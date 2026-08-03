/**
 * Navigation au doigt entre les quatre onglets.
 *
 * Le composant s'insère par `screenLayout` dans `app/(tabs)/_layout.tsx` : il
 * enveloppe les quatre écrans sans qu'aucun d'eux ait à le savoir, et la
 * navigation reste définie à un seul endroit (cf. CLAUDE.md).
 *
 * Pendant le geste, le contenu suit le doigt de loin — assez pour qu'on sente
 * que quelque chose bouge, pas assez pour découvrir le vide à côté. Au-delà du
 * seuil (ou à la volée), on navigue et c'est la transition de la barre
 * d'onglets qui prend le relais. En bout de course (pas d'onglet dans cette
 * direction), la résistance triple : le contenu ne fait que frémir.
 *
 * ⚠️ Conflit avec les défilements horizontaux : sur La Carte, la rangée de
 * puces défile à l'horizontale elle aussi. Sans précaution, un doigt posé
 * dessus ferait les deux à la fois. `useSwipeGuard()` règle ça — voir sa doc.
 */
import { router, type Href } from 'expo-router';
import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * L'ordre des onglets — c'est lui, et lui seul, qui définit ce que « vers la
 * gauche » veut dire. Il doit rester aligné sur l'ordre des <Tabs.Screen>.
 */
export const TAB_ORDER = ['index', 'carte', 'soirees', 'infos'] as const;

export type TabName = (typeof TAB_ORDER)[number];

const TAB_HREF: Record<TabName, Href> = {
  index: '/',
  carte: '/carte',
  soirees: '/soirees',
  infos: '/infos',
};

/** Part du déplacement du doigt réellement appliquée au contenu. */
const FOLLOW = 0.32;
/** Idem, mais quand il n'y a pas d'onglet de ce côté : presque rien. */
const EDGE_FOLLOW = 0.09;
/** Fraction de la largeur d'écran au-delà de laquelle on change d'onglet. */
const DISTANCE_RATIO = 0.22;
/** Vitesse (px/s) qui déclenche le changement même sans avoir atteint le seuil. */
const VELOCITY = 700;

const SPRING = { damping: 20, stiffness: 220, reduceMotion: ReduceMotion.System };

type SwipeGuard = {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
};

const GuardContext = createContext<SharedValue<boolean> | null>(null);

const NOOP_GUARD: SwipeGuard = {
  onTouchStart: () => {},
  onTouchEnd: () => {},
  onTouchCancel: () => {},
};

/**
 * À étaler sur tout composant qui défile horizontalement à l'intérieur d'un
 * onglet :
 *
 *   <ScrollView horizontal {...useSwipeGuard()} />
 *
 * Tant qu'un doigt est posé dessus, le swipe entre onglets est neutralisé.
 * On passe par `onTouchStart` plutôt que par `onScrollBeginDrag` : le premier
 * part dès que le doigt touche, le second seulement une fois le défilement
 * engagé — trop tard, le geste de navigation aurait déjà pu s'activer.
 */
export function useSwipeGuard(): SwipeGuard {
  const blocked = useContext(GuardContext);

  return useMemo(() => {
    if (!blocked) return NOOP_GUARD;
    return {
      onTouchStart: () => {
        blocked.value = true;
      },
      onTouchEnd: () => {
        blocked.value = false;
      },
      onTouchCancel: () => {
        blocked.value = false;
      },
    };
  }, [blocked]);
}

type SwipeTabsAreaProps = PropsWithChildren<{
  /** Nom de route de l'écran enveloppé (`index`, `carte`, `soirees`, `infos`). */
  routeName: string;
}>;

export function SwipeTabsArea({ routeName, children }: SwipeTabsAreaProps) {
  const translateX = useSharedValue(0);
  const blocked = useSharedValue(false);
  const reduceMotion = useReducedMotion();
  const { width } = useWindowDimensions();

  const index = TAB_ORDER.indexOf(routeName as TabName);
  const hasPrevious = index > 0;
  const hasNext = index >= 0 && index < TAB_ORDER.length - 1;

  const goTo = useCallback(
    (delta: number) => {
      const target = TAB_ORDER[index + delta];
      if (target) router.navigate(TAB_HREF[target]);
    },
    [index]
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        // Il faut 20 px franchement horizontaux pour activer, et le geste
        // abandonne dès 14 px verticaux : le défilement des listes reste
        // prioritaire, c'est lui qu'on utilise le plus souvent.
        .activeOffsetX([-20, 20])
        .failOffsetY([-14, 14])
        .onUpdate((event) => {
          if (blocked.value || reduceMotion) return;
          const towardsExistingTab = event.translationX < 0 ? hasNext : hasPrevious;
          translateX.value = event.translationX * (towardsExistingTab ? FOLLOW : EDGE_FOLLOW);
        })
        .onEnd((event) => {
          const passed =
            Math.abs(event.translationX) > width * DISTANCE_RATIO ||
            Math.abs(event.velocityX) > VELOCITY;

          if (!blocked.value && passed) {
            if (event.translationX < 0 && hasNext) {
              runOnJS(goTo)(1);
            } else if (event.translationX > 0 && hasPrevious) {
              runOnJS(goTo)(-1);
            }
          }

          translateX.value = withSpring(0, SPRING);
        }),
    [blocked, goTo, hasNext, hasPrevious, reduceMotion, translateX, width]
  );

  const followStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GuardContext.Provider value={blocked}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.screen, followStyle]}>{children}</Animated.View>
      </GestureDetector>
    </GuardContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
