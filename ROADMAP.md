# Feuille de route — ce qui reste à faire

> **Ce document ne parle que du futur.** Ce que l'app *fait* aujourd'hui est
> décrit dans `CLAUDE.md` ; *pourquoi* elle le fait ainsi, et les pièges
> rencontrés en chemin, dans `.claude/rules/`.
>
> **Remis à plat le 6 août 2026.** Il avait grossi jusqu'à 1000 lignes en
> accumulant, en tête de fichier, le récit chronologique de chaque chantier
> terminé — un compte rendu, exactement ce qu'il annonçait ne pas être. Ce récit
> est dans l'historique git ; ce qu'il fallait en retenir est dans les règles.

## Comment lire ce document

Chaque chantier tient en quatre points : **Intention** (ce qu'on veut, et
pourquoi), **Ce que ça touche** (les fichiers, pour estimer l'ampleur),
**Décidé** (les arbitrages déjà tranchés), **Ouvert** (ce qui attend une
décision, un regard ou une mesure).

**La discipline qui garde ce fichier court :** quand un chantier se termine, ce
qu'il faut en savoir pour la suite part dans `.claude/rules/` (ou dans
`CLAUDE.md` si ça change la structure), et il ne reste ici qu'une ligne dans le
tableau des chantiers terminés. Une question tranchée ne reste pas barrée dans
le récapitulatif : elle disparaît, sa réponse vit dans la règle concernée.

## Vue d'ensemble

| # | Chantier | État | Ce qui le débloque |
|---|---|---|---|
| **4** | Mouvement — le ressenti du bouton et de la feuille | 🟡 entamé | Une mesure sur téléphone réel (Q2), puis l'œil de Jonathan (Q1) |
| **1d** | Accueil — le voile de la vidéo | ⚪ ouvert | Se juge à l'écran (Q3) |
| **3b** | La Carte — l'ouverture des fiches saute en hauteur | ⚪ ouvert | La même mesure que le chantier 4 (Q2) |
| — | Les liens des artistes | ⏸ suspendu | De vraies URL, à fournir par l'exploitant (Q4) |

Les trois chantiers sont indépendants. Le 4 est le plus rentable à reprendre en
premier : il est **transverse** (LE bouton, la feuille — donc tous les écrans),
et la mesure qu'il demande débloque aussi le 3b et la question 5.

---

# Chantier 4 — Mouvement : la pression du bouton et l'ouverture de la feuille 🟡

## Intention

**Demande de Jonathan, 3 août 2026 :** au toucher, « Réserver une table » donne
**une impression de freeze** — il faut un effet plus léger. Et l'ouverture de la
feuille de réservation **ne semble pas naturelle**, sa fluidité est à reprendre.

⚠️ **Ce n'est pas un chantier « accueil », malgré l'endroit où ça se voit.**
`components/ui/Button.tsx` est LE bouton de l'app, et la feuille s'ouvre depuis
l'en-tête de tous les écrans. Toute retouche ici se répercute partout — c'est ce
qui fait l'intérêt du chantier, et son risque.

## Déjà fait — les deux défauts structurels (5 août 2026)

Ce sont les seuls points qui ne dépendaient ni d'une mesure ni d'un arbitrage
visuel. **Le détail vit dans les règles, pas ici :**

- **Le halo ne monte plus rien à chaque appui** — `PressHalo`, monté une fois,
  piloté par une valeur partagée. Voir `.claude/rules/design-system.md`,
  « Le halo de pression ne monte plus rien ».
- **La feuille glisse depuis `<Modal onShow>`**, pas depuis un effet sur
  `mounted`, avec un filet de sécurité de 250 ms. Voir
  `.claude/rules/ecrans.md`, « La feuille de réservation glisse depuis
  `onShow` ».

## Ce qui reste

1. **Les réglages de ressenti**, tous suspendus à l'œil de Jonathan (Q1) :
   passer la pression sur `quick` (`damping: 22`, `stiffness: 340`) au lieu de
   `bouncy` (peu amorti : `damping: 12`, `stiffness: 260`, qui dépasse la cible
   et met du temps à se stabiliser) ; réduire l'amplitude à `scale: 0.97` au
   lieu de `0.95` ; raccourcir `TIMING.duration` de 400 ms vers 300 ms, l'usage
   pour une feuille basse se situant plutôt entre 250 et 350.
2. **Différer le contenu lourd de la feuille** — le seul point qui soit
   vraiment une optimisation. `open()` monte d'un coup l'en-tête, trois points
   d'étape, un `ScrollView`, huit puces de date, huit puces d'heure, le
   sélecteur de couverts et le pied. Les monter après coup se **voit** (une
   feuille vide qui se remplit), donc ça ne se tranche ni sans mesure (Q2) ni
   sans regard.

## Ce que ça touche

- `components/ui/Button.tsx` — la variante de pression
- `tamagui.config.ts` — éventuellement les paramètres de `bouncy`
- `features/reserve/ReserveProvider.tsx` — `TIMING`, le montage du contenu

## Deux fausses pistes, à ne pas rouvrir

- **`reset()` n'est pas sur le chemin critique.** Ses sept `setState`, plus
  `setMounted`, sont dans le même bloc synchrone : React les regroupe en **un
  seul** rendu, pas huit. Les déplacer à la fermeture n'économiserait rien et
  ferait réapparaître l'état précédent si on rouvrait avant la fin de
  l'animation de fermeture. Documenté dans `.claude/rules/ecrans.md`.
- **Ne pas éteindre le halo sur les gros appels à l'action** pour gagner en
  fluidité : il ne coûte plus rien depuis `PressHalo`. S'il saute un jour, ce
  sera par goût, pas par performance (Q1).

## Contraintes

- **`prefers-reduced-motion` reste respecté** — le halo n'est pas *atténué*
  quand les animations système sont coupées, il n'est **pas joué du tout**.
  C'est la convention du projet pour tout ce qui est purement décoratif.
- **Un seul bouton.** Alléger la pression du gros appel à l'action ne doit pas
  produire une seconde géométrie : ça passe par une variante ou par le thème.

---

# Chantier 1d — Accueil : le voile de la vidéo ⚪

## Intention

Le voile actuel est **un compromis, pas un réglage définitif**. La photo fixe
d'origine était sombre au centre, exactement là où se posent le titre et
l'accroche : **20 %** suffisaient. La vidéo, elle, y fait défiler des visages,
un feu, des lampions — l'accroche devenait difficile à lire. Le voile est monté
à **0,32**, et l'accroche a gagné l'ombre portée du titre (son `opacity: 0.9` a
sauté au passage : atténuer un texte sur fond mouvant est le contraire de ce
qu'il faut faire).

## Décidé

**C'est `0,32` le premier chiffre à bouger si la vidéo paraît trop assagie** —
en gardant en tête que c'est lui, et lui seul, qui tient la lisibilité sur les
plans clairs.

## Ouvert (Q3)

**Piste plus fine, si baisser le voile global ne suffit pas :** le remplacer par
un écran **local** derrière le seul bloc de texte — un dégradé vertical centré
sur la zone titre + accroche. La vidéo garderait toute sa vivacité en haut et en
bas, et le texte son fond garanti. Plus de travail, meilleur résultat.

## Ce que ça touche

`app/(tabs)/index.tsx` uniquement.

---

# Chantier 3b — La Carte : l'ouverture des fiches saute en hauteur ⚪

## Intention

Laissé de côté volontairement au chantier 3 : l'ouverture d'une fiche **fond**
la description, mais sa **hauteur, elle, saute**. C'est sec.

## Ouvert

Une `LinearTransition` lisserait le changement, mais **les animations de layout
sur une `FlatList` sont un nid à saccades**, et la question des performances
(Q2) était ouverte le jour même. À reprendre une fois la mesure faite sur
téléphone réel — pas avant.

## Ce que ça touche

`components/features/MenuBlockView.tsx` (`DishCard`).

---

# En attente de l'exploitant — les liens des artistes ⏸

`Artist.website`, `.instagram` et `.facebook` (`data/artists.ts`) sont **vides**
sur les trois artistes placeholder, donc les pastilles s'affichent désactivées.
C'est le choix le plus sûr en démo : un lien inventé tomberait sur un 404 devant
le prospect. À reprendre le jour où l'exploitant fournit de vraies URL (Q4).

Ces pastilles ouvrent le navigateur via `Linking.openURL`, comme le bouton
« M'y rendre » de l'écran Infos. C'est la seule sortie externe de la démo, et
elle reste dans le cadre « aucune donnée envoyée » : on n'envoie rien, on ouvre
un lien.

---

# Questions ouvertes

| # | Question | Bloque | Peut attendre ? |
|---|---|---|---|
| **Q1** | **Garde-t-on le halo du bouton ?** C'est la signature « ampoule de guirlande » du projet. La moitié technique de la question est réglée — il ne coûte plus ni rendu ni montage —, donc le supprimer serait plus simple mais coûterait un morceau d'identité **sans plus rien économiser**. Ne reste que le goût. ⚠️ Son apparence **à l'appui** n'a jamais pu être vérifiée : un fondu de 560 ms n'est pas saisissable par `screencap`. | Chantier 4 | Oui — se tranche en le voyant à l'œil |
| **Q2** | **Le « freeze » survit-il à un build de production ?** Tout a été observé sur Expo Go, donc sur un bundle de développement, où les à-coups du fil JS sont nettement plus marqués. La mesure du 5 août ne vaut **rien** : `dumpsys gfxinfo` donnait 96,4 % d'images saccadées et un centile GPU à 4950 ms, mais l'AVD tourne en rendu logiciel (`swiftshader`, imposé par le driver du poste). À refaire **sur téléphone réel**, au moniteur de performance d'Expo Go — c'est le seul verdict qui vaudra. | Chantiers 4 et 3b, Q5 | Non — c'est la première étape |
| **Q3** | **Voile global à 0,32, ou écran local derrière le seul bloc de texte ?** Le second garde la vidéo vive en haut et en bas. | Chantier 1d | Oui — se juge à l'écran |
| **Q4** | **Liens des artistes : vraies URL ou placeholders ?** | — | Oui — pastilles désactivées en attendant |
| **Q6** | **Le pli du feuilletage est-il juste ?** Tout est dans l'objet `TURN` de `NewspaperPager.tsx`, une valeur nommée par réglage : `angleSign` (⚠️ **le sens de la rotation n'a jamais été vu à l'œil** — si le pli part du mauvais bord, c'est ce seul signe à inverser), `maxAngle` (18°), `threshold` (30 % de la largeur), `perspective` (1000), `foldOpacity`, `foldSpread`, `lift`, `edgeOpacity`, `edgeFadeIn`. Aucun n'est une valeur de design system : ce sont des réglages de ressenti, et ils se jugent à l'écran. | — | Oui — se juge à l'œil, une valeur à la fois |
| **Q5** | **Coupe-t-on les décorations de l'accueil hors focus ?** Rien ne fuit (tous les timers sont nettoyés), mais l'accueil n'est jamais démonté : l'anneau `emphasis`, les ampoules de la guirlande et le battement du `Countdown` tournent **même quand on est sur un autre onglet**. Les figer (`useIsFocused`) ne changerait rien à l'image. Demandé puis suspendu par Jonathan le 5 août, faute d'avoir tranché entre « c'est plus fluide ? » et « c'est plus beau ? ». | — | Oui — dépend de Q2 |

---

# Chantiers terminés

Une ligne chacun. **Ce qu'il faut en savoir pour la suite vit dans les règles**,
pas ici — la colonne de droite dit où.

| # | Chantier | Quand | Où vit la suite |
|---|---|---|---|
| **0** | Identité typographique — Berkshire Swash remplace Fraunces | 3 août 2026 | `.claude/rules/typographie.md` (les polices, le plancher d'interligne, la graisse unique) |
| **1b** | Accueil — le « g » de Oignies rogné | 3 août 2026 | `.claude/rules/typographie.md` (l'interligne a un plancher, et il se lit dans la police) |
| **1a** | Accueil — les halos de la guirlande rognés | 4 août 2026 | Rien à retenir : `viewBox` élargi, `marginTop` porté à `spacing.snug` |
| **1d.b** | Accueil — la vidéo tournait en continu | 3 août 2026 | `.claude/rules/ecrans.md` (une ouverture, pas une boucle) |
| **1d.c** | Accueil — le débit de la vidéo | 4 août 2026 | Voir la recette de ré-encodage plus bas |
| **1c** | Accueil — la hiérarchie des deux boutons | 4 août 2026 | `.claude/rules/design-system.md` (`tone="glass"`, `emphasis`, et le piège Reanimated) |
| **2** | Soirées — la seconde section | 4 août 2026 | `.claude/rules/ecrans.md` (le carrousel au tap **et** au swipe, l'ombre du panneau) · `.claude/rules/donnees-et-demo.md` (`data/artists.ts`) |
| **3** | La Carte — fiches repliées | 5 août 2026 | `.claude/rules/ecrans.md` (seuls les plats illustrés se replient, le bouton flottant). Reste le 3b ci-dessus. |
| **5** | Soirées — le feuilletage façon journal | 6 août 2026 | `.claude/rules/ecrans.md` (« L'écran Soirées se feuillette comme un journal » : les trois invariants du pager, le `zIndex` qui vient de React, le pli simulé faute de Skia). Reste le réglage du pli (Q6). |

**Deux chantiers ont fini ailleurs que là où ils partaient**, et ça vaut d'être
su avant de relire l'historique git :

- **« Les pépites » n'a jamais existé.** La seconde section de Soirées, prévue
  comme une sélection de soirées (`pepite: boolean`), est devenue **« Artist
  Spot »** — une galerie d'artistes reliés à leur soirée. `pepite` et
  `artistUrl` ont disparu de `data/events.ts`.
- **Le swipe entre onglets a été supprimé** (5 août), et le geste ainsi libéré
  donné au carrousel de Soirées. `SwipeTabs.tsx` et `SwipeTabsArea` n'existent
  plus ; toute la mécanique de garde-fou (`useSwipeGuard`, `ScrollView` importé
  de `react-native-gesture-handler`) qui existait pour cohabiter avec lui a
  disparu avec — sauf sur la rangée de filtres de La Carte, où elle sert encore.
  **Le carrousel lui-même n'a pas survécu au chantier 5** (6 août) : le geste
  horizontal appartient désormais à la page entière, et `PosterFrame` a été
  retiré. `PosterCarousel.tsx` s'appelle maintenant `SpotlightParts.tsx` et ne
  porte plus que de l'habillage.

# Recettes d'atelier

Deux méthodes éprouvées, qui ne vivent nulle part ailleurs parce qu'elles ne
servent qu'à refaire une opération rare.

**Ré-encoder une vidéo de fond.** `accueil.mp4` est passé de 2,45 Mo à 782 Kio
(÷3,1) sans perte perceptible derrière le voile : `ffmpeg` (installé via
`winget`, `Gyan.FFmpeg`), résolution ramenée à **768×576**, débit ciblé **en deux
passes** à ~1300 kbit/s (`-maxrate 1500k -bufsize 3000k`). Vérifier en extrayant
la même seconde avant et après, pas à l'oreille du réglage.

**Choisir une police d'affichage.** Trois étapes, dans cet ordre — c'est la
troisième qui a inversé le classement au chantier 0 :

1. **Présélectionner sur mesures**, en lisant directement les tables
   `head`/`hhea`/`OS/2`/`cmap`/`GSUB` des `.ttf` livrés par
   `@expo-google-fonts` — jamais sur les fiches produit. Relever `unitsPerEm`,
   `ascender`, `descender` (le plancher d'interligne, à reporter dans
   `MIN_LINE_HEIGHT_RATIO`) et la présence de `tnum`.
2. **Monter un écran de comparaison jetable** (`app/type-lab.tsx` au chantier 0,
   supprimé après l'arbitrage) : les vrais titres, dans chaque famille, chacune
   avec `lineHeight = ceil(fontSize × son plancher)` — sinon on compare des
   rendus rognés.
3. **Juger sur l'appareil**, à taille réelle, sur le vrai fond, avec les vrais
   mots. Captures via `adb exec-out screencap`. Cette étape ne se délègue pas.

---

Les contraintes que ces chantiers touchent — aucune valeur en dur, un seul
bouton, versions figées, rien n'est envoyé, zones tactiles ≥ 44 px — sont les
cinq règles d'or de `CLAUDE.md`. Elles ne sont pas recopiées ici : un plan de
travail qui redit les règles finit par en donner une version périmée.
