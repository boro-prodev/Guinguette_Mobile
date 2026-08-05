/**
 * LE bouton de l'application — un seul objet, décliné, jamais recopié.
 *
 * Ce qui ne bouge jamais : la police (Karla SemiBold chassée, en capitales),
 * la géométrie (hauteur ≥ 44 px, padding, rayon en pilule, bordure de 2 px
 * présente même quand elle est transparente pour que toutes les déclinaisons
 * fassent exactement la même taille) et l'animation de pression.
 *
 * Ce qui se personnalise : la couleur, et uniquement elle, via le thème
 * Tamagui courant. Un bouton vert, c'est `<Button theme="secondary">` — pas un
 * nouveau composant, pas un style local. Les thèmes disponibles sont déclarés
 * dans `tamagui.config.ts` : primary (défaut), secondary, tertiary, dusk,
 * lampion (sur photo sombre), neutral.
 *
 *   <Button theme="secondary" tone="soft" size="lg" full onPress={…}>
 *     <Button.Icon name="check" />
 *     <Button.Text>Je serai là !</Button.Text>
 *   </Button>
 *
 * L'animation « lampion » : le bouton se comprime sous le doigt, repart en
 * léger dépassement au relâchement, et un halo ambré se diffuse depuis son
 * contour — l'ampoule d'une guirlande qu'on vient d'allumer.
 */
import { BlurView } from 'expo-blur';
import type { ReactNode, RefObject } from 'react';
import { Children, isValidElement, useCallback, useEffect } from 'react';
import type { View as RNViewInstance } from 'react-native';
import { View as RNView, StyleSheet } from 'react-native';
import Reanimated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  createStyledContext,
  styled,
  Text,
  useTheme,
  View,
  withStaticProperties,
  type GetProps,
} from 'tamagui';

import { Icon, type IconName } from '@/components/ui/Icon';
import { colors, radius } from '@/constants/theme';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonTone = 'solid' | 'soft' | 'outline' | 'ghost' | 'glass';

/** Durée de vie du halo — au-delà, il est déjà totalement transparent. */
const HALO_MS = 560;

/**
 * Un aller du battement de l'anneau `emphasis` — exactement la durée du point
 * du compte à rebours (`PULSE_MS` dans `Countdown.tsx`), repris ici à
 * l'identique : « la même ampoule qui bat », juste posée sur un anneau plutôt
 * que sur un point.
 */
const EMPHASIS_PULSE_MS = 1100;

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

/**
 * `size` et `tone` descendent par contexte : le libellé et l'icône s'accordent
 * au cadre sans qu'on ait à les leur repasser à la main.
 */
const ButtonContext = createStyledContext<{ size: ButtonSize; tone: ButtonTone }>({
  size: 'md',
  tone: 'solid',
});

const ButtonFrame = styled(View, {
  name: 'Button',
  context: ButtonContext,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$pill',
  // Bordure toujours présente, transparente sur les fonds pleins : sans elle,
  // un bouton « outline » serait 4 px plus large que son voisin plein.
  borderWidth: 2,
  borderColor: '$transparent',

  // `transition` et non `animation` : Tamagui 2 a renommé la prop.
  transition: 'bouncy',
  pressStyle: { scale: 0.95 },

  variants: {
    size: {
      sm: { height: '$sm', paddingHorizontal: '$snug', gap: '$xs' },
      md: { height: '$md', paddingHorizontal: '$md', gap: '$base' },
      lg: { height: '$lg', paddingHorizontal: '$md', gap: '$base' },
    },

    tone: {
      solid: { backgroundColor: '$solid' },
      soft: { backgroundColor: '$soft' },
      outline: { backgroundColor: '$transparent', borderColor: '$borderColor' },
      ghost: { backgroundColor: '$transparent' },
      // Entrée VIDE, volontairement. Le fond et le liseré viennent tous les
      // deux du cadre interne dédié posé par `ButtonImpl` (`ButtonGlassFill`),
      // jamais d'ici : sur ce cadre animé (`transition: 'bouncy'`), la moindre
      // couleur nouvelle posée sur ce variant fait planter Reanimated, qui la
      // confond avec le rayon de pilule (« Cannot create property 'onStart'
      // on number '999' »). Reproductible même avec `transition={null}` sur
      // l'instance — le seul contournement fiable trouvé est de ne JAMAIS
      // introduire de nouvelle couleur dans ce variant.
      glass: {},
    },

    /** Occupe toute la largeur disponible — les gros appels à l'action. */
    full: {
      true: { alignSelf: 'stretch' },
    },

    /** Bouton rond à icône seule (fermer, +/-) : la largeur suit la hauteur. */
    circular: {
      true: { paddingHorizontal: '$0', aspectRatio: 1 },
    },

    // Défini en dernier : neutralise la compression des variantes précédentes.
    disabled: {
      true: { opacity: 0.45, pressStyle: { scale: 1 } },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    tone: 'solid',
  },
});

const ButtonLabel = styled(Text, {
  name: 'ButtonText',
  context: ButtonContext,

  fontFamily: '$label',
  textTransform: 'uppercase',
  textAlign: 'center',

  variants: {
    size: {
      sm: { fontSize: '$1', lineHeight: '$1', letterSpacing: '$1' },
      md: { fontSize: '$1', lineHeight: '$1', letterSpacing: '$1' },
      lg: { fontSize: '$2', lineHeight: '$2', letterSpacing: '$2' },
    },

    tone: {
      solid: { color: '$onSolid' },
      soft: { color: '$onSoft' },
      outline: { color: '$onOutline' },
      ghost: { color: '$onOutline' },
      // PAS `onOutline` : sa teinte dépend du thème d'accent (lisible en
      // clair sur `lampion`, mais `dusk`/`neutral` la posent sombre — illisible
      // une fois floutée sur une photo sombre). `surface` reste le même
      // blanc cassé quel que soit le thème : comme `lampion`, le verre est
      // pensé pour se poser sur une photo, jamais sur le fond clair de l'app.
      glass: { color: '$surface' },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    tone: 'solid',
  },
});

/**
 * Le halo de pression. Il déborde volontairement du cadre (insets négatifs)
 * pour rayonner au-delà du bord, et n'intercepte aucun toucher.
 *
 * ⚠️ **Un seul halo, monté en permanence** (chantier 4). La version précédente
 * en montait un NOUVEAU à chaque appui (`setPulses([...current, id])`) et le
 * démontait 560 ms plus tard par `setTimeout` : deux rendus React et un cycle
 * montage/démontage par pression, sur le fil JS, à l'instant précis où le doigt
 * touche. C'était le suspect n° 1 de l'« impression de freeze » remontée par
 * Jonathan. Appuyer n'écrit désormais que dans une valeur partagée.
 *
 * `progress` va de 0 (halo au plus vif) à 1 (dissipé) — il vaut donc **1 au
 * repos**, ce qui rend l'anneau invisible sans rien démonter. L'aller reproduit
 * exactement l'ancien `enterStyle` : opacité 0,45 → 0, échelle 0,9 → 1,45.
 */
function PressHalo({ progress }: { progress: SharedValue<number> }) {
  const theme = useTheme();

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 0.9 + 0.55 * progress.value }],
  }));

  return (
    <Reanimated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          top: -6,
          right: -6,
          bottom: -6,
          left: -6,
          borderRadius: radius.pill,
          borderWidth: 2,
          borderColor: String(theme.glow?.val),
        },
        style,
      ]}
    />
  );
}

/** Icône au trait, à la couleur et à la taille du bouton qui la contient. */
function ButtonIcon({ name, strokeWidth = 2 }: { name: IconName; strokeWidth?: number }) {
  const { size, tone } = ButtonContext.useStyledContext();
  const theme = useTheme();

  // outline et ghost partagent `onOutline` ; `glass` prend `surface` (même
  // raison que `ButtonLabel` juste au-dessus : un texte clair garanti, peu
  // importe le thème d'accent).
  const token =
    tone === 'solid'
      ? theme.onSolid
      : tone === 'soft'
        ? theme.onSoft
        : tone === 'glass'
          ? theme.surface
          : theme.onOutline;

  return <Icon name={name} size={ICON_SIZE[size]} color={String(token?.val)} strokeWidth={strokeWidth} />;
}

/**
 * L'anneau `emphasis`, qui bat — exactement la même mécanique que le point du
 * compte à rebours (`Countdown.tsx`) : un `withRepeat`/`withTiming` en
 * miroir, même easing, même durée. `useReducedMotion` coupe l'animation, pas
 * l'anneau lui-même : il reste posé, à pleine opacité, immobile — le signal
 * de hiérarchie doit survivre à `prefers-reduced-motion`, seul son mouvement
 * lui est propre à sacrifier.
 */
function EmphasisRing() {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(0.25, {
        duration: EMPHASIS_PULSE_MS,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Reanimated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        // Mêmes insets que `PressHalo` (-6) : même rayonnement, mais permanent —
        // pas de montage/démontage à chaque appui, pas de risque de
        // replonger dans le crash Reanimated rencontré sur le cadre animé
        // par Tamagui (cf. `ButtonGlassFill`, plus bas).
        { top: -6, right: -6, bottom: -6, left: -6, borderRadius: radius.pill, borderWidth: 0.6, borderColor: colors.amberBulb },
        ringStyle,
      ]}
    />
  );
}

/**
 * Le fond du bouton « verre » : un flou natif (`expo-blur`, livré avec Expo
 * Go) derrière un voile teinté par la couleur d'accent du thème courant
 * (`$solid`, à faible opacité) — jamais une simple transparence, qui se
 * délite sur les zones claires d'une photo comme `outline` avant lui.
 *
 * `emphasis` réserve à CE bouton le traitement « ampoule » déjà utilisé par le
 * halo de pression (`PressHalo` plus haut) : un anneau ambré qui bat, ici permanent
 * plutôt que déclenché au toucher. De quoi rétablir un rang principal quand
 * deux boutons `tone="glass"` partagent sinon exactement le même traitement —
 * sans revenir à un aplat de couleur qui casserait l'esthétique verre.
 *
 * ⚠️ **Sur Android, le flou n'a lieu QUE si l'appelant fournit `blurTarget`.**
 * `dimezisBlurView` ne floute pas « ce qu'il y a dessous » tout seul : il lui
 * faut la référence d'un `BlurTargetView` qui enveloppe explicitement le
 * contenu à flouter. Sans elle, expo-blur retombe sur `'none'` — un simple
 * voile semi-transparent — en le signalant au démarrage :
 * « You have selected the "dimezisBlurView" blur method, but the `blurTarget`
 * prop has not been configured ». Le bouton reste lisible, mais ce n'est plus
 * du verre. Voir `app/(tabs)/index.tsx` pour le seul appelant qui le câble.
 */
function ButtonGlassFill({
  emphasis = false,
  blurTarget,
}: {
  emphasis?: boolean;
  blurTarget?: RefObject<RNViewInstance | null>;
}) {
  const theme = useTheme();

  return (
    <>
      {emphasis && <EmphasisRing />}
      {/* `RNView`, pas le `View` Tamagui du reste du fichier : un `overflow:
          'hidden'` posé sur un cadre que Tamagui anime (`transition: 'bouncy'`)
          fait planter Reanimated, qui confond alors le style avec une valeur
          animée. Ce cadre-ci est purement décoratif, jamais animé. */}
      <RNView
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          // Le liseré vit ici, pas dans le variant `tone="glass"` du cadre
          // Tamagui : c'est justement lui qui faisait planter Reanimated.
          // `emphasis` l'éclaircit en ambre — le même signal que l'anneau
          // extérieur, mais au ras du bord.
          {
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: emphasis ? colors.amberBulb : colors.glassEdge,
            overflow: 'hidden',
          },
        ]}
      >
        <BlurView
          intensity={40}
          tint="dark"
          // Sans cible, `dimezisBlurView` se dégrade en `'none'` et prévient au
          // démarrage : autant demander `'none'` franchement que réclamer un
          // flou qu'on sait impossible. iOS floute de toute façon sans cible.
          blurMethod={blurTarget ? 'dimezisBlurView' : 'none'}
          blurTarget={blurTarget}
          style={StyleSheet.absoluteFill}
        />
        <RNView
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: String(theme.solid?.val), opacity: emphasis ? 0.3 : 0.22 },
          ]}
        />
      </RNView>
    </>
  );
}

type ButtonFrameProps = GetProps<typeof ButtonFrame>;

export type ButtonProps = ButtonFrameProps & {
  /** Confort d'écriture : `<Button>Réserver</Button>` équivaut à `<Button.Text>`. */
  children?: ReactNode;
  /**
   * Rang principal sur `tone="glass"` uniquement : anneau ambré permanent
   * (cf. `ButtonGlassFill`). Sans effet sur les autres tons, qui portent déjà
   * leur hiérarchie par la couleur pleine.
   */
  emphasis?: boolean;
  /**
   * `tone="glass"` sur **Android** uniquement : la référence du
   * `BlurTargetView` (`expo-blur`) qui enveloppe le contenu à flouter — sans
   * elle, pas de flou du tout, juste un voile (cf. `ButtonGlassFill`). Un même
   * `BlurTargetView` sert plusieurs boutons tant qu'ils tiennent dans ses
   * limites, et c'est le montage recommandé : une cible par bouton coûterait
   * une capture de plus à chaque image.
   */
  blurTarget?: RefObject<RNViewInstance | null>;
};

function ButtonImpl({
  children,
  onPress,
  onPressIn,
  disabled,
  tone = 'solid',
  emphasis = false,
  blurTarget,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  /** 0 = halo au plus vif, 1 = dissipé. Au repos il vaut donc 1, pas 0. */
  const halo = useSharedValue(1);

  const firePulse = useCallback(() => {
    // Le halo est purement décoratif : quand l'utilisateur a désactivé les
    // animations au niveau du système, on ne l'allume pas du tout.
    if (reduceMotion || disabled) return;

    // Un appui n'est plus qu'une écriture dans une valeur partagée : ni rendu
    // React, ni montage, ni `setTimeout` à nettoyer. Le halo est déjà là.
    halo.value = 0;
    halo.value = withTiming(1, { duration: HALO_MS, reduceMotion: ReduceMotion.System });
  }, [disabled, halo, reduceMotion]);

  // Une chaîne nue passée en enfant est enveloppée : cela évite d'écrire
  // <Button.Text> pour les neuf boutons sur dix qui n'ont qu'un libellé.
  const content = Children.map(children, (child) =>
    isValidElement(child) ? child : child == null || child === false ? null : (
      <ButtonLabel>{child}</ButtonLabel>
    )
  );

  return (
    <ButtonFrame
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      tone={tone}
      // `tone="glass"` introduit `$glassEdge`, une bordure translucide inédite
      // pour ce cadre : le pilote Reanimated de Tamagui tente d'interpoler ce
      // nouveau style en même temps que le rayon de pilule (999) et plante
      // dessus (« Cannot create property 'onStart' on number '999' »). Pas de
      // transition animée sur ce ton, le temps du prototype — la compression
      // au toucher (`pressStyle`) reste immédiate, seul le rebond disparaît.
      transition={reduceMotion || tone === 'glass' ? null : 'bouncy'}
      onPressIn={(event) => {
        firePulse();
        onPressIn?.(event);
      }}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      {tone === 'glass' && <ButtonGlassFill emphasis={emphasis} blurTarget={blurTarget} />}
      <PressHalo progress={halo} />
      {content}
    </ButtonFrame>
  );
}

export const Button = withStaticProperties(ButtonImpl, {
  Text: ButtonLabel,
  Icon: ButtonIcon,
});
