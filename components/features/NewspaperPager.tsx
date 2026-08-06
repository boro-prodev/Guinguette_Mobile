/**
 * `NewspaperPager` — on feuillette la page comme une feuille de journal.
 *
 * Une page est une **feuille entière** : tout ce qui est à l'intérieur bouge
 * d'un seul bloc, comme du papier. La feuille suit le doigt, pivote légèrement
 * sur son bord meneur, projette une ombre sur celle du dessous, et découvre
 * progressivement la page suivante — qui, elle, ne bouge pas d'un pixel : dans
 * un vrai journal, c'est la feuille du dessus qui voyage.
 *
 * ## La leçon des trois clignotements
 *
 * L'ancien carrousel d'affiches a coûté trois corrections successives, toutes
 * dues au **même écueil** : le thread UI (les valeurs partagées) et React (les
 * états) n'arrivent pas à l'écran au même instant, et l'image qui s'intercale
 * entre les deux montre quelque chose qui n'a jamais existé. Voir
 * `.claude/rules/ecrans.md`.
 *
 * Ce composant ferme la question autrement, et par construction :
 *
 * 1. **Toutes les pages sont montées en permanence, chacune à sa place**
 *    (superposées, `absoluteFill`). Changer de page ne déplace aucune vue, ne
 *    remonte aucune image, ne réattribue aucune position : il n'y a plus deux
 *    géométries à synchroniser.
 * 2. **Rien de visible ne dépend de l'index React pendant le geste.** L'index
 *    ne sert qu'aux rôles (quelle feuille est dessus) et il ne change qu'une
 *    fois le mouvement **terminé**.
 * 3. ⚠️ **Et surtout : à la fin du mouvement, la feuille sortante est masquée
 *    dans le MÊME worklet que la remise à zéro.** C'est le point à ne pas
 *    défaire. Au moment où la glissade se termine, `dragX` doit revenir à 0
 *    (la page découverte devient la page courante, donc au repos), mais
 *    l'index React, lui, n'arrivera qu'un rendu plus tard. Pendant cette image
 *    d'intervalle, la feuille sortante est encore « celle du dessus » et se
 *    retrouverait brutalement recentrée — l'aller-retour d'image, en tout
 *    point identique à celui de l'ancien carrousel. `outgoing` la rend
 *    transparente au même instant : l'image d'intervalle devient alors
 *    **rigoureusement identique** à celle d'après, et le rendu React peut
 *    arriver quand il veut, même dix images plus tard.
 *
 * ## Ce que le geste ne fait pas
 *
 * Il ne touche jamais à un état React tant que le doigt bouge (`onUpdate`
 * n'écrit que des valeurs partagées), et il cède le pas au défilement vertical
 * de la page (`activeOffsetX`/`failOffsetY`) — chaque feuille défile de son
 * côté, seule la fenêtre visible se plie.
 *
 * ## Ce qui n'est volontairement pas là
 *
 * - **Pas de vrai *page curl*.** Il faudrait un maillage déformable ou un
 *   shader (React Native Skia), qui est un module natif absent d'Expo Go — sur
 *   lequel ce projet est figé. Le pli est donc simulé : perspective, rotation,
 *   ombre portée, dégradé de flexion. Si le rendu devait aller plus loin, ce
 *   serait par calques, pas par shader.
 * - **Pas de butée ni de résistance aux bords** : le feuilletage boucle
 *   (la dernière page ramène à la première). Le jour où l'on passerait en
 *   butée, la résistance se poserait dans `onUpdate`, et nulle part ailleurs.
 */
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
/**
 * ⚠️ **Le `ScrollView` vient de gesture-handler, pas de React Native.** Avec
 * celui de React Native, le défilement natif avale le toucher et le geste
 * horizontal du pager ne reçoit **rien du tout** — pas un `onUpdate`, pas un
 * `onEnd` : la page ne bougeait pas d'un pixel (constaté à l'émulateur le
 * 6 août 2026). Celui de gesture-handler est enveloppé d'un
 * `NativeViewGestureHandler`, ce qui donne à RNGH les deux gestes à arbitrer
 * au lieu d'un seul, et `activeOffsetX`/`failOffsetY` reprennent leur rôle.
 */
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, radius, shadows, spacing } from '@/constants/theme';

/**
 * Marge autour de chaque feuille, à gauche et à droite. Sans elle, la feuille
 * occupe le cadre bord à bord et l'ombre de `shadows.card` n'a nulle part où
 * se voir — demande de Jonathan, 6 août 2026, en même temps que le contour
 * noir cédait la place à cette ombre : « ne pas garder les pages du journal
 * collées à droite et à gauche […] centrée légèrement ».
 *
 * Seulement gauche/droite, pas haut/bas : le cadre (`styles.frame`) épouse
 * déjà exactement la hauteur disponible entre l'en-tête et la barre
 * d'onglets, il n'y a pas de « bord du haut » à dégager comme il y a un bord
 * du cadre à gauche et à droite de l'écran.
 */
const SHEET_INSET = spacing.sm;

/**
 * Tous les réglages du feuilletage, au même endroit — c'est ici qu'on ajuste
 * le ressenti, jamais dans le corps du composant.
 */
export const TURN = {
  /** Part de la largeur à parcourir pour que la page soit tournée. */
  threshold: 0.3,
  /** Vitesse (px/s) qui valide le tour même sans avoir atteint le seuil. */
  velocity: 550,
  /** Profondeur de la perspective — plus c'est bas, plus le pli est marqué. */
  perspective: 1000,
  /** Angle maximal du pli, en degrés. Au-delà de ~25°, le texte devient illisible. */
  maxAngle: 18,
  /**
   * ⚠️ **Sens de la rotation — à vérifier à l'œil, sur les deux plateformes.**
   * Un `rotateY` positif éloigne le bord droit du regard. En partant vers la
   * gauche, on veut au contraire que le bord droit — le bord libre, celui
   * qu'on soulève — vienne **vers** le regard, donc un angle négatif. Si le
   * pli paraissait partir du mauvais bord, c'est ce seul signe à inverser.
   */
  angleSign: -1,
  /** Échelle de la feuille au plus fort du mouvement — un retrait, pas un zoom. */
  minScale: 0.98,
  /** Soulèvement vertical de la feuille (px) : elle décolle un peu du plan. */
  lift: 6,
  /**
   * Assombrissement du bord meneur de la feuille — la flexion du papier.
   *
   * ⚠️ **C'est le seul assombrissement du feuilletage, et il vit sur la
   * feuille qui BOUGE.** Il y en avait deux autres, tous deux posés sur la
   * page qu'on découvre : une ombre portée au bord du pli et un voile général.
   * Retirés le 6 août 2026 après regard de Jonathan — la page suivante
   * apparaissait cernée d'une bande sombre, ce qui se lit comme un liseré sale
   * plutôt que comme du papier. **Ne rien remettre sur la page du dessous :
   * elle se découvre propre, à sa vraie couleur.**
   */
  foldOpacity: 0.3,
  /** Part de la largeur sur laquelle cette flexion se dissipe. */
  foldSpread: 0.45,
  /** Retour en place quand le seuil n'a pas été franchi. */
  spring: { damping: 20, stiffness: 210, mass: 0.9 },
  /**
   * Fin de course quand il l'a été. Une durée fixe plutôt qu'un ressort : on a
   * besoin de connaître l'instant **exact** où la feuille se pose, c'est lui
   * qui déclenche le changement d'index.
   */
  timing: { duration: 300, easing: Easing.out(Easing.cubic) },
} as const;

export type NewspaperPagerHandle = {
  /** Tourner jusqu'à une page donnée — la rangée de pastilles passe par là. */
  goTo: (index: number) => void;
};

type NewspaperPagerProps<T> = {
  pages: T[];
  initialIndex?: number;
  /** Identité stable d'une page : c'est sa `key`, donc ce qui garantit qu'elle
   *  n'est jamais remontée (et qu'aucune image n'est rechargée). */
  keyExtractor: (page: T) => string;
  renderPage: (page: T) => ReactNode;
  /** Appelé **uniquement** quand le tour de page est réellement terminé. */
  onPageChange?: (index: number, page: T) => void;
  /** Marges intérieures du contenu défilable d'une feuille. */
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  ref?: Ref<NewspaperPagerHandle>;
};

/**
 * Le modulo qui boucle (−1 devient la dernière page).
 *
 * ⚠️ **`'worklet'` n'est pas décoratif.** Sans lui, cette fonction reste une
 * fonction du thread JS ; le geste, qui l'appelle depuis le thread UI, la voit
 * comme une *remote function* et **fait planter l'application** en dur :
 * « Tried to synchronously call a Remote Function ». Toute fonction utilitaire
 * appelée depuis un worklet doit en être un.
 */
const wrap = (index: number, count: number) => {
  'worklet';
  return ((index % count) + count) % count;
};

export function NewspaperPager<T>({
  pages,
  initialIndex = 0,
  keyExtractor,
  renderPage,
  onPageChange,
  contentContainerStyle,
  style,
  ref,
}: NewspaperPagerProps<T>) {
  const reduceMotion = useReducedMotion();
  const count = pages.length;

  // L'index de la feuille du dessus. Il ne bouge qu'à la fin d'un tour de
  // page — jamais pendant que le doigt glisse.
  const [index, setIndex] = useState(initialIndex);

  /** Déplacement horizontal de la feuille du dessus. 0 au repos, toujours. */
  const dragX = useSharedValue(0);
  /** Largeur mesurée du cadre — dans une valeur partagée, le geste en a besoin. */
  const width = useSharedValue(0);
  /** Quelle page se découvre en dessous (−1 : aucune). */
  const revealIndex = useSharedValue(-1);
  /** Quelle page vient de sortir et doit rester invisible — voir l'en-tête. */
  const outgoing = useSharedValue(-1);
  /** Vrai pendant la fin de course : un second geste est ignoré, pas empilé. */
  const isTurning = useSharedValue(false);

  const scrollRefs = useRef<Record<number, ScrollView | null>>({});

  /** Progression signée du geste : −1 (page suivante) à +1 (page précédente). */
  const progress = useDerivedValue(() => {
    const w = width.value;
    if (w <= 0) return 0;
    const value = dragX.value / w;
    return value < -1 ? -1 : value > 1 ? 1 : value;
  });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      width.value = event.nativeEvent.layout.width;
    },
    [width]
  );

  /**
   * Le seul endroit où React apprend le changement. On en profite pour
   * remettre la feuille qu'on vient de quitter en haut de son défilement :
   * elle est invisible à cet instant, et une page de journal se présente
   * toujours par son début.
   */
  const commit = useCallback(
    (from: number, to: number) => {
      setIndex(to);
      scrollRefs.current[from]?.scrollTo({ y: 0, animated: false });
      const page = pages[to];
      if (page !== undefined) onPageChange?.(to, page);
    },
    [onPageChange, pages]
  );

  /**
   * Termine le tour de page : la feuille finit sa course hors du cadre, puis
   * — et seulement là — l'index change.
   */
  const runTurn = useCallback(
    (direction: 1 | -1, target: number) => {
      'worklet';
      const w = width.value;
      if (w <= 0 || target === index) return;

      revealIndex.value = target;

      if (reduceMotion) {
        // Animations coupées : on change de page, sans pli ni glissade. La
        // fonction reste entière, c'est l'effet qui disparaît.
        dragX.value = 0;
        runOnJS(commit)(index, target);
        return;
      }

      isTurning.value = true;
      dragX.value = withTiming(-direction * w, TURN.timing, (finished) => {
        // `finished` est faux quand une autre animation prend la main sur
        // `dragX` — y compris la remise à zéro qu'on fait juste en dessous,
        // qui rappelle donc ce callback une seconde fois. Sans ce garde, le
        // tour de page se validerait deux fois.
        if (!finished) return;
        // ⚠️ Ces deux lignes doivent partir ensemble, dans ce worklet-ci :
        // masquer la sortante et remettre la position à zéro dans la même
        // image est ce qui rend l'attente du rendu React invisible.
        outgoing.value = index;
        dragX.value = 0;
        isTurning.value = false;
        runOnJS(commit)(index, target);
      });
    },
    [commit, dragX, index, isTurning, outgoing, reduceMotion, revealIndex, width]
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(count > 1)
        // Il faut une intention horizontale franche, et le geste cède vite à
        // la verticale : le défilement de la feuille reste prioritaire.
        .activeOffsetX([-12, 12])
        .failOffsetY([-14, 14])
        .onBegin(() => {
          if (isTurning.value) return;
          outgoing.value = -1;
        })
        .onUpdate((event) => {
          if (reduceMotion || isTurning.value) return;
          dragX.value = event.translationX;
          // La page qui se découvre dépend du sens, et peut changer en cours
          // de geste si le doigt repart dans l'autre sens.
          revealIndex.value =
            event.translationX < 0 ? wrap(index + 1, count) : wrap(index - 1, count);
        })
        .onEnd((event) => {
          if (isTurning.value) return;
          const w = width.value;
          const passed =
            Math.abs(event.translationX) > w * TURN.threshold ||
            Math.abs(event.velocityX) > TURN.velocity;

          if (!passed || w <= 0) {
            dragX.value = withSpring(0, TURN.spring);
            return;
          }

          const direction: 1 | -1 = event.translationX < 0 ? 1 : -1;
          runTurn(direction, wrap(index + direction, count));
        }),
    [count, dragX, index, isTurning, outgoing, reduceMotion, revealIndex, runTurn, width]
  );

  useImperativeHandle(
    ref,
    () => ({
      goTo: (target: number) => {
        if (isTurning.value || target === index || target < 0 || target >= count) return;
        // Le chemin le plus court : avec trois pages qui bouclent, reculer
        // d'un cran vaut mieux qu'avancer de deux.
        const forward = wrap(target - index, count);
        runTurn(forward * 2 <= count ? 1 : -1, target);
      },
    }),
    [count, index, isTurning, runTurn]
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.frame, style]} onLayout={onLayout}>
        {pages.map((page, position) => (
          <Sheet
            key={keyExtractor(page)}
            position={position}
            isTop={position === index}
            progress={progress}
            width={width}
            outgoing={outgoing}
            revealIndex={revealIndex}
            contentContainerStyle={contentContainerStyle}
            scrollRef={(node) => {
              scrollRefs.current[position] = node;
            }}
          >
            {renderPage(page)}
          </Sheet>
        ))}
      </View>
    </GestureDetector>
  );
}

/**
 * Une feuille. Toutes sont montées en permanence et superposées ; seuls les
 * rôles changent — celle du dessus porte le mouvement, celle qu'on découvre
 * reste immobile, les autres sont transparentes.
 */
function Sheet({
  position,
  isTop,
  progress,
  width,
  outgoing,
  revealIndex,
  contentContainerStyle,
  scrollRef,
  children,
}: {
  position: number;
  isTop: boolean;
  progress: SharedValue<number>;
  width: SharedValue<number>;
  outgoing: SharedValue<number>;
  revealIndex: SharedValue<number>;
  contentContainerStyle?: ViewStyle;
  scrollRef: (node: ScrollView | null) => void;
  children: ReactNode;
}) {
  /**
   * Le pli. L'ordre des `transform` est tout sauf décoratif :
   * - `perspective` d'abord — c'est elle qui projette tout ce qui suit ;
   * - le déplacement du doigt ;
   * - puis le trio `+pivot / rotateY / −pivot`, qui déplace l'axe de rotation
   *   sur le **bord meneur** de la feuille (celui qui sort du cadre en
   *   premier). React Native a bien un `transformOrigin`, mais il n'est pas
   *   animable : le trio fait la même chose en trois nombres, calculés sur le
   *   thread UI.
   *
   * Rappel de lecture : dans une liste de `transform`, la **dernière** entrée
   * s'applique en premier au contenu. `[+pivot, rotateY, −pivot]` amène donc
   * bien le pivot au centre, tourne, puis remet la feuille en place.
   */
  const sheetStyle = useAnimatedStyle(() => {
    const p = isTop ? progress.value : 0;
    const amount = Math.abs(p);
    const direction = p === 0 ? 0 : p < 0 ? -1 : 1;
    // Bord meneur : à gauche quand la feuille part à gauche, à droite sinon.
    const pivot = (direction * width.value) / 2;

    const opacity = isTop
      ? outgoing.value === position
        ? 0
        : 1
      : revealIndex.value === position
        ? 1
        : 0;

    return {
      opacity,
      transform: [
        { perspective: TURN.perspective },
        { translateX: p * width.value },
        { translateY: -TURN.lift * amount },
        { translateX: pivot },
        { rotateY: `${direction * TURN.angleSign * TURN.maxAngle * amount}deg` },
        { translateX: -pivot },
        { scale: 1 - (1 - TURN.minScale) * amount },
      ],
    };
  });

  return (
    <Animated.View
      /**
       * ⚠️ **Le `zIndex` est indispensable, et il vient de React — pas d'un
       * worklet.** Les feuilles se dessinent dans l'ordre du tableau : sans
       * lui, la page révélée (rendue après, si son rang est plus grand)
       * passerait par-dessus celle qui bouge, et le pli serait invisible.
       *
       * Le poser en état React est sans danger **précisément grâce à
       * `outgoing`** : au commit, l'ordre change en même temps que les rôles,
       * mais la feuille sortante est alors transparente, donc l'image ne
       * bouge pas d'un pixel. Ne pas essayer de l'animer sur le thread UI :
       * `zIndex` passe par le circuit de commit, `transform` par la voie
       * rapide, et les deux n'arrivent pas ensemble — c'est la porte ouverte
       * au clignotement qu'on vient de fermer.
       */
      style={[styles.sheet, { zIndex: isTop ? 2 : 1 }, sheetStyle]}
      pointerEvents={isTop ? 'auto' : 'none'}
      accessibilityElementsHidden={!isTop}
      importantForAccessibility={isTop ? 'auto' : 'no-hide-descendants'}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      {/* La flexion n'existe que sur la feuille qui bouge — jamais sur celle
          qu'on découvre, qui se montre à sa vraie couleur. Le bord, lui, est
          permanent : voir `styles.sheet`. */}
      {isTop && (
        <>
          <Fold side="left" progress={progress} />
          <Fold side="right" progress={progress} />
        </>
      )}
    </Animated.View>
  );
}

/**
 * La **flexion** du bord meneur de la feuille : la partie qui s'enfonce dans
 * la perspective s'assombrit, comme une feuille qu'on plie. Un calque par
 * côté, actif seulement quand la feuille part de ce côté-là.
 *
 * `side` est le bord **libre**, celui qui se soulève : à droite quand la
 * feuille part vers la gauche. Le dégradé, lui, part du bord opposé.
 *
 * ⚠️ **Ce calque vit sur la feuille qui bouge, et il n'a plus de pendant sur
 * la page du dessous.** Il y avait ici une seconde vue, `castShadow` : une
 * bande sombre posée juste au-delà du bord libre, donc **sur** la page qu'on
 * découvre. Retirée le 6 août 2026 — à l'écran, la page suivante apparaissait
 * cernée d'un liseré sombre, plus salissant que réaliste.
 */
function Fold({ side, progress }: { side: 'left' | 'right'; progress: SharedValue<number> }) {
  // Feuille qui part à gauche → progression négative → bord libre à droite.
  const sign = side === 'right' ? -1 : 1;

  const foldStyle = useAnimatedStyle(() => {
    const amount = progress.value * sign;
    return { opacity: (amount > 0 ? amount : 0) * TURN.foldOpacity };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, foldStyle]}>
      <LinearGradient
        colors={[colors.duskShade, colors.duskFade]}
        locations={[0, TURN.foldSpread]}
        start={side === 'right' ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 }}
        end={side === 'right' ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    // Le cadre coupe ce qui dépasse : c'est lui qui fait exister le bord de la
    // feuille pendant qu'elle sort.
    overflow: 'hidden',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: SHEET_INSET,
    right: SHEET_INSET,
    bottom: 0,
    // Opaque, sans quoi on verrait la feuille du dessous par transparence.
    backgroundColor: colors.background,
    /**
     * Les angles du HAUT de la feuille, arrondis — demande de Jonathan,
     * 6 août 2026 : une feuille aux coins vifs faisait moins « léché » dès
     * qu'on la glissait. `radius.md` est le même cran que les affiches et les
     * panneaux qu'elle contient, donc un arrondi discret plutôt qu'une carte
     * à jouer.
     *
     * ⚠️ **Seul le haut, pas le bas** — retouché le même jour : la feuille
     * touche la barre d'onglets en son pied (`styles.frame` épouse
     * exactement la hauteur entre l'en-tête et la barre), un arrondi bas ne
     * s'y serait jamais vu et aurait juste laissé passer un triangle de fond
     * dans les coins, sans raison d'être.
     *
     * `overflow: 'hidden'` n'est pas facultatif : sans lui, seul le fond de la
     * feuille serait arrondi, et le dégradé de flexion — qui est ce qui rend
     * le bord VISIBLE — garderait ses coins carrés par-dessus.
     */
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    overflow: 'hidden',
    /**
     * Une ombre plutôt qu'un contour — demande de Jonathan, 6 août 2026.
     * L'intention de départ (« montrer que les pages de journal sont des
     * pages de journal ») avait d'abord donné une petite bordure noire
     * permanente ; jugée peu belle à l'écran, remplacée par `shadows.card` —
     * la même ombre que les autres cartes de l'app (`Pane`, les panneaux de
     * La Carte) — pour un effet de feuille **légèrement surélevée** plutôt
     * qu'encadrée.
     *
     * ⚠️ Fonctionne malgré `overflow: 'hidden'` juste au-dessus : sur Android
     * (la cible de test de ce projet), l'ombre portée par `elevation` n'est
     * pas coupée par le clip de la vue qui la porte — même agencement que
     * `Pane` dans `SpotlightParts.tsx`, qui combine déjà les deux sans
     * calque séparé.
     */
    ...shadows.card,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
