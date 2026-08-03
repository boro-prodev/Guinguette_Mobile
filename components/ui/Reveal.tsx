/**
 * Équivalent de la classe `.reveal` du site : le contenu monte en fondu à
 * l'apparition, échelonné via `delay`. `ReduceMotion.System` coupe l'animation
 * quand l'utilisateur a désactivé les effets au niveau de l'OS.
 */
import type { PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';

type RevealProps = PropsWithChildren<{
  /** Retard en millisecondes, pour la cascade (0.1s / 0.2s sur le site). */
  delay?: number;
  /** Fondu simple, sans translation verticale. */
  fadeOnly?: boolean;
  style?: ViewStyle | ViewStyle[];
}>;

export function Reveal({ children, delay = 0, fadeOnly = false, style }: RevealProps) {
  const entering = fadeOnly
    ? FadeIn.duration(600).delay(delay).reduceMotion(ReduceMotion.System)
    : FadeInDown.duration(600).delay(delay).reduceMotion(ReduceMotion.System);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
