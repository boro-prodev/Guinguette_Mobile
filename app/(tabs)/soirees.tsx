/**
 * Soirées & Bal — deux carrousels du même composant : « À l'affiche »
 * (toute la programmation) et « Les pépites » (sélection manuelle de
 * l'exploitant, cf. `data/events.ts`).
 */
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EventSpotlight } from '@/components/features/EventSpotlight';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { events } from '@/data/events';
import { NBSP } from '@/utils/text';
export default function SoireesScreen() {
  const pepites = useMemo(() => events.filter((event) => event.pepite), []);

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Reveal>
          <Text style={styles.title}>Soirées & Bal</Text>
        </Reveal>
        <Reveal delay={150}>
          {/* `numberOfLines={1}` n'est pas cosmétique : sans lui, Android
              mesure mal ce `Text` en Berkshire Swash et rogne « Incroyable »
              en silence (ni retour à la ligne, ni points de suspension). */}
          <Text style={styles.intro} numberOfLines={1}>
            {`Ambiance Unique${NBSP}| Artiste Incroyable`}
          </Text>
        </Reveal>
      </View>

      <Reveal delay={300} fadeOnly style={styles.spotlight}>
        <EventSpotlight kicker="À l’affiche" events={events} />
      </Reveal>

      {pepites.length > 0 && (
        <Reveal delay={400} fadeOnly style={styles.spotlight}>
          <EventSpotlight kicker="Les pépites" events={pepites} />
        </Reveal>
      )}
    </ScrollView>
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
    ...type.headlineXs,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  spotlight: {
    alignSelf: 'stretch',
  },
});
