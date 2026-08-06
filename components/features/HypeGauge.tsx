/**
 * Jauge d'ambiance d'une soirée (DÉMO — les niveaux sont des placeholders).
 *
 * Elle ne compte pas des places — cette jauge-là, `SeatsGauge`, a été retirée
 * le 6 août 2026 (« enlève le système de place libre ») — elle affiche un
 * **engouement** : un signal que le patron peut comparer d'une soirée à
 * l'autre (`data/events.ts` → `hype`, volontairement différent sur les trois
 * soirées placeholder). Toujours dans les couleurs de la guirlande de
 * l'accueil (`amberBulb` → `emberDark`), jamais dans le thème de la soirée :
 * c'est la signature « esprit guinguette », pas l'accent de la carte.
 *
 * Demande de Jonathan, 6 août 2026, en remplacement d'un bouton
 * « Participer » nu : « J'y serai » (`EventDetailPane`) fait maintenant
 * monter cette jauge d'un cran — voir `boosted`.
 *
 * ⚠️ **`scaleX` porte le niveau lui-même, pas seulement sa révélation.** La
 * technique vient de `SeatsGauge` : POUSSER depuis 0 vers 1 à l'apparition en
 * animant `scaleX` plutôt que `width`, une largeur en pourcentage ne s'animant
 * pas sur le fil natif. Ici on va plus loin — `Fill` garde une largeur FIXE à
 * 100 % du rail, et c'est `scaleX` qui vaut le niveau lui-même (`0` à `level`,
 * pas seulement `0` ou `1`) — ce qui permet au bond de « J'y serai » de
 * s'animer aussi proprement que l'apparition, avec le même mécanisme.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { styled, Text, View, XStack } from 'tamagui';

import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

/** Ce qu'ajoute votre propre « J'y serai » au niveau affiché. */
const BOOST = 0.06;

/** Paliers d'intitulé, du plus calme au plus couru. */
function tierLabel(level: number): string {
  if (level >= 0.7) return 'Grande ambiance annoncée !';
  if (level >= 0.34) return 'Ça chauffe !';
  return 'Ça commence à chauffer';
}

const Track = styled(View, {
  name: 'HypeTrack',
  height: 6,
  borderRadius: '$pill',
  backgroundColor: '$borderColor',
  overflow: 'hidden',
});

const Fill = styled(View, {
  name: 'HypeFill',
  width: '100%',
  height: '100%',
  borderRadius: '$pill',
  transformOrigin: 'left',
});

const Tier = styled(Text, {
  name: 'HypeTier',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  color: colors.emberDark,
});

type HypeGaugeProps = {
  /** Niveau d'engouement de base, 0–1 (`data/events.ts` → `hype`). */
  hype: number;
  /** Votre propre « J'y serai » : ajoute `BOOST` au niveau affiché. */
  boosted: boolean;
};

export function HypeGauge({ hype, boosted }: HypeGaugeProps) {
  const level = Math.min(1, hype + (boosted ? BOOST : 0));
  const reduceMotion = useReducedMotion();

  // Même astuce que SeatsGauge : monté à zéro puis relâché au tick suivant,
  // pour que le premier passage à `level` soit ce qui pousse la jauge, pas un
  // état déjà plein dès le premier rendu.
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
        accessibilityLabel="Ambiance de la soirée"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(level * 100) }}
      >
        <Fill scaleX={grown ? level : 0} transition={reduceMotion ? null : 'lazy'}>
          <LinearGradient
            colors={[colors.amberBulb, colors.emberDark]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          />
        </Fill>
      </Track>

      <XStack alignItems="center" gap="$xs">
        <Icon name="flame" size={14} color={colors.emberDark} />
        <Tier>{tierLabel(level)}</Tier>
      </XStack>
    </View>
  );
}

const styles = {
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
} as const;
