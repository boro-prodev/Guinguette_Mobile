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
le callback de fin de `withTiming` — c'est ce qui permet à l'affiche et au
panneau de détails de changer exactement au même instant.

⚠️ **La bande ne se « repose » jamais à 0 — elle avance.** Une version
intermédiaire remettait `dragX` à 0 en même temps qu'elle appelait `onCommit` :
la remise à 0 s'applique sur le thread UI, le nouvel index passe par un rendu
React, donc la première arrivait à l'écran avant le second et on voyait
l'affiche suivante, puis un retour brutal à l'ancienne, puis enfin la nouvelle
(« image 2, image 1, image 2 »). `dragX` garde désormais sa position et c'est
un décalage compté en largeurs, `shift`, qui l'annule. `shift` étant un état
React posé dans le **même bloc synchrone** que `onCommit`, les deux arrivent
dans le même rendu. L'invariant au repos : `dragX === shift × largeur`, donc la
position visible `dragX − shift × largeur` vaut 0. Ne pas réintroduire de
remise à zéro.

⚠️ **Et `shift` se lit en style ORDINAIRE, jamais dans un worklet.** Le premier
correctif ci-dessus tenait l'invariant mais consommait `shift` dans le style
animé de la bande, alors que les positions des trois affiches (`left`) sont un
style React Native ordinaire. Deux chemins, donc deux instants : au commit, les
`left` se réattribuaient autour du nouvel index pendant que la bande était
encore décalée d'une largeur, et cette image-là montrait la case `+1` du
**nouvel** index — un bref éclair de l'affiche d'après, « image 1, image 3,
image 2 ». L'annulation vit donc sur une vue intercalée en style ordinaire,
validée dans le même commit que les `left`. Le thread UI ne porte plus que
`dragX`, déjà arrivé avant le commit. Vu à l'écran par Jonathan, corrigé le
5 août 2026.

⚠️ **Une affiche est identifiée par son élément, jamais par sa place.** Les
trois emplacements ont d'abord été fixes (précédente/active/suivante) : à
chaque changement, la **même** `<Image>` recevait une nouvelle `source`, donc
expo-image refaisait son fondu depuis le vide — on voyait le fond gris du cadre
et le texte, sans photo, le temps du décodage. Chaque affiche porte maintenant
la `key` de son élément (prop `keyExtractor`, fournie par `EventSpotlight` et
`ArtistSpotlight`) et ne fait que changer de `left` : React conserve
l'instance, l'image reste décodée.

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

## La Carte : seuls les plats illustrés se replient

`MenuBlockView` rend quatre formes de blocs ; **deux seulement se replient**,
`feature` et `photo`. Repliés, ils montrent image, titre et prix ; la
description n'apparaît qu'au toucher. Les listes de prix (`list`) et les
intertitres (`heading`) ne bougent pas — déjà compacts, et sans image à mettre
en avant.

- **Le signal de dépliage est une pastille ronde en bas à droite de la photo**,
  chevron pivotant de 180° à l'ouverture. C'est le seul coin libre : le badge
  « Suggestion de saison » tient le haut à droite d'un plat vedette, le prix
  tient la ligne du titre. Ne pas le déplacer dans cette ligne — il s'y lirait
  comme appartenant au prix.
- **La carte repliable est un `PressableScale`, pas un `Button`.** Elle n'est
  pas une action étiquetée ; c'est la zone tactile brute du projet. Elle porte
  `accessibilityState={{ expanded }}` et un `accessibilityHint` qui change avec
  l'état.
- **`DishCard` est un composant à part**, et pas une branche de
  `MenuBlockView` : il porte des hooks, et les intertitres comme les listes de
  prix n'ont ainsi rien à monter pour rien.
- L'ouverture **fond** la description ; la hauteur, elle, saute. Choix assumé —
  une `LinearTransition` lisserait le mouvement mais les animations de layout
  dans une `FlatList` sont un nid à saccades.

## Le bouton flottant de La Carte

Absent en haut de page, il se pose au défilement (`SHOW_AT`) et s'efface quand
on remonte. Trois choses à ne pas défaire :

- **La bascule ne traverse vers React qu'aux changements d'état**, pas à chaque
  image : le suivi vit dans un `useAnimatedScrollHandler` (thread UI) et ne
  passe par `runOnJS` que lorsque le seuil est franchi. Sans ce garde, un simple
  défilement inonderait le thread JS.
- **Invisible veut dire inatteignable** — `pointerEvents` *et*
  `accessibilityElementsHidden`, même règle que les deux appels à l'action de
  l'accueil.
- ⚠️ **La barre d'onglets n'est pas en position absolue** : le bas de l'écran
  **est** son bord supérieur. Ne pas ajouter `TAB_BAR_HEIGHT` ni la safe-area,
  ce serait décoller le bouton pour rien (mesuré le 5 août 2026). Le poser
  **bas** (`spacing.md`) : plus haut, il tombe en pleine ligne de titre et
  masque le nom du plat.
- ⚠️ **L'ombre se pose sur un conteneur à la taille du bouton**, jamais sur son
  parent pleine largeur : Android ne connaît que `elevation` et dessine d'après
  l'outline de la vue — avec `radius.pill`, un parent pleine largeur donne une
  pilule aussi large que l'écran, visible comme une bande grise.

## La feuille de réservation glisse depuis `onShow`, pas depuis un effet

⚠️ Le glissement d'ouverture part de **`<Modal onShow>`** — c'est-à-dire quand
la fenêtre native est **réellement présentée**. Ne pas revenir à un `useEffect`
sur l'état `mounted` : il se déclenche au commit React, alors que `<Modal>` crée
une fenêtre native une à deux trames plus tard, et le début du glissement se
jouait hors écran.

Un **filet de sécurité** (250 ms) lance la glissade même sans `onShow` : une
feuille montée mais restée hors écran serait une impasse — plus rien à toucher,
et le fond déjà assombri. Même règle que l'accueil : une animation ne tient
jamais le contenu en otage.

`reset()` reste sur le chemin d'ouverture. Ses sept `setState`, plus
`setMounted`, sont dans le même bloc synchrone : React les regroupe en un seul
rendu. Les déplacer à la fermeture n'économiserait rien et ferait réapparaître
l'état précédent si on rouvrait avant la fin de l'animation.

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
