# Feuille de route — prochaines étapes

> Idées de Jonathan, mises en forme le **2 août 2026**, arbitrages tranchés le
> même jour.
> **Mise à jour du 2 août 2026** — le skill `better-typography` est installé : le
> chantier 0 est débloqué. *(Cette note annonçait aussi que « 1b attend seulement
> que 0 soit fait » — c'était faux, voir le 3 août.)*
> **Mise à jour du 3 août 2026** — revue typographique passée sur toute l'app.
> **Les chantiers 0 et 1b sont faits** : l'app tourne désormais sur
> **Berkshire Swash**. Deux demandes de Jonathan sont venues s'ajouter le même
> jour : la reprise des **deux boutons de l'accueil** (nouveau chantier 1c), celle
> du **sous-titre de Soirées** — déjà prévue au chantier 2, simplement renforcée
> — et un **chantier 4 sur le mouvement** (pression du bouton, ouverture de la
> feuille de réservation). Les chantiers 1a, 1c, 2, 3 et 4 restent entiers.
> **Mise à jour du 4 août 2026** — **1a est fait** : la guirlande ne rogne plus
> ses halos et ne collide plus avec le jambage du « g » d'Oignies (vérifié à
> l'écran, sur émulateur). Dans le chantier 1, ne restent ouverts que **1d.c**
> (débit de la vidéo) et **1c** (hiérarchie des deux boutons).
> **Mise à jour du 4 août 2026 (soir)** — **1d.c et 1c sont faits.** La vidéo
> est ré-encodée (÷3,1 sur le poids). La hiérarchie des boutons est passée par
> plusieurs pistes avant de se fixer : d'abord un simple `tone="soft"` sur le
> second bouton, puis — à la demande de Jonathan — un essai glassmorphisme
> devenu la version retenue. `components/ui/Button.tsx` gagne deux ajouts
> **non prévus par ce document** : `tone="glass"` (flou natif + voile teinté)
> et `emphasis` (anneau ambré permanent, qui bat). Ni l'un ni l'autre n'existait
> avant ce chantier ; les deux sont documentés dans
> `.claude/rules/design-system.md`, y compris un piège Reanimated rencontré en
> route. Il ne reste ouvert, dans le chantier 1, que **1d.a** (le voile de la
> vidéo) — voir la question 10 en fin de document.
> **Mise à jour du 4 août 2026 (nuit)** — **Chantier 2 fait.** Jonathan a
> reformulé l'interaction en cours de route : le carrousel « À l'affiche » se
> swipe désormais au doigt (garde-fou `useSwipeGuard()`), et le toucher sur
> l'affiche déplie ses informations au lieu de faire avancer à la soirée
> suivante. « Les pépites » n'est pas « toute la programmation » comme le
> proposait ce document par défaut, mais une sélection **manuelle** de
> l'exploitant (`pepite: boolean` dans `data/events.ts`) — l'ancien point
> ouvert n°2 est tranché différemment de sa proposition par défaut. `EventCard`
> a disparu, son contenu migré dans un panneau de dépliage partagé
> (`EventDetailPane`). Un piège technique inédit a été rencontré et documenté
> dans `.claude/rules/ecrans.md` : un `ScrollView` React Native imbriqué dans
> le `ScrollView` vertical de l'écran se fait parfois voler son geste par le
> swipe d'onglets, *silencieusement* ; le contournement est d'importer ce
> `ScrollView` depuis `react-native-gesture-handler`.
> **Mise à jour du 4 août 2026 (nuit, suite)** — En testant le chantier 2,
> Jonathan a trouvé mieux : le panneau reste désormais **toujours affiché**
> sous l'affiche active, sans tap pour le déplier (`toggleExpanded` a
> disparu). « Les pépites » est remplacé entièrement par **« Artist Spot »**
> (nom anglais voulu tel quel) : une galerie des artistes déjà venus ou à
> venir (`data/artists.ts`, nouveau), chacun relié à sa soirée
> (`Artist.eventId`), avec bio, style musical et liens (site, Instagram,
> Facebook — deux icônes ajoutées à `Icon.tsx`). Son panneau ne montre que la
> fiche artiste, jamais le programme/jauge/tarif/Participer, qui restent
> propres à « À l'affiche ». La mécanique de carrousel (auparavant dans
> `EventSpotlight.tsx`) est désormais partagée par les deux sections via
> `components/features/PosterCarousel.tsx`. Piège trouvé au passage : le
> compte à rebours (`utils/date.ts`) ne sait pas parler du passé — il
> affiche « C'est maintenant ! » indéfiniment une fois la date dépassée —
> donc `ArtistSpotlight` ne l'affiche que pour une soirée à venir.
> `GuinguetteEvent.pepite` et `.artistUrl` ont disparu, remplacés par
> `Artist`. Détail du chantier 2, plus bas, mis à jour en conséquence.
> **Mise à jour du 5 août 2026** — Après avoir testé « À l'affiche » et
> « Artist Spot » quelques jours, Jonathan est revenu sur le swipe : trop
> proche du geste de navigation entre onglets, source de confusion. Les deux
> carrousels naviguent de nouveau **au tap** (fondu + scale via
> `AnimatePresence`, sans glissement latéral pour ne pas rappeler un swipe),
> comme avant le chantier 2 — mais avec une nouveauté qui n'existait pas
> alors : **les deux sections restent synchronisées**, portées par un seul
> `activeEventId` levé dans `soirees.tsx` (`Artist.eventId` sert de clé
> commune). Toute la mécanique `ScrollView`/`useSwipeGuard`/RNGH documentée au
> chantier 2 pour ces deux carrousels a disparu avec elle — `useSwipeGuard()`
> reste utile ailleurs (la rangée de filtres de La Carte), mais plus ici.
> **Mise à jour du 5 août 2026 (suite)** — Jonathan a testé le retour au tap
> décrit ci-dessus et trouvé deux choses à revoir : un **glitch visuel** au
> changement d'affiche (la nouvelle image apparaissait écrasée avant de
> reprendre sa taille — `Poster` n'était pas positionné en absolu dans
> `PosterShell`, donc l'affiche sortante et l'affiche entrante se partageaient
> l'espace en flux normal le temps du crossfade `AnimatePresence` ; corrigé),
> et une reformulation du geste : **le swipe entre onglets disparaît
> entièrement** (`SwipeTabsArea` et `components/layout/SwipeTabs.tsx`
> supprimés, navigation par la barre d'onglets uniquement), et le geste ainsi
> libéré est **donné au carrousel de Soirées**, qui offre désormais le tap
> **et** le swipe (gauche pour avancer, droite pour reculer) sur « À
> l'affiche » comme sur « Artist Spot » — deux façons équivalentes de
> naviguer, portées par un geste unique (`usePosterSwipe`,
> `components/features/PosterCarousel.tsx`, `Gesture.Race(pan, tap)` de
> `react-native-gesture-handler`). Un `pageFollowX` partagé (levé dans
> `soirees.tsx`) répercute une fraction du glissement sur tout le contenu de
> l'écran pendant le geste — l'effet est le même en haut ou en bas de la page,
> puisque le `transform` porte sur le conteneur qui enveloppe tout le contenu
> défilable, pas sur la position de défilement elle-même.
> **Mise à jour du 5 août 2026 (nuit)** — Jonathan a testé cette première
> version du geste et remonté trois défauts précis : le panneau de détails
> changeait de contenu avant que l'affiche ait fini son fondu (jamais
> synchronisés) ; glisser le doigt révélait le fond blanc de `PosterShell`
> derrière l'affiche qui suivait le doigt (une seule affiche montée à la
> fois) ; et le retour tactile au tap (un `scale` posé sur un enfant *clippé*
> par `PosterShell`) révélait à la fois ce fond blanc et le contour carré, non
> arrondi, de l'enfant. **`PosterFrame` remplace le crossfade `AnimatePresence`
> par un vrai carrousel à trois affiches** (précédente / active / suivante),
> toujours montées côte à côte dans la bande : glisser le doigt fait apparaître
> la vraie affiche voisine, comme les pages d'un livre — plus jamais de fond
> vide. Tap et swipe-abouti déclenchent désormais **la même** glissade
> programmatique (durée fixe, `Easing.out(Easing.cubic)`) : un seul langage
> visuel, jamais deux. Point clé pour la synchronisation : le changement
> d'état (`onCommit`) n'arrive **qu'à la fin** de cette glissade, jamais au
> relâchement du doigt — c'est ce couplage qui aligne exactement l'affiche et
> le panneau de détails. Le scale de pression est passé sur un wrapper **à
> l'extérieur** de `PosterShell`, pour que toute la carte arrondie rétrécisse
> comme un seul bloc au lieu de révéler ses bords. Côté panneau,
> `EventDetailPane`/`ArtistDetailPane` séparent désormais l'ombre portée
> (`Pane`, jamais démontée) du contenu (remonté par `key`, lui, à chaque
> changement) : l'ombre Android (`elevation`) ne suit pas le fondu
> `entering`/`exiting` de Reanimated et « sautait » sinon avant le contenu.
> Trois nouvelles photos d'artistes (`assets/images/jazz-band.webp`,
> `orchestre-band.webp`, `solo-singer.webp`, converties depuis des PNG de 4 Mo
> fournis par Jonathan) remplacent les images réutilisées des soirées dans
> `data/artists.ts` — `solo-singer.webp` reste utilisée pour « Duo Amandine &
> Téo » malgré l'écart visuel avec « duo, guitare » (portrait d'une chanteuse
> seule), choix confirmé par Jonathan.
> **Mise à jour du 5 août 2026 (fin de journée)** — Deux correctifs sur le
> carrousel, puis **le chantier 3 est fait**. Côté Soirées : les affiches sont
> désormais identifiées par la **clé de leur élément** et non par leur place,
> sans quoi chaque changement remplaçait la `source` d'une `<Image>` déjà montée
> et expo-image repartait d'un fondu à vide (affiche sans photo) ; et
> l'annulation du décalage de bande (`shift`) est passée d'un worklet à un
> **style React Native ordinaire**, sans quoi elle arrivait une image après la
> réattribution des positions et laissait voir l'affiche *d'après* (« image 1,
> image 3, image 2 »). Côté accueil, un avertissement au démarrage a révélé que
> le flou du `tone="glass"` était **purement désactivé sur Android** depuis le
> début : `dimezisBlurView` exige un `BlurTargetView` désigné (prop
> `blurTarget`), faute de quoi expo-blur retombe sur un simple voile. Corrigé,
> vérifié à l'écran. Le chantier 3 est détaillé plus bas, dans son **Résultat**.
> **Le reste de ce document n'est pas implémenté.** C'est un plan de travail, pas
> un compte rendu. L'état réel de l'app est décrit dans `CLAUDE.md`.

## Comment lire ce document

Chaque chantier à faire est découpé en :

- **Intention** — ce qu'on veut obtenir, et pourquoi.
- **Ce que ça touche** — les fichiers concernés, pour estimer l'ampleur.
- **Décidé** / **Encore ouvert** — les arbitrages, tranchés ou non.

Les chantiers **faits** gardent la même place dans le document, mais s'ouvrent
sur un **Résultat** : ce qui a été retenu, ce que ça a coûté, et ce qu'il faut
savoir pour la suite. Leur section « Intention » est conservée au passé, comme
trace du besoin d'origine.

Les points encore ouverts sont rassemblés en fin de document. Ceux qui ont été
tranchés y restent, **barrés**, avec leur réponse — pour qu'une question réglée
ne soit pas reposée trois semaines plus tard.

## Déjà fait

| # | Chantier | Quand | Ce qui en reste à savoir |
|---|---|---|---|
| **0** | Identité typographique | 3 août 2026 | Berkshire Swash remplace Fraunces en display et headline. Les tailles n'ont pas bougé : son plancher (1,242) est à peine au-dessus de celui de Fraunces (1,233). |
| **1b** | Accueil — « g » de Oignies rogné | 3 août 2026 | Le blocage était infondé : le correctif se déduisait des métriques de la police, sans attendre le chantier 0. |
| **1a** | Accueil — guirlande rognée | 4 août 2026 | Le `viewBox` élargi ne suffisait pas seul à écarter la guirlande du jambage du « g » : `marginTop` est passé de `spacing.sm` à `spacing.snug`, vérifié à l'écran. |
| **1d.c** | Accueil — débit de la vidéo | 4 août 2026 | Ré-encodée à 768×576, ~1290 kbit/s : 2,45 Mo → 782 Kio (÷3,1). Qualité vérifiée à l'écran, aucune perte perceptible derrière le voile. |
| **1c** | Accueil — hiérarchie des deux boutons | 4 août 2026 | Verre (`tone="glass"`) + anneau ambré permanent qui bat (`emphasis`) sur le bouton principal. Deux ajouts à `Button.tsx` non prévus par ce document — voir le chantier pour le détail et le piège Reanimated rencontré. |
| **2** | Soirées — les pépites | 4 août 2026 (nuit) | Carrousel swipé (`useSwipeGuard()` + `ScrollView` de `react-native-gesture-handler`) ; panneau toujours affiché (le tap-pour-déplier initial a été abandonné le soir même). « Les pépites » a ensuite été remplacé par « Artist Spot » (`data/artists.ts`) — voir la mise à jour du 4 août (nuit, suite) en tête de document. |
| **3** | La Carte — fiches repliées | 5 août 2026 | Le « motif validé en 2 » que ce document proposait de réutiliser **n'existait plus** : le tap-pour-déplier de Soirées avait été abandonné le soir même de son écriture. Le signal de dépliage a donc été inventé, pas repris — voir le Résultat. |

## Ordre conseillé — ce qui reste

| # | Chantier | État | Pourquoi à ce moment-là |
|---|---|---|---|
| **4** | Mouvement — pression du bouton, ouverture de la feuille | ✅ **prêt** | Ajouté le 3 août 2026. Indépendant des autres, mais **transverse** : touche LE bouton et la feuille, donc tous les écrans. À faire quand le reste est stable. **C'est aussi là que se traite la question de performance** ouverte le 5 août (voir la question 8). |

---

# Chantier 0 — Identité typographique ✅ fait le 3 août 2026

## Résultat

**Berkshire Swash** remplace Fraunces en `display` et `headline`. Karla (corps,
libellés) et Caveat (accents) ne bougent pas : le changement porte uniquement sur
la police d'affichage.

Trois candidates ont été présélectionnées sur mesures puis jugées sur
l'émulateur, sur la photo d'accueil, aux vraies tailles :

| | Plancher | Titre @40 | Verdict |
|---|---|---|---|
| **Berkshire Swash** | 1,242 | 427 px | **retenue** — la plus caractérielle, esprit enseigne peinte |
| Abril Fatface | 1,349 | 459 px | tenait bien le fond photo, mais moins « guinguette » |
| Yeseva One | 1,155 | 506 px | trop proche de Fraunces en dessous de 40 px |

**Ce que la bascule a coûté : rien en mise en page.** Le plancher d'interligne de
Berkshire Swash (1,242) est à peine au-dessus de celui de Fraunces (1,233) :
toutes les valeurs de `type` passaient déjà. Aucune taille, aucun interligne n'a
bougé.

**Deux conséquences à ne pas perdre de vue :**

- **Une seule graisse existe (400).** `displayFont.weight` est passé à `'400'`
  dans `tamagui.config.ts` : demander du 600 ferait synthétiser un faux gras à
  iOS. La hiérarchie des titres se fait donc uniquement par la taille.
- **Berkshire Swash et Caveat sont deux écritures parentes.** Sur l'accueil,
  « Sous les lampions » et le titre se ressemblent plus qu'avant. C'est assumé
  (« on assume notre originalité »), mais ça reste le point à surveiller si on
  ajoute du Caveat ailleurs.

## Intention (le besoin d'origine, tel qu'il était formulé)

Un seul texte de l'app sonnait juste : **« Sous les lampions »** sur l'accueil
(Caveat, manuscrit). Tout le reste — Fraunces pour les titres, Karla pour le
corps — était propre mais neutre : ça pouvait être n'importe quel restaurant. On
voulait que l'identité « guinguette » se lise sur **tous** les textes.

**Ce n'est pas un copier-coller de Caveat partout.** Du manuscrit en corps de
texte serait illisible, et l'effet s'annulerait à force d'être partout. Ce qu'on
cherche, c'est une police d'affichage qui porte le même esprit — bal populaire,
affiche de foire, belle époque — et qui laisse Caveat garder son rôle d'accent
rare et précieux.

## État de l'outillage (constaté à l'usage)

✅ **Débloqué le 2 août 2026.** Le skill attendu est installé : `better-typography`,
lié dans le projet (`.agents/skills/better-typography` → `~/.agents/skills/`,
avec sa junction depuis `.claude/skills/`). Il couvre le choix et l'appariement de
familles, l'échelle typographique, la hiérarchie des titres, l'interligne, la
longueur de ligne et les chiffres tabulaires.

⚠️ **C'est un skill web.** Une partie de son contenu ne s'applique pas ici :
formats `woff2`, `font-feature-settings`, `text-wrap`, `::selection`, zoom iOS sur
les champs, équivalences Tailwind. Ce qu'on en retient, ce sont les **principes**
(quelle famille pour quel rôle, quel rapport de tailles, quel interligne) ; leur
traduction vers `constants/theme.ts` (`fonts`, `type`) et les échelles Tamagui
reste manuelle, et les polices se prennent dans `@expo-google-fonts`, pas chez un
fondeur au hasard.

⚠️ **Et il n'apporte aucun outil.** Vérifié : son dossier `agents/` ne contient
qu'un manifeste de 123 octets, et `choosing-fonts.md` est de la prose. Ni
sélecteur de police, ni mesureur. La présélection s'est faite en lisant
directement les tables `head`/`hhea`/`OS/2`/`cmap`/`GSUB` des fichiers `.ttf`
livrés par `@expo-google-fonts` — c'est cette méthode qu'il faut reprendre pour
toute future candidate, pas les fiches produit.

**Ampleur du changement, tranchée le 3 août 2026 :** titres seuls. Karla garde le
corps et les libellés — un affichage à swash en corps de texte serait illisible,
et l'effet s'annulerait.

## Ce que ça a touché

- `constants/theme.ts` — `fonts`, `MIN_LINE_HEIGHT_RATIO`
- `tamagui.config.ts` — `displayFont` (famille par `fonts.display`, `weight`)
- `app/_layout.tsx` — le `useFonts()`
- `utils/text.ts` — la note de couverture des caractères, revérifiée

## Méthode suivie

1. **Présélection sur mesures** — liste courte des familles d'affichage (esprit
   bal populaire / affiche de foire / belle époque), filtrée sur ce qui existe
   dans `@expo-google-fonts`, puis départagée en lisant les tables des `.ttf`.
2. **Écran de comparaison jetable** — `app/type-lab.tsx`, les vrais titres dans
   quatre familles, avec l'interligne propre à chacune pour ne pas comparer des
   rendus rognés. **Supprimé après l'arbitrage**, comme prévu.
3. **Jugé sur l'appareil**, à taille réelle, sur la photo de fond, avec les vrais
   mots. Captures via `adb exec-out screencap`.

L'étape 3 ne se délègue pas — une police se juge à l'écran, pas sur description.
C'est d'ailleurs elle qui a inversé le classement : Yeseva One, favorite sur le
papier, s'est révélée trop proche de Fraunces en dessous de 40 px.

⚠️ **À refaire si la police change un jour :** l'écran de comparaison est
supprimé, mais sa recette tient en trois lignes — charger les candidates dans
`useFonts()`, poser `lineHeight = ceil(fontSize × plancher)` pour chacune, et
afficher les vrais titres sur la vraie photo.

## Critère de sélection découvert le 3 août 2026

**Une police d'affichage se choisit aussi sur ses métriques verticales.** Sur RN
Android, un `lineHeight` inférieur à `(ascender − descender) / unitsPerEm` de la
police **coupe les jambages descendants** — c'était tout le chantier 1b. La règle
web « interligne ~1,1 sur un titre » ne s'applique donc pas ici : le plancher
réel est celui de la fonte.

Conséquence pratique : une police à grandes hauteurs **interdit les titres
serrés**. Les planchers du projet : Berkshire Swash 1,242 · Karla 1,169 ·
Caveat 1,26 (Fraunces était à 1,233). Si le compact fait partie de l'effet
recherché, c'est un critère à regarder *avant* de tomber amoureux d'un dessin —
sinon le titre sera soit rogné, soit plus aéré que voulu. Les écarts sont
sensibles : sur les six candidates mesurées, le plancher allait de **1,155**
(Yeseva One) à **1,525** (Bodoni Moda), soit 47 px contre 61 px d'interligne pour
un même titre à 40 px.

À la sélection, relever pour chaque candidate : `unitsPerEm`, `ascender` et
`descender` de la table `hhea`, et reporter le ratio dans
`MIN_LINE_HEIGHT_RATIO` (`constants/theme.ts`). Vérifier au passage la présence
de `tnum` dans `GSUB` : **Berkshire Swash ne l'a pas** (pas plus que Fraunces
avant elle), ce qui interdit toujours les chiffres à chasse fixe sur les prix de
la carte et le compteur de couverts.

## Le projet jumeau — la question était mal posée

**La prémisse de ce point était fausse, vérification faite le 3 août 2026.**

`../Guinguette_Web` n'utilise pas Bricolage Grotesque / Be Vietnam Pro : son
design system (`src/main.css`, lignes 70-77) déclare **Fraunces / Karla /
Caveat**, et `index.html` charge bien ces trois familles. Seules
`la-carte.html`, `soirees-bal.html` et `infos-pratiques.html` chargent encore
Bricolage / Be Vietnam — des `<link>` hérités de `stitch-export/` qui n'ont
jamais été nettoyés, et dont le CSS de ces pages ne se sert même pas.

Il n'y avait donc **aucun écart à combler** : les deux design systems étaient
alignés. Le passage à Berkshire Swash **crée la divergence**, il ne la referme
pas. C'est assumé.

**Reste à faire, côté site et pas ici :** nettoyer les trois `<link>` fantômes de
`Guinguette_Web`, et corriger son `CLAUDE.md` qui affirme la même chose inexacte
que celui du mobile affirmait.

## Pièges techniques (le second a été rencontré pour de vrai)

**1. Deux endroits à déclarer.** Chaque police ajoutée doit être chargée dans
`useFonts()` *et* décrite dans `tamagui.config.ts` avec sa table `face`. Sur
Android, `fontWeight` ne s'applique pas à une police custom — c'est le fichier
qui porte la graisse. Une graisse oubliée dans `face` ne produit pas d'erreur,
juste un texte qui retombe silencieusement sur la graisse par défaut.

**2. Déclarer une graisse qui n'existe pas fait synthétiser un faux gras à iOS.**
Berkshire Swash n'existe qu'en 400, alors que `displayFont.weight` valait `'600'`
— hérité de Fraunces. Android aurait simplement ignoré la demande, mais iOS aurait
**fabriqué** un gras approximatif. `weight` est donc passé à `'400'`. Retenir :
**la graisse déclarée doit être une graisse qui existe dans le fichier**, et ça se
vérifie à chaque changement de police.

---

# Chantier 1 — Accueil

Quatre points sur le même écran. **1a, 1b, 1c, 1d.b et 1d.c sont faits.** Ne
reste ouvert que **1d.a** (le voile de la vidéo, question 10 en fin de
document) — un réglage fin, pas un blocage.

## 1a. Les ampoules de la guirlande sont rognées ✅ fait le 4 août 2026

**Diagnostic (trouvé en lisant `components/ui/Guirlande.tsx`) :** ce n'est pas un
problème de largeur, c'est le `viewBox` qui est trop court en hauteur.

Le `viewBox` fait `240 × 28`. Chaque ampoule est dessinée avec un halo de rayon
`8`. Or :

- l'ampoule à `cy: 5` déborde de 3 px **au-dessus** du cadre (5 − 8 = −3) ;
- l'ampoule à `cy: 24` déborde de 4 px **en dessous** (24 + 8 = 32 > 28) ;
- les deux ampoules à `cy: 20` touchent le bord bas pile poil (20 + 8 = 28).

Leurs halos sont donc coupés net, alors que les deux ampoules à `cy: 9` passent
sans problème. D'où l'impression d'irrégularité : certaines sont entières,
d'autres non.

**Correctif appliqué :** `viewBox` porté à `"0 -10 240 48"` — exactement la
piste envisagée ci-dessus —, sans toucher aux coordonnées des ampoules, et
`height` recalculé sur ce nouveau ratio (`(width / 240) * 48`). Les six halos
sont désormais entiers, vérifié à l'écran sur `Guinguette_API36`.

**Constaté le 3 août 2026 (capture après le passage à Berkshire Swash), et
toujours vrai une fois le `viewBox` seul élargi :** la guirlande venait se poser
**dans la zone du jambage d'« Oignies »**. Le `viewBox` plus haut pousse le
contenu visible plus bas dans son propre cadre — ça ouvre un peu d'air — mais
pas assez : au premier essai, `marginTop` laissé à `spacing.sm` (12 px)
collait encore la guirlande au « g ». Il a fallu l'augmenter réellement, pas
seulement compter sur l'effet indirect du `viewBox`.

**`guirlande.marginTop` est passé de `spacing.sm` à `spacing.snug`** (12 → 16 px)
dans `app/(tabs)/index.tsx`. Vérifié par comparaison de captures avant/après :
c'était bien le bon levier, la valeur qui manquait.

**Fichiers :** `components/ui/Guirlande.tsx` (le `viewBox`) et
`app/(tabs)/index.tsx` (l'espacement).

## 1b. Le « g » de « Oignies » est rogné ✅ fait le 3 août 2026

**Diagnostic confirmé, et chiffré.** L'intuition était la bonne, le seuil non :
il ne se devine pas, il se lit dans la police. Table `hhea` de
`Fraunces_600SemiBold` : `ascender 1956`, `descender −510`, `unitsPerEm 2000` →
hauteur de ligne naturelle **1,233 em**. À `fontSize: 40`, il faut donc
**49,3 px** ; `lineHeight: 44` en manquait 5,3, pour un jambage qui descend de
10,2 px. Le « ~1,2 × la taille (soit 48) » estimé ici aurait encore rogné.

Le problème était par ailleurs **plus large que ce seul mot** :

- le titre passe à **2 lignes sur tous les formats** (360 : « La Guinguette » /
  « de Oignies ») — les deux *g* étaient coupés, pas un seul ;
- **Caveat rognait aussi**, silencieusement : `type.accent` en 26/30 exigeait
  32,8 px, et « Sous les lampions » y perdait le jambage de son *p*. Les trois
  crans de `$accent` dans `tamagui.config.ts` étaient sous le plancher ;
- `heroTitle` de l'écran Infos (34/40, une taille inventée sur place) rognait le
  *p* et le *q* de « Infos Pratiques ».

**Correctif appliqué :** relever les interlignes au plancher de chaque police.
`includeFontPadding` et le `paddingBottom` de secours n'ont pas été nécessaires.
Les planchers mesurés sont désormais documentés dans
`MIN_LINE_HEIGHT_RATIO` (`constants/theme.ts`).

**Fichiers :** `constants/theme.ts`, `tamagui.config.ts`, `app/(tabs)/infos.tsx`

## 1c. Les deux appels à l'action sont à retravailler ✅ fait le 4 août 2026

## Résultat

**Les deux boutons partagent le même traitement « verre »
(`tone="glass"`, nouveau) : flou natif (`expo-blur`, livré avec Expo Go)
derrière un voile teinté par la couleur d'accent du thème courant.** Le rang
principal ne vient plus de la couleur (les deux sont maintenant en verre) mais
d'un second ajout, `emphasis` : un anneau ambré **permanent qui bat** autour de
« Réserver une table » — même mécanique que le point du `Countdown`
(`withRepeat`/`withTiming`, 1100 ms, `Easing.inOut(Easing.quad)`), posée ici sur
un anneau plutôt qu'un point.

```tsx
<Button theme="dusk" tone="glass" size="lg" full emphasis onPress={open}>
  Réserver une table
</Button>
<Button theme="neutral" tone="glass" size="md" onPress={…}>
  Prochaines soirées
</Button>
```

**Trois étapes avant d'arriver là, chacune jugée à l'écran :**

1. **Premier essai, plus sobre :** `tone="soft"` (voile sombre) sur le second
   bouton plutôt que `outline`, qui se diluait sur les zones claires de la
   photo. Approuvé par Jonathan, puis dépassé par la demande suivante.
2. **Glassmorphisme, quatre teintes comparées** (ambre/lampion, terre/primary,
   nuit/dusk, givré/neutral — toutes tirées des thèmes existants, rien
   d'inventé). **Nuit** retenue pour le bouton principal, **givré** pour le
   secondaire.
3. **Hiérarchie à rétablir :** les deux boutons en verre se ressemblant trop,
   `emphasis` a été ajouté spécifiquement pour le bouton principal — un anneau
   ambré plutôt qu'un retour à l'aplat de couleur, pour ne pas sacrifier
   l'esthétique verre validée à l'étape 2.

**Piège rencontré, documenté dans `.claude/rules/design-system.md` :** poser
une couleur nouvelle (le liseré du verre) dans le `variant` `tone` d'un cadre
que Tamagui anime (`transition: 'bouncy'`) fait planter Reanimated
(« Cannot create property 'onStart' on number '999' » — confusion avec le
rayon de pilule). Le contournement retenu : le fond et le liseré du verre
vivent sur un `View` React Native statique, superposé en enfant du bouton,
jamais dans ses `variants` Tamagui.

**L'entrée des boutons a aussi été reprise** (demande du même jour) : chacun
porte son propre fondu au lieu d'un fondu unique sur le bloc, minuté sur la
durée réelle de la vidéo (`player.duration`) plutôt que déclenché après coup.
Réglages retenus après plusieurs essais de Jonathan à l'écran :
`PRIMARY_FADE_MS = 2000`, `POST_VIDEO_DELAY_MS = 1500` (le bouton principal
finit son fondu 1,5 s après la fin de la vidéo), `SECONDARY_FADE_DELAY_MS =
600` (écart entre les deux boutons), courbe `Easing.elastic(1)`. Toutes ces
valeurs sont des constantes en tête de `app/(tabs)/index.tsx`, faites pour
être retouchées facilement.

⚠️ **Contrainte tenue : il n'y a toujours qu'UN bouton dans l'app.** Les deux
ajouts (`tone="glass"`, `emphasis`) vivent dans `components/ui/Button.tsx`,
pas dans un composant local ni un `PressableScale` déguisé. Cible tactile
≥ 44 px inchangée ; `prefers-reduced-motion` coupe le battement de l'anneau
mais le garde visible, fixe (même convention que le point du `Countdown`).

**Ce que ça a touché :** `components/ui/Button.tsx` (`tone="glass"`,
`emphasis`, `ButtonGlassFill`, `EmphasisRing`), `constants/theme.ts`
(`colors.glassEdge`), `app/(tabs)/index.tsx` (les deux appelants, le
minutage d'entrée par bouton), `.claude/rules/design-system.md` (le nouveau
ton et le piège Reanimated), `package.json` (`expo-blur`, livré avec Expo
Go — installé via `npx expo install`, aucun risque pour les versions figées).

## Intention (le besoin d'origine, tel qu'il était formulé)

**Demande de Jonathan, 3 août 2026 :** « Réserver une table » et « Prochaines
soirées » doivent être repris.

**Ce qu'on voyait alors (capture du 3 août) :** deux pilules pleine largeur
empilées, de géométrie **rigoureusement identique** — même hauteur, même rayon,
même graisse de libellé. Seules les couleurs les distinguaient : terre plein pour
la première, contour ambré sur la photo pour la seconde. Trois conséquences :

- **La hiérarchie entre l'action principale et l'action secondaire était
  faible.** À taille et forme égales, c'était la seule couleur qui devait
  porter la différence, et sur une photo chargée elle ne suffisait pas
  toujours.
- **Le bouton détouré se diluait sur les zones claires de l'image.** Son
  contour faisait 2 px et son texte était blanc ; le voile derrière lui
  n'était pas garanti.
- **Le bloc occupait une grande hauteur en bas d'écran**, juste sous une
  accroche déjà longue.

## 1d. La vidéo de fond — trois réglages laissés ouverts

**Contexte :** l'accueil tourne sur `assets/videos/accueil.mp4` depuis le 3 août
2026 (`expo-video`, livré avec Expo Go). Depuis le même jour, c'est une
**ouverture** : la vidéo passe une fois, s'arrête sur sa dernière image, et les
deux appels à l'action n'apparaissent qu'ensuite.

**b et c sont faits** (le second s'est réglé tout seul avec le passage en
ouverture) ; **a reste ouvert**, en réglage fin — voir la question 10 en fin de
document.

### a. Le voile est un compromis, pas un réglage définitif

La photo fixe était sombre au centre, exactement là où se posent le titre et
l'accroche : **20 %** de voile suffisaient. La vidéo y fait défiler des visages,
un feu, des lampions — l'accroche devenait difficile à lire. Le voile est monté
à **0,32** et l'accroche a gagné l'ombre portée du titre (son `opacity: 0.9` a
sauté au passage : atténuer un texte sur fond mouvant est le contraire de ce
qu'il faut faire).

**C'est le premier chiffre à bouger si la vidéo paraît trop assagie** — en
gardant en tête que c'est lui qui tient la lisibilité sur les plans clairs.

**Piste plus fine, si 0,32 déçoit :** remplacer le voile *global* par un écran
local derrière le seul bloc de texte — un dégradé vertical centré sur la zone
titre + accroche. La vidéo garderait toute sa vivacité en haut et en bas, et le
texte son fond garanti. Plus de travail, meilleur résultat.

### ~~b. La vidéo continue de tourner quand on change d'onglet~~ ✅ réglé

Réglé le 3 août 2026 par le passage en **ouverture** : la boucle a sauté, la
vidéo passe une fois et `player.pause()` est appelé sur `playToEnd`. Le lecteur
retombe en `STOPPED` — vérifié au `logcat` — et n'y revient pas, puisque
l'accueil reste monté et que l'ouverture ne rejoue pas.

Il n'y a donc plus de décodage continu à couper. Un `useFocusEffect` reste
inutile en l'état.

### c. Le débit du fichier est très élevé ✅ fait le 4 août 2026

**Mesuré avant :** dans l'atome `mvhd`, **5,0 s**, **2,34 Mo**, soit
**~3 900 kbit/s** — trois à quatre fois ce qu'il faut pour un fond d'écran de
téléphone.

**Ré-encodé avec `ffmpeg`** (installé via `winget`, `Gyan.FFmpeg`) : résolution
ramenée à **768×576** (contre 1024×768), débit ciblé en deux passes à
**~1300 kbit/s** (`-maxrate 1500k -bufsize 3000k`). Résultat : **782 Kio**
(contre 2,45 Mo, ÷3,1), durée inchangée (5,04 s). Qualité vérifiée par
comparaison d'images extraites avant/après à la même seconde de lecture :
aucune perte perceptible, y compris à l'œil sur l'émulateur, derrière le voile
à 32 %.

**Ce que ça a touché :** `assets/videos/accueil.mp4` uniquement — aucun
changement de code, le fichier se réutilise tel quel via le même `require()`
dans `app/(tabs)/index.tsx`.

---

# Chantier 2 — Soirées : les pépites ✅ fait le 4 août 2026 (nuit)

## Résultat

**L'écran garde ses deux sections (« À l'affiche », « Les pépites »), mais
l'interaction et le contenu diffèrent de ce que ce document proposait par
défaut** — reformulés par Jonathan le jour même, en cours de chantier :

- **Le carrousel se parcourt au doigt** (`ScrollView` paginé, `pagingEnabled`),
  gardé par `useSwipeGuard()` pour ne jamais changer d'onglet. Les trois
  pastilles du bas restent, pour un saut direct.
- **Le toucher sur l'affiche déplie ses informations** au lieu de faire avancer
  à la soirée suivante — l'avancée manuelle disparaît, remplacée par le swipe.
- **« Les pépites » n'est pas « toute la programmation ».** C'est une
  sélection **manuelle** de l'exploitant : `pepite: boolean` dans
  `data/events.ts`, coché soirée par soirée. La section ne s'affiche pas du
  tout si rien n'est coché. Ça tranche le point ouvert n°2 différemment de la
  proposition par défaut de ce document.
- **Le dépliage est un panneau unique, partagé par tout le carrousel**
  (`EventDetailPane`, nouveau fichier) — jamais un par page. Il ne reste monté
  que pendant qu'il est ouvert : démonté à chaque changement de soirée, pour
  éviter qu'`useDemoFlag` affiche un instant l'état RSVP de l'ancienne soirée
  sous le nouvel événement.
- **`EventCard.tsx` a disparu**, son contenu (date, description, programme,
  jauge, tarif, bouton RSVP) migré tel quel dans `EventDetailPane`, sans son
  ancien sous-niveau de repli « Le programme » — devenu redondant avec le
  dépliage qui l'englobe désormais.
- **Pastille de lien artiste** : le `Button` existant (`tone="ghost"`,
  `circular`), pas un nouveau composant. Nouvelle icône `link` dans
  `Icon.tsx`. `artistUrl` reste vide sur les 3 soirées placeholder — la
  pastille s'affiche donc désactivée, l'option « plus sûre » déjà envisagée
  ici plutôt qu'un lien inventé qui tomberait sur un 404 en démo.
- **Bouton « Participer »** dans tous ses états, ✓ une fois coché — repris
  sans changement de logique depuis l'ancien `EventCard`.

**Piège technique rencontré, documenté dans `.claude/rules/ecrans.md` :** un
`ScrollView` React Native, imbriqué dans le `ScrollView` vertical de l'écran
(lui-même sous le `Gesture.Pan()` de `SwipeTabsArea`), se fait parfois voler
son geste par le swipe d'onglets — `useSwipeGuard()` seul ne suffit pas,
**silencieusement, sans erreur ni avertissement**. Constaté à l'écran sur
`Guinguette_API36` : le carrousel restait immobile et l'app changeait
d'onglet. Le contournement : importer ce `ScrollView` depuis
`react-native-gesture-handler` plutôt que `react-native` — il s'annonce
correctement auprès du même arbitrage tactile que `SwipeTabsArea`. La rangée
de filtres de La Carte n'avait jamais rencontré ce piège : elle est imbriquée
dans une `FlatList`, pas un `ScrollView`.

**`app/(tabs)/soirees.tsx` passe de `FlatList` à `ScrollView`** — la liste de
cartes qui justifiait la `FlatList` a disparu ; l'écran est désormais un
nombre fixe de sections, l'exception déjà admise pour Infos.

**Ce que ça a touché :** `app/(tabs)/soirees.tsx`, `components/features/
EventSpotlight.tsx` (réécrit), `components/features/EventDetailPane.tsx`
(nouveau), `components/features/EventCard.tsx` (supprimé), `components/ui/
Icon.tsx` (icône `link`), `data/events.ts` (`pepite`, `artistUrl`).
`components/ui/Button.tsx` **n'a pas changé** — seuls les libellés appelants,
comme prévu.

### Mise à jour du 4 août 2026 (nuit, suite) — trois points ci-dessus dépassés

En testant l'écran, Jonathan a préféré une autre approche pour deux points de
ce Résultat — les paragraphes ci-dessus restent comme trace de la première
version livrée, voici l'état actuel :

- **Le toucher ne déplie plus rien : le panneau est toujours affiché.** Plus
  de tap-to-expand, plus d'état `expanded`. Le panneau se redémonte à chaque
  changement de soirée (`key={active.id}`, toujours nécessaire — c'est même
  la seule chose qui empêche encore le flash d'état RSVP décrit plus haut,
  maintenant que le `{expanded && ...}` qui le faisait aussi ne existe plus).
- **« Les pépites » a disparu, remplacé par « Artist Spot »** — une galerie
  d'artistes (`data/artists.ts`, nouveau), pas une sélection de soirées.
  `GuinguetteEvent.pepite` est supprimé.
- **La pastille de lien artiste quitte `EventDetailPane`** : `artistUrl`
  disparaît de `GuinguetteEvent`, remplacé par les liens (site, Instagram,
  Facebook) portés par `Artist` dans le nouveau panneau `ArtistDetailPane`.
- La mécanique de carrousel (le hook d'index/scroll, les styled components
  de l'affiche, le contournement RNGH) est sortie d'`EventSpotlight.tsx` vers
  `components/features/PosterCarousel.tsx`, partagée avec `ArtistSpotlight`.

Détail complet dans le chantier « Artist Spot » — pas un chantier numéroté de
ce document, une demande arrivée après coup, documentée directement dans
`CLAUDE.md` et `.claude/rules/`.

## Intention (le besoin d'origine, tel qu'il était formulé)

« À l'affiche » fonctionne : c'est le bon format. **On supprime la liste de
cartes du dessous** et on la remplace par une seconde section, « Les pépites »,
qui reprend **exactement le même composant, le même affichage et le même
fonctionnement**.

L'écran Soirées devient donc :

```
┌────────────────────────────┐
│      Soirées & Bal         │  titre
│ Découverte ! Ambiance      │  ← nouveau sous-titre
│ Unique ! Artiste Incroyable│     (2 lignes, mesuré)
│                            │
│  À L'AFFICHE               │
│ ┌────────────────────────┐ │
│ │  [photo]  ⏳ J-3 · 14h │ │  swipe horizontal
│ │  Trio Jazz Manouche    │ │  (garde-fou obligatoire)
│ └────────────────────────┘ │
│         ▬ ○ ○              │
│                            │
│  LES PÉPITES               │  ← même composant
│ ┌────────────────────────┐ │
│ │  [photo]  ⏳ J-12      │ │  swipe horizontal
│ │  Bal Populaire d'Été   │ │  clic → déplie
│ └────────────────────────┘ │
│         ○ ▬ ○              │
└────────────────────────────┘
```

## Ce qui reste ouvert

- **Liens artistes : URL réelles ou placeholders ?** Toujours non tranché,
  comme prévu ici — `artistUrl` reste vide sur les 3 soirées placeholder, la
  pastille s'affiche désactivée. À reprendre le jour où l'exploitant fournit
  de vraies URL.

La pastille de lien ouvre le navigateur via `Linking.openURL` — comme le
bouton « M'y rendre » de l'écran Infos, qui créait déjà le précédent. C'est la
seule sortie externe de la démo, et elle reste dans le cadre « aucune donnée
envoyée » : on n'envoie rien, on ouvre un lien.

---

# Chantier 3 — La Carte : fiches repliées ✅ fait le 5 août 2026

## Résultat

Les trois points décidés sont en place. Ce qu'il faut retenir :

**1. Le « signal élégant » a dû être inventé.** Ce document proposait de
réutiliser « le chevron du chantier 2 » — mais ce chevron n'existait plus au
moment d'écrire : le tap-pour-déplier de Soirées a été abandonné le soir même de
sa mise en place, au profit d'un panneau toujours ouvert. Retenu : une
**pastille ronde posée en bas à droite de la photo**, dont le chevron pivote de
180° à l'ouverture. Ce coin-là est le seul libre — le badge « Suggestion de
saison » occupe le haut à droite d'un plat vedette, et le prix tient la ligne du
titre.

**2. Le sous-titre a été raccourci deux fois, sur mesure.** L'accroche proposée
(« Découvrez les produits locaux à travers des plats gourmands et élégants »)
passait à 3 lignes sur 360 dp. La raccourcir en gardant « et élégants » tenait
en 2 lignes — mais laissait **« élégants » seul sur la seconde**, très
exactement le défaut qu'on voulait corriger. Retenu : **« Produits locaux, plats
gourmands »**, qui tient sur une ligne à 360 comme à 412 dp. C'est l'issue n° 1
proposée ici (« raccourcir la phrase »), poussée un cran plus loin.

**3. Le bouton flottant n'avait pas besoin d'éviter la barre d'onglets.** Ce
document le craignait ; c'est faux, et c'est mesuré : la barre n'est pas en
position absolue, donc le bas de l'écran **est** son bord supérieur. Lui ajouter
`TAB_BAR_HEIGHT` + safe-area l'aurait décollé pour rien. En revanche il faut le
poser **bas** : à `spacing.lg` il tombait en pleine ligne de titre et masquait
le nom du plat ; il est à `spacing.md`, où il ne croise plus qu'une bande de
photo. Les prix, eux, restent lisibles à toute position — ils sont alignés à
droite, au-delà de la pilule.

⚠️ **Piège Android rencontré** : l'ombre (`shadows.card` = `elevation: 3`) était
d'abord posée sur le conteneur pleine largeur du bouton. Android ne connaît que
`elevation` et dessine d'après **l'outline de la vue** : avec `radius.pill`, ça
donnait une pilule aussi large que l'écran, visible comme une bande grise. Elle
vit maintenant sur un conteneur qui se réduit à la taille du bouton.

**Ce que ça a touché :** `components/features/MenuBlockView.tsx` (nouveau
`DishCard`, à part pour que les intertitres et les listes de prix ne montent pas
de hooks pour rien), `app/(tabs)/carte.tsx` (sous-titre, bouton flottant,
`Animated.FlatList` + `useAnimatedScrollHandler`), `.claude/rules/ecrans.md`.
`data/menu.ts` n'a pas bougé, comme prévu.

**Non fait, volontairement** : l'ouverture ne fait que **fondre** la description
(la hauteur, elle, saute). Une `LinearTransition` lisserait le changement, mais
les animations de layout sur une `FlatList` sont un nid à saccades et la
question des performances était ouverte le jour même. À rouvrir au chantier 4 si
Jonathan le juge trop sec.

## Intention

Aujourd'hui chaque plat affiche image + titre + description + prix, d'un bloc.
C'est dense et ça allonge la page. On replie : **image, titre, prix** — et un
signal visuel élégant qui *donne envie* d'ouvrir pour en savoir plus.

C'est le même motif que le chantier 2 : une interaction apprise une fois,
réutilisée partout.

## Décidé

1. **Seuls les plats avec photo se replient.** Les listes de prix (Boissons,
   Desserts…) restent telles quelles — elles sont déjà compactes et n'ont pas
   d'image à mettre en avant.

   ```
   ┌──────────────────────┐
   │ [PHOTO]           ⌄  │  se replie
   │ Toasts saumon  14 €  │
   ├──────────────────────┤
   │ 🍷 Boissons          │
   │ Vin blanc       5 €  │  ne se
   │  Chardonnay…         │  replie pas
   │ Bière locale    4 €  │
   └──────────────────────┘
   ```

2. **Sous-titre** : « Découvrez nos saveurs au bord de l'eau »
   → « **Découvrez les produits locaux à travers des plats gourmands et élégants** »

   ⚠️ **Mesuré le 3 août 2026 : cette accroche-là passe à 3 lignes sur 360 px**
   (2 sur 412), et se termine par « élégants » tout seul. `styles.subtitle` de
   `carte.tsx` est centré — donc le remplacement **aggrave** ce qu'on vient de
   corriger sur Soirées, où l'actuel tenait en 2 lignes (1 seule sur 412).

   Trois issues, à trancher à l'écriture : raccourcir la phrase, l'aligner à
   gauche, ou l'assumer sur 3 lignes. La première est la plus simple.

3. **Bouton de réservation flottant, qui arrive au défilement.** Invisible en
   haut de page, il se pose en bas dès qu'on commence à parcourir la carte — au
   moment où l'envie se crée — et s'efface quand on remonte. Présent sans jamais
   encombrer.

   ⚠️ Il doit éviter la barre d'onglets (`TAB_BAR_HEIGHT` + safe-area) et ne pas
   masquer les prix.

## Ce que ça touche

- `app/(tabs)/carte.tsx` — sous-titre, bouton flottant
- `components/features/MenuBlockView.tsx` — le repli des blocs `feature` et
  `photo` (les blocs `list` et `heading` ne bougent pas)
- `data/menu.ts` — sans doute inchangé. ⚠️ Les prix y passent depuis le 3 août
  par l'assistant `eur()`, qui pose l'espace insécable avant le `€` : si le repli
  déplace un prix, **le faire passer par `eur()`**, jamais reformer « 14€ » à la
  main.

## ~~Encore ouvert~~ — tranché le 5 août 2026

- ~~**À quoi ressemble le « signal élégant » de dépliage ?** Le chevron du
  chantier 2 est cohérent mais discret. Un dégradé de texte tronqué, une ombre
  portée, un « + » ?~~ **Tranché : une pastille ronde en bas à droite de la
  photo, chevron qui pivote de 180° à l'ouverture.** La prémisse de la question
  était caduque — il n'y avait plus de chevron au chantier 2 à reprendre. Reste
  à faire valider **visuellement par Jonathan**, qui n'a pas encore vu l'écran.

---

# Chantier 4 — Mouvement : la pression du bouton et l'ouverture de la feuille ✅ prêt

## Intention

**Demande de Jonathan, 3 août 2026 :** au toucher, « Réserver une table » donne
**une impression de freeze** — il faut un effet plus léger. Et l'ouverture de la
feuille de réservation **ne semble pas naturelle**, sa fluidité est à reprendre.

⚠️ **Ce n'est pas un chantier « accueil », malgré l'endroit où ça se voit.**
`components/ui/Button.tsx` est LE bouton de l'app, et la feuille s'ouvre depuis
l'en-tête de tous les écrans comme depuis Infos. Toute retouche ici se répercute
partout — c'est ce qui fait l'intérêt du chantier, et son risque.

## Diagnostic — ce que le code dit

### La pression du bouton

Trois causes se cumulent, dans cet ordre d'importance :

1. **Le halo coûte un montage de composant à chaque appui.** `firePulse()` est
   appelé sur `onPressIn` et fait un `setPulses([...current, id])` : c'est un
   rendu React **et le montage d'un `<Halo>` animé**, sur le fil JS, à l'instant
   précis où le doigt touche. Un `setTimeout` de 560 ms déclenche ensuite un
   second rendu pour le démonter. Deux rendus et un cycle montage/démontage par
   appui, synchronisés avec le geste : c'est le suspect n° 1 du « freeze ».
2. **L'accueil est l'écran le plus lourd de l'app** — photo plein écran, deux
   `LinearGradient`, un zoom animé, quatre `Reveal`. Le même bouton coûte moins
   cher ailleurs, ce qui explique que ça se remarque là.
3. **`bouncy` est peu amorti** : `damping: 12`, `stiffness: 260`, `mass: 0.8`.
   Le relâchement dépasse la cible et met du temps à se stabiliser. Combiné à
   `pressStyle: { scale: 0.95 }`, ça donne un rebond ample — l'inverse de
   l'« effet plus léger » demandé.

**Pistes, de la plus rentable à la moins :**

- **garder un seul `<Halo>` monté en permanence** et piloter son opacité par une
  valeur partagée, au lieu d'en monter un par appui — supprime les deux rendus ;
- ou **ne pas allumer le halo sur les gros appels à l'action** `size="lg" full`,
  où il est de toute façon peu lisible ;
- passer la pression sur **`quick`** (`damping: 22`, `stiffness: 340`), qui
  existe déjà et est justement décrite comme « réponse immédiate » ;
- **réduire l'amplitude** : `scale: 0.97` au lieu de `0.95`.

### L'ouverture de la feuille

1. **L'animation démarre pendant le rendu le plus lourd du parcours.** `open()`
   enchaîne `reset()` (sept `setState`) puis `setMounted(true)` ; le `useEffect`
   lance ensuite le timing. Or c'est ce même commit qui monte **tout** le
   contenu de la feuille — en-tête, trois points d'étape, `ScrollView`, huit
   puces de date, huit puces d'heure, le sélecteur de couverts, le pied. Le fil
   JS est occupé pile au moment où le glissement commence.
2. **Sur Android, `<Modal>` crée une fenêtre native**, ce qui coûte une à deux
   trames. Le `useEffect` sur `mounted` se déclenche au montage React, pas à la
   présentation réelle de la fenêtre : les deux ne sont pas alignés.
3. **400 ms, c'est lent pour une feuille basse** — l'usage se situe plutôt entre
   250 et 350 ms. Ça n'est pas la cause, mais ça amplifie tout le reste.

**Pistes :**

- démarrer le timing depuis **`<Modal onShow={…}>`** plutôt que depuis un
  `useEffect` sur `mounted` : `onShow` se déclenche quand la fenêtre native est
  réellement présentée ;
- **différer le contenu lourd** — ne monter les puces qu'une fois la feuille en
  place, ou passer par `InteractionManager.runAfterInteractions` ;
- raccourcir `TIMING.duration` vers 300 ms ;
- vérifier au passage que `reset()` n'a pas besoin de tourner **avant**
  `setMounted` — le faire à la fermeture éviterait sept `setState` sur le chemin
  critique de l'ouverture.

## ⚠️ À vérifier avant de creuser

**Tout ceci est observé sur Expo Go, donc sur un bundle de développement.** Les à-coups
du fil JS y sont nettement plus marqués qu'en production. Avant d'optimiser à
l'aveugle, il faut **mesurer** : `Toggle performance monitor` dans le menu
développeur d'Expo Go donne les FPS des deux fils (JS et UI) et suffit à dire si
la chute est réelle.

Cela dit, le montage d'un composant par appui reste un défaut de conception
indépendamment du mode de build : il vaut la peine d'être corrigé même s'il ne
se voit plus en release.

## Ce que ça touche

- `components/ui/Button.tsx` — le halo et la variante de pression
- `tamagui.config.ts` — éventuellement les paramètres de `bouncy`
- `features/reserve/ReserveProvider.tsx` — `open()`, le `useEffect`, `TIMING`

## Contraintes

- **`prefers-reduced-motion` doit rester respecté** — le halo n'est aujourd'hui
  pas joué du tout quand les animations système sont coupées, et c'est la bonne
  convention (cf. `CLAUDE.md`). Toute réécriture doit la conserver.
- **Un seul bouton.** Alléger la pression du gros appel à l'action ne doit pas
  produire une seconde géométrie de bouton : ça passe par une variante ou par le
  thème.

## Encore ouvert

- **Est-ce qu'on garde le halo ?** C'est la signature « ampoule de guirlande » du
  projet. Le rendre gratuit est faisable ; le supprimer serait plus simple mais
  coûterait un morceau d'identité. À trancher en le voyant allégé.

---

# Points encore ouverts — récapitulatif

| # | Question | Bloque | Peut attendre ? |
|---|---|---|---|
| ~~1~~ | ~~Réaligner les polices avec `../Guinguette_Web` ?~~ **Question caduque** : la prémisse était fausse (les deux design systems étaient alignés) et la divergence est maintenant assumée. Reste un nettoyage à faire côté site. | — | Réglé le 3 août 2026 |
| ~~2~~ | ~~Répartition du contenu entre « À l'affiche » et « Les pépites » ?~~ **Tranché autrement que la proposition par défaut : « À l'affiche » garde toute la programmation ; « Les pépites » est une sélection manuelle de l'exploitant** (`pepite: boolean`). | — | Réglé le 4 août 2026 |
| 3 | Liens artistes : URL réelles ou placeholders ? | — | Oui — `artistUrl` reste vide, pastille désactivée en attendant |
| ~~4~~ | ~~Forme exacte du signal de dépliage sur La Carte~~ **Tranché : une pastille ronde en bas à droite de la photo, chevron qui pivote.** La question supposait qu'on reprendrait le chevron du chantier 2 — il n'existait plus. **Reste à valider à l'œil.** | — | Réglé le 5 août 2026 |
| ~~5~~ | ~~Deux boutons de même rang sur l'accueil, un second rétrogradé, ou un seul ?~~ **Tranché : les deux en verre (`tone="glass"`), le principal distingué par un anneau ambré qui bat (`emphasis`)**, pas par une couleur pleine. | — | Réglé le 4 août 2026 |
| ~~6~~ | ~~La nouvelle accroche de Soirées tient-elle en 1–2 lignes ?~~ **Mesuré : oui, 2 lignes** sur 360 comme sur 412. Elle reste centrée. | — | Réglé le 3 août 2026 |
| 7 | **Garde-t-on le halo du bouton ?** C'est la signature « ampoule », mais c'est aussi ce qui coûte un montage par appui | Chantier 4 | Oui — se tranche en le voyant allégé |
| 8 | **Le « freeze » survit-il à un build de production ?** À mesurer au moniteur de performance avant d'optimiser. **Première mesure, 5 août 2026** (`dumpsys gfxinfo`, émulateur) : 96,4 % d'images saccadées, 50ᵉ centile à 129 ms, **centile GPU à 4950 ms** — l'AVD tourne en rendu logiciel (`swiftshader`, imposé par le driver du poste), donc ces chiffres ne disent **rien** de l'app. À refaire sur téléphone réel, c'est le seul verdict qui vaudra. | Chantier 4 | Non — c'est la première étape du chantier |
| ~~9~~ | ~~**L'accroche de La Carte passe à 3 lignes sur 360 px.** Raccourcir, aligner à gauche, ou assumer ?~~ **Tranché : raccourcie deux fois** — « Produits locaux, plats gourmands », une seule ligne à 360 comme à 412. Garder « et élégants » tenait en 2 lignes mais laissait « élégants » orphelin. | — | Réglé le 5 août 2026 |
| 11 | **Coupe-t-on les décorations de l'accueil ?** Rien ne fuit (tous les timers sont nettoyés), mais l'accueil n'est jamais démonté : l'anneau `emphasis`, les 4 ampoules de la guirlande et le battement du `Countdown` tournent en boucle **même quand on est sur un autre onglet**. Les figer (`useIsFocused`) ne changerait rien à l'image. Demandé puis suspendu par Jonathan le 5 août, faute d'avoir tranché entre « c'est plus fluide ? » et « c'est plus beau ? ». | Chantier 4 | Oui — dépend de la mesure sur téléphone (question 8) |
| 10 | **Voile global à 0,32, ou écran local derrière le seul bloc de texte ?** Le second garde la vidéo vive en haut et en bas | Chantier 1d | Oui — se juge à l'écran |

---

# Contraintes à ne pas perdre de vue

Elles sont détaillées dans `CLAUDE.md`, rappelées ici parce que ces chantiers les
touchent directement :

- **Aucune valeur en dur.** Tout passe par `constants/theme.ts`, exposé à Tamagui
  par `tamagui.config.ts`. Les nouvelles polices et tailles s'ajoutent là.
- **Un seul bouton.** Renommer « Je serai là » en « Participer » se fait au
  niveau des libellés appelants — surtout pas en fabriquant un second bouton.
- **Zones tactiles ≥ 44 px** et **`prefers-reduced-motion` respecté** : tout
  dépliage, tout swipe, tout bouton flottant ajouté doit tenir les deux.
- **Versions figées sur Expo Go.** Ajouter des polices `@expo-google-fonts` est
  sans risque (pas de code natif). Ajouter une bibliothèque de carrousel ou de
  gestes, en revanche, demande de vérifier qu'elle ne contient pas de natif.
- **⚠️ Ne jamais installer avec `--legacy-peer-deps`.** Éprouvé le 3 août 2026 :
  le drapeau fait passer l'installation **mais retire `react-dom` de l'arbre**, et
  `@tamagui/popper` l'importe même sur natif — le bundle meurt alors sur
  `Unable to resolve "react-dom"`, très loin de la cause. `react-dom` est depuis
  une dépendance explicite alignée sur `react`, donc `npm install` passe sans
  drapeau. Si un conflit `ERESOLVE` réapparaît, **réaligner les versions**, pas
  forcer.
- **Tout reste simulé.** La pastille de lien artiste ouvre un lien externe — elle
  n'envoie rien, ce qui reste dans le cadre de la démo.
