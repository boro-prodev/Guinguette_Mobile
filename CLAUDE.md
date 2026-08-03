# La Guinguette de Oignies — Application mobile (démo)

Application React Native (Expo) pour une guinguette à Viroinval (Belgique).
**Tout le contenu visible est en français.**

**Ce fichier est un sommaire.** Il contient ce qu'il faut savoir *tout le temps* ;
le détail vit dans `.claude/rules/`, à ouvrir selon ce qu'on touche (voir
l'index plus bas). Ce qui est *prévu* mais pas encore fait vit dans `ROADMAP.md`.

**Projet jumeau :** le site web vit dans `../Guinguette_Web` (Vite + Tailwind).
Les deux projets sont **indépendants** — aucune dépendance de code, aucun fichier
partagé. Toute synchronisation est manuelle et volontaire.

## Nature du projet — À LIRE EN PREMIER

Cette application est un **modèle de démonstration**, pas (encore) une app de
production :

1. **Toutes les données sont des placeholders** — menu, prix, dates, horaires,
   adresse, téléphone. Les garder plausibles et en français, sans s'inquiéter de
   leur exactitude.
2. **Les parcours sont fonctionnels mais simulés** : une action mène jusqu'à un
   écran de confirmation, avec validation et retours visuels, **mais n'envoie
   rien** — aucun backend, aucun appel réseau, aucune collecte.
3. **Tout se conçoit pour un téléphone** (~360–430 px de large).
4. Objectif : montrer l'app à un prospect comme démonstration d'interface
   aboutie.

## Les cinq règles qu'on ne transgresse jamais

Elles priment, même sans avoir ouvert le fichier de règles correspondant.

1. **Aucune valeur en dur.** Couleurs, tailles, espacements, rayons, ombres,
   polices : tout passe par `constants/theme.ts`.
2. **Un seul bouton.** `components/ui/Button.tsx`. On le décline par thème et par
   variante — on n'en refabrique jamais un second.
3. **Versions figées sur Expo Go.** Ne jamais « mettre à jour » les paquets à
   code natif, et **jamais** installer avec `--legacy-peer-deps`.
4. **Rien n'est envoyé.** Aucun réseau, aucune collecte. La persistance se fait
   en `AsyncStorage` avec le préfixe `demo:`.
5. **Zones tactiles ≥ 44 px** et `prefers-reduced-motion` respecté, à la charge
   de l'appelant.

## Index des règles

| Fichier | L'ouvrir avant de… |
|---|---|
| `.claude/rules/environnement.md` | lancer l'app (émulateur ou téléphone), installer un paquet, toucher aux versions, committer |
| `.claude/rules/design-system.md` | toucher à une couleur, un espacement, un bouton, une animation ; ajouter un composant visuel |
| `.claude/rules/typographie.md` | poser une taille de texte ou un interligne, écrire un libellé, rédiger du contenu français |
| `.claude/rules/ecrans.md` | toucher à la navigation, à un défilement, à une animation, au fond vidéo de l'accueil |
| `.claude/rules/donnees-et-demo.md` | modifier le contenu de la démo, ajouter un parcours, persister un état |
| `ROADMAP.md` | entamer un chantier sur Accueil, Soirées ou La Carte |

## Stack & commandes

- Expo SDK 57 · React Native 0.86 · **Expo Router** (onglets) · TypeScript strict
  · Reanimated 4 + Gesture Handler · **Tamagui 2** (design system) ·
  **expo-video** (fond de l'accueil).
- `npm start` (Metro / Expo Go) · `npm run android` · `npm run ios`.
- **Vérification standard après modification** : `npx tsc --noEmit`, puis
  `npx expo-doctor`, puis contrôle visuel sur émulateur ou Expo Go.
- Pas de tests, pas de linter configurés.
- Dépôt : `boro-prodev/Guinguette_Mobile` sur GitHub, **privé**, branche `main`.

## Structure

| Chemin | Rôle |
|---|---|
| `ROADMAP.md` | **Prochaines étapes** — chantiers à venir et questions ouvertes |
| `.claude/rules/` | Les règles détaillées, par domaine (voir l'index ci-dessus) |
| `app/_layout.tsx` | Racine : polices, safe-area, `TamaguiProvider`, `ToastProvider`, `ReserveProvider` |
| `app/(tabs)/_layout.tsx` | **Source unique de la navigation** (header, onglets, transition, swipe) |
| `app/(tabs)/index · carte · soirees · infos` | Les 4 écrans (accueil, menu, événements, infos pratiques) |
| `constants/theme.ts` | **Valeurs brutes du design system** (couleurs, échelle typo, spacing, radius, ombres, polices) |
| `tamagui.config.ts` | Expose `theme.ts` à Tamagui : tokens, polices, thèmes d'accent, animations |
| `components/ui/Button.tsx` | **LE bouton de l'app** — un seul objet, décliné par thème |
| `components/ui/PressableScale.tsx` | Zone tactile brute — **pas** un bouton |
| `components/layout/SwipeTabs.tsx` | Navigation au doigt entre onglets (+ `useSwipeGuard`) |
| `components/features/EventSpotlight.tsx` | « À l'affiche » : une soirée en grand, fondu enchaîné, pagination |
| `components/features/Countdown.tsx` | Compte à rebours vivant (retick chaque minute, point qui bat) |
| `components/features/SeatsGauge.tsx` | Jauge de places, pousse depuis la gauche à l'apparition |
| `features/reserve/` | Parcours de réservation simulé (bottom sheet 3 étapes) |
| `data/` | Données placeholder : `menu.ts`, `events.ts`, `venue.ts` |
| `utils/date.ts · text.ts` | Dates en français (sans `Intl`) ; caractères typographiques nommés (`NBSP`, `NDASH`) |
| `hooks/useDemoFlag.ts` | Booléens persistés `demo:*` (AsyncStorage) |
| `components/ui · features · layout · toast` | Composants réutilisables, métier, chrome de navigation, toasts |
| `assets/` | Icônes, splash, photos, et `videos/accueil.mp4` (fond de l'accueil) |

## Tenir ce fichier à jour

`CLAUDE.md` décrit l'app **telle qu'elle est**. Quand une règle change :
la modifier dans le fichier de `.claude/rules/` concerné, et ne remonter ici que
si elle rejoint les cinq règles d'or ou change la structure. Un sommaire qui
grossit redevient un pavé.
