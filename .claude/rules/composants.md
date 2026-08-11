---
paths:
  - "components/**"
---

# Référence des composants

> À consulter **avant** de réutiliser un composant existant, ou d'en ajouter
> un nouveau — pour voir sa surface de props sans ouvrir le fichier source.

Cette page ne fait qu'un métier : lister les props de chaque composant.
Le **pourquoi** (arbitrages, pièges, historique) reste dans `.claude/rules/design-system.md`,
`.claude/rules/ecrans.md`, ou le commentaire d'en-tête du fichier concerné — pas
recopié ici, pour ne pas avoir deux sources à tenir à jour. Repéré comme gap le
11 août 2026 (audit de santé du design system) ; tenue à la main, pas générée —
aucun outil ne la vérifie, à relire à l'œil quand une prop change.

## `components/ui/` — primitives

| Composant | Props | Rôle |
|---|---|---|
| `Button` (+ `Button.Text`, `Button.Icon`) | `size?: 'sm'\|'md'\|'lg'` (déf. `md`) · `tone?: 'solid'\|'soft'\|'outline'\|'ghost'\|'glass'` (déf. `solid`) · `full?`, `circular?`, `disabled?: boolean` · `emphasis?: boolean` (déf. `false`, `tone="glass"` uniquement) · `blurTarget?: RefObject<View>` (Android, `tone="glass"` uniquement) · `theme` (prop Tamagui : `primary`\|`secondary`\|`tertiary`\|`dusk`\|`neutral`\|`lampion`) · `children`, `onPress`, `onPressIn` | LE bouton de l'app — toute action étiquetée. Détail : `design-system.md`. |
| `Chip` | `label: string` · `value: string` · `selected: boolean` · `onSelect: (value: string) => void` | Un choix dans une liste (filtres, créneaux) — pas une action. |
| `PressableScale` | `style?: ViewStyle \| ViewStyle[]` · `scaleTo?: number` (déf. `0.95`) · le reste de `PressableProps` | Zone tactile brute (compression au doigt), ni bouton ni puce. |
| `Icon` | `name: IconName` (liste fermée, voir le fichier) · `size?: number` (déf. `24`) · `color?: ColorValue` (déf. `colors.onSurface`) · `strokeWidth?: number` (déf. `1.75`) | Jeu de pictogrammes au trait, dessinés à la main. |
| `SocialIcon` | `name: 'facebook' \| 'instagram' \| 'website'` · `size?: number` (déf. `20`) · `color?: ColorValue` (lu seulement par `website`) | Icônes de marque en vraies couleurs — seule exception au thème courant, voir `design-system.md`. |
| `Reveal` | `children` · `delay?: number` (déf. `0`) · `fadeOnly?: boolean` (déf. `false`) · `style?: StyleProp<ViewStyle>` · `onLayout?: (e) => void` | Apparition en fondu échelonnée à l'arrivée sur l'écran. |
| `Guirlande` | `width?: number` (déf. `200`) · `active?: boolean` (déf. `true`) | La guirlande lumineuse scintillante — signature graphique du projet. |

## `components/features/` — blocs métier

| Composant | Props | Rôle |
|---|---|---|
| `HypeGauge` | `hype: number` (0–1, `data/events.ts`) · `boosted: boolean` | Jauge d'ambiance d'une soirée, pas un compteur de places. |
| `SpotlightParts` | *(pas un composant — exporte `Kicker`, `PosterShell`, `PosterContent`, `PosterTitle`, `PosterMeta`, `DotTarget`, `DotBar` (`active?: boolean`), `Pane`, `Body`, `tagLabelStyle`, `POSTER_HEIGHT`)* | Habillage commun aux deux sections de Soirées — aucune mécanique propre. |
| `EventSpotlight` | `kicker: string` · `event: GuinguetteEvent` · `pageLabel?: string` | « À l'affiche » — affiche + panneau d'une soirée, une page du journal. |
| `EventDetailPane` | `event: GuinguetteEvent` | Programme, jauge d'ambiance, tarif et bouton « J'y serai » d'une soirée. |
| `ArtistSpotlight` | `kicker: string` · `artist: Artist` · `event: GuinguetteEvent` | « Artist Spot » — affiche + fiche de l'artiste de **cette** soirée. |
| `ArtistDetailPane` | `artist: Artist` · `event: GuinguetteEvent` | Bio, style musical et liens (site/Instagram/Facebook) de l'artiste. |
| `NewspaperPager<T>` | `pages: T[]` · `initialIndex?: number` (déf. `0`) · `keyExtractor: (page: T) => string` · `renderPage: (page: T) => ReactNode` · `onPageChange?: (index, page) => void` · `contentContainerStyle?`, `style?: ViewStyle` · `ref?: Ref<NewspaperPagerHandle>` (`{ goTo(index) }`) | Le feuilletage façon journal — générique, réutilisable ailleurs que Soirées. Réglages de ressenti dans l'objet `TURN`, pas une prop. |
| `MenuBlockView` | `block: MenuBlock` (union `kind: 'feature' \| 'list'`) | Un bloc de La Carte — suggestion repliable illustrée, ou liste de prix. |

## `components/layout/` — chrome de navigation

| Composant | Props | Rôle |
|---|---|---|
| `AppHeader` | `floating?: boolean` (déf. `false`) | Barre supérieure, source unique de la navigation haute (branchée dans `app/(tabs)/_layout.tsx`). |
| `TabIcon` | `name: IconName` · `color: ColorValue` (fourni par le navigateur) · `focused: boolean` | Icône d'un onglet de la barre du bas. |

## `components/toast/`

| Composant | Props | Rôle |
|---|---|---|
| `ToastProvider` | `children` — expose le hook `useToast(): { showToast(message: string) }` | Toasts de confirmation empilés au-dessus de la barre d'onglets. |
