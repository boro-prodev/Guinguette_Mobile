/**
 * Icône d'onglet. L'onglet actif se signale par sa **couleur** (`primary`,
 * posée par le navigateur via `tabBarActiveTintColor`) et par un trait
 * légèrement plus épais.
 *
 * ⚠️ Une petite ampoule ambrée s'allumait en dessous jusqu'au 6 août 2026 —
 * port de `.nav-dot` du site. Retirée à la demande de Jonathan. Le wrapper qui
 * lui réservait 6 px de haut a disparu avec elle : sans lui, l'icône et son
 * libellé se resserrent de ces 6 px.
 */
import { memo } from 'react';
import { type ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';

type TabIconProps = {
  name: IconName;
  /** Fourni par le navigateur d'onglets : `ColorValue`, pas forcément une chaîne. */
  color: ColorValue;
  focused: boolean;
};

function TabIconComponent({ name, color, focused }: TabIconProps) {
  return <Icon name={name} size={24} color={color} strokeWidth={focused ? 2 : 1.75} />;
}

export const TabIcon = memo(TabIconComponent);
