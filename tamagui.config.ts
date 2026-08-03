/**
 * Configuration Tamagui « Terra Guinguette ».
 *
 * `constants/theme.ts` reste la SOURCE des valeurs brutes : ce fichier ne fait
 * que les exposer à Tamagui sous forme de tokens, de polices et de thèmes.
 * Aucune couleur, aucun espacement n'est recopié en dur ici — changer une
 * valeur dans `theme.ts` la change partout, y compris dans les composants
 * Tamagui.
 *
 * Le compilateur Tamagui n'est pas activé (le SDK 57 fournit son propre preset
 * Babel et le projet interdit un `babel.config.js`, cf. CLAUDE.md) : Tamagui
 * tourne en mode runtime. C'est sans conséquence ici — l'app est petite, et
 * l'extraction CSS ne sert de toute façon que sur le web.
 */
import { createAnimations } from '@tamagui/animations-reanimated';
import { createFont, createTamagui, createTokens } from 'tamagui';

import { colors, fonts, radius, spacing } from './constants/theme';

/* ------------------------------------------------------------------ tokens */

const tokens = createTokens({
  color: {
    ...colors,
    transparent: 'transparent',
  },

  /** Rythme d'espacement du projet, tel quel. */
  space: {
    0: 0,
    xs: spacing.xs,
    base: spacing.base,
    sm: spacing.sm,
    snug: spacing.snug,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    gutter: spacing.gutter,
    true: spacing.sm,
  },

  /**
   * Hauteurs de cible tactile. Le minimum du projet est 44 px : aucune taille
   * en dessous n'existe, on ne peut donc pas fabriquer un bouton trop petit.
   */
  size: {
    0: 0,
    sm: 44,
    md: 52,
    lg: 58,
    icon: 48,
    true: 52,
  },

  radius: {
    0: 0,
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
    sheet: radius.sheet,
    pill: radius.pill,
    true: radius.md,
  },

  zIndex: {
    0: 0,
    base: 1,
    raised: 10,
    sticky: 100,
    overlay: 1000,
    true: 1,
  },
});

/* ----------------------------------------------------------------- polices */

/**
 * Sur Android, `fontWeight` n'a aucun effet sur une police custom : c'est le
 * fichier qui porte la graisse. La table `face` de Tamagui existe exactement
 * pour ça — écrire `fontWeight="600"` fait résoudre le bon fichier au lieu
 * d'être ignoré silencieusement.
 */
const displayFont = createFont({
  family: fonts.display,
  size: { 1: 24, 2: 32, 3: 40, true: 32 },
  // Planchers Berkshire Swash (× 1,242) : 29,8 / 39,7 / 49,7 — les trois crans
  // passent. Cf. MIN_LINE_HEIGHT_RATIO dans theme.ts : sous ces valeurs,
  // Android coupe les jambages.
  lineHeight: { 1: 32, 2: 40, 3: 50, true: 40 },
  letterSpacing: { 1: 0, 2: 0, 3: -0.2, true: 0 },
  // Berkshire Swash n'existe qu'en 400. Demander du 600 ferait synthétiser un
  // faux gras à iOS (Android, lui, ignorerait simplement la demande) : on
  // déclare la seule graisse qui existe vraiment.
  weight: { 1: '400', true: '400' },
  // Toutes les clés pointent sur l'unique fichier : une graisse demandée par
  // erreur retombe ainsi sur le vrai dessin plutôt que sur une synthèse.
  face: {
    '400': { normal: fonts.display },
    '600': { normal: fonts.display },
    '700': { normal: fonts.display },
    bold: { normal: fonts.display },
    normal: { normal: fonts.display },
  },
});

const bodyFont = createFont({
  family: fonts.body,
  size: { 1: 14, 2: 16, 3: 18, true: 16 },
  lineHeight: { 1: 20, 2: 24, 3: 28, true: 24 },
  letterSpacing: { 1: 0, 2: 0, 3: 0, true: 0 },
  weight: { 1: '400', true: '400' },
  face: {
    '400': { normal: fonts.body, italic: fonts.bodyItalic },
    '500': { normal: fonts.bodySemiBold },
    '600': { normal: fonts.bodySemiBold },
    '700': { normal: fonts.bodySemiBold },
    bold: { normal: fonts.bodySemiBold },
    normal: { normal: fonts.body, italic: fonts.bodyItalic },
  },
});

/** Police des boutons et des micro-libellés : Karla SemiBold, légèrement chassée. */
const labelFont = createFont({
  family: fonts.label,
  size: { 1: 12, 2: 14, 3: 16, true: 12 },
  lineHeight: { 1: 16, 2: 20, 3: 22, true: 16 },
  letterSpacing: { 1: 0.6, 2: 0.5, 3: 0.4, true: 0.6 },
  weight: { 1: '600', true: '600' },
  face: {
    '400': { normal: fonts.label },
    '600': { normal: fonts.label },
    '700': { normal: fonts.label },
    bold: { normal: fonts.label },
    normal: { normal: fonts.label },
  },
});

/** Caveat — les accents manuscrits (« Sous les lampions »). */
const accentFont = createFont({
  family: fonts.accent,
  size: { 1: 20, 2: 26, 3: 34, true: 26 },
  // Caveat descend bas (jambage de 0,30 em) : ses trois crans passaient tous
  // sous le plancher de 1,26 (25,2 / 32,8 / 42,8) et rognaient.
  lineHeight: { 1: 26, 2: 34, 3: 44, true: 34 },
  letterSpacing: { 1: 0, 2: 0, 3: 0, true: 0 },
  weight: { 1: '600', true: '600' },
  face: {
    '400': { normal: fonts.accent },
    '600': { normal: fonts.accent },
    bold: { normal: fonts.accent },
    normal: { normal: fonts.accent },
  },
});

/* ------------------------------------------------------------------ thèmes */

/**
 * Thème de base. Aux clés Tamagui habituelles (`background`, `color`,
 * `borderColor`…) s'ajoutent quatre clés maison qui portent *l'accent* du
 * contexte courant :
 *
 * - `solid` / `onSolid` — le fond plein et son texte (bouton principal) ;
 * - `soft` / `onSoft`   — la teinte douce et son texte (bouton secondaire) ;
 * - `onOutline`         — le texte des boutons détourés et fantômes ;
 * - `glow`              — la couleur du halo de pression.
 *
 * C'est ce qui permet d'avoir UN seul bouton dans toute l'app dont seules les
 * couleurs changent : `<Button theme="secondary">` bascule ces cinq clés en
 * vert sans toucher à la géométrie ni à la typographie.
 */
const baseTheme = {
  background: colors.background,
  backgroundHover: colors.surfaceContainer,
  backgroundPress: colors.surfaceContainerHigh,
  backgroundFocus: colors.surfaceContainerHigh,
  backgroundStrong: colors.surfaceContainerLowest,
  backgroundTransparent: 'transparent',

  color: colors.onBackground,
  colorHover: colors.onBackground,
  colorPress: colors.onBackground,
  colorFocus: colors.onBackground,
  colorTransparent: 'transparent',

  borderColor: colors.outlineVariant,
  borderColorHover: colors.outline,
  borderColorPress: colors.outline,
  borderColorFocus: colors.outline,

  placeholderColor: colors.outline,
  outlineColor: colors.outline,
  shadowColor: 'rgba(188,71,73,0.16)',
  shadowColorHover: 'rgba(188,71,73,0.22)',

  /* Clés maison */
  muted: colors.onSurfaceVariant,
  surface: colors.surfaceContainerLowest,
  solid: colors.primary,
  onSolid: colors.onPrimary,
  soft: colors.primaryContainer,
  onSoft: colors.onPrimaryContainer,
  onOutline: colors.primary,
  glow: colors.amberBulb,
} as const;

type GuinguetteTheme = { [K in keyof typeof baseTheme]: string };

/**
 * Les sous-thèmes héritent en pratique du thème parent chez Tamagui, mais on
 * étale explicitement `baseTheme` : une clé oubliée deviendrait sinon une
 * couleur silencieusement fausse, difficile à repérer sur une démo.
 */
function accent(overrides: Partial<GuinguetteTheme>): GuinguetteTheme {
  return { ...baseTheme, ...overrides };
}

const themes = {
  light: accent({}),

  /** Rouge terre — l'accent par défaut (réserver, valider). */
  light_primary: accent({}),

  /** Vert feuillage — les confirmations et les états « acquis ». */
  light_secondary: accent({
    solid: colors.secondary,
    onSolid: colors.onSecondary,
    soft: colors.secondaryContainer,
    onSoft: colors.onSecondaryContainer,
    onOutline: colors.secondary,
    glow: colors.secondaryContainer,
  }),

  /** Doré — les mises en avant chaleureuses (à l'affiche, prix). */
  light_tertiary: accent({
    solid: colors.tertiary,
    onSolid: colors.onTertiary,
    soft: colors.tertiaryContainer,
    onSoft: colors.onTertiaryContainer,
    onOutline: colors.tertiary,
    glow: colors.tertiaryFixedDim,
  }),

  /** Bleu nuit — sur fond clair, un accent sobre et contrasté. */
  light_dusk: accent({
    solid: colors.dusk,
    onSolid: colors.surfaceContainerLowest,
    soft: colors.surfaceContainerHigh,
    onSoft: colors.dusk,
    onOutline: colors.dusk,
    glow: colors.amberBulb,
  }),

  /**
   * Ampoule ambrée — le seul thème pensé pour se poser SUR la photo sombre de
   * l'accueil : contours et texte clairs, halo doré.
   */
  light_lampion: accent({
    color: colors.surfaceContainerLowest,
    borderColor: 'rgba(240,173,74,0.7)',
    solid: colors.amberBulb,
    onSolid: colors.duskDeep,
    // Un voile assez dense pour qu'un texte clair reste lisible par-dessus
    // n'importe quelle photo, y compris ses zones les plus claires.
    soft: 'rgba(12,23,32,0.55)',
    onSoft: colors.surfaceContainerLowest,
    // Sur la photo sombre, un contour ambré mais un texte blanc : c'est le
    // texte qui doit rester lisible, pas se fondre dans le contour.
    onOutline: colors.surfaceContainerLowest,
    glow: colors.amberBulb,
    muted: colors.surfaceContainerLowest,
  }),

  /** Neutre — les actions discrètes (retour, fermer, annuler). */
  light_neutral: accent({
    solid: colors.surfaceContainerHigh,
    onSolid: colors.onSurface,
    soft: colors.surfaceContainerLow,
    onSoft: colors.onSurfaceVariant,
    onOutline: colors.onSurfaceVariant,
    glow: colors.outlineVariant,
  }),
};

/* -------------------------------------------------------------- animations */

/**
 * Toutes les animations Tamagui passent par Reanimated — déjà présent dans le
 * projet et déjà sur le thread UI. Aucun moteur d'animation supplémentaire.
 */
const animations = createAnimations({
  /** Rebond franc : la respiration des boutons au relâchement. */
  bouncy: { type: 'spring', damping: 12, mass: 0.8, stiffness: 260 },
  /** Réponse immédiate : la compression sous le doigt. */
  quick: { type: 'spring', damping: 22, mass: 0.6, stiffness: 340 },
  /** Ample et posé : dépliage de carte, apparition de panneau. */
  lazy: { type: 'spring', damping: 20, mass: 1, stiffness: 90 },
  /** Entre les deux : changements d'état de contenu. */
  medium: { type: 'spring', damping: 16, mass: 0.9, stiffness: 150 },
  /** Le halo de pression, qui doit s'éteindre en douceur et sans rebond. */
  halo: { type: 'timing', duration: 520 },
  /** Fondu court, sans mouvement. */
  fade: { type: 'timing', duration: 220 },
});

/* ------------------------------------------------------------------ config */

/**
 * L'app est mono-format (téléphone, ~360–430 px). Ces deux points de rupture
 * ne servent qu'à dégonfler les grands titres sur les petits écrans.
 */
const media = {
  narrow: { maxWidth: 380 },
  wide: { minWidth: 381 },
  short: { maxHeight: 700 },
} as const;

export const config = createTamagui({
  tokens,
  themes,
  media,
  animations,
  fonts: {
    display: displayFont,
    heading: displayFont,
    body: bodyFont,
    label: labelFont,
    accent: accentFont,
  },
  settings: {
    defaultFont: 'body',
    onlyAllowShorthands: false,
  },
});

export type GuinguetteConfig = typeof config;

/**
 * L'augmentation vise `@tamagui/web` et pas `tamagui` : c'est là que
 * `TamaguiCustomConfig` est *déclarée*. Le paquet `tamagui` ne fait que la
 * ré-exporter, et augmenter une ré-export crée une seconde interface au lieu
 * de fusionner — les tokens et les animations resteraient alors inconnus du
 * typage (`animation="bouncy"` refusé, `$solid` non suggéré).
 */
declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends GuinguetteConfig {}
}

export default config;
