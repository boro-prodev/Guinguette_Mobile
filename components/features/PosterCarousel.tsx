/**
 * Ce que « À l'affiche » et « Artist Spot » partagent : la coquille visuelle
 * du carrousel (une affiche à la fois, animée par `AnimatePresence` dans
 * chaque écran), le geste qui la pilote (`usePosterSwipe`, ci-dessous) et le
 * panneau toujours affiché en dessous. Le contenu de l'affiche et du panneau
 * reste propre à chaque écran (`EventSpotlight`/`EventDetailPane` vs
 * `ArtistSpotlight`/`ArtistDetailPane`) — ce fichier ne porte que l'habillage
 * et la mécanique communs.
 *
 * ⚠️ Le swipe d'onglets a disparu le 5 août 2026 (voir
 * `app/(tabs)/_layout.tsx`) : le même geste horizontal servait aux deux à la
 * fois et entrait en conflit. Le carrousel en hérite entièrement — tap **et**
 * swipe y cohabitent désormais, sans plus jamais rien à arbitrer avec la
 * navigation entre onglets.
 */
import { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { styled, Text, View } from 'tamagui';

import { fonts } from '@/constants/theme';

/** Hauteur de l'affiche — assez haute pour respirer, assez basse pour laisser
 *  deviner le panneau en dessous. */
export const POSTER_HEIGHT = 300;

export const Kicker = styled(Text, {
  name: 'SpotlightKicker',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  textTransform: 'uppercase',
  color: '$muted',
});

export const PosterShell = styled(View, {
  name: 'PosterShell',
  width: '100%',
  height: POSTER_HEIGHT,
  borderRadius: '$md',
  overflow: 'hidden',
  backgroundColor: '$backgroundStrong',
  // Contexte de positionnement pour `Poster`, ci-dessous — ne pas retirer.
  position: 'relative',
});

/**
 * ⚠️ `position: 'absolute'` + les quatre côtés à 0 ne sont pas cosmétiques :
 * `AnimatePresence` garde l'affiche sortante montée le temps de son animation
 * de sortie, donc l'ancienne et la nouvelle coexistent brièvement comme deux
 * enfants de `PosterShell`. Sans position absolue, ce sont deux vues en flux
 * normal (`flex: 1` dans un parent en colonne) : elles se partagent alors la
 * hauteur de 300 au lieu de se superposer, et la nouvelle affiche apparaît un
 * instant écrasée à mi-hauteur avant de reprendre sa taille une fois
 * l'ancienne démontée. La position absolue les superpose correctement, quel
 * que soit le nombre d'affiches montées en même temps.
 */
export const Poster = styled(View, {
  name: 'Poster',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'flex-end',
});

/** Distance (px) ou vitesse (px/s) franchie qui valide un swipe de carrousel. */
const SWIPE_DISTANCE = 56;
const SWIPE_VELOCITY = 600;
/** Part du glissement du doigt appliquée à l'affiche elle-même, en aperçu. */
const POSTER_FOLLOW = 0.5;
/** Part du même glissement répercutée sur toute la page — un effet plus
 *  subtil que sur l'affiche, qui reste le foyer du geste. */
const PAGE_FOLLOW = 0.12;
const FOLLOW_SPRING = { damping: 18, stiffness: 220, mass: 0.9 };

/**
 * Geste partagé par « À l'affiche » et « Artist Spot » : glisser à gauche
 * avance, glisser à droite recule, taper avance — les trois aboutissent au
 * même `onNext`/`onPrevious`, donc à la même transition `AnimatePresence`
 * dans l'écran appelant. Le glissement lui-même n'est qu'un **aperçu** (léger
 * `translateX` + compression au toucher) : la validation ne se joue qu'au
 * relâchement, jamais en continu.
 *
 * `Gesture.Race(pan, tap)`, pas un `onPress` Tamagui séparé : les deux
 * viennent du même système (`react-native-gesture-handler`), donc rien à
 * arbitrer entre deux mécaniques tactiles différentes. Le tap gagne la course
 * quand le doigt n'a quasi pas bougé ; sinon c'est le pan qui l'emporte dès
 * qu'il franchit son seuil d'activation horizontal.
 *
 * `pageFollowX`, optionnel, reçoit une fraction du même glissement — c'est ce
 * qui fait suivre toute la page, pas seulement l'affiche (voir `soirees.tsx`).
 */
export function usePosterSwipe({
  onNext,
  onPrevious,
  pageFollowX,
  reduceMotion,
}: {
  onNext: () => void;
  onPrevious: () => void;
  pageFollowX?: SharedValue<number>;
  reduceMotion: boolean;
}) {
  const dragX = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const commitSwipe = useCallback(
    (direction: 1 | -1) => {
      if (direction === 1) onNext();
      else onPrevious();
    },
    [onNext, onPrevious]
  );

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      // Comme l'ancien swipe d'onglets : il faut une intention horizontale
      // franche, et le geste cède vite à la verticale pour laisser défiler
      // la page — c'est elle qui reste prioritaire au-delà du seuil.
      .activeOffsetX([-10, 10])
      .failOffsetY([-12, 12])
      .onBegin(() => {
        pressScale.value = withTiming(0.97, { duration: 80 });
      })
      .onUpdate((event) => {
        if (reduceMotion) return;
        dragX.value = event.translationX * POSTER_FOLLOW;
        if (pageFollowX) pageFollowX.value = event.translationX * PAGE_FOLLOW;
      })
      .onEnd((event) => {
        const passed =
          Math.abs(event.translationX) > SWIPE_DISTANCE ||
          Math.abs(event.velocityX) > SWIPE_VELOCITY;
        if (passed) runOnJS(commitSwipe)(event.translationX < 0 ? 1 : -1);
      })
      .onFinalize(() => {
        dragX.value = withSpring(0, FOLLOW_SPRING);
        pressScale.value = withTiming(1, { duration: 150 });
        if (pageFollowX) pageFollowX.value = withSpring(0, FOLLOW_SPRING);
      });

    const tap = Gesture.Tap()
      .maxDistance(10)
      .onBegin(() => {
        pressScale.value = withTiming(0.97, { duration: 80 });
      })
      .onEnd((_event, success) => {
        if (success) runOnJS(onNext)();
      })
      .onFinalize(() => {
        pressScale.value = withTiming(1, { duration: 150 });
      });

    return Gesture.Race(pan, tap);
  }, [commitSwipe, dragX, onNext, pageFollowX, pressScale, reduceMotion]);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { scale: pressScale.value }],
  }));

  return { gesture, dragStyle };
}

export const PosterTitle = styled(Text, {
  name: 'PosterTitle',
  fontFamily: '$heading',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$onSoft',
});

export const PosterMeta = styled(Text, {
  name: 'PosterMeta',
  fontFamily: '$body',
  fontSize: '$1',
  lineHeight: '$1',
  color: '$onSoft',
  opacity: 0.9,
});

export const DotTarget = styled(View, {
  name: 'SpotlightDotTarget',
  // 44 px de large : la barre visible ne fait que 8 px, mais la cible en fait
  // 44 comme partout ailleurs dans l'app.
  width: 44,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

export const DotBar = styled(View, {
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

/** Coquille commune aux deux panneaux toujours affichés. */
export const Pane = styled(View, {
  name: 'SpotlightPane',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$md',
  overflow: 'hidden',
  padding: '$md',
  gap: '$sm',
});

export const Body = styled(Text, {
  name: 'SpotlightBody',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$muted',
});

export const tagLabelStyle = StyleSheet.create({
  tagLabel: {
    // Les capitales sont une mise en forme : les données gardent leur casse
    // naturelle, la transformation se fait ici — comme dans `Button.tsx`.
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontFamily: fonts.label,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
}).tagLabel;
