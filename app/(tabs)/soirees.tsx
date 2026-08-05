/**
 * Soirées & Bal — deux carrousels : « À l'affiche » (toute la programmation)
 * et « Artist Spot » (les artistes déjà venus ou à venir, `data/artists.ts`).
 *
 * Les deux partagent un seul état, `activeEventId` : taper l'affiche de
 * l'une avance la même soirée que l'autre suit — c'est cet id qui les
 * synchronise, `Artist.eventId` faisant le lien entre les deux tableaux.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ArtistSpotlight } from '@/components/features/ArtistSpotlight';
import { EventSpotlight } from '@/components/features/EventSpotlight';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { artists } from '@/data/artists';
import { events } from '@/data/events';
import { NBSP } from '@/utils/text';

export default function SoireesScreen() {
  const [activeEventId, setActiveEventId] = useState(events[0]?.id ?? '');

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
        <EventSpotlight
          kicker="À l’affiche"
          events={events}
          activeId={activeEventId}
          onChangeActive={setActiveEventId}
        />
      </Reveal>

      <Reveal delay={400} fadeOnly style={styles.spotlight}>
        <ArtistSpotlight
          kicker="Artist Spot"
          artists={artists}
          activeEventId={activeEventId}
          onChangeActive={setActiveEventId}
        />
      </Reveal>
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
