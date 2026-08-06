/**
 * Les pièces communes aux deux sections de l'écran Soirées — « À l'affiche »
 * (`EventSpotlight`) et « Artist Spot » (`ArtistSpotlight`) : le cadre de
 * l'affiche, sa titraille, le panneau à ombre portée, et la rangée de
 * pastilles. Rien que de l'habillage : le contenu reste propre à chaque
 * section.
 *
 * ⚠️ **Ce fichier s'appelait `PosterCarousel.tsx` et portait `PosterFrame`, la
 * mécanique complète d'un carrousel à trois affiches** (bande glissante, geste
 * de swipe, tap pour avancer, retour tactile). Elle a été retirée le 6 août
 * 2026 : depuis que **toute la page se feuillette d'un bloc**
 * (`NewspaperPager`), une soirée et son artiste vivent sur la même page de
 * journal, et il n'y a plus rien à faire défiler à l'intérieur. Deux gestes
 * horizontaux imbriqués, c'est exactement le conflit qui avait fait supprimer
 * le swipe entre onglets la veille — on ne le réintroduit pas un cran plus
 * bas. L'affiche est redevenue ce qu'elle montre : une image.
 *
 * La navigation entre soirées vit donc **entièrement** dans
 * `NewspaperPager` + la rangée de pastilles de `app/(tabs)/soirees.tsx`.
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

/** Habillage intérieur d'une affiche — image, dégradé, texte plaqués en bas. */
export const PosterContent = styled(View, {
  name: 'PosterContent',
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

/** Coquille commune aux deux panneaux toujours affichés — jamais démontée,
 *  voir `EventDetailPane`/`ArtistDetailPane` pour pourquoi. */
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
