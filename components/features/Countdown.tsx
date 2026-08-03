/**
 * Compte à rebours vivant jusqu'à une soirée.
 *
 * Il se recalcule tout seul (une fois par minute — inutile plus souvent quand
 * la plus petite unité affichée est la minute) et signale qu'il est *en vie*
 * par un point ambré qui bat lentement, comme une ampoule de guirlande.
 *
 * Il n'a pas de variante « sur photo » : ses couleurs viennent du thème
 * ambiant. Posé sur une image sombre, on l'enveloppe simplement dans
 * `<Theme name="lampion">` et il s'adapte.
 */
import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { styled, Text, View } from 'tamagui';

import { countdownTo, formatCountdown } from '@/utils/date';

const TICK_MS = 60_000;
/** Durée d'un battement du point — un aller, le retour est le miroir. */
const PULSE_MS = 1100;

const Badge = styled(View, {
  name: 'CountdownBadge',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$base',
  alignSelf: 'flex-start',
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  borderRadius: '$pill',
  backgroundColor: '$soft',
});

const Dot = styled(View, {
  name: 'CountdownDot',
  width: 8,
  height: 8,
  borderRadius: '$pill',
  backgroundColor: '$glow',
});

const Label = styled(Text, {
  name: 'CountdownLabel',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  // Ce libellé se réécrit toutes les minutes. Avec les chiffres
  // proportionnels de Karla (« 1 » fait 699 unités, « 8 » en fait 1275), la
  // pastille — posée en `alignSelf: 'flex-start'` — se redimensionnait à
  // chaque tick : « Dans 1 h 05 » mesure 70,4 px, « Dans 8 h 58 » 74 px.
  fontVariant: ['tabular-nums'],
  color: '$onSoft',
});

const AnimatedDot = Animated.createAnimatedComponent(Dot);

export function Countdown({ startsAt }: { startsAt: Date }) {
  const [now, setNow] = useState(() => new Date());
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(0.25, {
        duration: PULSE_MS,
        easing: Easing.inOut(Easing.quad),
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const label = formatCountdown(countdownTo(startsAt, now));

  return (
    <Badge accessibilityLabel={`Compte à rebours : ${label}`}>
      <AnimatedDot style={dotStyle} />
      <Label>{label}</Label>
    </Badge>
  );
}
