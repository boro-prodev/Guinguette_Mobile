/**
 * Icône d'onglet : quand l'onglet est actif, une petite ampoule ambrée
 * s'allume en dessous (port de `.nav-dot` du site).
 */
import { memo } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/Icon';
import { colors, radius, shadows } from '@/constants/theme';

type TabIconProps = {
  name: IconName;
  /** Fourni par le navigateur d'onglets : `ColorValue`, pas forcément une chaîne. */
  color: ColorValue;
  focused: boolean;
};

function TabIconComponent({ name, color, focused }: TabIconProps) {
  return (
    <View style={styles.wrapper}>
      <Icon name={name} size={24} color={color} strokeWidth={focused ? 2 : 1.75} />
      {focused && (
        <Animated.View
          entering={ZoomIn.springify().damping(9).reduceMotion(ReduceMotion.System)}
          style={[styles.dot, shadows.bulb]}
        />
      )}
    </View>
  );
}

export const TabIcon = memo(TabIconComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.amberBulb,
  },
});
