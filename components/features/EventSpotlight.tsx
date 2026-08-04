/**
 * « À l'affiche » — un carrousel plein écran d'une soirée à la fois, avec son
 * compte à rebours. Navigation au doigt (carrousel paginé, `useSwipeGuard()`
 * via `usePosterCarousel`, cf. `PosterCarousel.tsx`) ou par l'une des
 * pastilles du bas.
 *
 * Le panneau d'informations (`EventDetailPane`) reste **toujours affiché**
 * sous l'affiche active — plus de tap pour le déplier. Changer de soirée
 * (swipe ou pastille) le remonte à neuf (`key={active.id}`), à la fois pour
 * éviter qu'`useDemoFlag` affiche un instant l'état RSVP de l'ancienne
 * soirée, et parce que c'est ce qui déclenche son fondu d'entrée.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition, ReduceMotion } from 'react-native-reanimated';
import { Text, Theme, View, XStack, YStack } from 'tamagui';

import { Countdown } from '@/components/features/Countdown';
import { EventDetailPane } from '@/components/features/EventDetailPane';
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
import type { GuinguetteEvent } from '@/data/events';

type EventSpotlightProps = {
  /** Titre de la section — « À l'affiche »… */
  kicker: string;
  events: GuinguetteEvent[];
};

function EventSpotlightComponent({ kicker, events }: EventSpotlightProps) {
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
  } = usePosterCarousel(events);

  if (!active) return null;

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
          {events.map((event) => (
            <PosterShell key={event.id} width={containerWidth}>
              <Poster>
                <Image
                  source={event.image}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={reduceMotion ? 0 : 300}
                  accessibilityLabel={event.alt}
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
                    backgroundColor={event.tagColor}
                    paddingHorizontal="$sm"
                    paddingVertical="$xs"
                    borderRadius="$pill"
                  >
                    <Text style={[tagLabelStyle, { color: event.tagTextColor }]}>{event.tag}</Text>
                  </View>
                </XStack>

                {/* Sur la photo, c'est le thème « lampion » qui donne le voile
                    sombre et le texte clair — aucune couleur écrite ici. */}
                <Theme name="lampion">
                  <YStack gap="$base" padding="$md">
                    <Countdown startsAt={event.startsAt} />
                    <PosterTitle>{event.title}</PosterTitle>
                    <PosterMeta>{`${event.artist} · ${event.when}`}</PosterMeta>
                  </YStack>
                </Theme>
              </Poster>
            </PosterShell>
          ))}
        </ScrollView>

        <XStack justifyContent="center" alignItems="center">
          {events.map((event, position) => (
            <DotTarget
              key={event.id}
              accessibilityRole="button"
              accessibilityState={{ selected: position === index }}
              accessibilityLabel={`Voir ${event.title}`}
              onPress={() => goTo(position)}
            >
              <DotBar active={position === index} />
            </DotTarget>
          ))}
        </XStack>

        <EventDetailPane key={active.id} event={active} />
      </YStack>
    </Animated.View>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);
