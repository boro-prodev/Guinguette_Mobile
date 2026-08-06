/**
 * Jeu d'icônes au trait, dessinées à la main — port direct des `ICON_PATHS`
 * de src/nav.js. Pas de police d'icônes à charger, et le linework reste
 * cohérent avec le reste de l'identité.
 */
import { memo } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

export type IconName =
  | 'home'
  | 'menu'
  | 'calendar'
  | 'info'
  | 'call'
  | 'check'
  | 'close'
  | 'minus'
  | 'plus'
  | 'star'
  | 'tapas'
  | 'cake'
  | 'glass'
  | 'location'
  | 'clock'
  | 'directions'
  | 'chevron'
  | 'link'
  | 'instagram'
  | 'facebook'
  | 'flame';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
};

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <G>
      <Path d="M4 11.5 12 4l8 7.5" />
      <Path d="M6 10.5V19a1 1 0 0 0 1 1h3v-5.5h4V20h3a1 1 0 0 0 1-1v-8.5" />
    </G>
  ),
  menu: (
    <G>
      <Path d="M8 3v6a2 2 0 0 0 4 0V3" />
      <Path d="M10 9v12" />
      <Path d="M16 3v7c0 1-.8 2-2 2" />
      <Path d="M16 3v18" />
    </G>
  ),
  calendar: (
    <G>
      <Rect x={3.5} y={5} width={17} height={15} rx={2} />
      <Path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </G>
  ),
  info: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5.5M12 7.75h.01" />
    </G>
  ),
  call: (
    <Path d="M6.6 10.8c1.3 2.7 3.6 5 6.3 6.3l2.1-2.1c.3-.3.7-.4 1.1-.3 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3.7 13.8 3.7 4.3c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.2.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8Z" />
  ),
  check: <Path d="M5 13l4 4L19 7" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  minus: <Path d="M6 12h12" />,
  plus: <Path d="M12 6v12M6 12h12" />,
  star: <Path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9 2.6-5.3Z" />,
  tapas: (
    <G>
      <Path d="M3.5 15.5h17" />
      <Path d="M6 15.5a6 6 0 0 1 12 0" />
      <Path d="M12 9.5V3.5" />
      <Circle cx={12} cy={7} r={1.4} />
    </G>
  ),
  cake: (
    <G>
      <Path d="M3.5 20.5h17" />
      <Path d="M5.5 20.5v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6" />
      <Path d="M12 12.5v-3" />
      <Circle cx={12} cy={7.5} r={1.3} />
    </G>
  ),
  glass: (
    <G>
      <Path d="M6 4h12l-1.5 6.5a3 3 0 0 1-2.9 2.3h-3.2a3 3 0 0 1-2.9-2.3L6 4Z" />
      <Path d="M12 12.8V20" />
      <Path d="M8.5 20h7" />
    </G>
  ),
  location: (
    <G>
      <Path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <Circle cx={12} cy={10} r={2.5} />
    </G>
  ),
  clock: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </G>
  ),
  directions: (
    <G>
      <Path d="M12 3 21 12l-9 9-9-9 9-9Z" />
      <Path d="M10 14.5V12a1.5 1.5 0 0 1 1.5-1.5H15" />
      <Path d="m13 8.5 2 2-2 2" />
    </G>
  ),
  // Pointe vers le bas au repos ; les composants qui déplient le font pivoter.
  chevron: <Path d="m7 10 5 5 5-5" />,
  // Lien externe : cadre ouvert en haut à droite, d'où sort la flèche.
  link: (
    <G>
      <Path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
      <Path d="M15 3h6v6" />
      <Path d="m21 3-11 11" />
    </G>
  ),
  instagram: (
    <G>
      <Rect x={3.5} y={3.5} width={17} height={17} rx={5} />
      <Circle cx={12} cy={12} r={4.2} />
    </G>
  ),
  // Marque simplifiée au trait, dans le même esprit que les autres icônes —
  // pas un logo plein.
  facebook: (
    <Path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.8l.7-4H13V7a1 1 0 0 1 1-1h1V3Z" />
  ),
  // Le pion de `location`, retourné : même arc, pointe en haut au lieu du bas.
  // Une flamme n'est jamais qu'une goutte d'eau qui remonte.
  flame: <Path d="M12 3s7 5.7 7 11a7 7 0 1 1-14 0c0-5.3 7-11 7-11Z" />,
};

function IconComponent({
  name,
  size = 24,
  color = colors.onSurface,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </Svg>
  );
}

export const Icon = memo(IconComponent);
