/**
 * Design system « L'Heure Bleue » 
 * Source unique des couleurs, de l'échelle
 * typographique et du rythme d'espacement : ne jamais écrire de valeur en dur
 * dans un composant, importer depuis ici.
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#f2ead9',
  onBackground: '#1c2a35',

  surface: '#f2ead9',
  surfaceDim: '#e4dac2',
  surfaceBright: '#f8f2e4',
  surfaceContainerLowest: '#fffdf7',
  surfaceContainerLow: '#f7f0e0',
  surfaceContainer: '#f0e7d3',
  surfaceContainerHigh: '#e9dfc8',
  surfaceContainerHighest: '#e1d5ba',
  surfaceVariant: '#e1d5ba',
  onSurface: '#1c2a35',
  onSurfaceVariant: '#5b5240',

  inverseSurface: '#1c2a35',
  inverseOnSurface: '#f2ead9',

  outline: '#8a7d62',
  outlineVariant: '#cdbfa0',

  primary: '#a13d29',
  onPrimary: '#fdf8ef',
  primaryContainer: '#f0d9c8',
  onPrimaryContainer: '#5c2415',

  secondary: '#47572f',
  onSecondary: '#f9f7ec',
  secondaryContainer: '#dde6c9',
  onSecondaryContainer: '#33421f',

  tertiary: '#8a5f1a',
  onTertiary: '#fffaf0',
  tertiaryContainer: '#f6dfab',
  onTertiaryContainer: '#4d3a0a',
  tertiaryFixed: '#f6dfab',
  tertiaryFixedDim: '#edc873',
  onTertiaryFixed: '#4d3a0a',

  error: '#ba1a1a',
  onError: '#ffffff',

  /* Accents de marque (hors nomenclature Material) */
  dusk: '#16283a',
  duskDeep: '#0c1720',
  bark: '#6b5d49',
  amberBulb: '#f0ad4a',
  emberDark: '#7c3420',

  /**
   * Liseré du bouton « verre » (`tone="glass"` de `Button.tsx`) : la même
   * teinte quel que soit le thème d'accent — c'est le flou et le voile teinté
   * qui portent la couleur, pas le contour.
   */
  glassEdge: 'rgba(255,253,247,0.4)',
} as const;

/**
 * Sur Android, `fontWeight` est ignoré quand une police custom est chargée :
 * chaque graisse doit désigner explicitement son fichier.
 */
export const fonts = {
  /**
   * Berkshire Swash — la police d'affichage retenue au chantier 0 (3 août
   * 2026). Empattements à swash, esprit enseigne de guinguette peinte à la
   * main. Une seule graisse existe (400) : la hiérarchie des titres se fait
   * donc entièrement par la taille, jamais par le poids.
   */
  display: 'BerkshireSwash_400Regular',
  headline: 'BerkshireSwash_400Regular',
  body: 'Karla_400Regular',
  bodyItalic: 'Karla_400Regular_Italic',
  bodySemiBold: 'Karla_600SemiBold',
  label: 'Karla_600SemiBold',
  accent: 'Caveat_600SemiBold',
} as const;

/**
 * Interligne minimum, en multiple de la taille de police, RELEVÉ DANS LES
 * FICHIERS `.ttf` (table `hhea` : `ascender - descender`, sur `unitsPerEm`).
 *
 * Ce n'est pas une préférence esthétique, c'est un plancher technique : sous
 * cette valeur, RN Android comprime la boîte de glyphe et **coupe les
 * jambages descendants** (le « g » de Oignies, le « p » de lampions). Le web
 * tolère un interligne de 1,1 sur un titre parce que la boîte de glyphe y
 * déborde librement ; ici, elle rogne.
 *
 * Toute nouvelle entrée de `type` doit respecter le plancher de sa famille —
 * et tout changement de police d'affichage impose de relever ces coefficients
 * dans la nouvelle fonte avant de fixer l'échelle.
 */
export const MIN_LINE_HEIGHT_RATIO = {
  /** Berkshire Swash 400 : asc 2007, desc −537, upm 2048. */
  display: 1.242,
  /** Karla 400/600 : asc 1834, desc −504, upm 2000. */
  body: 1.169,
  /** Caveat 600 : asc 960, desc −300, upm 1000. */
  accent: 1.26,
} as const;

/** Échelle typographique — reprend `--text-*` de main.css. */
export const type = {
  displayLg: {
    fontFamily: fonts.display,
    fontSize: 40,
    // Berkshire Swash exige 40 × 1,242 = 49,7 px.
    lineHeight: 50,
    letterSpacing: -0.2,
  },
  headlineLg: {
    fontFamily: fonts.headline,
    fontSize: 32,
    lineHeight: 40,
  },
  headlineMd: {
    fontFamily: fonts.headline,
    fontSize: 24,
    lineHeight: 32,
  },
  /**
   * Le cran de la marque dans l'en-tête. 19 px est un choix contraint, pas un
   * caprice : à 24 px, « La Guinguette de Oignies » réclame ~290 px pour les
   * ~268 disponibles à côté du bouton d'appel, et se tronquerait.
   */
  headlineSm: {
    fontFamily: fonts.headline,
    fontSize: 19,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  /**
   * Les petites mentions en casse normale : notes de démo, dates, légendes,
   * toasts. À ne pas confondre avec `labelSm`, qui est chassé (+0,6) parce
   * qu'il est fait pour des CAPITALES — ce chasse rend au contraire une
   * phrase courante plus lâche et plus difficile à lire.
   */
  caption: {
    fontFamily: fonts.label,
    fontSize: 13,
    lineHeight: 18,
  },
  /** Micro-libellés EN CAPITALES uniquement — sinon, `caption`. */
  labelSm: {
    fontFamily: fonts.label,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  accent: {
    fontFamily: fonts.accent,
    fontSize: 26,
    // 34 et non 30 : Caveat exige 26 × 1,26 = 32,8 px, et « Sous les
    // lampions » a un jambage de 7,8 px.
    lineHeight: 34,
  },
} satisfies Record<string, TextStyle>;

/**
 * Chiffres à chasse fixe, pour toute valeur qui change sous les yeux
 * (compte à rebours) ou qui s'aligne en colonne (horaires, programme).
 *
 * ⚠️ Ne fonctionne QUE sur Karla : `tnum` est présent dans son `GSUB`, mais
 * **absent de Berkshire Swash** (`aalt frac liga ordn sups` seulement). Posé
 * sur un texte de la police d'affichage, c'est un no-op silencieux — inutile
 * d'essayer sur les prix de la carte ou le compteur de couverts.
 */
export const tabularNums = {
  fontVariant: ['tabular-nums'],
} satisfies TextStyle;

/** Rythme d'espacement (base 8px) — reprend `--spacing-*`. */
export const spacing = {
  xs: 4,
  sm: 12,
  /**
   * Le cran manquant de l'échelle. Il existait déjà, mais écrit en dur (`16`)
   * dans le padding des boutons et des puces : le déclarer ici évite qu'il
   * continue à se recopier.
   */
  snug: 16,
  md: 24,
  lg: 48,
  xl: 80,
  base: 8,
  gutter: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  sheet: 24,
  pill: 999,
} as const;

/**
 * Ombres teintées ember (`rgba(188,71,73,…)` du site web), déclinées par
 * plateforme : iOS accepte une couleur d'ombre, Android n'a que `elevation`.
 */
export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: 'rgb(188,71,73)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
    },
    android: { elevation: 3 },
    default: {},
  })!,
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: 'rgb(188,71,73)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 30,
    },
    android: { elevation: 6 },
    default: {},
  })!,
  sheet: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -12 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
    },
    android: { elevation: 24 },
    default: {},
  })!,
  bulb: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.amberBulb,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
    },
    android: { elevation: 4 },
    default: {},
  })!,
} as const;

/** Hauteur de la barre d'onglets (hors safe-area) — cf. `h-20` du site. */
export const TAB_BAR_HEIGHT = 64;
