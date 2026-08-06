/**
 * Soirées & Bal — **une page de journal par soirée**, qu'on feuillette au
 * doigt.
 *
 * Le titre et l'accroche sont l'ours du journal : ils ne bougent jamais. Tout
 * le reste — l'affiche de la soirée, son panneau, l'affiche de l'artiste, sa
 * fiche — est une **feuille**, d'un seul tenant, qui suit le doigt, se plie et
 * découvre la suivante (`NewspaperPager`).
 *
 * ⚠️ **Il y avait ici deux carrousels indépendants** (« À l'affiche » et
 * « Artist Spot »), chacun avec son geste, synchronisés par un `activeEventId`
 * partagé, plus un `pageFollowX` qui répercutait une fraction du glissement
 * sur toute la page. Tout ça a disparu le 6 août 2026 : `pageFollowX` était le
 * brouillon de ce qu'on fait maintenant pour de bon, et la synchronisation n'a
 * plus d'objet puisqu'une soirée et son artiste **vivent sur la même feuille**.
 * Un seul geste horizontal sur l'écran, jamais deux — c'est la même leçon que
 * la disparition du swipe entre onglets, un cran plus haut.
 *
 * La rangée de pastilles reste la navigation directe, et l'accès sans geste :
 * chaque pastille est un bouton qui tourne les pages jusqu'à la sienne.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { ArtistSpotlight } from '@/components/features/ArtistSpotlight';
import { EventSpotlight } from '@/components/features/EventSpotlight';
import {
  NewspaperPager,
  type NewspaperPagerHandle,
} from '@/components/features/NewspaperPager';
import { DotBar, DotTarget } from '@/components/features/SpotlightParts';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { artists } from '@/data/artists';
import { events, type GuinguetteEvent } from '@/data/events';
import type { Artist } from '@/data/artists';
import { NBSP } from '@/utils/text';

/** Une page : une soirée et l'artiste qui vient la jouer. */
type SoireePage = { event: GuinguetteEvent; artist?: Artist };

export default function SoireesScreen() {
  const pager = useRef<NewspaperPagerHandle>(null);
  const [index, setIndex] = useState(0);

  const pages = useMemo<SoireePage[]>(
    () =>
      events.map((event) => ({
        event,
        artist: artists.find((artist) => artist.eventId === event.id),
      })),
    []
  );

  const renderPage = useCallback((page: SoireePage) => <PageContent page={page} />, []);

  return (
    <View style={styles.screen}>
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
        <Reveal delay={220}>
          <XStack justifyContent="center" alignItems="center">
            {pages.map((page, position) => (
              <DotTarget
                key={page.event.id}
                accessibilityRole="button"
                accessibilityState={{ selected: position === index }}
                accessibilityLabel={`Voir ${page.event.title}`}
                onPress={() => pager.current?.goTo(position)}
              >
                <DotBar active={position === index} />
              </DotTarget>
            ))}
          </XStack>
        </Reveal>
      </View>

      <Reveal delay={300} fadeOnly style={styles.pager}>
        <NewspaperPager
          ref={pager}
          pages={pages}
          keyExtractor={(page) => page.event.id}
          renderPage={renderPage}
          onPageChange={setIndex}
          contentContainerStyle={styles.pageContent}
        />
      </Reveal>
    </View>
  );
}

/** Le contenu d'une feuille — mémoïsé : tourner la page ne le recalcule pas. */
const PageContent = ({ page }: { page: SoireePage }) => (
  <YStack gap="$md">
    <EventSpotlight kicker="À l’affiche" event={page.event} />
    {page.artist && (
      <ArtistSpotlight kicker="Artist Spot" artist={page.artist} event={page.event} />
    )}
  </YStack>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.sm,
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
  pager: {
    flex: 1,
  },
  pageContent: {
    // La feuille, elle, va d'un bord à l'autre : c'est son contenu qui garde
    // la gouttière, sans quoi le bord du papier ne toucherait pas le bord de
    // l'écran en tournant.
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
  },
});
