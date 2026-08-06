/**
 * La Carte — liste filtrable par catégorie.
 * Les blocs sont rendus par une FlatList unique : filtrer
 * ne fait que réduire les données, la mise en page ne se démonte pas.
 *
 * Un bouton de réservation **se pose au bout de la catégorie** : absent tant
 * qu'il reste à lire, il apparaît quand le dernier bloc finit d'entrer à
 * l'écran — au moment où l'envie est faite — et s'efface si on remonte. Sur une
 * catégorie assez courte pour tenir d'un écran, il est là d'emblée : on est
 * déjà au bout.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ListRenderItem,
} from 'react-native';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MenuBlockView } from '@/components/features/MenuBlockView';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Reveal } from '@/components/ui/Reveal';
import { colors, fonts, radius, shadows, spacing, type } from '@/constants/theme';
import { MENU_FILTERS, menuBlocks, type MenuBlock, type MenuCategory } from '@/data/menu';
import { useReserve } from '@/features/reserve/ReserveProvider';

/** Course du bouton à l'apparition : il monte, il n'apparaît pas sur place. */
const RISE = 24;
const FADE_MS = 200;
/** Hauteur réservée sous le dernier bloc pour que le bouton ne le masque pas. */
const CTA_CLEARANCE = 96;
/**
 * Distance au bas du contenu à partir de laquelle le bouton se pose. Elle vaut
 * exactement le vide réservé sous le dernier bloc : il apparaît donc au moment
 * précis où ce dernier bloc finit d'entrer à l'écran, et pas avant.
 *
 * ⚠️ **Ce n'est plus un seuil de défilement.** Le bouton se posait après
 * 220 px parcourus — ce qui marchait quand La Carte était une longue liste,
 * mais plus du tout depuis qu'on ne voit **qu'une catégorie à la fois**
 * (6 août 2026) : trois des quatre catégories ne défilent pas de 220 px, et le
 * bouton n'y apparaissait donc **jamais**. Le repère est désormais la fin du
 * contenu, quelle que soit sa hauteur.
 */
const END_MARGIN = spacing.md + CTA_CLEARANCE;

export default function CarteScreen() {
  // On entre sur la première puce, « À partager » — il n'y a plus de « Tout »
  // (6 août 2026) : on ne voit jamais qu'une catégorie à la fois, chacune
  // ouverte par sa suggestion illustrée.
  const [filter, setFilter] = useState<MenuCategory>(MENU_FILTERS[0]!.id);
  const { open } = useReserve();

  /**
   * `shown` pilote l'animation sur le thread UI ; `reachable` est son reflet
   * côté React, et il ne sert qu'à une chose : rendre le bouton inatteignable
   * tant qu'il est invisible. Un bouton transparent qu'on peut quand même
   * activer est un piège — même règle que les deux appels à l'action de
   * l'accueil.
   */
  const shown = useSharedValue(0);
  const [reachable, setReachable] = useState(false);

  /**
   * Les trois mesures dont dépend « est-on au bout ? ». Elles vivent en
   * valeurs partagées parce que deux d'entre elles n'arrivent que par des
   * événements JS (`onLayout`, `onContentSizeChange`) alors que la troisième
   * change à chaque image de défilement, sur le thread UI.
   */
  const offsetY = useSharedValue(0);
  const viewport = useSharedValue(0);
  const content = useSharedValue(0);

  const blocks = useMemo(() => menuBlocks.filter((b) => b.category === filter), [filter]);

  const handleFilter = useCallback((value: string) => setFilter(value as MenuCategory), []);

  const renderItem = useCallback<ListRenderItem<MenuBlock>>(
    ({ item }) => <MenuBlockView block={item} />,
    []
  );

  /**
   * Le verdict, à partir des trois mesures. Worklet : il est appelé aussi bien
   * depuis le gestionnaire de défilement (thread UI) que depuis `onLayout` et
   * `onContentSizeChange` (thread JS) — une catégorie trop courte pour défiler
   * n'émet **aucun** événement de défilement, et c'est justement là que le
   * bouton doit se poser d'emblée.
   */
  const evaluate = useCallback(() => {
    'worklet';
    if (viewport.value <= 0 || content.value <= 0) return;
    const next = offsetY.value + viewport.value >= content.value - END_MARGIN ? 1 : 0;
    // Le passage vers React n'a lieu qu'aux BASCULES, pas à chaque image :
    // sans ce garde, un simple défilement inonderait le thread JS.
    if (next === shown.value) return;
    shown.value = next;
    runOnJS(setReachable)(next === 1);
  }, [content, offsetY, shown, viewport]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      offsetY.value = event.contentOffset.y;
      viewport.value = event.layoutMeasurement.height;
      content.value = event.contentSize.height;
      evaluate();
    },
  });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewport.value = event.nativeEvent.layout.height;
      evaluate();
    },
    [evaluate, viewport]
  );

  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      content.value = height;
      evaluate();
    },
    [content, evaluate]
  );

  const ctaStyle = useAnimatedStyle(() => {
    const timing = { duration: FADE_MS, reduceMotion: ReduceMotion.System };
    return {
      opacity: withTiming(shown.value, timing),
      transform: [{ translateY: withTiming(shown.value === 1 ? 0 : RISE, timing) }],
    };
  });

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Reveal>
          <Text style={styles.title}>Notre Carte</Text>
        </Reveal>
        <Reveal delay={150}>
          {/*
            Mesuré sur émulateur, aux deux largeurs qui comptent. L'accroche
            proposée par la feuille de route (« Découvrez les produits locaux à
            travers des plats gourmands et élégants ») passait à 3 lignes sur
            360 dp ; la raccourcir en gardant « et élégants » tenait en 2, mais
            laissait « élégants » seul sur la seconde — le défaut même qu'on
            voulait corriger. Celle-ci tient sur UNE ligne aux deux largeurs.
          */}
          <Text style={styles.subtitle}>Produits locaux, plats gourmands</Text>
        </Reveal>
        {/*
          Plus de défilement (7 août 2026, demande de Jonathan) : quatre puces
          tiennent toujours sur une largeur de téléphone, un `ScrollView`
          n'avait donc rien à faire ici — juste une rangée simple, sur une
          seule ligne (pas de `flexWrap`), centrée par `justifyContent:
          'center'` et espacée à l'identique entre les puces par `gap`.
        */}
        <View style={styles.filters} accessibilityLabel="Filtrer la carte">
          {MENU_FILTERS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              value={item.id}
              selected={item.id === filter}
              onSelect={handleFilter}
            />
          ))}
        </View>
      </View>
    ),
    [filter, handleFilter]
  );

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={blocks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={5}
        initialNumToRender={4}
      />

      <Animated.View
        style={[styles.cta, ctaStyle]}
        pointerEvents={reachable ? 'auto' : 'none'}
        accessibilityElementsHidden={!reachable}
        importantForAccessibility={reachable ? 'auto' : 'no-hide-descendants'}
      >
        {/*
          L'ombre vit sur CE conteneur-ci, qui se réduit à la taille du bouton
          (le parent est en `alignItems: 'center'`). Posée sur le parent, elle
          aurait suivi son contour à lui — pleine largeur — et Android, qui ne
          connaît que `elevation` et dessine d'après l'outline de la vue, aurait
          tiré une pilule aussi large que l'écran.
        */}
        <View style={styles.ctaPill}>
          <Button theme="primary" tone="solid" size="md" onPress={open}>
            Réserver une table
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.gutter,
    // De quoi lire le dernier bloc en entier sans que le bouton le recouvre.
    paddingBottom: spacing.md + CTA_CLEARANCE,
    gap: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
  },
  title: {
    ...type.displayLg,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...type.bodyLg,
    // Android ne synthétise pas l'italique d'une police custom : il faut
    // désigner le fichier italique, `fontStyle` ne suffirait pas.
    fontFamily: fonts.bodyItalic,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  filters: {
    // Une seule ligne, jamais de retour à la ligne (demande de Jonathan,
    // 7 août 2026) : quatre puces tiennent toujours sur une largeur de
    // téléphone. `gap` espace les puces à l'identique entre elles ;
    // `justifyContent: 'center'` centre la rangée entière, à égale distance
    // des deux bords.
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  /**
   * La barre d'onglets n'est pas en position absolue (`app/(tabs)/_layout.tsx`) :
   * le bas de cet écran EST son bord supérieur. Vérifié à l'écran — un premier
   * essai à `spacing.lg` laissait très exactement 48 dp de vide. Il n'y a donc
   * pas à ajouter `TAB_BAR_HEIGHT` ni la safe-area, contrairement à ce que
   * craignait la feuille de route : ce serait décoller le bouton pour rien.
   *
   * Et il faut le poser BAS. À 48 dp il tombait en pleine ligne de titre et
   * masquait le nom du plat ; au ras de la barre, il ne croise plus qu'une
   * bande de photo, qui supporte un survol sans rien perdre.
   */
  cta: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    bottom: spacing.md,
    alignItems: 'center',
  },
  ctaPill: {
    borderRadius: radius.pill,
    ...shadows.card,
  },
});
