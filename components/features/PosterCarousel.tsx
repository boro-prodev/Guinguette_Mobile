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
 *
 * ⚠️ **Troisième révision, le 5 août 2026 (nuit).** Cette version-là avait
 * encore deux défauts, vus à l'écran par Jonathan et corrigés dans
 * `PosterFrame` — les deux invariants qui en sortent sont documentés sur le
 * composant lui-même, à lire avant d'y toucher :
 * 1. **l'affiche faisait un aller-retour** (suivante, retour à l'ancienne,
 *    puis enfin la suivante) — la bande était reposée à 0 sur le thread UI
 *    avant que le nouvel index n'arrive par un rendu React ;
 * 2. **une affiche s'affichait sans sa photo**, fond gris et texte seuls —
 *    les emplacements étaient identifiés par leur place et non par leur
 *    élément, donc chaque changement remplaçait la `source` d'une `<Image>`
 *    déjà montée, et expo-image repartait d'un fondu à vide ;
 * 3. **le clignotement est revenu sous une autre forme** — un bref éclair de
 *    l'affiche *d'après* (« image 1 → image 3 → image 2 »), parce que le
 *    correctif du point 1 lisait encore `shift` dans un worklet alors que les
 *    positions des affiches, elles, sont un style ordinaire. Deux chemins,
 *    donc deux instants. Corrigé le 5 août 2026 en fin de course.
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
  /** Identité stable d'un élément — c'est elle qui sert de `key` à son
   *  affiche, et donc ce qui garantit qu'une image déjà décodée n'est jamais
   *  remontée (voir `PosterFrame`). */
  keyExtractor: (item: T) => string;
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
 * ⚠️ **Deux pièges rencontrés à l'écran, et leurs deux invariants. Ne pas
 * défaire l'un sans comprendre l'autre.**
 *
 * **1. La bande ne se « repose » jamais à 0 — elle avance, et c'est un style
 * ORDINAIRE qui l'annule.** Le premier essai remettait `dragX` à 0 en même
 * temps qu'il appelait `onCommit`. Mais l'un s'applique sur le thread UI et
 * l'autre passe par un rendu React : la remise à 0 arrivait à l'écran **avant**
 * le nouvel index, et on voyait l'affiche suivante, puis un retour brutal à
 * l'ancienne, puis enfin la nouvelle (« image 2, image 1, image 2 »). La bande
 * garde donc sa position et c'est un décalage compté en largeurs, `shift`, qui
 * l'annule — `shift` étant un état React, il change **dans le même rendu** que
 * `activeIndex` chez l'appelant (React 18 regroupe les deux `setState` du même
 * bloc). Invariant au repos : `dragX === shift × largeur`, position visible
 * `dragX − shift × largeur`, soit 0.
 *
 * ⚠️ **Encore fallait-il le LIRE au bon endroit.** Une deuxième version tenait
 * cet invariant mais consommait `shift` dans le worklet du style animé, avec
 * les `left` des affiches restés en style ordinaire. Deux chemins, deux
 * instants : au commit, les `left` se réattribuaient autour du nouvel index
 * pendant que la bande était encore décalée d'une largeur, et l'image ainsi
 * gagnée montrait la case `+1` du NOUVEL index — « image 1, bref éclair
 * d'image 3, puis image 2 ». Vu à l'écran par Jonathan le 5 août 2026.
 * L'annulation vit donc sur une vue intercalée en style React Native
 * ordinaire : `translateX` et `left` sont alors deux styles du même rendu, et
 * rien ne peut plus s'intercaler entre eux. Le thread UI ne porte plus que
 * `dragX`, déjà arrivé à destination avant le commit.
 *
 * **2. Une affiche est identifiée par son élément, jamais par sa place.**
 * Les trois emplacements étaient d'abord fixes (précédente/active/suivante) :
 * à chaque changement, la **même** `<Image>` recevait une nouvelle `source`,
 * donc expo-image refaisait son fondu depuis le vide — on voyait le fond gris
 * du cadre et le texte, sans photo, le temps du décodage. Chaque affiche porte
 * maintenant la `key` de son élément (`keyExtractor`) et ne fait que changer
 * de `left` : React conserve l'instance, l'image reste décodée, et il n'y a
 * plus rien à recharger en cours de route.
 *
 * Tap et swipe-abouti déclenchent la **même** glissade programmatique
 * (`SLIDE_CONFIG`) ; `onCommit` n'est appelé qu'à la fin de celle-ci, ce qui
 * fait changer l'affiche et le panneau de détails dans le même instant.
 */
export function PosterFrame<T>({
  items,
  activeIndex,
  keyExtractor,
  onCommit,
  accessibilityLabel,
  renderPoster,
  pageFollowX,
}: PosterFrameProps<T>) {
  const reduceMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();
  // Mesurée via `onLayout`, avec la largeur de fenêtre comme repli tant qu'elle
  // n'a pas mesuré — jamais 0, sans quoi la glissade viserait sa position de
  // départ et « réussirait » sans jamais rien montrer à l'écran.
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  // Décalage de la bande, compté en largeurs — voir le piège 1 ci-dessus.
  const [shift, setShift] = useState(0);
  const dragX = useSharedValue(0);
  /** Position de repos au début du geste courant — voir `onBegin`. */
  const restX = useSharedValue(0);
  const pressScale = useSharedValue(1);
  // Vrai pendant qu'une glissade programmatique est en cours (tap, ou swipe
  // qui a franchi le seuil) : un second geste qui arriverait pendant ce court
  // instant est ignoré plutôt que de venir écraser `dragX` en plein vol, ce
  // qui désynchronisait affiche et pastilles lors d'un double geste rapide.
  const isAnimating = useSharedValue(false);
  const count = items.length;

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measured = event.nativeEvent.layout.width;
      setContainerWidth((current) => {
        // La largeur entre dans l'invariant `dragX === shift × largeur` : si
        // elle change une fois la bande décalée, il faut y replacer `dragX`.
        if (measured !== current) dragX.value = shift * measured;
        return measured;
      });
    },
    [dragX, shift]
  );

  /**
   * Fin de glissade. `setShift` et `onCommit` sont dans le même bloc
   * synchrone : React 18 les regroupe en un seul rendu, donc le décalage de la
   * bande et le nouvel index arrivent **ensemble** à l'écran — c'est tout ce
   * qui empêche l'aller-retour d'image décrit plus haut. `dragX`, lui, n'est
   * pas touché : il est déjà à sa nouvelle position de repos.
   */
  const finishSlide = useCallback(
    (direction: 1 | -1) => {
      isAnimating.value = false;
      setShift((current) => current - direction);
      onCommit(direction);
    },
    [isAnimating, onCommit]
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
        // Position de repos du moment, relevée sur le thread UI plutôt que
        // recalculée depuis `shift` : le worklet n'a ainsi jamais à faire
        // confiance à une valeur JS qui pourrait dater d'un rendu précédent.
        restX.value = dragX.value;
        pressScale.value = withTiming(0.98, { duration: 80 });
      })
      .onUpdate((event) => {
        if (reduceMotion || isAnimating.value) return;
        dragX.value = restX.value + event.translationX;
        if (pageFollowX) pageFollowX.value = event.translationX * PAGE_FOLLOW;
      })
      .onEnd((event) => {
        if (isAnimating.value) return;
        const passed =
          Math.abs(event.translationX) > SWIPE_DISTANCE ||
          Math.abs(event.velocityX) > SWIPE_VELOCITY;

        if (!passed) {
          dragX.value = withSpring(restX.value, FOLLOW_SPRING);
          return;
        }

        const direction: 1 | -1 = event.translationX < 0 ? 1 : -1;
        const target = restX.value - direction * containerWidth;
        if (reduceMotion) {
          dragX.value = target;
          runOnJS(finishSlide)(direction);
        } else {
          isAnimating.value = true;
          dragX.value = withTiming(target, SLIDE_CONFIG, (finished) => {
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
        restX.value = dragX.value;
        pressScale.value = withTiming(0.98, { duration: 80 });
      })
      .onEnd((_event, success) => {
        if (!success || isAnimating.value) return;
        const target = restX.value - containerWidth;
        if (reduceMotion) {
          dragX.value = target;
          runOnJS(finishSlide)(1);
        } else {
          isAnimating.value = true;
          dragX.value = withTiming(target, SLIDE_CONFIG, (finished) => {
            if (finished) runOnJS(finishSlide)(1);
          });
        }
      })
      .onFinalize(() => {
        pressScale.value = withTiming(1, { duration: 150 });
      });

    return Gesture.Race(pan, tap);
  }, [
    containerWidth,
    count,
    dragX,
    finishSlide,
    isAnimating,
    pageFollowX,
    pressScale,
    reduceMotion,
    restX,
  ]);

  // Le scale de pression vit sur ce wrapper, à l'EXTÉRIEUR de PosterShell :
  // toute la carte arrondie rétrécit comme un seul bloc. Posé plus bas (sur
  // un enfant clippé par PosterShell), il révélait le fond blanc du parent
  // ET le contour carré, non arrondi, de l'enfant — piège rencontré au tout
  // premier essai.
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // La bande ne porte QUE le geste. L'annulation du décalage (`shift`) vit sur
  // une vue intercalée, en style ordinaire — voir le piège 1 sur le composant.
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  /**
   * Les trois affiches montées, chacune avec son décalage relatif à l'active
   * (−1 à gauche, 0 au centre, +1 à droite). C'est la **clé de l'élément** qui
   * identifie chaque affiche, pas sa place : changer d'index ne fait donc que
   * déplacer des vues déjà rendues, sans jamais recharger une image.
   * `seen` couvre le cas d'une liste trop courte pour que précédente et
   * suivante soient deux éléments distincts.
   */
  const slots = useMemo(() => {
    const entries: { key: string; item: T; offset: number }[] = [];
    const seen = new Set<string>();

    const push = (index: number, offset: number) => {
      const item = items[index];
      if (!item) return;
      const key = keyExtractor(item);
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ key, item, offset });
    };

    push(activeIndex, 0);
    if (count > 1) {
      push((activeIndex + 1) % count, 1);
      push((activeIndex - 1 + count) % count, -1);
    }

    // Ordre de rendu figé sur la clé : les affiches ne changent que de `left`
    // d'un rendu à l'autre, jamais de position dans l'arbre.
    return entries.sort((a, b) => a.key.localeCompare(b.key));
  }, [activeIndex, count, items, keyExtractor]);

  const active = items[activeIndex];
  if (!active) return null;

  return (
    <Animated.View style={pressStyle}>
      <PosterShell onLayout={onLayout}>
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[StyleSheet.absoluteFill, stripStyle]}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel(active)}
          >
            {/*
              Cette vue-ci annule le décalage accumulé, et elle est en style
              React Native ORDINAIRE — pas animé. C'est tout l'intérêt : son
              `translateX` et les `left` des affiches sont deux styles du même
              rendu, donc validés dans le même commit, donc impossibles à voir
              l'un sans l'autre. Portée par un worklet, l'annulation arrivait
              une image APRÈS la réattribution des `left`, et cette image-là
              montrait la voisine d'après (piège 1).
            */}
            <RNView
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: -shift * containerWidth }] },
              ]}
            >
              {slots.map(({ key, item, offset }) => (
                <RNView key={key} style={[styles.slot, { left: `${offset * 100}%` }]}>
                  {renderPoster(item)}
                </RNView>
              ))}
            </RNView>
          </Animated.View>
        </GestureDetector>
      </PosterShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
  },
});
