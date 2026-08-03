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

C'est pour cette raison que l'affiche « À l'affiche » se change au toucher et non
au glissement.

## Listes

Les listes passent par **`FlatList`** (jamais `ScrollView`) et leurs éléments
sont **mémoïsés**. Exception admise : un contenu court et statique, comme
l'écran Infos.

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

## La vidéo de l'accueil

Le fond de l'accueil est une vidéo (`expo-video`, livré avec Expo Go — pas de
build natif nécessaire). **Trois choses à ne pas défaire :**

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

⚠️ **Dette connue** : la vidéo n'est pas mise en pause quand on change d'onglet.
Les écrans étant des onglets, l'accueil reste monté et le décodage continue.
Voir chantier 1d.
