/**
 * La Carte — liste filtrable par catégorie (port de la-carte.html et de
 * src/menu-filter.js). Les blocs sont rendus par une FlatList unique : filtrer
 * ne fait que réduire les données, la mise en page ne se démonte pas.
 */
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import { MenuBlockView } from '@/components/features/MenuBlockView';
import { useSwipeGuard } from '@/components/layout/SwipeTabs';
import { Chip } from '@/components/ui/Chip';
import { Reveal } from '@/components/ui/Reveal';
import { colors, fonts, spacing, type } from '@/constants/theme';
import { MENU_FILTERS, menuBlocks, type MenuBlock, type MenuFilter } from '@/data/menu';

export default function CarteScreen() {
  const [filter, setFilter] = useState<MenuFilter>('tout');
  // Cette rangée défile à l'horizontale, comme le geste de navigation entre
  // onglets : le garde-fou neutralise le second tant qu'un doigt est posé ici.
  const swipeGuard = useSwipeGuard();

  const blocks = useMemo(
    () => (filter === 'tout' ? menuBlocks : menuBlocks.filter((b) => b.category === filter)),
    [filter]
  );

  const handleFilter = useCallback((value: string) => setFilter(value as MenuFilter), []);

  const renderItem = useCallback<ListRenderItem<MenuBlock>>(
    ({ item }) => <MenuBlockView block={item} />,
    []
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Reveal>
          <Text style={styles.title}>Notre Carte</Text>
        </Reveal>
        <Reveal delay={150}>
          <Text style={styles.subtitle}>Découvrez nos saveurs au bord de l’eau</Text>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersRow}
          accessibilityLabel="Filtrer la carte"
          {...swipeGuard}
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
    <FlatList
      data={blocks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={6}
      windowSize={5}
      initialNumToRender={4}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
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
});
