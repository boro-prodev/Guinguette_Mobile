/**
 * Retour tactile standard du projet : tout élément interactif se comprime
 * légèrement au doigt (le survol n'existe pas sur mobile, cf. `active:scale-95`
 * du site web). Le ressort passe par Reanimated pour rester sur le thread UI.
 */
import { forwardRef } from 'react';
import { Pressable, type PressableProps, type View, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 320, reduceMotion: ReduceMotion.System };

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: ViewStyle | ViewStyle[];
  /** Amplitude de la compression (0.95 par défaut, 0.9 pour les petites cibles). */
  scaleTo?: number;
};

export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  { style, scaleTo = 0.95, onPressIn, onPressOut, ...props },
  ref
) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      ref={ref}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, SPRING);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, SPRING);
        onPressOut?.(event);
      }}
      {...props}
    />
  );
});
