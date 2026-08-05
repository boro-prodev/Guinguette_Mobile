/**
 * « Artist Spot » — même mécanique qu'« À l'affiche » (tap pour avancer,
 * `AnimatePresence` fondu + scale, panneau toujours affiché en dessous),
 * appliquée aux artistes plutôt qu'aux soirées.
 *
 * Chaque artiste reste relié à une soirée précise (`Artist.eventId`,
 * `data/events.ts`). C'est cette référence, pas un index d'artiste, qui sert
 * de clé partagée avec `EventSpotlight` : `activeEventId` vient de
 * `soirees.tsx`, et taper l'une ou l'autre section fait toujours avancer la
 * même soirée — les deux carrousels restent synchronisés.
 *
 * Le compte à rebours n'a pas de forme pour le passé (`utils/date.ts` →
 * `formatCountdown` affiche « C'est maintenant ! » sans limite de durée) : on
 * ne l'affiche donc que pour une soirée à venir.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Text, Theme, View, XStack, YStack } from 'tamagui';

import { ArtistDetailPane } from '@/components/features/ArtistDetailPane';
import { Countdown } from '@/components/features/Countdown';
import {
  DotBar,
  DotTarget,
  Kicker,
  Poster,
  PosterMeta,
  PosterShell,
  PosterTitle,
  tagLabelStyle,
} from '@/components/features/PosterCarousel';
import { colors } from '@/constants/theme';
import { events } from '@/data/events';
import type { Artist } from '@/data/artists';

type ArtistSpotlightProps = {
  /** Titre de la section — « Artist Spot ». */
  kicker: string;
  artists: Artist[];
  /** Id de la soirée active — partagé avec `EventSpotlight` par `soirees.tsx`. */
  activeEventId: string;
  onChangeActive: (id: string) => void;
};

function ArtistSpotlightComponent({
  kicker,
  artists,
  activeEventId,
  onChangeActive,
}: ArtistSpotlightProps) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, artists.findIndex((artist) => artist.eventId === activeEventId));
  const active = artists[index];
  const activeEvent = active && events.find((event) => event.id === active.eventId);

  const advance = useCallback(() => {
    const next = artists[(index + 1) % artists.length];
    if (next) onChangeActive(next.eventId);
  }, [artists, index, onChangeActive]);

  if (!active || !activeEvent) return null;

  return (
    <Animated.View
      layout={
        reduceMotion
          ? undefined
          : LinearTransition.springify().damping(20).stiffness(180).reduceMotion(ReduceMotion.System)
      }
    >
      <YStack gap="$sm">
        <Kicker>{kicker}</Kicker>

        <PosterShell>
          <AnimatePresence>
            <Poster
              key={active.id}
              transition={reduceMotion ? null : 'medium'}
              opacity={1}
              scale={1}
              enterStyle={{ opacity: 0, scale: 0.96 }}
              exitStyle={{ opacity: 0, scale: 0.96 }}
              pressStyle={{ scale: 0.97 }}
              accessibilityRole="button"
              accessibilityLabel={`${active.name}, ${activeEvent.when}. Toucher pour voir l’artiste suivant.`}
              onPress={advance}
            >
              <Image
                source={active.image}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={reduceMotion ? 0 : 300}
                accessibilityLabel={active.alt}
                cachePolicy="memory-disk"
              />

              <LinearGradient
                pointerEvents="none"
                colors={['rgba(12,23,32,0)', 'rgba(12,23,32,0.85)']}
                locations={[0.35, 1]}
                style={StyleSheet.absoluteFill}
              />

              <XStack position="absolute" top="$md" left="$md">
                <View
                  backgroundColor={colors.tertiaryFixed}
                  paddingHorizontal="$sm"
                  paddingVertical="$xs"
                  borderRadius="$pill"
                >
                  <Text style={[tagLabelStyle, { color: colors.onTertiaryFixed }]}>
                    {active.style}
                  </Text>
                </View>
              </XStack>

              <Theme name="lampion">
                <YStack gap="$base" padding="$md">
                  {activeEvent.startsAt.getTime() > Date.now() && (
                    <Countdown startsAt={activeEvent.startsAt} />
                  )}
                  <PosterTitle>{active.name}</PosterTitle>
                  <PosterMeta>{`${activeEvent.title} · ${activeEvent.when}`}</PosterMeta>
                </YStack>
              </Theme>
            </Poster>
          </AnimatePresence>
        </PosterShell>

        <XStack justifyContent="center" alignItems="center">
          {artists.map((artist, position) => (
            <DotTarget
              key={artist.id}
              accessibilityRole="button"
              accessibilityState={{ selected: position === index }}
              accessibilityLabel={`Voir ${artist.name}`}
              onPress={() => onChangeActive(artist.eventId)}
            >
              <DotBar active={position === index} />
            </DotTarget>
          ))}
        </XStack>

        <ArtistDetailPane key={active.id} artist={active} event={activeEvent} />
      </YStack>
    </Animated.View>
  );
}

export const ArtistSpotlight = memo(ArtistSpotlightComponent);
