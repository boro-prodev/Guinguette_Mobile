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
import { Children, isValidElement, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
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

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonTone = 'solid' | 'soft' | 'outline' | 'ghost';

/** Durée de vie du halo — au-delà, il est déjà totalement transparent. */
const HALO_MS = 560;

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
    },
  } as const,

  defaultVariants: {
    size: 'md',
    tone: 'solid',
  },
});

/**
 * Le halo. Il déborde volontairement du cadre (insets négatifs) pour rayonner
 * au-delà du bord, et n'intercepte aucun toucher.
 */
const Halo = styled(View, {
  name: 'ButtonHalo',
  position: 'absolute',
  top: -6,
  right: -6,
  bottom: -6,
  left: -6,
  borderRadius: '$pill',
  borderWidth: 2,
  borderColor: '$glow',
  pointerEvents: 'none',
});

/** Icône au trait, à la couleur et à la taille du bouton qui la contient. */
function ButtonIcon({ name, strokeWidth = 2 }: { name: IconName; strokeWidth?: number }) {
  const { size, tone } = ButtonContext.useStyledContext();
  const theme = useTheme();

  const token =
    tone === 'solid' ? theme.onSolid : tone === 'soft' ? theme.onSoft : theme.onOutline;

  return <Icon name={name} size={ICON_SIZE[size]} color={String(token?.val)} strokeWidth={strokeWidth} />;
}

type ButtonFrameProps = GetProps<typeof ButtonFrame>;

export type ButtonProps = ButtonFrameProps & {
  /** Confort d'écriture : `<Button>Réserver</Button>` équivaut à `<Button.Text>`. */
  children?: ReactNode;
};

function ButtonImpl({ children, onPress, onPressIn, disabled, ...props }: ButtonProps) {
  const [pulses, setPulses] = useState<number[]>([]);
  const nextPulseId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const firePulse = useCallback(() => {
    // Le halo est purement décoratif : quand l'utilisateur a désactivé les
    // animations au niveau du système, on ne l'allume pas du tout.
    if (reduceMotion || disabled) return;

    const id = (nextPulseId.current += 1);
    setPulses((current) => [...current, id]);

    const timer = setTimeout(() => {
      setPulses((current) => current.filter((pulse) => pulse !== id));
      timers.current = timers.current.filter((pending) => pending !== timer);
    }, HALO_MS);

    timers.current.push(timer);
  }, [disabled, reduceMotion]);

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
      transition={reduceMotion ? null : 'bouncy'}
      onPressIn={(event) => {
        firePulse();
        onPressIn?.(event);
      }}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      {pulses.map((id) => (
        <Halo
          key={id}
          transition="halo"
          // Le style au repos est déjà éteint : monté sur `enterStyle`, le
          // halo joue donc l'aller (diffusion + fondu) puis se démonte alors
          // qu'il est déjà invisible. Pas besoin d'AnimatePresence.
          opacity={0}
          scale={1.45}
          enterStyle={{ opacity: 0.65, scale: 0.92 }}
        />
      ))}
      {content}
    </ButtonFrame>
  );
}

export const Button = withStaticProperties(ButtonImpl, {
  Text: ButtonLabel,
  Icon: ButtonIcon,
});
