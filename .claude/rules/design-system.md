---
paths:
  - "components/**"
  - "constants/theme.ts"
  - "tamagui.config.ts"
---

# Design system « Terra Guinguette »

> À lire **avant** de toucher à une couleur, un espacement, un bouton, une
> animation, ou d'ajouter un composant visuel.
> La typographie a son propre fichier : `.claude/rules/typographie.md`.

## Où vivent les valeurs

- **Toutes les valeurs brutes sont dans `constants/theme.ts`** : `colors`
  (primary rouge, secondary vert, tertiary doré), `type`
  (display/headline/body/label), `spacing`, `radius`, `shadows`, `fonts`.
  **Jamais de couleur ni de valeur en dur dans un composant.**
- **`tamagui.config.ts` ne fait que les exposer à Tamagui** — il n'invente
  aucune valeur, il importe `theme.ts`. Modifier une couleur là-bas la change
  partout, StyleSheet comme Tamagui. Ne jamais recopier une valeur dans la
  config.
- Pas de dark mode : `userInterfaceStyle` est figé sur `light` dans `app.json`.

## Les accents passent par des thèmes, pas par des props

Le thème définit `solid`/`onSolid` (fond plein + son texte), `soft`/`onSoft`
(teinte douce + son texte), `onOutline` et `glow` (halo de pression).

Thèmes disponibles : `primary` (défaut), `secondary`, `tertiary`, `dusk`,
`neutral`, et `lampion` — le seul pensé pour se poser **sur une photo sombre**
(texte clair, contour ambré).

## Un seul bouton dans toute l'app

`components/ui/Button.tsx` fixe la police, la géométrie (hauteur ≥ 44 px,
padding, pilule, bordure de 2 px même transparente pour que toutes les
déclinaisons fassent exactement la même taille) et l'animation. Seules les
couleurs changent, et uniquement par le thème :

```tsx
<Button theme="secondary" tone="soft" size="lg" full onPress={…}>
  <Button.Icon name="check" />
  <Button.Text>Je serai là !</Button.Text>
</Button>
```

`tone` : `solid` · `soft` · `outline` · `ghost` · `glass`. `size` : `sm` · `md` ·
`lg`. Plus `full`, `circular` et `emphasis`. Une chaîne nue en enfant est
automatiquement enveloppée dans `<Button.Text>`.

`tone="glass"` — flou natif (`expo-blur`, livré avec Expo Go) derrière un
voile teinté par `$solid` du thème courant, pensé pour se poser sur une photo
comme `lampion` avant lui (texte toujours clair, via `$surface` et non
`$onOutline` — ce dernier vire sombre sur `dusk`/`neutral`, illisible une fois
flouté). `emphasis` y ajoute un anneau ambré permanent qui bat (même
mécanique que le point du `Countdown`) : de quoi garder un rang principal
quand deux boutons `glass` partagent sinon le même traitement, sans revenir à
un aplat de couleur.

⚠️ **Sur Android, `tone="glass"` ne floute QUE si l'appelant passe
`blurTarget`.** Depuis expo-blur 57, `dimezisBlurView` ne floute pas « ce qu'il
y a dessous » tout seul : il lui faut la référence d'un `BlurTargetView` qui
enveloppe explicitement le contenu à flouter. Sans elle, expo-blur retombe
silencieusement sur un voile semi-transparent, en le signalant à chaque montage
(« the `blurTarget` prop has not been configured » — deux fois au démarrage,
une par bouton de l'accueil, jusqu'au 5 août 2026).
`app/(tabs)/index.tsx` est le montage de référence : **une seule** cible
enveloppe tout le fond (photo, vidéo, voile, dégradés) et sert les **deux**
boutons — expo-blur l'autorise tant qu'ils tiennent dans ses limites, et une
cible par bouton coûterait une capture de plus par image. Ce qui doit
apparaître dans le verre vit donc dans cette cible ; ce qui reste dehors n'y
apparaîtra pas — un bouton ne se floute pas lui-même.

## Trois primitives tactiles, à ne pas confondre

| Primitive | Pour quoi |
|---|---|
| `Button` | Toute **action** étiquetée |
| `Chip` | Un **choix** dans une liste — pas en capitales, état `selected` |
| `PressableScale` | Une zone tactile qui n'est visuellement ni l'un ni l'autre : le fond qui referme la feuille de réservation, le bloc téléphone de l'écran Infos |

**Si ça ressemble à un bouton, c'est `Button`** — ne jamais en refabriquer un
avec `PressableScale`. `Chip` partage les mêmes tokens et thèmes que `Button`
mais reste un objet distinct.

Zones tactiles **≥ 44 px** et feedback tactile sur tout élément interactif : le
hover n'existe pas sur téléphone.

## Animations nommées

Déclarées dans `tamagui.config.ts`, toutes en Reanimated. **En ajouter une se
fait là et nulle part ailleurs.**

| Nom | Rôle |
|---|---|
| `bouncy` | Rebond franc — relâchement des boutons |
| `quick` | Réponse immédiate — compression sous le doigt |
| `lazy` | Ample et posé — dépliages, panneaux |
| `medium` | Changements d'état de contenu |
| `halo` | Le seul en `timing` — halo de pression |
| `fade` | Fondu court, sans mouvement |

## Pièges Tamagui

- **Deux props `transition` cohabitent, et elles n'ont rien à voir.** Sur un
  composant Tamagui, `transition` prend un *nom d'animation*
  (`transition="bouncy"`). Sur `<Image>` d'expo-image, `transition` prend une
  *durée en millisecondes* (`transition={250}`). Même nom, sens opposé : lire le
  composant avant de toucher.
- **Tamagui 2 ≠ Tamagui 1**, et la plupart des exemples en ligne (y compris le
  skill `tamagui`) décrivent la v1 :
  - la prop d'animation s'appelle **`transition`**, pas `animation` ;
  - l'augmentation de types doit viser **`@tamagui/web`**, le module où
    `TamaguiCustomConfig` est *déclarée*. Augmenter `'tamagui'`, qui ne fait que
    la ré-exporter, crée une seconde interface au lieu de fusionner : les tokens
    et les animations restent alors inconnus du typage, sans message clair.
- **Le compilateur Tamagui n'est pas activé** (il faudrait un `babel.config.js`,
  interdit ici). Tamagui tourne en mode runtime : sans conséquence sur cette
  app, et l'extraction CSS ne sert de toute façon que sur le web.
- **Déclarer une graisse qui n'existe pas fait synthétiser un faux gras à iOS.**
  `displayFont.weight` vaut `'400'` parce que Berkshire Swash n'a que cette
  graisse. Android ignorerait la demande ; iOS, lui, fabriquerait un gras
  approximatif.
- **Une nouvelle couleur posée dans un `variant` d'un cadre animé
  (`transition` non nul) peut planter Reanimated**, rencontré en ajoutant
  `tone="glass"` à `Button.tsx` : `Cannot create property 'onStart' on number
  '999'` — Reanimated confondait le `borderColor` inédit du variant avec le
  rayon de pilule (999). Reproductible même avec `transition={null}` posé sur
  l'instance ; le seul contournement fiable a été de ne **jamais** introduire
  de couleur nouvelle dans les `variants` d'un cadre animé, et de la poser à
  la place sur un `View` React Native statique, superposé en enfant (cf.
  `ButtonGlassFill` dans `Button.tsx`).
