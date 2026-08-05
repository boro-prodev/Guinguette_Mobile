/**
 * « À l'affiche » — une soirée à la fois, avec son compte à rebours.
 * Navigation **au tap ou au swipe** (gauche pour avancer, droite pour
 * reculer) — les deux cohabitent depuis que le swipe d'onglets a disparu
 * (5 août 2026, voir `app/(tabs)/_layout.tsx`). Toute la mécanique (glissement
 * à trois affiches façon livre, geste, retour tactile) vit dans `PosterFrame`
 * (`PosterCarousel.tsx`), partagée avec `ArtistSpotlight`.
 *
 * L'état actif (`activeId`) est **contrôlé par `soirees.tsx`**, pas local à
 * ce composant : c'est ce qui synchronise « À l'affiche » avec « Artist
 * Spot » — avancer l'une ou l'autre affiche avance la même soirée partagée.
 *
 * Le panneau d'informations (`EventDetailPane`) reste **toujours affiché**
 * sous l'affiche active. `PosterFrame` ne signale le changement de soirée
 * (`onChangeActive`) qu'une fois sa glissade terminée : c'est ce qui
 * synchronise le panneau avec l'affiche, jamais l'un en avance sur l'autre.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { Text, Theme, View, XStack, YStack } from 'tamagui';

import { Countdown } from '@/components/features/Countdown';
import { EventDetailPane } from '@/components/features/EventDetailPane';
import {
  DotBar,
  DotTarget,
  Kicker,
  PosterContent,
  PosterFrame,
  PosterMeta,
  PosterTitle,
  tagLabelStyle,
} from '@/components/features/PosterCarousel';
import type { GuinguetteEvent } from '@/data/events';

type EventSpotlightProps = {
  /** Titre de la section — « À l'affiche »… */
  kicker: string;
  events: GuinguetteEvent[];
  /** Id de la soirée active — partagé avec `ArtistSpotlight` par `soirees.tsx`. */
  activeId: string;
  onChangeActive: (id: string) => void;
  /** Fraction du glissement à répercuter sur toute la page — voir `soirees.tsx`. */
  pageFollowX?: SharedValue<number>;
};

function renderEventPoster(event: GuinguetteEvent, reduceMotion: boolean) {
  return (
    <PosterContent>
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

      {/* Sur la photo, c'est le thème « lampion » qui donne le voile sombre
          et le texte clair — aucune couleur écrite ici. */}
      <Theme name="lampion">
        <YStack gap="$base" padding="$md">
          <Countdown startsAt={event.startsAt} />
          <PosterTitle>{event.title}</PosterTitle>
          <PosterMeta>{`${event.artist} · ${event.when}`}</PosterMeta>
        </YStack>
      </Theme>
    </PosterContent>
  );
}

function EventSpotlightComponent({
  kicker,
  events,
  activeId,
  onChangeActive,
  pageFollowX,
}: EventSpotlightProps) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, events.findIndex((event) => event.id === activeId));
  const active = events[index];

  const handleCommit = useCallback(
    (direction: 1 | -1) => {
      const next = events[(index + direction + events.length) % events.length];
      if (next) onChangeActive(next.id);
    },
    [events, index, onChangeActive]
  );

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

        <PosterFrame
          items={events}
          activeIndex={index}
          keyExtractor={(event) => event.id}
          onCommit={handleCommit}
          pageFollowX={pageFollowX}
          accessibilityLabel={(event) =>
            `${event.title}, ${event.when}. Toucher ou glisser pour changer de soirée.`
          }
          renderPoster={(event) => renderEventPoster(event, reduceMotion)}
        />

        <XStack justifyContent="center" alignItems="center">
          {events.map((event, position) => (
            <DotTarget
              key={event.id}
              accessibilityRole="button"
              accessibilityState={{ selected: position === index }}
              accessibilityLabel={`Voir ${event.title}`}
              onPress={() => onChangeActive(event.id)}
            >
              <DotBar active={position === index} />
            </DotTarget>
          ))}
        </XStack>

        <EventDetailPane event={active} />
      </YStack>
    </Animated.View>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);
