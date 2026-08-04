---
paths:
  - "app/**"
  - "components/layout/**"
  - "components/features/**"
---

# Écrans, navigation et mouvement

> À lire **avant** de toucher à la navigation, à un défilement, à une animation,
> ou au fond de l'accueil.

## Navigation : ne jamais la réécrire dans un écran

Header, barre d'onglets, transition (`sceneStyleInterpolator` + `transitionSpec`)
et geste de swipe sont définis dans **`app/(tabs)/_layout.tsx`** — source unique.
Toute modification de navigation se fait là.

Le swipe enveloppe les écrans via `screenLayout`, donc **aucun écran n'a à le
savoir**.

## Tout défilement horizontal doit porter `useSwipeGuard()`

Sans lui, un doigt qui fait défiler une rangée de puces change *aussi* d'onglet :
les deux gestes sont identiques.

```tsx
<ScrollView horizontal {...useSwipeGuard()} />
```

⚠️ **Imbriqué dans le `ScrollView` vertical de l'écran, importer ce `ScrollView`
depuis `react-native-gesture-handler`, pas `react-native`.** Rencontré au
chantier 2 (le carrousel « À l'affiche » / « Les pépites ») : le `ScrollView`
natif de React Native se fait parfois voler le geste par le `Gesture.Pan()` de
`SwipeTabsArea` une fois posé à l'intérieur d'un autre `ScrollView` — `blocked`
passe bien à `true` au toucher, mais le swipe change quand même d'onglet,
**silencieusement, sans erreur**. `useSwipeGuard()` seul ne suffit pas dans ce
cas ; le `ScrollView` de `react-native-gesture-handler` s'annonce correctement
auprès du même arbitrage tactile que `SwipeTabsArea` et referme le trou. La
rangée de filtres de La Carte n'a jamais eu ce problème : elle est imbriquée
dans une `FlatList`, pas un `ScrollView`.

## Listes

Les listes passent par **`FlatList`** (jamais `ScrollView`) et leurs éléments
sont **mémoïsés**. Exception admise : un contenu court et statique, comme
l'écran Infos — ou l'écran Soirées depuis le chantier 2, dont les deux sections
sont un nombre fixe de carrousels, pas une liste.

## `prefers-reduced-motion` doit être respecté

Et **c'est à l'appelant de le faire** — ni Tamagui ni les composants ne le
devinent. La convention du projet :

- lire **`useReducedMotion()` de Reanimated** (pas `AccessibilityInfo` à la main :
  le hook s'abonne aux changements) ;
- sur un composant Tamagui, passer `transition={reduceMotion ? null : 'bouncy'}`
  — `null` désactive, il ne fige pas à mi-course ;
- sur une animation Reanimated écrite à la main, ajouter
  `reduceMotion: ReduceMotion.System` à la config du ressort ou du timing ;
- les animations **purement décoratives** (le halo du bouton, le point qui bat du
  compte à rebours, la vidéo de l'accueil) ne sont pas atténuées mais **pas
  jouées du tout**.

Pour tester : `adb shell settings put global animator_duration_scale 0`
(et `transition_animation_scale`, `window_animation_scale`), puis remettre à `1`.

## La vidéo de l'accueil — une ouverture, pas une boucle

Le fond de l'accueil est une vidéo de 5 s (`expo-video`, livré avec Expo Go —
pas de build natif nécessaire). Elle **passe une seule fois**, s'arrête sur sa
dernière image, et c'est cette image qui devient le fond fixe de l'écran.

**Les deux appels à l'action n'apparaissent qu'à la fin de l'ouverture.** Trois
règles encadrent ce séquencement :

- **Le bloc des boutons reste monté du premier rendu**, à opacité 0. C'est ce
  qui réserve sa hauteur : le monter à la fin de la vidéo ferait remonter d'un
  coup le titre et l'accroche, centrés dans l'espace restant.
- **Invisible veut dire inatteignable** : `pointerEvents="none"` *et*
  `accessibilityElementsHidden` tant que l'ouverture tourne. Un bouton
  transparent qu'on peut quand même activer est un piège.
- **Trois sorties garantissent que les boutons finissent toujours par
  apparaître** : la fin normale (`playToEnd`), les animations coupées
  (`reduceMotion`, la vidéo n'est alors jamais chargée) et l'échec de lecture
  (`status === 'error'`). Un fond décoratif ne doit jamais pouvoir retenir
  l'action principale de l'écran en otage.

L'ouverture se joue **une fois par session** : les écrans étant des onglets,
l'accueil reste monté, donc revenir dessus depuis La Carte ne la rejoue pas.

**Trois choses à ne pas défaire non plus :**

- **La photo reste sous la vidéo, et ce n'est pas un reliquat.** Elle sert
  d'affiche pendant le chargement — sans elle, on voit un rectangle noir au
  démarrage — et de repli quand les animations système sont coupées. La vidéo
  n'apparaît en fondu qu'au statut `readyToPlay`.
- **`surfaceType="textureView"` est obligatoire.** Le défaut Android
  (`surfaceView`) dessine la vidéo dans sa propre couche : elle passerait
  **au-dessus** des dégradés, du titre et des boutons.
- **Le voile est à 0,32, pas à 0,20.** Sur une photo fixe et sombre, 20 %
  suffisaient. Sur une vidéo, des visages et un feu passent là où se pose le
  texte : le voile et l'ombre portée de l'accroche sont ce qui garantit la
  lisibilité quel que soit le plan. Ne pas les alléger pour « mieux voir la
  vidéo » — c'est un arbitrage ouvert, décrit au chantier 1d du `ROADMAP.md`.

Quand `useReducedMotion()` est vrai, la **source du lecteur est mise à `null`** :
le fichier n'est même pas chargé.

`player.pause()` est appelé sur `playToEnd` — sans ça le décodeur continue de
tourner tant que l'écran est monté, c'est-à-dire toute la session.
