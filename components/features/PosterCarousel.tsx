/**
 * Ce que « À l'affiche » et « Artist Spot » partagent : la coquille visuelle
 * du carrousel (une affiche à la fois, animée par `AnimatePresence` dans
 * chaque écran) et du panneau toujours affiché en dessous. Le contenu de
 * l'affiche et du panneau reste propre à chaque écran
 * (`EventSpotlight`/`EventDetailPane` vs `ArtistSpotlight`/
 * `ArtistDetailPane`) — ce fichier ne porte que l'habillage commun.
 *
 * ⚠️ Pas de `ScrollView` ici : les deux carrousels naviguent au **tap**, pas
 * au swipe (revu après le chantier 2 — swiper une affiche entrait en
 * conflit avec le swipe de navigation entre onglets, trop de gestes
 * proches). `useSwipeGuard()` reste utile ailleurs dans l'app (la rangée de
 * filtres de La Carte), mais plus ici.
 */
import { StyleSheet } from 'react-native';
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
