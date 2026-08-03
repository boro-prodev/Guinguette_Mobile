/**
 * « À l'affiche » — l'accroche en haut de l'écran Soirées.
 *
 * Une seule soirée à la fois, en grand, avec son compte à rebours. On passe
 * à la suivante en touchant l'affiche, ou directement à celle qu'on veut par
 * les trois barres du bas.
 *
 * Volontairement PAS un carrousel qui défile au doigt : l'écran entier est
 * déjà sensible au glissement horizontal pour changer d'onglet, et deux
 * gestes identiques superposés se disputeraient le doigt. Le changement se
 * fait donc au toucher — et l'animation d'entrée, elle, garde le sens de la
 * lecture.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { AnimatePresence, styled, Text, Theme, View, XStack, YStack } from 'tamagui';

import { Countdown } from '@/components/features/Countdown';
import type { GuinguetteEvent } from '@/data/events';

/** Hauteur de l'affiche — assez haute pour respirer, assez basse pour laisser
 *  deviner la première carte en dessous et donner envie de faire défiler. */
const POSTER_HEIGHT = 300;

const Kicker = styled(Text, {
  name: 'SpotlightKicker',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  textTransform: 'uppercase',
  color: '$muted',
});

const PosterShell = styled(View, {
  name: 'PosterShell',
  height: POSTER_HEIGHT,
  borderRadius: '$md',
  overflow: 'hidden',
  backgroundColor: '$backgroundStrong',
});

const Poster = styled(View, {
  name: 'Poster',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  justifyContent: 'flex-end',
});

const PosterTitle = styled(Text, {
  name: 'PosterTitle',
  fontFamily: '$heading',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$onSoft',
});

const PosterMeta = styled(Text, {
  name: 'PosterMeta',
  fontFamily: '$body',
  fontSize: '$1',
  lineHeight: '$1',
  color: '$onSoft',
  opacity: 0.9,
});

const DotTarget = styled(View, {
  name: 'SpotlightDotTarget',
  // 44 px de large : la barre visible ne fait que 8 px, mais la cible en fait
  // 44 comme partout ailleurs dans l'app.
  width: 44,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

const DotBar = styled(View, {
  name: 'SpotlightDot',
  height: 6,
  borderRadius: '$pill',
  transition: 'medium',

  variants: {
    active: {
      true: { width: 30, backgroundColor: '$solid' },
      false: { width: 8, backgroundColor: '$borderColor' },
    },
  } as const,

  defaultVariants: { active: false },
});

type EventSpotlightProps = {
  events: GuinguetteEvent[];
};

function EventSpotlightComponent({ events }: EventSpotlightProps) {
  const [index, setIndex] = useState(0);
  /** +1 : on avance dans la programmation ; -1 : on remonte. */
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const select = useCallback(
    (next: number) => {
      setDirection(next > index || (index === events.length - 1 && next === 0) ? 1 : -1);
      setIndex(next);
    },
    [events.length, index]
  );

  const advance = useCallback(() => {
    select((index + 1) % events.length);
  }, [events.length, index, select]);

  const active = events[index];
  if (!active) return null;

  return (
    <YStack gap="$sm">
      <Kicker>À l’affiche</Kicker>

      <PosterShell>
        {/*
          Les affiches se recouvrent (elles sont toutes en position absolue) :
          la sortante s'efface pendant que l'entrante arrive, ce qui donne un
          fondu enchaîné plutôt qu'un trou blanc entre les deux.

          Le style de sortie est neutre — un simple fondu, sans direction.
          C'est volontaire : l'élément sortant conserve les props du rendu
          précédent, sa direction serait donc en retard d'un cran.
        */}
        <AnimatePresence>
          <Poster
            key={active.id}
            transition={reduceMotion ? null : 'medium'}
            opacity={1}
            x={0}
            scale={1}
            enterStyle={{ opacity: 0, x: direction * 48, scale: 0.96 }}
            exitStyle={{ opacity: 0, scale: 0.98 }}
            accessibilityRole="button"
            accessibilityLabel={`${active.title}, ${active.when}. Toucher pour voir la soirée suivante.`}
            onPress={advance}
            pressStyle={{ scale: 0.98 }}
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
            onPress={() => select(position)}
          >
            <DotBar active={position === index} />
          </DotTarget>
        ))}
      </XStack>
    </YStack>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);
