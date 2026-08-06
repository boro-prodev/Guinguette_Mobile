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
import { BlurTargetView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useIsFocused } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Guirlande } from '@/components/ui/Guirlande';
import { Reveal } from '@/components/ui/Reveal';
import { colors, spacing, type } from '@/constants/theme';
import { venue } from '@/data/venue';
import { useReserve } from '@/features/reserve/ReserveProvider';

const AMBIANCE_VIDEO = require('../../assets/videos/accueil.mp4');

/** Durée du fondu photo → vidéo. Assez long pour ne pas se voir comme une coupe. */
const CROSSFADE_MS = 700;

/**
 * Courbe du fondu des boutons — un léger rebond élastique en fin de course,
 * repris pour le zoom lent de la photo juste plus bas (même qualité de
 * mouvement sur les deux). Choisie à l'écran, sur l'appareil : essayée après
 * `Easing.bezier(0.22, 1, 0.36, 1)` (départ franc, pose sans rebond), jugée
 * trop sage une fois le fondu allongé.
 */
const SMOOTH_EASING = Easing.elastic(1);

/**
 * Fondu du bouton principal — allongé (550 ms au premier réglage) pour rester
 * doux à cette taille de bloc et laisser le temps à l'élastique de se sentir.
 * Minuté pour se TERMINER `POST_VIDEO_DELAY_MS` après la fin de la vidéo
 * (voir l'effet sur `videoReady`) : « Réserver une table » finit de se poser
 * une fois l'image du dernier plan déjà figée, pas pile dessus.
 */
const PRIMARY_FADE_MS = 2000;

/** Écart voulu entre la fin de la vidéo et la fin du fondu du bouton principal. */
const POST_VIDEO_DELAY_MS = 1500;

/**
 * « Prochaines soirées » démarre son fondu après le premier — un écart plus
 * large (150 ms au premier réglage) pour rester perceptible maintenant que
 * chaque fondu dure 2 s.
 */
const SECONDARY_FADE_DELAY_MS = 600;

/**
 * Secours si `player.duration` n'est pas encore renseigné au moment où la
 * lecture démarre (ça arrive, la métadonnée peut suivre de quelques ms) :
 * la durée mesurée à l'encodage du chantier 1d.c (5,04 s), légèrement
 * arrondie en dessous pour ne jamais faire déborder le fondu après la fin
 * réelle de la vidéo.
 */
const FALLBACK_VIDEO_DURATION_MS = 5000;

export default function HomeScreen() {
  const { open } = useReserve();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1.08);
  const videoOpacity = useSharedValue(0);
  const primaryOpacity = useSharedValue(0);
  const secondaryOpacity = useSharedValue(0);
  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /**
   * La cible du flou des deux boutons « verre » — voir `backdrop` dans le
   * rendu. **Une seule pour les deux** : expo-blur sait servir plusieurs
   * `BlurView` depuis une même cible tant qu'ils tiennent dans ses limites, et
   * c'est nettement moins coûteux qu'une capture par bouton.
   */
  const backdropRef = useRef<View | null>(null);

  /**
   * L'ouverture est jouée, ou elle ne le sera pas. Dans les deux cas les
   * boutons deviennent disponibles — jamais d'écran sans appel à l'action.
   */
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const pending = introTimers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

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

    // Les deux fondus sont plantés dans le TEMPS de la vidéo, pas après coup :
    // « Réserver une table » finit d'apparaître `POST_VIDEO_DELAY_MS` après
    // que la vidéo s'arrête sur sa dernière image, pas pile dessus.
    // `player.duration` peut suivre de quelques ms la bascule de statut —
    // d'où le repli mesuré à l'encodage si elle n'est pas encore renseignée.
    const durationMs = player.duration > 0 ? player.duration * 1000 : FALLBACK_VIDEO_DURATION_MS;
    const primaryDelay = Math.max(0, durationMs + POST_VIDEO_DELAY_MS - PRIMARY_FADE_MS);
    const secondaryDelay = primaryDelay + SECONDARY_FADE_DELAY_MS;

    const fadeIn = (opacity: typeof primaryOpacity) => {
      opacity.value = withTiming(1, {
        duration: PRIMARY_FADE_MS,
        easing: SMOOTH_EASING,
        reduceMotion: ReduceMotion.System,
      });
    };

    introTimers.current.push(setTimeout(() => fadeIn(primaryOpacity), primaryDelay));
    introTimers.current.push(setTimeout(() => fadeIn(secondaryOpacity), secondaryDelay));
  }, [player, videoOpacity, videoReady, primaryOpacity, secondaryOpacity]);

  // Fin de l'ouverture : on met en pause pour libérer le décodeur — sans ça il
  // continue de tourner tant que l'écran reste monté, et les onglets le
  // gardent monté en permanence.
  useEventListener(player, 'playToEnd', () => {
    player.pause();
    setIntroDone(true);
  });

  // Animations coupées : pas de vidéo, donc rien à attendre — et le minutage
  // ci-dessus ne se déclenchera jamais (`videoReady` reste faux). Les deux
  // boutons doivent donc apparaître directement, en pleine opacité.
  useEffect(() => {
    if (!reduceMotion) return;
    setIntroDone(true);
    primaryOpacity.value = 1;
    secondaryOpacity.value = 1;
  }, [reduceMotion, primaryOpacity, secondaryOpacity]);

  // Filet de sécurité : si la vidéo ne peut pas être lue, les boutons
  // apparaissent quand même. Un fond décoratif ne doit jamais pouvoir retenir
  // l'action principale de l'écran en otage. Pas de vidéo qui finit ⇒ pas de
  // durée à viser : un fondu classique, immédiat, suffit.
  useEffect(() => {
    if (status !== 'error') return;
    setIntroDone(true);
    const fadeIn = (opacity: typeof primaryOpacity) => {
      opacity.value = withTiming(1, {
        duration: PRIMARY_FADE_MS,
        easing: SMOOTH_EASING,
        reduceMotion: ReduceMotion.System,
      });
    };
    fadeIn(primaryOpacity);
    fadeIn(secondaryOpacity);
  }, [status, primaryOpacity, secondaryOpacity]);

  // Quatrième sortie : l'utilisateur change d'onglet avant la fin de
  // l'ouverture. `lazy: false` (`app/(tabs)/_layout.tsx`) garde l'accueil
  // monté en permanence, donc la vidéo continuerait de jouer et les boutons de
  // finir leur fondu hors écran si on ne coupait pas court. Au lieu de ça, on
  // saute directement à l'état final — vidéo sur sa dernière image, boutons à
  // pleine opacité d'un coup, pas en fondu — pour qu'en revenant sur l'accueil
  // il n'y ait plus rien à attendre.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused || introDone) return;

    introTimers.current.forEach(clearTimeout);
    introTimers.current = [];

    if (videoReady) {
      if (player.duration > 0) player.currentTime = player.duration;
      player.pause();
    }

    videoOpacity.value = 1;
    primaryOpacity.value = 1;
    secondaryOpacity.value = 1;
    setIntroDone(true);
  }, [isFocused, introDone, videoReady, player, videoOpacity, primaryOpacity, secondaryOpacity]);

  // Équivalent de @keyframes hero-zoom : la photo se pose lentement.
  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 1600,
      easing: SMOOTH_EASING,
      reduceMotion: ReduceMotion.System,
    });
  }, [scale]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const videoStyle = useAnimatedStyle(() => ({ opacity: videoOpacity.value }));
  const primaryButtonStyle = useAnimatedStyle(() => ({ opacity: primaryOpacity.value }));
  const secondaryButtonStyle = useAnimatedStyle(() => ({ opacity: secondaryOpacity.value }));

  return (
    <View style={styles.screen}>
      {/*
        Tout le fond — photo, vidéo, voile et dégradés — vit dans CE conteneur,
        et pas seulement par goût du rangement : c'est la cible que les deux
        boutons « verre » floutent (`blurTarget`). Sur Android, `expo-blur` ne
        floute pas « ce qu'il y a dessous » tout seul, il floute le contenu
        d'un `BlurTargetView` désigné nommément. Ce qui doit apparaître dans le
        verre doit donc être ici ; ce qui reste dehors (le titre, l'accroche,
        les boutons eux-mêmes) n'y apparaîtra pas — ce qui est bien l'effet
        recherché, un bouton ne se floute pas lui-même.
      */}
      <BlurTargetView ref={backdropRef} style={StyleSheet.absoluteFill} pointerEvents="none">
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
      </BlurTargetView>

      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
        <Reveal delay={0}>
          <Text style={styles.kicker}>{venue.kicker}</Text>
        </Reveal>

        <Reveal delay={150}>
          <Text style={styles.title}>{venue.name}</Text>
        </Reveal>

        <Reveal delay={300} fadeOnly style={styles.guirlande}>
          {/*
            `active` reste faux tant que l'ouverture (vidéo) n'est pas
            terminée : la guirlande ne doit pas scintiller en même temps que la
            vidéo joue, sous peine de deux animations qui se disputent le
            regard. `introDone` couvre les quatre sorties (fin normale, coupure
            au changement d'onglet, animations désactivées, échec de lecture).
          */}
          <Guirlande width={200} active={introDone} />
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
          `introDone` reste le seul garde côté toucher/accessibilité : les deux
          fondus ci-dessous ne pilotent que ce qui se VOIT, pas ce qu'on peut
          ATTEINDRE, et se terminent de toute façon à peu près quand `introDone`
          bascule.
        */}
        <View
          style={styles.actions}
          pointerEvents={introDone ? 'auto' : 'none'}
          accessibilityElementsHidden={!introDone}
          importantForAccessibility={introDone ? 'auto' : 'no-hide-descendants'}
        >
          {/*
            Chantier 1c. Les deux boutons partagent le même traitement
            « verre » (`tone="glass"`) — géométrie identique, donc plus rien
            ne les distingue par la taille ou la forme. `emphasis` rétablit
            le rang principal sans revenir à un aplat de couleur : un anneau
            ambré permanent, le même dispositif que le halo de pression,
            juste toujours allumé plutôt que déclenché au toucher.

            Chaque bouton porte son propre fondu (`primaryButtonStyle` /
            `secondaryButtonStyle`) plutôt qu'un fondu unique sur le bloc : le
            premier finit d'apparaître `POST_VIDEO_DELAY_MS` après la fin de
            la vidéo, le second le suit de peu — cf. l'effet sur `videoReady`
            plus haut.
          */}
          <Animated.View style={[styles.primaryButtonWrap, primaryButtonStyle]}>
            <Button
              theme="dusk"
              tone="glass"
              size="lg"
              full
              emphasis
              blurTarget={backdropRef}
              accessibilityLabel="Réserver une table"
              onPress={open}
            >
              Réserver une table
            </Button>
          </Animated.View>

          <Animated.View style={secondaryButtonStyle}>
            <Button
              theme="neutral"
              tone="glass"
              size="md"
              blurTarget={backdropRef}
              accessibilityLabel="Voir les prochaines soirées"
              onPress={() => router.navigate('/soirees')}
            >
              Prochaines soirées
            </Button>
          </Animated.View>
        </View>
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
    // 'center' et non le défaut 'stretch' : le bouton secondaire n'est plus
    // `full`, il doit se centrer sur sa propre largeur sans que le parent le
    // réétire.
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  // L'`Animated.View` qui porte le fondu du bouton principal doit s'étirer
  // elle-même — sinon le `full` du `Button` qu'elle contient s'étire dans le
  // vide plutôt que dans la largeur de `actions`.
  primaryButtonWrap: {
    alignSelf: 'stretch',
  },
});
