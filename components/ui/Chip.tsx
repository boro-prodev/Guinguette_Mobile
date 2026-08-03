/**
 * Puce sélectionnable — filtres de La Carte et créneaux du parcours de
 * réservation partagent exactement le même objet visuel.
 *
 * Volontairement distincte de `<Button>` : une puce est un *choix* dans une
 * liste, pas une action. Elle n'est ni en capitales (« VEN. 8 AOÛT » se lit
 * mal), ni animée au relâchement, et son état porté est `selected`, pas
 * `pressed`. Elle partage en revanche les mêmes tokens et les mêmes thèmes —
 * `<Chip theme="secondary">` la fait basculer au vert, comme le bouton.
 */
import { memo, useCallback } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { createStyledContext, styled, Text, View } from 'tamagui';

const ChipContext = createStyledContext<{ selected: boolean }>({ selected: false });

const ChipFrame = styled(View, {
  name: 'Chip',
  context: ChipContext,

  height: '$sm',
  paddingHorizontal: '$snug',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$pill',
  borderWidth: 1,
  transition: 'quick',
  pressStyle: { scale: 0.94 },

  variants: {
    selected: {
      true: { backgroundColor: '$solid', borderColor: '$solid' },
      false: { backgroundColor: '$surface', borderColor: '$borderColor' },
    },
  } as const,

  defaultVariants: { selected: false },
});

const ChipLabel = styled(Text, {
  name: 'ChipText',
  context: ChipContext,

  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',

  variants: {
    selected: {
      true: { color: '$onSolid' },
      false: { color: '$muted' },
    },
  } as const,

  defaultVariants: { selected: false },
});

type ChipProps = {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
};

function ChipComponent({ label, value, selected, onSelect }: ChipProps) {
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  const reduceMotion = useReducedMotion();

  return (
    <ChipFrame
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      selected={selected}
      transition={reduceMotion ? null : 'quick'}
      onPress={handlePress}
    >
      <ChipLabel selected={selected}>{label}</ChipLabel>
    </ChipFrame>
  );
}

export const Chip = memo(ChipComponent);
