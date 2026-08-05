/**
 * La Carte — liste filtrable par catégorie.
 * Les blocs sont rendus par une FlatList unique : filtrer
 * ne fait que réduire les données, la mise en page ne se démonte pas.
 *
 * Un bouton de réservation **flotte au défilement** (chantier 3) : absent en
 * haut de page, il se pose dès qu'on commence à parcourir la carte — au moment
 * où l'envie se crée — et s'efface quand on remonte.
 */
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
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
import { MENU_FILTERS, menuBlocks, type MenuBlock, type MenuFilter } from '@/data/menu';
import { useReserve } from '@/features/reserve/ReserveProvider';

/**
 * Défilement à partir duquel le bouton se pose. Assez haut pour qu'il ne
 * clignote pas au moindre frémissement du doigt, assez bas pour être là dès le
 * premier plat dépassé.
 */
const SHOW_AT = 220;
/** Course du bouton à l'apparition : il monte, il n'apparaît pas sur place. */
const RISE = 24;
const FADE_MS = 200;
/** Hauteur réservée sous le dernier bloc pour que le bouton ne le masque pas. */
const CTA_CLEARANCE = 96;

export default function CarteScreen() {
  const [filter, setFilter] = useState<MenuFilter>('tout');
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

  const blocks = useMemo(
    () => (filter === 'tout' ? menuBlocks : menuBlocks.filter((b) => b.category === filter)),
    [filter]
  );

  const handleFilter = useCallback((value: string) => setFilter(value as MenuFilter), []);

  const renderItem = useCallback<ListRenderItem<MenuBlock>>(
    ({ item }) => <MenuBlockView block={item} />,
    []
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const next = event.contentOffset.y > SHOW_AT ? 1 : 0;
      // Le passage vers React n'a lieu qu'aux BASCULES, pas à chaque image :
      // sans ce garde, un simple défilement inonderait le thread JS.
      if (next !== shown.value) {
        shown.value = next;
        runOnJS(setReachable)(next === 1);
      }
    },
  });

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersRow}
          accessibilityLabel="Filtrer la carte"
        >
          {MENU_FILTERS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              value={item.id}
              selected={item.id === filter}
              onSelect={handleFilter}
            />
          ))}
        </ScrollView>
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
  filtersRow: {
    // Les puces débordent volontairement des marges pour défiler bord à bord.
    marginHorizontal: -spacing.gutter,
    marginTop: spacing.md,
  },
  filters: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
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
