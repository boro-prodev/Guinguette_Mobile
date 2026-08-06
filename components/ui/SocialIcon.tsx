/**
 * Icônes des trois liens de « Retrouver l'artiste » (`ArtistDetailPane.tsx`).
 *
 * ⚠️ **Seul endroit de l'app où une icône ne prend pas sa couleur du thème
 * courant.** Facebook et Instagram ont une identité de couleur fixe, propre à
 * la marque — leur donner la teinte de la soirée (comme le reste du jeu
 * d'icônes, `Icon.tsx`, à trait unique) les rendrait méconnaissables. Elles
 * sont donc dessinées ici, à part, avec leurs vraies couleurs. Le globe du
 * site web n'est pas une marque : il reste sur le principe habituel (trait
 * fin, couleur reçue en prop), simplement plus parlant que l'ancien pictogramme
 * de lien en chaîne — demande de Jonathan, 7 août 2026.
 */
import { memo } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export type SocialIconName = 'facebook' | 'instagram' | 'website';

type SocialIconProps = {
  name: SocialIconName;
  size?: number;
  /** Uniquement lue par `website` — Facebook et Instagram gardent leur couleur propre. */
  color?: ColorValue;
};

function SocialIconComponent({ name, size = 20, color }: SocialIconProps) {
  if (name === 'facebook') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={11} fill="#1877F2" />
        <Path
          d="M15.3 12.6h-2.1V20h-3v-7.4H8.6v-2.5h1.6V8.5c0-1.9 1-3.4 3.4-3.4h2.2v2.6h-1.4c-.9 0-1.2.4-1.2 1.2v1.6h2.4l-.3 2.5Z"
          fill="#fff"
        />
      </Svg>
    );
  }

  if (name === 'instagram') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Defs>
          <LinearGradient id="igGradient" x1="0" y1="24" x2="24" y2="0">
            <Stop offset="0" stopColor="#F9CE34" />
            <Stop offset="0.4" stopColor="#EE2A7B" />
            <Stop offset="1" stopColor="#6228D7" />
          </LinearGradient>
        </Defs>
        <Path
          d="M7.6 2.5h8.8a5.1 5.1 0 0 1 5.1 5.1v8.8a5.1 5.1 0 0 1-5.1 5.1H7.6a5.1 5.1 0 0 1-5.1-5.1V7.6a5.1 5.1 0 0 1 5.1-5.1Z"
          fill="url(#igGradient)"
        />
        <Circle cx={12} cy={12} r={4.1} stroke="#fff" strokeWidth={1.7} />
        <Circle cx={16.9} cy={7.1} r={1.15} fill="#fff" />
      </Svg>
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17" />
      <Path d="M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
    </Svg>
  );
}

export const SocialIcon = memo(SocialIconComponent);
