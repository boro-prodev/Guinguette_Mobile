/**
 * Jauge de places d'une soirée (DÉMO — les chiffres sont des placeholders).
 *
 * Le remplissage n'est pas dessiné d'emblée : il pousse depuis la gauche
 * quand la carte apparaît. L'astuce est d'animer `scaleX` avec un
 * `transformOrigin` à gauche plutôt qu'une largeur — une largeur en
 * pourcentage ne s'anime pas sur le fil natif, un `scaleX` oui.
 */
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { styled, Text, View, XStack } from 'tamagui';

/** Au-delà de ce taux de remplissage, on prévient que ça se remplit. */
const ALMOST_FULL = 0.85;

const Track = styled(View, {
  name: 'SeatsTrack',
  height: 6,
  borderRadius: '$pill',
  backgroundColor: '$borderColor',
  overflow: 'hidden',
});

const Fill = styled(View, {
  name: 'SeatsFill',
  height: '100%',
  borderRadius: '$pill',
  backgroundColor: '$solid',
  transformOrigin: 'left',
});

const Caption = styled(Text, {
  name: 'SeatsCaption',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  fontVariant: ['tabular-nums'],
  color: '$muted',
});

const Warning = styled(Caption, {
  name: 'SeatsWarning',
  color: '$solid',
});

type SeatsGaugeProps = {
  capacity: number;
  taken: number;
};

export function SeatsGauge({ capacity, taken }: SeatsGaugeProps) {
  const ratio = Math.min(1, Math.max(0, taken / capacity));
  const remaining = Math.max(0, capacity - taken);
  const reduceMotion = useReducedMotion();

  // Monté à zéro puis relâché au tick suivant : c'est ce changement de valeur
  // que Tamagui anime. Sans ce délai, la barre serait déjà pleine au premier
  // rendu et il n'y aurait rien à animer. Quand les animations sont coupées,
  // on part directement plein — la jauge reste lisible, elle ne pousse pas.
  const [grown, setGrown] = useState(reduceMotion);
  useEffect(() => {
    if (reduceMotion) return;
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <View gap="$xs">
      <Track
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: capacity, now: taken }}
      >
        <Fill
          width={`${ratio * 100}%`}
          transition={reduceMotion ? null : 'lazy'}
          scaleX={grown ? 1 : 0}
        />
      </Track>

      <XStack justifyContent="space-between" alignItems="center">
        <Caption>{`${remaining} places encore libres`}</Caption>
        {ratio >= ALMOST_FULL && <Warning>Bientôt complet</Warning>}
      </XStack>
    </View>
  );
}
