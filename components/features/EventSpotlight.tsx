/**
 * « À l'affiche » — une soirée à la fois, avec son compte à rebours.
 * Navigation **au tap** (l'affiche avance à la soirée suivante, en boucle) ou
 * par l'une des pastilles du bas — plus de swipe depuis la révision qui a
 * suivi le chantier « Artist Spot » : swiper l'affiche entrait en conflit
 * avec le swipe de navigation entre onglets.
 *
 * L'état actif (`activeId`) est **contrôlé par `soirees.tsx`**, pas local à
 * ce composant : c'est ce qui synchronise « À l'affiche » avec « Artist
 * Spot » — taper l'une ou l'autre affiche avance la même soirée partagée.
 *
 * Le panneau d'informations (`EventDetailPane`) reste **toujours affiché**
 * sous l'affiche active. Changer de soirée le remonte à neuf (`key={active.id}`),
 * à la fois pour éviter qu'`useDemoFlag` affiche un instant l'état RSVP de
 * l'ancienne soirée, et parce que c'est ce qui déclenche son fondu d'entrée.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { LinearTransition, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, Text, Theme, View, XStack, YStack } from 'tamagui';

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
};

function EventSpotlightComponent({ kicker, events, activeId, onChangeActive }: EventSpotlightProps) {
  const reduceMotion = useReducedMotion();
  const index = Math.max(0, events.findIndex((event) => event.id === activeId));
  const active = events[index];

  const advance = useCallback(() => {
    const next = events[(index + 1) % events.length];
    if (next) onChangeActive(next.id);
  }, [events, index, onChangeActive]);

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

        <PosterShell>
          {/* Fondu + scale seulement, jamais de glissement latéral : ça
              ressemblerait à un swipe, exactement le geste qu'on a retiré. */}
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
              accessibilityLabel={`${active.title}, ${active.when}. Toucher pour voir la soirée suivante.`}
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
                  backgroundColor={active.tagColor}
                  paddingHorizontal="$sm"
                  paddingVertical="$xs"
                  borderRadius="$pill"
                >
                  <Text style={[tagLabelStyle, { color: active.tagTextColor }]}>{active.tag}</Text>
                </View>
              </XStack>

              {/* Sur la photo, c'est le thème « lampion » qui donne le voile
                  sombre et le texte clair — aucune couleur écrite ici. */}
              <Theme name="lampion">
                <YStack gap="$base" padding="$md">
                  <Countdown startsAt={active.startsAt} />
                  <PosterTitle>{active.title}</PosterTitle>
                  <PosterMeta>{`${active.artist} · ${active.when}`}</PosterMeta>
                </YStack>
              </Theme>
            </Poster>
          </AnimatePresence>
        </PosterShell>

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

        <EventDetailPane key={active.id} event={active} />
      </YStack>
    </Animated.View>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);
