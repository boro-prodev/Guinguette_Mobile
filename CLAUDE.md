# La Guinguette de Oignies — Application mobile (démo)

Application React Native (Expo) pour une guinguette à Viroinval (Belgique).
**Tout le contenu visible est en français.**

**Projet jumeau :** le site web vit désormais dans `../Guinguette_Web` (Vite +
Tailwind). Les deux projets sont **indépendants** — aucune dépendance de code,
aucun fichier partagé. Ils gardent en commun les mêmes données placeholder et la
même identité visuelle, mais toute synchronisation est manuelle et volontaire.

## Nature du projet — À LIRE EN PREMIER

Cette application est un **modèle de démonstration**, pas (encore) une app de production :

1. **Toutes les données sont des placeholders** : menu, prix, dates de soirées, horaires, adresse (Rue de Revin 16, 5670 Viroinval) et téléphone (0490 007 007) sont du contenu d'exemple, modifiable sans validation métier. Ne pas s'inquiéter de leur exactitude ; les garder plausibles et en français.
2. **Les parcours doivent être fonctionnels mais simulés** : une action (réservation, inscription à une soirée…) doit guider l'utilisateur jusqu'à un écran de confirmation, avec validation et retours visuels, **mais ne rien envoyer** — aucun backend, aucun appel réseau, aucune collecte réelle. Une mention discrète type « Démo — aucune donnée n'est envoyée » est la convention.
3. **Tout se conçoit pour un téléphone** (~360–430 px de large). Zones tactiles ≥ 44 px, feedback tactile sur chaque élément interactif.
4. Objectif : pouvoir montrer l'app à un prospect/client comme démonstration d'interface aboutie.

**Ce fichier décrit l'app telle qu'elle est.** Ce qui est *prévu* mais pas encore
fait vit dans `ROADMAP.md` — à lire avant d'entamer un chantier sur les écrans
Soirées, Carte ou Accueil, et avant de toucher aux polices.

## Stack & commandes

- Expo SDK 57 · React Native 0.86 · **Expo Router** (onglets) · TypeScript strict · Reanimated 4 + Gesture Handler · **Tamagui 2** (design system).
- `npm start` (Metro / Expo Go) · `npm run android` · `npm run ios`.
- Vérification standard après modification : `npx tsc --noEmit`, puis `npx expo-doctor`, puis contrôle visuel sur émulateur ou Expo Go.
- Pas de tests, pas de linter configurés.
- **Dépôt git depuis le 3 août 2026** : `boro-prodev/Guinguette_Mobile` sur GitHub, **privé**, branche `main`.

## Structure

| Chemin | Rôle |
|---|---|
| `ROADMAP.md` | **Prochaines étapes de développement** — chantiers à venir et questions ouvertes |
| `app/_layout.tsx` | Racine : polices, safe-area, `TamaguiProvider`, `ToastProvider`, `ReserveProvider` |
| `app/(tabs)/_layout.tsx` | **Source unique de la navigation** (header, barre d'onglets, transition, swipe) |
| `app/(tabs)/index · carte · soirees · infos` | Les 4 écrans (accueil, menu, événements, infos pratiques) |
| `constants/theme.ts` | **Valeurs brutes du design system** en TS (couleurs, type scale, spacing, radius, ombres, polices) |
| `tamagui.config.ts` | Expose `theme.ts` à Tamagui : tokens, polices, thèmes d'accent, animations |
| `components/ui/Button.tsx` | **LE bouton de l'app** — un seul objet, décliné par thème |
| `components/ui/PressableScale.tsx` | Zone tactile brute (fond d'écran, carte cliquable) — **pas** un bouton |
| `components/layout/SwipeTabs.tsx` | Navigation au doigt entre onglets (+ `useSwipeGuard`) |
| `components/features/EventSpotlight.tsx` | « À l'affiche » : une soirée en grand, fondu enchaîné, pagination |
| `components/features/Countdown.tsx` | Compte à rebours vivant (retick chaque minute, point qui bat) |
| `components/features/SeatsGauge.tsx` | Jauge de places, pousse depuis la gauche à l'apparition |
| `data/` | Données placeholder centralisées : `menu.ts`, `events.ts`, `venue.ts` |
| `utils/date.ts · text.ts` | Formatage de dates en français (sans `Intl`) ; caractères typographiques nommés (`NBSP`, `NDASH`) |
| `features/reserve/` | Parcours de réservation simulé (bottom sheet 3 étapes) |
| `components/ui · features · layout · toast` | Composants réutilisables, composants métier, chrome de navigation, toasts |
| `hooks/useDemoFlag.ts` | Booléens persistés `demo:*` (AsyncStorage) |
| `assets/` | Icônes, splash, photos |

## Lancer l'app sur l'émulateur Android

AVD utilisé : `Guinguette_API36` (Android 36, Play Store), avec Expo Go
(`host.exp.exponent`) déjà installé. Le SDK est sous
`%LOCALAPPDATA%\Android\Sdk` ; `adb` et `emulator` ne sont pas dans le `PATH` par
défaut, il faut les y ajouter pour la session.

```bash
export PATH="$PATH:$LOCALAPPDATA/Android/Sdk/emulator:$LOCALAPPDATA/Android/Sdk/platform-tools"

# 1. Émulateur (en tâche de fond)
emulator -avd Guinguette_API36 -gpu swiftshader_indirect -no-boot-anim

# 2. Attendre le boot complet
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done

# 3. Metro (en tâche de fond, à la racine du projet)
npx expo start
# prêt quand : curl -s http://localhost:8081/status → packager-status:running

# 4. Ouvrir le projet dans Expo Go
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

Contrôle visuel sans regarder la fenêtre : `adb exec-out screencap -p > shot.png`.
Au tout premier lancement, Expo Go superpose son menu développeur à l'app — le
fermer avec `adb shell input keyevent 4`.

Pour arrêter proprement : `adb emu kill` (l'arrêt est asynchrone, revérifier avec
`adb devices`), puis `adb kill-server`.

**Piège GPU (poste actuel).** Sans `-gpu swiftshader_indirect`, l'émulateur peut
mourir sur « Android Emulator closed unexpectedly » (crash du driver graphique) ;
le log montre `Could not detect GPU properly for Vulkan emulation` et
`Failed to load opengl32sw`. Swiftshader est un rendu logiciel : plus lent, mais
fiable. Rien à voir avec l'app.

Deux messages qui ressemblent à des erreurs et n'en sont pas : « An update for
expo is available » (versions figées, voir ci-dessous) et « Running multiple
emulators with the same AVD » (une instance tient déjà le verrou — inutile d'en
relancer une).

## Règles propres au mobile

- **Versions figées sur Expo Go — ne pas « mettre à jour ».** Le projet est volontairement épinglé sur `expo@57.0.2` et les versions de `bundledNativeModules` correspondantes (`react-native-reanimated@4.5.0`, `react-native-worklets@0.10.0`, `react-native-screens@4.25.2`, `expo-router@57.0.3`…). Ces paquets ont du code natif **compilé en dur dans Expo Go** : au moindre écart de patch, Reanimated compare JS et natif au démarrage et **tue le processus sans erreur JS** — l'app retombe sur l'accueil Expo, et rien n'apparaît ni en red box ni dans le log Metro. Metro affiche « An update for expo is available » : c'est attendu, l'ignorer. La contrainte ne saute qu'en passant à un build de développement ou une release.
- **Pas de dossier `android/`.** Le prebuild natif a été supprimé (1,4 Go) : le workflow est Expo Go. Si un build de développement devient nécessaire, il se régénère par `npx expo prebuild` — mais cela fait sortir du cadre ci-dessus.
- **Aucune valeur en dur** : tout passe par `constants/theme.ts` (`colors`, `type`, `spacing`, `radius`, `shadows`, `fonts`).
- **Polices** : sur Android `fontWeight`/`fontStyle` ne s'appliquent pas à une police custom — désigner explicitement le fichier (`fonts.bodyItalic`, `fonts.label`…).
- **Pas de `babel.config.js`** : le SDK 57 fournit le preset (et le plugin worklets de Reanimated 4) par défaut ; en ajouter un casse le bundle.
- **Persistance démo** : `AsyncStorage` avec le préfixe `demo:`.
- Les listes passent par `FlatList` (jamais `ScrollView`) et leurs éléments sont mémoïsés.

## Design system « Terra Guinguette »

- **Toutes les valeurs brutes sont dans `constants/theme.ts`** : `colors` (primary rouge, secondary vert, tertiary doré), `type` (display/headline/body/label), `spacing`, `radius`, `shadows`, `fonts`. Jamais de couleur ni de valeur en dur dans un composant.
- **`tamagui.config.ts` ne fait que les exposer à Tamagui** — il n'invente aucune valeur, il importe `theme.ts`. Modifier une couleur là-bas la change partout, StyleSheet comme Tamagui. Ne jamais recopier une valeur dans la config.
- **Les couleurs d'accent passent par des thèmes, pas par des props.** Le thème définit `solid`/`onSolid` (fond plein + son texte), `soft`/`onSoft` (teinte douce + son texte), `onOutline` et `glow` (halo de pression). Thèmes disponibles : `primary` (défaut), `secondary`, `tertiary`, `dusk`, `neutral`, et `lampion` — le seul pensé pour se poser **sur une photo sombre** (texte clair, contour ambré).
- **Un seul bouton dans toute l'app.** `components/ui/Button.tsx` fixe la police, la géométrie (hauteur ≥ 44 px, padding, pilule, bordure de 2 px même transparente pour que toutes les déclinaisons fassent la même taille) et l'animation. Seules les couleurs changent, et uniquement par le thème :

  ```tsx
  <Button theme="secondary" tone="soft" size="lg" full onPress={…}>
    <Button.Icon name="check" />
    <Button.Text>Je serai là !</Button.Text>
  </Button>
  ```

  `tone` : `solid` · `soft` · `outline` · `ghost`. `size` : `sm` · `md` · `lg`. Plus `full` et `circular`. Une chaîne nue en enfant est automatiquement enveloppée dans `<Button.Text>`.
- **Une puce n'est pas un bouton.** `Chip` reste distinct (choix dans une liste, pas en capitales, état `selected`) mais partage les mêmes tokens et thèmes.
- **Trois primitives tactiles, à ne pas confondre** : `Button` pour toute *action* étiquetée ; `Chip` pour un *choix* dans une liste ; `PressableScale` pour une zone tactile qui n'est visuellement ni l'un ni l'autre (le fond qui referme la feuille de réservation, le bloc téléphone de l'écran Infos). Si ça ressemble à un bouton, c'est `Button` — ne jamais refabriquer un bouton avec `PressableScale`.
- **L'interligne a un plancher, et il se lit dans la police.** Sur RN Android, un `lineHeight` inférieur à la hauteur de ligne naturelle de la fonte (`(ascender − descender) / unitsPerEm`, table `hhea`) **coupe les jambages descendants** — sans erreur, sans avertissement. Les ratios mesurés sont dans `MIN_LINE_HEIGHT_RATIO` (`constants/theme.ts`) : **1,242 pour Berkshire Swash, 1,169 pour Karla, 1,26 pour Caveat**. Toute nouvelle taille doit les respecter ; la règle web « ~1,1 sur un titre » ne s'applique pas ici, elle rogne.
- **`caption` et `labelSm` ne sont pas interchangeables.** `labelSm` (12 px, `letterSpacing: 0.6`) est fait pour des **CAPITALES** ; ce chasse rend au contraire une phrase courante plus lâche. Pour toute mention en casse normale — dates, notes de démo, légendes, toasts — c'est `type.caption` (13 px, sans chasse).
- **Chiffres à chasse fixe** : `tabularNums` (`constants/theme.ts`) pour toute valeur qui change sous les yeux ou s'aligne en colonne. ⚠️ Ne marche que sur **Karla** : `tnum` est absent de Berkshire Swash, où la propriété serait un no-op silencieux.
- **Ponctuation française** : apostrophe courbe `’`, demi-cadratin pour les plages, cadratin pour les incises, et espace insécable avant `€`, avant une unité et avant `!`/`?`. Elle passe par les constantes nommées de `utils/text.ts` — jamais tapée au clavier, un caractère invisible dans un éditeur se fait écraser à la première retouche. `NBSP` est U+00A0 et **pas** U+202F : l'espace fine insécable, pourtant canonique en français, est absente des quatre polices du projet.
- **Échelles de police Tamagui** : `$1/$2/$3` ne valent pas la même chose selon la famille. `$body` → 14/16/18 · `$label` → 12/14/16 (chassé, pour les boutons et micro-libellés) · `$heading` et `$display` → 24/32/40 · `$accent` (Caveat) → 20/26/34. Toujours poser `fontFamily` avant de choisir une taille.
- **Animations nommées** (dans `tamagui.config.ts`, toutes en Reanimated) : `bouncy` (rebond franc, relâchement des boutons) · `quick` (réponse immédiate) · `lazy` (ample et posé, dépliages) · `medium` (changements d'état de contenu) · `halo` (le seul en timing, pour le halo de pression) · `fade`. En ajouter une se fait là et nulle part ailleurs.
- Polices : **Berkshire Swash** (display + headline), **Karla** (corps, labels), **Caveat** (accents manuscrits type « Sous les lampions »), chargées via `@expo-google-fonts/*`. Berkshire Swash a été retenue au chantier 0 le 3 août 2026, en remplacement de Fraunces : empattements à swash, esprit enseigne peinte. **Une seule graisse existe (400)** — la hiérarchie des titres passe donc uniquement par la taille.
- **Berkshire Swash et Caveat sont deux écritures parentes**, et c'est assumé. Caveat garde son rôle d'accent manuscrit rare (« Sous les lampions »), mais les deux se ressemblent davantage qu'avec Fraunces : ne pas les empiler ailleurs que sur l'accueil sans regarder le résultat.
- ⚠️ **La pile du site jumeau est à vérifier, pas à recopier.** L'ancienne version de ce fichier affirmait que `../Guinguette_Web` tourne sur Bricolage Grotesque / Be Vietnam Pro : c'est inexact. Son design system (`src/main.css`) déclare Fraunces / Karla / Caveat, et seules trois pages (`la-carte`, `soirees-bal`, `infos-pratiques`) chargent encore Bricolage / Be Vietnam — des `<link>` hérités de `stitch-export/` qui n'ont jamais été nettoyés. Depuis le passage à Berkshire Swash, **les deux projets divergent réellement** pour la première fois.
- Pas de dark mode : `userInterfaceStyle` est figé sur `light` dans `app.json`.

## Conventions du projet

- **Parcours simulés** : toute interaction « transactionnelle » (réserver, s'inscrire…) se termine par un état de confirmation local, sans requête réseau. Si un état doit persister, `AsyncStorage` avec le préfixe `demo:`.
- **Navigation : ne jamais la réécrire dans un écran.** Header, barre d'onglets, transition (`sceneStyleInterpolator` + `transitionSpec`) et geste de swipe sont définis dans `app/(tabs)/_layout.tsx` (source unique) ; toute modification de nav se fait là. Le swipe enveloppe les écrans via `screenLayout`, donc aucun écran n'a à le savoir.
- **Tout défilement horizontal doit porter `useSwipeGuard()`.** Sans lui, un doigt qui fait défiler une rangée de puces change *aussi* d'onglet — les deux gestes sont identiques. `<ScrollView horizontal {...useSwipeGuard()} />` suffit. C'est pour cette raison que l'affiche « À l'affiche » se change au toucher et non au glissement.
- **Données placeholder** : centralisées dans `data/` — modifier la démo pour un prospect = éditer ces fichiers, jamais les écrans. Les dates d'événements doivent être générées relatives à aujourd'hui pour que la démo ne paraisse jamais périmée.
- **`data/events.ts` : `startsAt` est la source, tout le reste en découle.** C'est une vraie `Date` (jour *et* heure) qui alimente le compte à rebours ; le libellé `when` en est dérivé par `withDerivedLabels()`, jamais saisi à la main. Chaque soirée porte aussi un `theme` (`primary` | `secondary` | `tertiary`) qui peint sa carte entière — c'est là qu'on change la couleur d'une soirée, pas dans `EventCard`.
- Zones tactiles ≥ 44 px, feedback tactile sur tout élément interactif (le hover n'existe pas).
- **`prefers-reduced-motion` doit être respecté**, et c'est à l'appelant de le faire — ni Tamagui ni les composants ne le devinent. La convention du projet :
  - lire `useReducedMotion()` de **Reanimated** (pas `AccessibilityInfo` à la main, le hook s'abonne aux changements) ;
  - sur un composant Tamagui, passer `transition={reduceMotion ? null : 'bouncy'}` — `null` désactive, il ne fige pas à mi-course ;
  - sur une animation Reanimated écrite à la main, ajouter `reduceMotion: ReduceMotion.System` à la config du ressort ou du timing ;
  - les animations purement décoratives (le halo du bouton, le point qui bat du compte à rebours) ne sont pas atténuées mais **pas jouées du tout**.

## Pièges connus

- **Deux props `transition` cohabitent, et elles n'ont rien à voir.** Sur un composant Tamagui, `transition` prend un *nom d'animation* (`transition="bouncy"`). Sur `<Image>` d'expo-image, `transition` prend une *durée en millisecondes* (`transition={250}`). Même nom, sens opposé : lire le composant avant de toucher.
- **Tamagui 2 ≠ Tamagui 1**, et la plupart des exemples en ligne (y compris le skill `tamagui`) décrivent la v1 :
  - la prop d'animation s'appelle **`transition`**, pas `animation` (`transition="bouncy"`) ;
  - l'augmentation de types doit viser **`@tamagui/web`**, le module où `TamaguiCustomConfig` est *déclarée*. Augmenter `'tamagui'`, qui ne fait que la ré-exporter, crée une seconde interface au lieu de fusionner : les tokens et les animations restent alors inconnus du typage, sans message clair.
- **Le compilateur Tamagui n'est pas activé** (il faudrait un `babel.config.js`, interdit ici). Tamagui tourne en mode runtime : c'est sans conséquence sur cette app, et l'extraction CSS ne sert de toute façon que sur le web.
- **Installer un paquet casse le bundle si on passe par `--legacy-peer-deps`.** `npm install` échoue sur ce projet avec une erreur `ERESOLVE` : `react-dom` et `react` doivent être en version identique. Le réflexe `--legacy-peer-deps` fait passer l'installation **mais retire `react-dom` de l'arbre** — et `@tamagui/popper` l'importe depuis `Popper.native.js`, y compris sur natif. Le bundle meurt alors sur `Unable to resolve "react-dom"`, très loin de la cause. `react-dom` est désormais une dépendance explicite alignée sur `react` (19.2.3), ce qui supprime le conflit à la racine : `npm install` passe sans drapeau. **Si le conflit revient, réaligner les deux versions plutôt que de forcer.**
- `npx expo-doctor` signale en permanence deux échecs **attendus** : les écarts de version (le pinning est volontaire, voir plus haut) et un doublon `expo-font` qu'`expo` embarque lui-même. Ni l'un ni l'autre ne vient du code.
- Le projet vit sous `C:\Users\jonat\source\repos\Guinguette_Mobile` — **pas** sous OneDrive (une ancienne version de ce fichier l'indiquait à tort).
- `.claude/skills/react-native-expert` est une **copie** de `.agents/skills/react-native-expert`, pas un lien symbolique (le mode développeur Windows n'était pas actif à la création). Modifier `.agents/` implique de recopier.
- **Les skills ne sont pas versionnés, et c'est volontaire.** `.agents/` et `.claude/skills/` sont exclus du dépôt : ce sont des contenus tiers, et surtout `.agents/skills/better-typography` est une **jonction Windows vers `C:\Users\<toi>\.agents\`** — git la suivrait et publierait un morceau du dossier personnel. Leur provenance est enregistrée dans `skills-lock.json`, qui est versionné et suffit à les réinstaller. Même logique pour `.claude/settings.local.json`, propre à la machine.
