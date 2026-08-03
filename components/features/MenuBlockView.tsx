/**
 * Rendu d'un bloc de La Carte. Les quatre formes (plat vedette, plat en photo,
 * intertitre, liste de prix) sont rendues par un seul composant mémoïsé pour
 * que la FlatList de l'écran reste homogène et filtrable.
 */
import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { colors, radius, shadows, spacing, type } from '@/constants/theme';
import type { MenuBlock, MenuItem } from '@/data/menu';

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

function MenuBlockComponent({ block }: { block: MenuBlock }) {
  if (block.kind === 'heading') {
    return <Text style={styles.heading}>{block.title}</Text>;
  }

  if (block.kind === 'list') {
    return (
      <View style={[styles.card, shadows.card]}>
        {block.title && (
          <View style={styles.listHeader}>
            {block.icon && <Icon name={block.icon} size={22} color={colors.primary} />}
            <Text style={styles.listTitle}>{block.title}</Text>
          </View>
        )}
        {block.items.map((item, index) => (
          <PriceRow key={item.id} item={item} last={index === block.items.length - 1} />
        ))}
      </View>
    );
  }

  const featured = block.kind === 'feature';

  return (
    <View style={[styles.card, shadows.card]}>
      <View style={featured ? styles.featureImageWrapper : styles.photoImageWrapper}>
        <Image
          source={block.image}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={block.alt}
          transition={250}
          cachePolicy="memory-disk"
        />
        {featured && (
          <View style={styles.badge}>
            <Icon name="star" size={14} color={colors.onTertiaryFixed} />
            <Text style={styles.badgeLabel}>{block.badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.dishBody}>
        <View style={styles.dishText}>
          <Text style={styles.dishTitle}>{block.title}</Text>
          <Text style={styles.dishDescription}>{block.description}</Text>
        </View>
        <Text style={styles.dishPrice}>{block.price}</Text>
      </View>
    </View>
  );
}

export const MenuBlockView = memo(MenuBlockComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  heading: {
    ...type.headlineLg,
    color: colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.md,
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

  /* Plats illustrés */
  featureImageWrapper: {
    height: 224,
    width: '100%',
  },
  photoImageWrapper: {
    height: 192,
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
    marginBottom: spacing.xs,
  },
  dishDescription: {
    ...type.bodyMd,
    color: colors.onSurfaceVariant,
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
