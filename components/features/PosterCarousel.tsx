/**
 * Ce que « À l'affiche » et « Artist Spot » partagent : la coquille visuelle
 * du carrousel, `PosterFrame` (mécanique + rendu complets, ci-dessous) et le
 * panneau toujours affiché en dessous. Le contenu de l'affiche et du panneau
 * reste propre à chaque écran (`EventSpotlight`/`EventDetailPane` vs
 * `ArtistSpotlight`/`ArtistDetailPane`) — ce fichier ne porte que l'habillage
 * et la mécanique communs.
 *
 * ⚠️ Le swipe d'onglets a disparu le 5 août 2026 (voir
 * `app/(tabs)/_layout.tsx`) : le même geste horizontal servait aux deux à la
 * fois et entrait en conflit. Le carrousel en hérite entièrement — tap **et**
 * swipe y cohabitent désormais, sans plus jamais rien à arbitrer avec la
 * navigation entre onglets.
 *
 * ⚠️ **Deuxième révision, le 5 août 2026 (soir).** La première version
 * (crossfade `AnimatePresence`) glissait trois défauts que Jonathan a
 * remontés à l'écran :
 * 1. le panneau de détails (remonté par `key`) changeait de contenu avant que
 *    l'affiche ait fini son fondu — les deux n'étaient jamais synchronisés ;
 * 2. glisser le doigt révélait le fond blanc de `PosterShell` derrière
 *    l'affiche qui suivait le doigt, puisqu'une seule affiche à la fois était
 *    montée ;
 * 3. le retour tactile au tap (`scale` sur un enfant *clippé* par
 *    `PosterShell`) révélait à la fois le fond blanc du parent et le contour
 *    carré, non arrondi, de l'enfant.
 *
 * `PosterFrame` remplace tout ça par un vrai carrousel à trois affiches
 * (précédente / active / suivante), toujours montées côte à côte : glisser le
 * doigt fait apparaître la vraie affiche voisine, comme les pages d'un livre.
 * Le tap déclenche exactement la même transition qu'un swipe abouti — un seul
 * mécanisme, jamais deux langages visuels différents. Point clé pour la
 * synchronisation : le changement d'état (`onCommit`) n'arrive **qu'à la fin**
 * de l'animation de glissement, jamais au relâchement du doigt — c'est ce qui
 * permet au panneau de détails de changer exactement au même instant que
 * l'affiche.
 */
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  View as RNView,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { styled, Text, View } from 'tamagui';

import { fonts } from '@/constants/theme';

/** Hauteur de l'affiche — assez haute pour respirer, assez basse pour laisser
 *  deviner le panneau en dessous. */
export const POSTER_HEIGHT = 300;

export const Kicker = styled(Text, {
  name: 'SpotlightKicker',
  fontFamily: '$label',
  fontSize: '$1',
  lineHeight: '$1',
  letterSpacing: '$1',
  textTransform: 'uppercase',
  color: '$muted',
});

export const PosterShell = styled(View, {
  name: 'PosterShell',
  width: '100%',
  height: POSTER_HEIGHT,
  borderRadius: '$md',
  overflow: 'hidden',
  backgroundColor: '$backgroundStrong',
  // Contexte de positionnement pour la bande de `PosterFrame` — ne pas retirer.
  position: 'relative',
});

/** Habillage intérieur d'une affiche — image, dégradé, texte plaqués en bas. */
export const PosterContent = styled(View, {
  name: 'PosterContent',
  flex: 1,
  justifyContent: 'flex-end',
});

export const PosterTitle = styled(Text, {
  name: 'PosterTitle',
  fontFamily: '$heading',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$onSoft',
});

export const PosterMeta = styled(Text, {
  name: 'PosterMeta',
  fontFamily: '$body',
  fontSize: '$1',
  lineHeight: '$1',
  color: '$onSoft',
  opacity: 0.9,
});

export const DotTarget = styled(View, {
  name: 'SpotlightDotTarget',
  // 44 px de large : la barre visible ne fait que 8 px, mais la cible en fait
  // 44 comme partout ailleurs dans l'app.
  width: 44,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

export const DotBar = styled(View, {
  name: 'SpotlightDot',
  height: 6,
  borderRadius: '$pill',
  transition: 'medium',

  variants: {
    active: {
      true: { width: 30, backgroundColor: '$solid' },
      false: { width: 8, backgroundColor: '$borderColor' },
    },
  } as const,

  defaultVariants: { active: false },
});

/** Coquille commune aux deux panneaux toujours affichés — jamais démontée,
 *  voir `EventDetailPane`/`ArtistDetailPane` pour pourquoi. */
export const Pane = styled(View, {
  name: 'SpotlightPane',
  backgroundColor: '$backgroundStrong',
  borderRadius: '$md',
  overflow: 'hidden',
  padding: '$md',
  gap: '$sm',
});

export const Body = styled(Text, {
  name: 'SpotlightBody',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$muted',
});

export const tagLabelStyle = StyleSheet.create({
  tagLabel: {
    // Les capitales sont une mise en forme : les données gardent leur casse
    // naturelle, la transformation se fait ici — comme dans `Button.tsx`.
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontFamily: fonts.label,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
}).tagLabel;

/** Distance (px) ou vitesse (px/s) franchie qui valide un swipe de carrousel. */
const SWIPE_DISTANCE = 56;
const SWIPE_VELOCITY = 600;
/** Part du glissement du doigt répercutée sur toute la page — un effet plus
 *  subtil que sur l'affiche, qui reste le foyer du geste. */
const PAGE_FOLLOW = 0.12;
const FOLLOW_SPRING = { damping: 18, stiffness: 220, mass: 0.9 };
/** Glissement programmatique (tap, ou swipe qui a franchi le seuil) : une
 *  durée fixe plutôt qu'un ressort, pour connaître le moment exact où l'affiche
 *  se pose — c'est ce moment-là qui déclenche `onCommit`. */
const SLIDE_CONFIG = { duration: 260, easing: Easing.out(Easing.cubic) };

type PosterFrameProps<T> = {
  items: T[];
  activeIndex: number;
  onCommit: (direction: 1 | -1) => void;
  accessibilityLabel: (item: T) => string;
  renderPoster: (item: T) => ReactNode;
  /** Fraction du glissement à répercuter sur toute la page — voir `soirees.tsx`. */
  pageFollowX?: SharedValue<number>;
};

/**
 * Le carrousel complet : trois affiches (précédente / active / suivante)
 * côte à côte dans une bande, `PosterShell` ne laissant voir que celle du
 * milieu tant qu'on ne glisse pas. Glisser translate toute la bande — la
 * voisine devient donc visible en vrai, jamais un fond vide.
 *
 * Tap et swipe-abouti déclenchent la **même** glissade programmatique
 * (`SLIDE_CONFIG`) ; `onCommit` n'est appelé qu'à la fin de cette glissade,
 * au même moment où `dragX` revient à 0 — l'appelant peut donc faire changer
 * l'affiche et le panneau de détails dans le même instant, sans jamais les
 * désynchroniser.
 */
export function PosterFrame<T>({
  items,
  activeIndex,
  onCommit,
  accessibilityLabel,
  renderPoster,
  pageFollowX,
}: PosterFrameProps<T>) {
  const reduceMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();
  // Nombre JS ordinaire, pas une valeur partagée : capturé par copie dans les
  // worklets ci-dessous à chaque reconstruction du geste (`useMemo`). Mesuré
  // via `onLayout`, avec la largeur de fenêtre comme repli tant qu'il n'a pas
  // encore mesuré — jamais 0, sans quoi la glissade viserait sa position de
  // départ et « réussirait » sans jamais rien montrer à l'écran.
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const dragX = useSharedValue(0);
  const pressScale = useSharedValue(1);
  // Vrai pendant qu'une glissade programmatique est en cours (tap, ou swipe
  // qui a franchi le seuil) : un second geste qui arriverait pendant ce court
  // instant est ignoré plutôt que de venir écraser `dragX` en plein vol, ce
  // qui désynchronisait affiche et pastilles lors d'un double geste rapide.
  const isAnimating = useSharedValue(false);
  const count = items.length;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  /** Repose la bande à 0 et ne fait avancer l'état qu'à cet instant précis —
   *  c'est ce couplage qui synchronise l'affiche et le panneau appelant. */
  const finishSlide = useCallback(
    (direction: 1 | -1) => {
      dragX.value = 0;
      isAnimating.value = false;
      onCommit(direction);
    },
    [dragX, isAnimating, onCommit]
  );

  const gesture = useMemo(() => {
    const enabled = count > 1;

    const pan = Gesture.Pan()
      .enabled(enabled)
      // Il faut une intention horizontale franche, et le geste cède vite à la
      // verticale pour laisser défiler la page — elle reste prioritaire.
      .activeOffsetX([-10, 10])
      .failOffsetY([-12, 12])
      .onBegin(() => {
        if (isAnimating.value) return;
        pressScale.value = withTiming(0.98, { duration: 80 });
      })
      .onUpdate((event) => {
        if (reduceMotion || isAnimating.value) return;
        dragX.value = event.translationX;
        if (pageFollowX) pageFollowX.value = event.translationX * PAGE_FOLLOW;
      })
      .onEnd((event) => {
        if (isAnimating.value) return;
        const passed =
          Math.abs(event.translationX) > SWIPE_DISTANCE ||
          Math.abs(event.velocityX) > SWIPE_VELOCITY;

        if (!passed) {
          dragX.value = withSpring(0, FOLLOW_SPRING);
          return;
        }

        const direction: 1 | -1 = event.translationX < 0 ? 1 : -1;
        if (reduceMotion) {
          dragX.value = 0;
          runOnJS(finishSlide)(direction);
        } else {
          isAnimating.value = true;
          dragX.value = withTiming(-direction * containerWidth, SLIDE_CONFIG, (finished) => {
            if (finished) runOnJS(finishSlide)(direction);
          });
        }
      })
      .onFinalize(() => {
        pressScale.value = withTiming(1, { duration: 150 });
        if (pageFollowX) pageFollowX.value = withSpring(0, FOLLOW_SPRING);
      });

    const tap = Gesture.Tap()
      .enabled(enabled)
      .maxDistance(10)
      .onBegin(() => {
        if (isAnimating.value) return;
        pressScale.value = withTiming(0.98, { duration: 80 });
      })
      .onEnd((_event, success) => {
        if (!success || isAnimating.value) return;
        if (reduceMotion) {
          dragX.value = 0;
          runOnJS(finishSlide)(1);
        } else {
          isAnimating.value = true;
          dragX.value = withTiming(-containerWidth, SLIDE_CONFIG, (finished) => {
            if (finished) runOnJS(finishSlide)(1);
          });
        }
      })
      .onFinalize(() => {
        pressScale.value = withTiming(1, { duration: 150 });
      });

    return Gesture.Race(pan, tap);
  }, [containerWidth, count, dragX, finishSlide, isAnimating, pageFollowX, pressScale, reduceMotion]);

  // Le scale de pression vit sur ce wrapper, à l'EXTÉRIEUR de PosterShell :
  // toute la carte arrondie rétrécit comme un seul bloc. Posé plus bas (sur
  // un enfant clippé par PosterShell), il révélait le fond blanc du parent
  // ET le contour carré, non arrondi, de l'enfant — piège rencontré au tout
  // premier essai.
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  const active = items[activeIndex];
  if (!active) return null;

  const prevItem = items[(activeIndex - 1 + count) % count];
  const nextItem = items[(activeIndex + 1) % count];

  return (
    <Animated.View style={pressStyle}>
      <PosterShell onLayout={onLayout}>
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[StyleSheet.absoluteFill, stripStyle]}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel(active)}
          >
            {count > 1 && <PosterSlot position="prev">{renderPoster(prevItem)}</PosterSlot>}
            <PosterSlot position="current">{renderPoster(active)}</PosterSlot>
            {count > 1 && <PosterSlot position="next">{renderPoster(nextItem)}</PosterSlot>}
          </Animated.View>
        </GestureDetector>
      </PosterShell>
    </Animated.View>
  );
}

/** Une des trois places de la bande — prend `left` en pourcentage plutôt
 *  qu'en pixels : pas besoin de connaître la largeur pour se positionner,
 *  seule la translation de la bande entière (`stripStyle`, en pixels) en a
 *  besoin. */
function PosterSlot({
  position,
  children,
}: {
  position: 'prev' | 'current' | 'next';
  children: ReactNode;
}) {
  const left = position === 'prev' ? '-100%' : position === 'next' ? '100%' : '0%';
  return <RNView style={[styles.slot, { left }]}>{children}</RNView>;
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
  },
});
