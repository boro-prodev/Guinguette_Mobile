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

Header, barre d'onglets et transition (`sceneStyleInterpolator` +
`transitionSpec`) sont définis dans **`app/(tabs)/_layout.tsx`** — source
unique. Toute modification de navigation se fait là.

⚠️ **Il n'y a plus de swipe au doigt entre onglets** — la barre d'onglets se
tape, c'est tout. Il y en a eu un (`SwipeTabsArea`,
`components/layout/SwipeTabs.tsx`, geste `Gesture.Pan()` enveloppant chaque
écran via `screenLayout`), retiré le 5 août 2026 : le même geste horizontal
servait aussi à naviguer dans le carrousel de l'écran Soirées, et les deux
sources de swipe entraient en conflit — swiper une affiche changeait parfois
d'onglet. Plutôt que d'arbitrer les deux, le swipe a été retiré de la
navigation et donné entièrement au carrousel (voir plus bas). `useSwipeGuard()`
a disparu avec lui ; la rangée de filtres de La Carte (`app/(tabs)/carte.tsx`)
n'a plus besoin de s'en prémunir.

## Le carrousel de l'écran Soirées se pilote au tap **et** au swipe

« À l'affiche » et « Artist Spot » (`EventSpotlight`/`ArtistSpotlight`) partagent
un seul composant, `PosterFrame` (`components/features/PosterCarousel.tsx`),
qui porte **toute** la mécanique — geste, rendu, retour tactile. Deux façons
équivalentes d'avancer :

- **le tap sur l'affiche** ;
- **le swipe horizontal** — gauche pour avancer, droite pour reculer.

⚠️ **Ce n'est pas un crossfade.** La première version (`AnimatePresence`,
fondu + scale) a été abandonnée le 5 août 2026 (soir) après trois défauts
remontés par Jonathan à l'écran :

1. le panneau de détails (remonté par `key`) changeait de contenu avant que
   l'affiche ait fini son fondu — jamais synchronisés ;
2. glisser le doigt révélait le fond blanc de `PosterShell` derrière
   l'affiche qui suivait le doigt, puisqu'une seule affiche était montée à
   la fois ;
3. le retour tactile au tap (`scale` posé sur un enfant *clippé* par
   `PosterShell`) révélait à la fois ce fond blanc et le contour carré, non
   arrondi, de l'enfant.

**`PosterFrame` est un vrai carrousel à trois affiches** (précédente / active
/ suivante), toujours montées côte à côte dans une bande que `PosterShell`
(overflow `hidden`) ne laisse voir qu'au milieu tant qu'on ne glisse pas.
Glisser translate la bande entière : la voisine devient donc visible en vrai,
jamais un fond vide — l'effet livre demandé par Jonathan. Tap et
swipe-abouti déclenchent la **même** glissade programmatique (durée fixe,
`Easing.out(Easing.cubic)`), jamais deux langages visuels différents.

⚠️ **Point clé pour la synchronisation : l'état ne change qu'à la fin de la
glissade**, jamais au relâchement du doigt. `onCommit` n'est appelé que dans
le callback de fin de `withTiming`, au même moment où `dragX` revient à 0 —
c'est ce couplage qui permet à l'affiche et au panneau de détails de changer
exactement au même instant, sans jamais désynchroniser l'un de l'autre.

⚠️ **Le scale de pression vit sur un wrapper à l'EXTÉRIEUR de `PosterShell`**,
jamais sur un enfant qu'elle clippe : toute la carte arrondie rétrécit comme
un seul bloc, sans révéler ni fond ni contour carré (piège rencontré à la
première version, voir ci-dessus).

⚠️ **Un second geste pendant une glissade en cours est ignoré**, pas empilé —
une valeur partagée `isAnimating` le fait taire dès `onBegin`/`onEnd`, reset
dans `finishSlide`. Sans ça, un double tap ou un double swipe rapprochés
pouvaient faire dérailler `dragX` en pleine animation.

⚠️ **`Gesture.Pan()` est imbriqué dans le `ScrollView` vertical de l'écran** :
`activeOffsetX`/`failOffsetY` arbitrent avec le défilement de la page comme
`SwipeTabsArea` le faisait en son temps avec le swipe d'onglets, mais il n'y a
plus de second geste horizontal concurrent à cet endroit — seul le défilement
vertical de la page doit rester prioritaire au-delà du seuil vertical.

**Toute la page suit le geste, pas seulement l'affiche.** Un `pageFollowX`
(valeur partagée Reanimated, levée dans `soirees.tsx`, transmise aux deux
sections) applique un très léger `translateX` à l'ensemble du contenu de
l'écran pendant le glissement — qu'on soit en haut ou en bas de la page, le
`transform` s'applique au conteneur qui enveloppe tout le contenu défilable,
pas à la position de défilement. Revient à 0 par ressort au relâchement, que
le seuil ait été franchi ou non.

`prefers-reduced-motion` coupe l'aperçu de glissement (`dragX`/`pageFollowX`
restent à 0, la glissade programmatique devient instantanée) mais **pas** la
fonction : taper ou swiper change toujours de diapositive, seule
l'animation disparaît — même convention que le reste du fichier.

## Le panneau de détails ne démonte jamais son ombre portée

`EventDetailPane`/`ArtistDetailPane` séparent la coquille à ombre (`Pane`,
`shadows.card`) du contenu (`EventDetailContent`/`ArtistDetailContent`,
remonté par `key={event.id}`/`key={artist.id}` à chaque changement). Tout
remonter ensemble faisait clignoter l'ombre Android (`elevation`) un instant
avant le contenu : `elevation` n'est pas porté par l'animation d'opacité de
`entering`/`exiting` de Reanimated, contrairement au reste de la vue — elle
« saute » au lieu de suivre le fondu. Garder `Pane` stable et ne remonter que
le contenu referme le trou.

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
