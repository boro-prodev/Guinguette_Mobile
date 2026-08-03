/**
 * Accueil — photo plein écran, dégradé « heure bleue » et deux appels à
 * l'action (port de index.html).
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Guirlande } from '@/components/ui/Guirlande';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { venue } from '@/data/venue';
import { useReserve } from '@/features/reserve/ReserveProvider';

export default function HomeScreen() {
  const { open } = useReserve();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1.08);

  // Équivalent de @keyframes hero-zoom : la photo se pose lentement.
  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 1600,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      reduceMotion: ReduceMotion.System,
    });
  }, [scale]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.screen}>
      <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
        <Image
          source={require('../../assets/images/ambiance-soiree.webp')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          priority="high"
          accessibilityLabel="Soirée festive à la guinguette : guirlandes lumineuses au-dessus des tables rustiques, dans une ambiance conviviale."
        />
      </Animated.View>

      {/* Voile plat + les deux lavis directionnels du dégradé `hero-duotone`. */}
      <View style={styles.veil} pointerEvents="none" />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(240,173,74,0.28)', 'rgba(240,173,74,0)']}
        locations={[0, 0.42]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(12,23,32,0.6)', 'rgba(12,23,32,0)']}
        locations={[0, 0.38]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        <Reveal delay={0}>
          <Text style={styles.kicker}>{venue.kicker}</Text>
        </Reveal>

        <Reveal delay={150}>
          <Text style={styles.title}>{venue.name}</Text>
        </Reveal>

        <Reveal delay={300} fadeOnly style={styles.guirlande}>
          <Guirlande width={200} />
        </Reveal>

        <Reveal delay={300}>
          <Text style={styles.tagline}>{venue.tagline}</Text>
        </Reveal>

        <Reveal delay={450} style={styles.actions}>
          <Button
            size="lg"
            full
            accessibilityLabel="Réserver une table"
            onPress={open}
          >
            Réserver une table
          </Button>

          {/*
            Seul endroit de l'app posé sur une photo sombre : le thème
            « lampion » y remplace le rouge par l'ambre des guirlandes et
            garde un texte clair. Même bouton, autres couleurs.
          */}
          <Button
            theme="lampion"
            tone="outline"
            size="lg"
            full
            accessibilityLabel="Voir les prochaines soirées"
            onPress={() => router.navigate('/soirees')}
          >
            Prochaines soirées
          </Button>
        </Reveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.duskDeep,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12,23,32,0.2)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.lg,
  },
  kicker: {
    ...type.accent,
    color: colors.amberBulb,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...type.displayLg,
    color: colors.surfaceContainerLowest,
    textAlign: 'center',
    textShadowColor: 'rgba(12,23,32,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  guirlande: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tagline: {
    ...type.bodyLg,
    color: colors.surfaceContainerLowest,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    gap: spacing.sm + 4,
  },
});
