/**
 * Équivalent de la classe `.reveal` du site : le contenu monte en fondu à
 * l'apparition, échelonné via `delay`. `ReduceMotion.System` coupe l'animation
 * quand l'utilisateur a désactivé les effets au niveau de l'OS.
 */
import type { PropsWithChildren } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';

type RevealProps = PropsWithChildren<{
  /** Retard en millisecondes, pour la cascade (0.1s / 0.2s sur le site). */
  delay?: number;
  /** Fondu simple, sans translation verticale. */
  fadeOnly?: boolean;
  // `StyleProp<ViewStyle>` (pas `ViewStyle | ViewStyle[]`) : accepte les
  // tableaux avec des entrées conditionnelles falsy (`cond && {...}`), utile
  // pour la hauteur mesurée de la carte de contact d'Infos.
  style?: StyleProp<ViewStyle>;
  /** Transmis tel quel — sert par exemple à mesurer la hauteur rendue (Infos). */
  onLayout?: (event: LayoutChangeEvent) => void;
}>;

export function Reveal({ children, delay = 0, fadeOnly = false, style, onLayout }: RevealProps) {
  const entering = fadeOnly
    ? FadeIn.duration(600).delay(delay).reduceMotion(ReduceMotion.System)
    : FadeInDown.duration(600).delay(delay).reduceMotion(ReduceMotion.System);

  return (
    <Animated.View entering={entering} style={style} onLayout={onLayout}>
      {children}
    </Animated.View>
  );
}
