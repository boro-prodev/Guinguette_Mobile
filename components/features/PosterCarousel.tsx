/**
 * Ce que « À l'affiche » et « Artist Spot » partagent : un carrousel plein
 * écran (une affiche à la fois, swipée ou sautée par pastille) et la coquille
 * visuelle du panneau toujours affiché en dessous. Le contenu de l'affiche et
 * du panneau reste propre à chaque écran (`EventSpotlight`/`EventDetailPane`
 * vs `ArtistSpotlight`/`ArtistDetailPane`) — ce fichier ne porte que la
 * mécanique et l'habillage communs.
 *
 * `usePosterCarousel` centralise l'état du carrousel : index actif, largeur
 * mesurée, garde-fou de swipe. Voir `useSwipeGuard()` — sans lui, swiper dans
 * le carrousel changerait aussi d'onglet, puisque l'écran entier y est
 * sensible.
 *
 * ⚠️ Le `ScrollView` vient de `react-native-gesture-handler`, pas de
 * `react-native` : imbriqué dans le `ScrollView` vertical de l'écran, le
 * `ScrollView` natif de React Native se fait parfois voler son geste par le
 * swipe d'onglets — silencieusement, sans erreur. Rencontré au chantier 2,
 * ce module porte le contournement pour les deux carrousels de l'écran.
 */
import { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { styled, Text, View } from 'tamagui';

import { useSwipeGuard } from '@/components/layout/SwipeTabs';
import { fonts } from '@/constants/theme';

/** Hauteur de l'affiche — assez haute pour respirer, assez basse pour laisser
 *  deviner le panneau en dessous. */
export const POSTER_HEIGHT = 300;

export function usePosterCarousel<T>(items: T[]) {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();
  const swipeGuard = useSwipeGuard();

  const active = items[index];

  /** Saut direct depuis une pastille. */
  const goTo = useCallback(
    (position: number) => {
      setIndex(position);
      scrollRef.current?.scrollTo({ x: position * containerWidth, animated: !reduceMotion });
    },
    [containerWidth, reduceMotion]
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!containerWidth) return;
      const position = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
      setIndex(position);
    },
    [containerWidth]
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  return {
    index,
    active,
    containerWidth,
    scrollRef,
    swipeGuard,
    reduceMotion,
    onLayout,
    handleMomentumEnd,
    goTo,
  };
}

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
  height: POSTER_HEIGHT,
  borderRadius: '$md',
  overflow: 'hidden',
  backgroundColor: '$backgroundStrong',
});

export const Poster = styled(View, {
  name: 'Poster',
  flex: 1,
  justifyContent: 'flex-end',
});

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

export { ScrollView };
