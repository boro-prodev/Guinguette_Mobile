/**
 * « À l'affiche » / « Les pépites » — un carrousel plein écran d'une soirée à
 * la fois, avec son compte à rebours. Le composant est générique : c'est
 * `soirees.tsx` qui décide du titre (`kicker`) et du sous-ensemble de soirées
 * affiché — le carrousel lui-même ne sait pas dans quelle section il vit.
 *
 * Navigation : au doigt, par un vrai `ScrollView` paginé, ou directement par
 * l'une des pastilles du bas. Le swipe est gardé par `useSwipeGuard()` — sans
 * lui, le même geste ferait aussi changer d'onglet, puisque `SwipeTabsArea`
 * couvre tout l'écran. C'est le même mécanisme déjà utilisé par la rangée de
 * filtres de La Carte, appliqué ici à un défilement paginé plutôt que libre.
 *
 * Toucher l'affiche active déplie ses informations (description, programme,
 * jauge, tarif, lien artiste, bouton « Participer ») dans un panneau unique,
 * partagé par tout le carrousel — jamais un par page. Changer de soirée
 * (swipe ou pastille) referme systématiquement le panneau : une seule dépliée
 * à la fois, et jamais l'ancienne affichée sous le nouvel événement.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
// Import RNGH plutôt que RN : ce `ScrollView` s'annonce correctement auprès du
// `Gesture.Pan()` de `SwipeTabsArea` (même arbitrage tactile), alors que le
// `ScrollView` natif de React Native se le fait parfois voler par ce même
// geste une fois imbriqué dans le `ScrollView` vertical de l'écran — le
// glissement finit par changer d'onglet au lieu de faire défiler le
// carrousel, sans erreur ni avertissement.
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { LinearTransition, ReduceMotion, useReducedMotion } from 'react-native-reanimated';
import { styled, Text, Theme, View, XStack, YStack } from 'tamagui';

import { Countdown } from '@/components/features/Countdown';
import { EventDetailPane } from '@/components/features/EventDetailPane';
import { useSwipeGuard } from '@/components/layout/SwipeTabs';
import { fonts } from '@/constants/theme';
import type { GuinguetteEvent } from '@/data/events';

/** Hauteur de l'affiche — assez haute pour respirer, assez basse pour laisser
 *  deviner le panneau déplié en dessous. */
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
  flex: 1,
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
  /** Titre de la section — « À l'affiche », « Les pépites »… */
  kicker: string;
  events: GuinguetteEvent[];
};

function EventSpotlightComponent({ kicker, events }: EventSpotlightProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();
  const swipeGuard = useSwipeGuard();

  const active = events[index];

  /** Saut direct depuis une pastille : referme le panneau, comme tout
   *  changement de soirée. */
  const goTo = useCallback(
    (position: number) => {
      setIndex(position);
      setExpanded(false);
      scrollRef.current?.scrollTo({ x: position * containerWidth, animated: !reduceMotion });
    },
    [containerWidth, reduceMotion]
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!containerWidth) return;
      const position = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
      setIndex((current) => {
        if (position === current) return current;
        setExpanded(false);
        return position;
      });
    },
    [containerWidth]
  );

  /** Seule l'affiche actuellement active peut se déplier — un tap sur une
   *  page voisine pendant le règlement du scroll ne doit rien faire. */
  const toggleExpanded = useCallback(
    (position: number) => {
      if (position !== index) return;
      setExpanded((open) => !open);
    },
    [index]
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

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
          onMomentumScrollEnd={handleMomentumEnd}
          {...swipeGuard}
        >
          {events.map((event, position) => (
            <PosterShell key={event.id} width={containerWidth}>
              <Poster
                transition={reduceMotion ? null : 'quick'}
                pressStyle={{ opacity: 0.94 }}
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded && position === index }}
                accessibilityLabel={`${event.title}, ${event.when}. Toucher pour plus d’informations.`}
                onPress={() => toggleExpanded(position)}
              >
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
                    <Text style={[styles.tagLabel, { color: event.tagTextColor }]}>{event.tag}</Text>
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

        {expanded && <EventDetailPane key={active.id} event={active} />}
      </YStack>
    </Animated.View>
  );
}

export const EventSpotlight = memo(EventSpotlightComponent);

const styles = StyleSheet.create({
  tagLabel: {
    // Les capitales sont une mise en forme : `events.ts` garde « Musique
    // Live » en casse naturelle, la transformation se fait ici — comme dans
    // `Button.tsx`, qui posait déjà le motif.
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontFamily: fonts.label,
    fontWeight:600,
    textTransform: 'uppercase',
  },
});
