/**
 * Signature graphique du projet : la guirlande lumineuse, un fil qui pend
 * légèrement, ponctué d'ampoules ambrées. Reprend le SVG de index.html.
 *
 * Le halo est rendu par un cercle plus large en dessous de chaque ampoule :
 * les filtres `drop-shadow` SVG ne sont pas fiables sur react-native-svg.
 */
import { memo, useEffect } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Bulb = { cx: number; cy: number; flickerDelay: number | null };

/**
 * Positions reprises telles quelles du SVG d'origine (viewBox 240 × 28) —
 * seul le viewBox a grandi depuis, pour laisser leurs halos respirer.
 */
const BULBS: Bulb[] = [
  { cx: 20, cy: 9, flickerDelay: 0 },
  { cx: 62, cy: 20, flickerDelay: null },
  { cx: 104, cy: 24, flickerDelay: 1200 },
  { cx: 146, cy: 20, flickerDelay: null },
  { cx: 188, cy: 9, flickerDelay: 0 },
  { cx: 222, cy: 5, flickerDelay: 1200 },
];

function FlickeringBulb({ cx, cy, flickerDelay, active }: Bulb & { active: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // `active` reste faux tant que la vidéo de l'accueil joue : la guirlande
    // est une décoration, pas un second point d'attention pendant l'ouverture.
    // Elle ne se met à scintiller qu'une fois la vidéo terminée (ou d'emblée
    // pour tout autre appelant, `active` valant `true` par défaut).
    if (flickerDelay === null || !active) return;
    // Reprend @keyframes bulb-flicker : 3,6 s, creux à 46 % puis 54 %.
    opacity.value = withDelay(
      flickerDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1650, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.55, { duration: 290, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.85, { duration: 290, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1370, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false,
        undefined,
        ReduceMotion.System
      )
    );
  }, [flickerDelay, opacity, active]);

  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));

  return (
    <>
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={8}
        fill={colors.amberBulb}
        opacity={0.18}
        animatedProps={animatedProps}
      />
      <AnimatedCircle cx={cx} cy={cy} r={4} fill={colors.amberBulb} animatedProps={animatedProps} />
    </>
  );
}

type GuirlandeProps = {
  width?: number;
  /**
   * Passe à `false` pour garder les ampoules fixes (posées à leur opacité de
   * repos, sans scintiller) tant qu'un événement plus important — la vidéo de
   * l'accueil — n'est pas terminé. `true` par défaut : les appelants qui ne
   * s'en soucient pas retrouvent le comportement d'origine.
   */
  active?: boolean;
};

function GuirlandeComponent({ width = 200, active = true }: GuirlandeProps) {
  // Le viewBox fait 240 × 48 (et non 28) : chaque ampoule porte un halo de
  // rayon 8, et certaines (cy: 5, cy: 24) débordaient d'un cadre trop court
  // en hauteur — leurs halos étaient coupés net.
  const height = (width / 240) * 48;

  return (
    <Svg width={width} height={height} viewBox="0 -10 240 48" fill="none">
      <Path
        d="M2 4 Q60 26 120 4 T238 4"
        stroke={colors.bark}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.55}
        fill="none"
      />
      {BULBS.map((bulb) => (
        <FlickeringBulb key={`${bulb.cx}-${bulb.cy}`} {...bulb} active={active} />
      ))}
    </Svg>
  );
}

export const Guirlande = memo(GuirlandeComponent);
