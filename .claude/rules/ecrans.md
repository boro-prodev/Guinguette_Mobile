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

## L'écran Soirées se feuillette comme un journal

**Une page = une soirée**, et elle contient tout : l'affiche de la soirée, son
panneau, l'affiche de l'artiste, sa fiche. Seuls le titre, l'accroche et la
rangée de pastilles restent fixes — l'ours du journal. Tout le reste est une
**feuille** d'un seul tenant, qui suit le doigt, pivote sur son bord meneur,
projette une ombre sur la page du dessous et la découvre.

Toute la mécanique vit dans `components/features/NewspaperPager.tsx`, un
composant générique. `EventSpotlight`/`ArtistSpotlight` ne naviguent plus du
tout : ils montrent ce qu'on leur donne.

⚠️ **Un seul geste horizontal par écran.** Le carrousel d'affiches
(`PosterFrame`, tap et swipe sur l'affiche) a été **retiré** le 6 août 2026 en
même temps que ce chantier arrivait. Ce n'est pas une perte de fonction, c'est
la même leçon que la disparition du swipe entre onglets la veille, un cran plus
bas : deux gestes horizontaux imbriqués finissent toujours par s'arbitrer mal.
`pageFollowX` (une fraction du glissement répercutée sur toute la page) a
disparu avec — il était le brouillon de ce qu'on fait maintenant pour de bon.

⚠️ **Le piège du clignotement est fermé par construction, pas par astuce.**
Trois corrections successives de l'ancien carrousel venaient toutes du même
endroit : le thread UI et React n'arrivent pas à l'écran au même instant, et
l'image d'intervalle montre un état qui n'a jamais existé. Le pager repose sur
trois invariants, à lire dans son en-tête avant d'y toucher :

1. **Toutes les pages sont montées en permanence et superposées.** Changer de
   page ne déplace aucune vue, ne réattribue aucune position, ne recharge
   aucune image.
2. **L'index React ne change qu'à la fin du mouvement**, jamais au relâchement
   du doigt ni pendant le glissement.
3. **La feuille sortante est masquée dans le MÊME worklet que la remise à zéro
   de `dragX`.** C'est le point à ne pas défaire : l'image qui précède le rendu
   React devient alors rigoureusement identique à celle qui le suit, et le
   rendu peut arriver quand il veut, même dix images plus tard.

⚠️ **Le `zIndex` des feuilles vient de React, jamais d'un worklet.** Sans lui,
la page révélée passerait par-dessus celle qui bouge (ordre de rendu du
tableau). Le poser en état React est sans danger *grâce au point 3* ; l'animer
sur le thread UI ne le serait pas — `zIndex` passe par le circuit de commit et
`transform` par la voie rapide, les deux n'arrivent pas ensemble.

**Le pli est simulé, et c'est définitif tant qu'on reste sur Expo Go.** Un vrai
*page curl* demanderait un maillage déformable ou un shader (React Native
Skia), module natif absent d'Expo Go. Le pli se compose donc de : perspective,
rotation autour du bord meneur (obtenue par un trio `+pivot / rotateY / −pivot`,
`transformOrigin` n'étant pas animable), et un dégradé de flexion qui assombrit
ce bord meneur. Si le rendu doit aller plus loin, ce sera par calques.

⚠️ **Rien ne s'assombrit sur la page qu'on découvre.** Il y avait deux calques
pour ça — une ombre portée au bord du pli, qui tombait sur elle, et un voile
général qui se dissipait à mesure qu'elle sortait. Les deux ont sauté le 6 août
2026 après regard de Jonathan : la page suivante apparaissait **cernée d'une
bande sombre**, ce qui se lit comme un liseré sale, pas comme du papier. La
feuille qui bouge est la seule à porter un assombrissement. Ne rien remettre en
dessous — le brief d'origine demandait cette ombre, l'écran a tranché contre.

**La feuille a les angles du HAUT arrondis** (`radius.md`, le même cran que les
affiches et les panneaux qu'elle contient), avec `overflow: 'hidden'` — sans
lui, seul le fond serait arrondi et le dégradé de flexion garderait ses coins
carrés par-dessus. **Pas le bas** (retouché le 6 août 2026) : la feuille touche
la barre d'onglets en son pied (`styles.frame` épouse exactement la hauteur
entre l'en-tête et la barre), un arrondi bas ne s'y serait jamais vu.

**Et elle porte une ombre permanente** (`shadows.card`, la même que `Pane` et
les panneaux de La Carte) plutôt qu'un contour — demande de Jonathan, 6 août
2026, qui a tranché en deux temps dans la même session :

1. « montrer que les pages de journal sont des pages de journal » → une petite
   bordure noire permanente (`borderWidth: 1`, `colors.duskShade`) ;
2. « oublie la bordure noire, c'est pas beau, peut-être un léger ombrage pour
   donner l'impression qu'elle est un peu surélevée » → l'ombre actuelle.

Trois versions successives du même besoin, à ne pas rouvrir sans relire cet
historique :

- **5 août** — un liseré au cheveu (`Edge`), qui n'apparaissait **qu'au
  glissement** (opacité pilotée par `progress`), parce qu'un `borderWidth`
  permanent dessinerait une boîte autour d'une feuille qui couvrait alors le
  cadre bord à bord.
- **6 août, 1er temps** — le `borderWidth` permanent, precisément ce qu'on
  avait écarté la veille : Jonathan voulait la page reconnaissable **en
  permanence**, pas seulement pendant le geste.
- **6 août, 2e temps** — l'ombre, jugée plus belle. Elle exige la marge
  ci-dessous, que le contour n'exigeait pas — une bordure se voit contre
  n'importe quel fond, une ombre a besoin d'espace pour se projeter.

⚠️ **Ne fonctionne que grâce à `SHEET_INSET`** (`spacing.sm`, gauche/droite
seulement) sur `styles.sheet` : une feuille bord à bord avec le cadre n'a nulle
part où projeter son ombre — `frame` la coupe (`overflow: 'hidden'`) exactement
là où elle apparaîtrait. `SHEET_INSET` est distinct de la gouttière de contenu
(`pageContent` dans `app/(tabs)/soirees.tsx`) : l'un détache la feuille des
bords de l'écran, l'autre détache son contenu des angles arrondis de la
feuille — les deux marges s'additionnent, ce n'est pas une redite.

L'ombre fonctionne malgré le `overflow: 'hidden'` de la feuille (nécessaire aux
angles arrondis) : sur Android, cible de test de ce projet, `elevation` n'est
pas coupée par le clip de la vue qui la porte — même agencement que `Pane`.

**Le feuilletage boucle** (la dernière page ramène à la première), donc pas de
butée ni de résistance aux bords — le jour où l'on passerait en butée, la
résistance se poserait dans `onUpdate`, et nulle part ailleurs.

**Deux pièges d'exécution, tous deux rencontrés le 6 août 2026 et coûteux à
diagnostiquer parce qu'ils ne ressemblent pas à leur cause :**

- ⚠️ **Le `ScrollView` d'une feuille vient de `react-native-gesture-handler`,
  jamais de `react-native`.** Avec celui de React Native, le défilement natif
  avale le toucher et le geste horizontal ne reçoit **rien du tout** — ni
  `onUpdate`, ni `onEnd` : la page ne bouge pas d'un pixel, sans la moindre
  erreur. Celui de gesture-handler est enveloppé d'un
  `NativeViewGestureHandler`, ce qui donne à RNGH deux gestes à arbitrer au
  lieu d'un seul.
- ⚠️ **Toute fonction utilitaire appelée depuis un worklet doit elle-même être
  un worklet.** Un simple modulo (`wrap`) laissé en fonction JS ordinaire
  **fait planter l'application en natif** dès le premier geste : « Tried to
  synchronously call a Remote Function ». Le message ne nomme pas le fichier
  fautif dans la red box — il n'apparaît qu'en `adb logcat`.

**Chaque feuille défile verticalement de son côté** : seule la fenêtre visible
se plie. `activeOffsetX`/`failOffsetY` arbitrent entre le geste horizontal et
ce défilement, qui reste prioritaire. Une feuille qu'on vient de quitter est
remise en haut de son défilement — invisible à cet instant, et une page de
journal se présente toujours par son début.

**Les pastilles sont la navigation sans geste** (et l'équivalent des boutons
précédent/suivant) : chaque pastille tourne les pages jusqu'à la sienne, par le
chemin le plus court. Un compteur (« 2 / 3 », `tabularNums`) les accompagne
depuis le 6 août 2026 — « un indicateur plus marquant pour le nombre de page » :
la rangée de pastilles seule ne dit pas d'un coup d'œil où on en est.

⚠️ **Les pastilles utilisaient `transition: 'medium'` (ressort lâche,
`stiffness: 150`) et ça se voyait comme un décalage.** L'index React ne change
qu'à la FIN du tour de page (300 ms, `TURN.timing`) — la pastille active ne
commence donc à bouger qu'une fois la feuille déjà immobile, et un ressort trop
lent continue alors de glisser bien après coup : repéré par Jonathan comme une
« impression de lag ». Passé à `'quick'` (`stiffness: 340`), qui se pose plus
vite que la feuille ne met à tourner.

**Une seule affiche porte le compte à rebours.** `ArtistSpotlight` n'a plus de
`Countdown` depuis le 6 août 2026 : le répéter sur l'affiche de l'artiste
doublait l'information déjà donnée par « À l'affiche », et faisait battre deux
points ambrés sur la même page. `EventSpotlight` reste la seule source.

**Les réseaux de l'artiste (`ArtistDetailPane`) sont en `tone="soft"` et
`size="md"`**, pas `ghost`/`sm` : « les mettre un peu plus en avant », demande
du même jour. Trois pastilles nues en bas de panneau se lisaient comme un
détail secondaire ; un disque de couleur (teinte du thème de la soirée) leur
donne un poids visuel, un `Kicker` (« Retrouver l'artiste ») les identifie.
Mécanique inchangée — mêmes trois `Linking.openURL`, même désactivation si
l'URL est vide (voir `.claude/rules/donnees-et-demo.md`).

`prefers-reduced-motion` coupe l'aperçu et le pli (`dragX` reste à 0, le tour
de page devient instantané) mais **pas** la fonction : glisser ou toucher une
pastille change toujours de soirée — même convention que le reste du fichier.

## Le panneau de détails ne démonte jamais son ombre portée

`EventDetailPane`/`ArtistDetailPane` séparent la coquille à ombre (`Pane`,
`shadows.card`) du contenu (`EventDetailContent`/`ArtistDetailContent`,
remonté par `key={event.id}`/`key={artist.id}` à chaque changement). Tout
remonter ensemble faisait clignoter l'ombre Android (`elevation`) un instant
avant le contenu : `elevation` n'est pas porté par l'animation d'opacité de
`entering`/`exiting` de Reanimated, contrairement au reste de la vue — elle
« saute » au lieu de suivre le fondu. Garder `Pane` stable et ne remonter que
le contenu referme le trou.

## La Carte : une suggestion illustrée, puis une liste

⚠️ **Il n'y a plus de filtre « Tout »** (6 août 2026) : on entre sur
« À partager », et on ne voit **jamais qu'une catégorie à la fois**. Chacune
tient en deux blocs, toujours dans cet ordre — un `feature` (la suggestion, en
grande photo, badge « Suggestion de saison », description qui se déplie) puis un
`list` (tout le reste, en lignes nom / description / prix, **sans image**).

`MenuBlockView` ne rend donc plus que ces deux formes. `heading` (l'intertitre
pleine largeur) et `photo` (le plat illustré sans badge) ont disparu avec ce
remaniement : plus aucune donnée ne les utilisait. **Une seule photo par
catégorie** — c'est ce qui fait qu'elle met quelque chose en avant.

**Seule la suggestion se replie.** Repliée, elle montre image, titre et prix ;
la description n'apparaît qu'au toucher. Les listes de prix ne bougent pas —
déjà compactes, et sans image à mettre en avant.

⚠️ **Le titre d'une liste porte `numberOfLines={1}` et `flex: 1`.** Sans eux,
Android mesure mal ce `Text` en Berkshire Swash et coupait « À partager » à son
seul « À », en silence — exactement le défaut de l'accroche de l'écran Soirées.
Le réflexe vaut pour **tout** titre court en police d'affichage posé dans une
rangée `flexDirection: 'row'`.

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
- ⚠️ **La valeur partagée du chevron s'écrit dans le gestionnaire, jamais dans
  la fonction de mise à jour de `setExpanded`.** React exécute cette
  fonction-là **pendant le rendu** (deux fois en mode strict) : Reanimated 4 le
  signalait à chaque repli (« Writing to `value` during component render »), et
  l'animation risquait d'être jouée deux fois ou perdue. Corrigé le 6 août
  2026 ; le prix est que `toggle` dépend d'`expanded`, ce qui ne coûte rien.

## Le bouton flottant de La Carte

Il se pose **au bout de la catégorie** : absent tant qu'il reste à lire, il
apparaît quand le dernier bloc finit d'entrer à l'écran, et s'efface si on
remonte.

⚠️ **Ce n'est plus un seuil de défilement, et ça ne peut plus l'être.** Il se
posait après 220 px parcourus (`SHOW_AT`), ce qui marchait quand La Carte était
une longue liste. Depuis qu'on ne voit **qu'une catégorie à la fois** (6 août
2026), trois des quatre catégories ne défilent pas de 220 px : le bouton n'y
apparaissait **jamais**. Le repère est désormais la distance au bas du contenu,
et il vaut le vide réservé sous le dernier bloc (`END_MARGIN`
= `spacing.md + CTA_CLEARANCE`) — le bouton arrive donc au moment précis où ce
dernier bloc finit d'entrer, jamais avant.

Quatre choses à ne pas défaire :

- ⚠️ **Le verdict doit aussi se calculer hors défilement.** Une catégorie trop
  courte pour défiler n'émet **aucun** événement de défilement — et c'est
  justement là que le bouton doit être présent d'emblée, puisqu'on est déjà au
  bout. Le calcul est donc appelé depuis trois endroits : le gestionnaire de
  défilement (thread UI), `onLayout` et `onContentSizeChange` (thread JS). Il
  porte `'worklet'` pour pouvoir l'être des deux côtés.
- **La bascule ne traverse vers React qu'aux changements d'état**, pas à chaque
  image : le suivi vit dans un `useAnimatedScrollHandler` (thread UI) et ne
  passe par `runOnJS` que lorsque le verdict change. Sans ce garde, un simple
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
