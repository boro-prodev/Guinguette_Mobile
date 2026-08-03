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

## Ordre conseillé — ce qui reste

| # | Chantier | État | Pourquoi à ce moment-là |
|---|---|---|---|
| **1a + 1d + 1c** | Accueil — guirlande, réglages vidéo, puis les deux appels à l'action | ✅ **prêt** | **Une seule passe, dans cet ordre.** 1a et 1c touchent le rythme vertical du bas d'écran ; 1d fixe le fond, et les boutons ne se jugent pas sur un fond qui va encore bouger. |
| **2** | Soirées — les pépites | ✅ **prêt** | La plus grosse refonte, mais elle est *structurelle* (disposition, gestes) : un changement de police plus tard demandera de réajuster des tailles, pas de tout refaire. |
| **3** | La Carte — fiches repliées | ✅ **prêt** | Réutilise le motif validé en 2. Beaucoup moins risqué une fois 2 fait. |
| **4** | Mouvement — pression du bouton, ouverture de la feuille | ✅ **prêt** | Ajouté le 3 août 2026. Indépendant des autres, mais **transverse** : touche LE bouton et la feuille, donc tous les écrans. À faire quand le reste est stable. |

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

Quatre points sur le même écran. **1b est fait** (3 août 2026) ; restent **1a**
(bug d'affichage), **1d** (réglages de la vidéo de fond) et **1c** (reprise de
conception des boutons).

**Les trois se traitent en une seule passe, dans l'ordre 1a → 1d → 1c** : 1a et
1c touchent tous deux le rythme vertical du bas d'écran, et 1d fixe le fond —
juger la hiérarchie des boutons sur un fond encore mouvant, c'est trancher deux
fois.

## 1a. Les ampoules de la guirlande sont rognées ✅ prêt

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

**Correctif :** agrandir le `viewBox` verticalement (par exemple
`viewBox="0 -10 240 48"`) sans toucher aux coordonnées des ampoules, et ajuster
le calcul de `height` en conséquence. Réduire le rayon du halo marcherait aussi
mais affaiblirait l'effet lumineux, qui est la signature du projet.

**Constaté en plus, le 3 août 2026 (capture après le passage à Berkshire
Swash) :** la guirlande vient se poser **dans la zone du jambage d'« Oignies »**.
Ce n'est pas la bascule qui l'a causé — les profondeurs sont quasi identiques
(Fraunces 0,255 em, Berkshire 0,262 em) — mais le « g » à swash de Berkshire est
bien plus expansif, donc la proximité se lit maintenant comme une collision.
`guirlande.marginTop` vaut `spacing.sm` (12 px) dans `app/(tabs)/index.tsx` :
c'est le levier. À régler en même temps que le `viewBox`, sinon on ajuste deux
fois le même espacement.

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

## 1c. Les deux appels à l'action sont à retravailler ✅ prêt

**Demande de Jonathan, 3 août 2026 :** « Réserver une table » et « Prochaines
soirées » doivent être repris.

**Ce qu'on voit aujourd'hui (capture du 3 août) :** deux pilules pleine largeur
empilées, de géométrie **rigoureusement identique** — même hauteur, même rayon,
même graisse de libellé. Seules les couleurs les distinguent : terre plein pour
la première, contour ambré sur la photo pour la seconde. Trois conséquences :

- **La hiérarchie entre l'action principale et l'action secondaire est faible.**
  À taille et forme égales, c'est la seule couleur qui doit porter la différence,
  et sur une photo chargée elle ne suffit pas toujours.
- **Le bouton détouré se dilue sur les zones claires de l'image.** Son contour
  fait 2 px et son texte est blanc ; le voile derrière lui n'est pas garanti.
- **Le bloc occupe une grande hauteur en bas d'écran**, juste sous une accroche
  déjà longue.

**Encore ouvert — c'est le fond de la demande, et ça n'est pas tranché :** est-ce
qu'on garde deux boutons de même rang, est-ce qu'on rétrograde le second (lien,
`tone="ghost"`, taille inférieure), ou est-ce qu'on n'en garde qu'un ? À voir à
l'écran, sur la photo, comme pour le chantier 0.

⚠️ **Contrainte à ne pas casser : il n'y a qu'UN bouton dans l'app.** Toute
reprise passe par `components/ui/Button.tsx`, par ses variantes (`tone`, `size`)
ou par un thème dans `tamagui.config.ts` — **jamais** par un bouton refabriqué
localement, ni par un `PressableScale` déguisé. Le thème `lampion` existe déjà
exactement pour ce contexte « sur photo sombre ». Cible tactile ≥ 44 px et
`prefers-reduced-motion` restent valables.

**Ce que ça touche :** `app/(tabs)/index.tsx` (les appelants), et selon la
direction retenue `components/ui/Button.tsx` ou le thème `light_lampion`.

⚠️ **À faire après 1d, pas avant.** Les deux boutons se détachent différemment
sur une vidéo que sur une photo fixe : arbitrer leur hiérarchie sur un fond qui
va peut-être encore changer, c'est trancher deux fois.

## 1d. La vidéo de fond — trois réglages laissés ouverts ✅ prêt

**Contexte :** l'accueil tourne sur `assets/videos/accueil.mp4` depuis le 3 août
2026 (`expo-video`, livré avec Expo Go). Depuis le même jour, c'est une
**ouverture** : la vidéo passe une fois, s'arrête sur sa dernière image, et les
deux appels à l'action n'apparaissent qu'ensuite.

Restent deux points ouverts sur trois — le second s'est réglé tout seul avec ce
changement.

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

### c. Le débit du fichier est très élevé

Mesuré le 3 août 2026 dans l'atome `mvhd` : **5,0 s**, **2,34 Mo**, soit
**~3 900 kbit/s**. C'est trois à quatre fois ce qu'il faudrait pour un fond
d'écran de téléphone.

Une passe d'encodage (résolution plafonnée à la taille d'écran, débit ramené
vers 1 000–1 500 kbit/s) diviserait le poids par deux ou trois sans différence
visible derrière un voile à 32 %. La durée de 5 s, elle, est bonne : assez pour
poser une ambiance, assez court pour ne pas faire attendre devant les boutons.

**Ce que ça touche :** `app/(tabs)/index.tsx`, `assets/videos/accueil.mp4`.

---

# Chantier 2 — Soirées : les pépites ✅ prêt

## Intention

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

## Décidé

1. **Sous-titre** — « Découverte ! Ambiance Unique ! Artiste Incroyable »
   remplace le paragraphe actuel.

   **Reconfirmé le 3 août 2026** — motif donné par Jonathan : le texte actuel
   n'est **« pas assez concis et dynamique »**. C'est bien un problème de *copie*
   avant d'être un problème de mise en forme, et ça valide la décision déjà
   prise ici.

   Trois mesures qui vont dans le même sens, relevées pendant la revue
   typographique :

   - le paragraphe fait **4 lignes centrées**, pas trois — sur 360 px *comme* sur
     412 px ;
   - à 412 px il se termine par un **orphelin d'un seul mot** (« rendez-vous. ») ;
   - centré sur 4 lignes, chaque ligne repart d'un x différent : l'œil peine à
     enchaîner.

   Le remplacement règle les trois d'un coup — **à condition de ne pas recentrer
   un bloc de plusieurs lignes.** Si la nouvelle accroche tient sur une ou deux
   lignes, centrée elle va très bien ; au-delà, il faut l'aligner à gauche.

   ✅ **Mesuré le 3 août 2026 : l'accroche proposée tient en 2 lignes**, sur 360
   comme sur 412 px (Karla 18 px). Elle peut donc rester centrée.
   ⚠️ Une réserve tout de même : à 412 px elle se coupe en « Découverte !
   Ambiance Unique ! Artiste » / « **Incroyable** » — soit un dernier mot seul.
   Si ça choque à l'écran, raccourcir d'un mot suffira.

   **Fichier :** `app/(tabs)/soirees.tsx` (`styles.intro` porte le
   `textAlign: 'center'`).
2. **Les pépites reprennent à l'identique le composant « à l'affiche »** —
   même affichage, même fonctionnement. Ce n'est pas un nouveau composant à
   écrire, c'est `EventSpotlight` réutilisé.
3. **Le swipe horizontal est autorisé** pour parcourir les cartes, dans les deux
   sections.
   ⚠️ **Il ne doit pas changer d'onglet.** C'est déjà outillé : `useSwipeGuard()`
   existe exactement pour ce conflit (cf. `CLAUDE.md`). C'est d'ailleurs pour ça
   que l'affiche actuelle se change au toucher — passer au swipe lève cette
   limite, à condition de poser le garde-fou.
4. **Clic sur l'image → dépliage** des informations aujourd'hui portées par les
   cartes du bas : date, description, programme horaire, jauge de places, tarif.
   Une seule dépliée à la fois, et c'est la page qui défile (pas de défilement
   imbriqué dans la carte — ça ferait un troisième geste au même endroit).
5. **Une pastille de lien** vers le site ou le réseau social du groupe/artiste,
   à l'intérieur du bloc déplié.
6. **Le bouton devient « Participer »** dans tous ses états. Une fois coché, il
   est mis en avant avec un **✓** (le basculement au vert existe déjà).

## Ce que ça touche

- `app/(tabs)/soirees.tsx` — sous-titre, suppression de la `FlatList` de cartes,
  ajout de la seconde section
- `components/features/EventSpotlight.tsx` — gagne le swipe horizontal et le
  dépliage ; devient le composant unique de l'écran
- `components/features/EventCard.tsx` — **son contenu migre** dans le dépliage du
  spotlight, puis le fichier disparaît
- `data/events.ts` — nouveau champ pour le lien artiste
- `components/ui/Button.tsx` — **rien à changer ici**, seulement les libellés
  appelants. *(Le chantier 4 le modifie, lui — mais pour le mouvement, pas pour
  la géométrie. Les deux ne se marchent pas dessus.)*

## Encore ouvert

- **Quel contenu dans quelle section ?** Les deux sections utilisant le même
  composant sur les mêmes 3 soirées, il faut une règle de répartition.
  Proposition par défaut : *« À l'affiche » = la prochaine soirée uniquement ;
  « Les pépites » = toute la programmation.* À confirmer.
- **Liens artistes : URL réelles ou placeholders ?** Les données du projet sont
  des placeholders ; des URL inventées tomberaient sur des 404 en pleine démo
  client. Un lien vers une page qui existe, ou une pastille visuellement
  désactivée, est plus sûr.

## Note

La pastille de lien ouvrira le navigateur via `Linking.openURL` — comme le bouton
« M'y rendre » de l'écran Infos, qui crée déjà le précédent. C'est la seule sortie
externe de la démo, et elle reste dans le cadre « aucune donnée envoyée » :
on n'envoie rien, on ouvre un lien.

---

# Chantier 3 — La Carte : fiches repliées ✅ prêt

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

## Encore ouvert

- **À quoi ressemble le « signal élégant » de dépliage ?** Le chevron du
  chantier 2 est cohérent mais discret. Un dégradé de texte tronqué, une ombre
  portée, un « + » ? À arbitrer visuellement, une fois le chantier 2 en place.

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
| 2 | Répartition du contenu entre « À l'affiche » et « Les pépites » | Chantier 2 | Non — à trancher au démarrage |
| 3 | Liens artistes : URL réelles ou placeholders ? | Chantier 2 | Oui — en fin de chantier |
| 4 | Forme exacte du signal de dépliage sur La Carte | Chantier 3 | Oui — s'arbitre en voyant le chantier 2 |
| 5 | **Deux boutons de même rang sur l'accueil, un second rétrogradé, ou un seul ?** | Chantier 1c | Non — c'est tout le chantier. Se juge à l'écran, sur la photo |
| ~~6~~ | ~~La nouvelle accroche de Soirées tient-elle en 1–2 lignes ?~~ **Mesuré : oui, 2 lignes** sur 360 comme sur 412. Elle reste centrée. | — | Réglé le 3 août 2026 |
| 7 | **Garde-t-on le halo du bouton ?** C'est la signature « ampoule », mais c'est aussi ce qui coûte un montage par appui | Chantier 4 | Oui — se tranche en le voyant allégé |
| 8 | **Le « freeze » survit-il à un build de production ?** À mesurer au moniteur de performance avant d'optimiser | Chantier 4 | Non — c'est la première étape du chantier |
| 9 | **L'accroche de La Carte passe à 3 lignes sur 360 px.** Raccourcir, aligner à gauche, ou assumer ? | Chantier 3 | Oui — à l'écriture de la copie |
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
