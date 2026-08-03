/**
 * Soirées & Bal — programmation et boutons « J'y serai » simulés
 * (port de soirees-bal.html).
 */
import { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';

import { EventCard } from '@/components/features/EventCard';
import { EventSpotlight } from '@/components/features/EventSpotlight';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { events, type GuinguetteEvent } from '@/data/events';

export default function SoireesScreen() {
  const renderItem = useCallback<ListRenderItem<GuinguetteEvent>>(
    ({ item }) => <EventCard event={item} />,
    []
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Reveal>
          <Text style={styles.title}>Soirées & Bal</Text>
        </Reveal>
        <Reveal delay={150}>
          <Text style={styles.intro}>
            Rejoignez-nous sous les lampions pour des soirées inoubliables au bord de l’eau.
            Musique live, danse et convivialité au rendez-vous.
          </Text>
        </Reveal>
        <Reveal delay={300} fadeOnly style={styles.spotlight}>
          <EventSpotlight events={events} />
        </Reveal>
      </View>
    ),
    []
  );

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      maxToRenderPerBatch={4}
      windowSize={5}
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
    alignItems: 'center',
  },
  title: {
    ...type.displayLg,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  intro: {
    ...type.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  spotlight: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
