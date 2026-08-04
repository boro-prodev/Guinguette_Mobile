/**
 * « Artist Spot » — même carrousel qu'« À l'affiche » (voir
 * `PosterCarousel.tsx`), appliqué aux artistes plutôt qu'aux soirées : une
 * affiche à la fois, swipée ou sautée par pastille, panneau toujours affiché
 * en dessous.
 *
 * Chaque artiste reste relié à une soirée précise (`Artist.eventId`,
 * `data/events.ts`). Le compte à rebours n'a pas de forme pour le passé
 * (`utils/date.ts` → `formatCountdown` affiche « C'est maintenant ! » sans
 * limite de durée) : on ne l'affiche donc que pour une soirée à venir, jamais
 * pour un artiste déjà passé — sinon la même mention resterait affichée
 * indéfiniment, absurde des mois après le concert.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { Text, Theme, View, XStack, YStack } from 'tamagui';

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
  ScrollView,
  tagLabelStyle,
  usePosterCarousel,
} from '@/components/features/PosterCarousel';
import { colors } from '@/constants/theme';
import { events } from '@/data/events';
import type { Artist } from '@/data/artists';

type ArtistSpotlightProps = {
  /** Titre de la section — « Artist Spot ». */
  kicker: string;
  artists: Artist[];
};

function ArtistSpotlightComponent({ kicker, artists }: ArtistSpotlightProps) {
  const {
    index,
    active,
    containerWidth,
    scrollRef,
    swipeGuard,
    reduceMotion,
    onLayout,
    handleMomentumEnd,
    goTo,
  } = usePosterCarousel(artists);

  const activeEvent = active && events.find((event) => event.id === active.eventId);

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

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onLayout={onLayout}
          onMomentumScrollEnd={handleMomentumEnd}
          {...swipeGuard}
        >
          {artists.map((artist) => {
            const linkedEvent = events.find((event) => event.id === artist.eventId);
            if (!linkedEvent) return null;
            const isUpcoming = linkedEvent.startsAt.getTime() > Date.now();

            return (
              <PosterShell key={artist.id} width={containerWidth}>
                <Poster>
                  <Image
                    source={artist.image}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={reduceMotion ? 0 : 300}
                    accessibilityLabel={artist.alt}
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
                        {artist.style}
                      </Text>
                    </View>
                  </XStack>

                  <Theme name="lampion">
                    <YStack gap="$base" padding="$md">
                      {isUpcoming && <Countdown startsAt={linkedEvent.startsAt} />}
                      <PosterTitle>{artist.name}</PosterTitle>
                      <PosterMeta>{`${linkedEvent.title} · ${linkedEvent.when}`}</PosterMeta>
                    </YStack>
                  </Theme>
                </Poster>
              </PosterShell>
            );
          })}
        </ScrollView>

        <XStack justifyContent="center" alignItems="center">
          {artists.map((artist, position) => (
            <DotTarget
              key={artist.id}
              accessibilityRole="button"
              accessibilityState={{ selected: position === index }}
              accessibilityLabel={`Voir ${artist.name}`}
              onPress={() => goTo(position)}
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
