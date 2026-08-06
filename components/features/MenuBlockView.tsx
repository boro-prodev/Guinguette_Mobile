/**
 * Rendu d'un bloc de La Carte. Les deux formes (la suggestion illustrée, la
 * liste de prix) sont rendues par un seul composant mémoïsé pour que la
 * FlatList de l'écran reste homogène et filtrable.
 *
 * **Seule la suggestion se replie** (chantier 3). Repliée, elle montre image,
 * titre et prix ; la description n'apparaît qu'au toucher. Les listes de prix
 * ne bougent pas : elles sont déjà compactes et n'ont pas d'image à mettre en
 * avant.
 *
 * ⚠️ Il y avait quatre formes jusqu'au 6 août 2026. `heading` (l'intertitre
 * pleine largeur) et `photo` (le plat illustré sans badge) ont disparu avec le
 * remaniement de `data/menu.ts` : plus aucune donnée ne les utilisait, une
 * catégorie ne portant plus qu'une seule photo — celle de sa suggestion.
 */
import { Image } from 'expo-image';
import { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radius, shadows, spacing, type } from '@/constants/theme';
import type { MenuBlock, MenuItem } from '@/data/menu';

/** Durée du pivot du chevron. Assez courte pour suivre le doigt sans traîner. */
const CHEVRON_MS = 200;
/** Fondu de la description. Plus court que le pivot : le texte ne doit pas
 *  arriver après le signal qui l'annonce. */
const REVEAL_MS = 160;

const PriceRow = memo(function PriceRow({ item, last }: { item: MenuItem; last: boolean }) {
  return (
    <View style={last ? styles.row : [styles.row, styles.rowDivider]}>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowDescription}>{item.description}</Text>
      </View>
      <Text style={styles.rowPrice}>{item.price}</Text>
    </View>
  );
});

/**
 * La suggestion de la catégorie : un plat illustré, repliable. Composant à part
 * entière — et pas une branche de `MenuBlockComponent` — parce qu'il porte des
 * hooks : les listes de prix n'ont ainsi rien à monter pour rien.
 *
 * Le signal de dépliage est une **pastille ronde posée en bas à droite de la
 * photo**, dont le chevron pivote à l'ouverture. Ce coin-là est le seul libre :
 * le badge « Suggestion de saison » occupe le haut à droite, et le prix occupe
 * la ligne du titre. Il fallait l'inventer — le chevron du chantier 2, que la
 * feuille de route proposait de réutiliser, n'existe plus depuis que le panneau
 * de Soirées reste ouvert en permanence.
 */
function DishCard({ block }: { block: Extract<MenuBlock, { kind: 'feature' }> }) {
  const [expanded, setExpanded] = useState(false);
  const turn = useSharedValue(0);

  /**
   * ⚠️ **La valeur partagée s'écrit ici, pas dans la fonction de mise à jour de
   * `setExpanded`.** C'est là qu'elle était, et Reanimated 4 le signalait à
   * chaque repli : « Writing to `value` during component render ». React
   * exécute la fonction passée à un `setState` **pendant le rendu** (et deux
   * fois en mode strict), donc écrire une valeur partagée dedans revient à
   * lancer une animation en plein rendu — au mieux jouée deux fois, au pire
   * perdue. Le prix est de dépendre d'`expanded` : `toggle` se recrée à chaque
   * bascule, ce qui ne coûte rien ici.
   */
  const toggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    turn.value = withTiming(next ? 1 : 0, {
      duration: CHEVRON_MS,
      reduceMotion: ReduceMotion.System,
    });
  }, [expanded, turn]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.value * 180}deg` }],
  }));

  return (
    <PressableScale
      style={[styles.card, shadows.card]}
      // Une carte qui se déplie n'est ni un `Button` (ce n'est pas une action
      // étiquetée) ni un `Chip` : c'est la zone tactile brute du projet.
      scaleTo={0.98}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={`${block.title}, ${block.price}`}
      accessibilityHint={expanded ? 'Toucher pour replier' : 'Toucher pour lire la description'}
      accessibilityState={{ expanded }}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={block.image}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={block.alt}
          // Prop d'expo-image : une DURÉE en ms, pas un nom d'animation Tamagui.
          transition={250}
          cachePolicy="memory-disk"
        />
        <View style={styles.badge}>
          <Icon name="star" size={14} color={colors.onTertiaryFixed} />
          <Text style={styles.badgeLabel}>{block.badge}</Text>
        </View>

        <View style={styles.revealBadge}>
          <Animated.View style={chevronStyle}>
            <Icon name="chevron" size={20} color={colors.primary} />
          </Animated.View>
        </View>
      </View>

      <View style={styles.dishBody}>
        <View style={styles.dishText}>
          <Text style={styles.dishTitle}>{block.title}</Text>
          {expanded && (
            <Animated.View
              entering={FadeIn.duration(REVEAL_MS).reduceMotion(ReduceMotion.System)}
              exiting={FadeOut.duration(REVEAL_MS).reduceMotion(ReduceMotion.System)}
            >
              <Text style={styles.dishDescription}>{block.description}</Text>
            </Animated.View>
          )}
        </View>
        <Text style={styles.dishPrice}>{block.price}</Text>
      </View>
    </PressableScale>
  );
}

function MenuBlockComponent({ block }: { block: MenuBlock }) {
  if (block.kind === 'list') {
    return (
      <View style={[styles.card, shadows.card]}>
        {block.title && (
          <View style={styles.listHeader}>
            {block.icon && <Icon name={block.icon} size={22} color={colors.primary} />}
            {/* `numberOfLines={1}` et le `flex` ne sont pas cosmétiques : sans
                eux, Android mesure mal ce `Text` en Berkshire Swash et coupait
                « À partager » à son seul « À », en silence — même défaut que
                l'accroche de l'écran Soirées. */}
            <Text style={styles.listTitle} numberOfLines={1}>
              {block.title}
            </Text>
          </View>
        )}
        {block.items.map((item, index) => (
          <PriceRow key={item.id} item={item} last={index === block.items.length - 1} />
        ))}
      </View>
    );
  }

  return <DishCard block={block} />;
}

export const MenuBlockView = memo(MenuBlockComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  /* Listes de prix */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listTitle: {
    ...type.headlineMd,
    color: colors.primary,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: 'rgba(188,71,73,0.2)',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    ...type.bodyLg,
    fontFamily: type.headlineMd.fontFamily,
    color: colors.onSurface,
  },
  rowDescription: {
    ...type.bodySm,
    color: colors.onSurfaceVariant,
  },
  rowPrice: {
    ...type.bodyLg,
    fontFamily: type.headlineMd.fontFamily,
    color: colors.onSurface,
  },

  /* La suggestion illustrée */
  imageWrapper: {
    height: 224,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceContainerHigh,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  badgeLabel: {
    // « Suggestion de saison » : casse normale, donc `caption`.
    ...type.caption,
    color: colors.onTertiaryFixed,
  },
  /**
   * Le signal de dépliage. Posé sur la photo plutôt que dans la ligne du titre :
   * là, il aurait touché le prix et se serait lu comme lui appartenant.
   */
  revealBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  dishBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
  },
  dishText: {
    flex: 1,
  },
  dishTitle: {
    ...type.headlineMd,
    color: colors.onSurface,
  },
  dishDescription: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  /**
   * Un seul cran de prix, y compris sur un plat vedette. La variante à 32 px
   * rendait le prix plus gros que le nom du plat qu'il accompagne, et à
   * égalité avec les intertitres de section : la vedette se signale déjà par
   * une image plus haute (224 contre 192) et par son badge.
   */
  dishPrice: {
    ...type.headlineMd,
    color: colors.primary,
  },
});
