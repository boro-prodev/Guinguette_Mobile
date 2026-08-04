/**
 * Accueil — vidéo d'ambiance plein écran, dégradé « heure bleue » et deux
 * appels à l'action (port de index.html).
 *
 * Le fond se joue en deux couches superposées :
 *
 * 1. **la photo**, toujours présente, qui sert d'affiche pendant le chargement
 *    de la vidéo — sans elle, on verrait un rectangle noir au démarrage ;
 * 2. **la vidéo**, posée par-dessus, qui apparaît en fondu seulement une fois
 *    prête à jouer.
 *
 * Quand l'utilisateur a coupé les animations au niveau du système, la vidéo
 * n'est ni chargée ni montée : la photo reste, et c'est tout. C'est la
 * convention du projet — une animation purement décorative n'est pas
 * atténuée, elle n'est pas jouée.
 */
import { useEvent, useEventListener } from 'expo';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Guirlande } from '@/components/ui/Guirlande';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { venue } from '@/data/venue';
import { useReserve } from '@/features/reserve/ReserveProvider';

const AMBIANCE_VIDEO = require('../../assets/videos/accueil.mp4');

/** Durée du fondu photo → vidéo. Assez long pour ne pas se voir comme une coupe. */
const CROSSFADE_MS = 700;

/** Apparition des deux appels à l'action, une fois l'ouverture terminée. */
const ACTIONS_FADE_MS = 550;

export default function HomeScreen() {
  const { open } = useReserve();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1.08);
  const videoOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);

  /**
   * L'ouverture est jouée, ou elle ne le sera pas. Dans les deux cas les
   * boutons deviennent disponibles — jamais d'écran sans appel à l'action.
   */
  const [introDone, setIntroDone] = useState(false);

  // `useVideoPlayer` est un hook : il s'appelle toujours. C'est la SOURCE qu'on
  // met à `null` quand les animations sont coupées — ainsi le fichier n'est
  // même pas chargé.
  const player = useVideoPlayer(reduceMotion ? null : AMBIANCE_VIDEO, (instance) => {
    // Pas de boucle : c'est une ouverture, elle passe une fois. Elle s'arrête
    // ensuite sur sa dernière image, qui devient le fond fixe de l'écran.
    instance.loop = false;
    instance.muted = true;
  });

  // `status` passe par `readyToPlay` quand la première image est décodable :
  // c'est le seul moment sûr pour révéler la vidéo sans montrer de noir.
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const videoReady = !reduceMotion && status === 'readyToPlay';

  useEffect(() => {
    if (!videoReady) return;
    player.play();
    videoOpacity.value = withTiming(1, {
      duration: CROSSFADE_MS,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  }, [player, videoOpacity, videoReady]);

  // Fin de l'ouverture : on met en pause pour libérer le décodeur — sans ça il
  // continue de tourner tant que l'écran reste monté, et les onglets le
  // gardent monté en permanence.
  useEventListener(player, 'playToEnd', () => {
    player.pause();
    setIntroDone(true);
  });

  // Animations coupées : pas de vidéo, donc rien à attendre.
  useEffect(() => {
    if (reduceMotion) setIntroDone(true);
  }, [reduceMotion]);

  // Filet de sécurité : si la vidéo ne peut pas être lue, les boutons
  // apparaissent quand même. Un fond décoratif ne doit jamais pouvoir retenir
  // l'action principale de l'écran en otage.
  useEffect(() => {
    if (status === 'error') setIntroDone(true);
  }, [status]);

  useEffect(() => {
    if (!introDone) return;
    actionsOpacity.value = withTiming(1, {
      duration: ACTIONS_FADE_MS,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  }, [actionsOpacity, introDone]);

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

  const videoStyle = useAnimatedStyle(() => ({ opacity: videoOpacity.value }));
  const actionsStyle = useAnimatedStyle(() => ({ opacity: actionsOpacity.value }));

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

      {!reduceMotion && (
        <Animated.View style={[StyleSheet.absoluteFill, videoStyle]} pointerEvents="none">
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            // Décorative et déjà décrite par l'image du dessous : on ne la
            // donne pas une seconde fois aux lecteurs d'écran.
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            // `surfaceView` (le défaut Android) se dessine dans sa propre
            // couche et passerait AU-DESSUS des dégradés et du texte.
            surfaceType="textureView"
          />
        </Animated.View>
      )}

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

        {/*
          Les deux boutons n'apparaissent qu'à la fin de l'ouverture — mais le
          bloc, lui, reste monté du premier rendu. C'est ce qui réserve sa
          hauteur : le monter à la fin de la vidéo ferait remonter d'un coup le
          titre et l'accroche, centrés dans l'espace restant.

          Tant que l'ouverture n'est pas finie, ils sont invisibles, hors
          d'atteinte du doigt (`pointerEvents`) ET des lecteurs d'écran — un
          bouton transparent qu'on peut quand même activer est un piège.
        */}
        <Animated.View
          style={[styles.actions, actionsStyle]}
          pointerEvents={introDone ? 'auto' : 'none'}
          accessibilityElementsHidden={!introDone}
          importantForAccessibility={introDone ? 'auto' : 'no-hide-descendants'}
        >
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
        </Animated.View>
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
    // 0,32 et non 0,20 depuis le passage à la vidéo. La photo fixe était sombre
    // au centre, là où se posent le titre et l'accroche ; la vidéo, elle, y fait
    // défiler des visages, un feu, des lampions. Un fond qu'on ne maîtrise plus
    // demande un voile qui ne dépend pas de ce qu'il y a dessous.
    backgroundColor: 'rgba(12,23,32,0.32)',
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
    // spacing.sm collait la guirlande au jambage du « g » d'Oignies : le
    // viewBox agrandi (voir Guirlande.tsx) ne suffisait pas seul.
    marginTop: spacing.snug,
    marginBottom: spacing.md,
  },
  tagline: {
    ...type.bodyLg,
    color: colors.surfaceContainerLowest,
    textAlign: 'center',
    marginBottom: spacing.lg,
    // Même ombre portée que le titre : c'est elle qui tient l'accroche quand
    // une image claire passe derrière. L'`opacity: 0.9` d'avant a sauté — sur
    // fond mouvant, atténuer un texte est exactement ce qu'il ne faut pas faire.
    textShadowColor: 'rgba(12,23,32,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  actions: {
    width: '100%',
    gap: spacing.sm + 4,
  },
});
