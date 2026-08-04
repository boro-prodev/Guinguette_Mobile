---
paths:
  - "components/**"
  - "constants/theme.ts"
  - "utils/text.ts"
  - "data/**"
---

# Typographie

> À lire **avant** de poser une taille de texte, un interligne, un libellé, ou
> d'écrire du contenu visible en français.

## Les polices

**Berkshire Swash** (display + headline) · **Karla** (corps, libellés) ·
**Caveat** (accents manuscrits type « Sous les lampions »), chargées via
`@expo-google-fonts/*`.

Berkshire Swash a été retenue au chantier 0 le 3 août 2026, en remplacement de
Fraunces : empattements à swash, esprit enseigne peinte. **Une seule graisse
existe (400)** — la hiérarchie des titres passe donc uniquement par la taille,
jamais par le poids.

Sur Android, `fontWeight`/`fontStyle` ne s'appliquent pas à une police custom :
désigner explicitement le fichier (`fonts.bodyItalic`, `fonts.label`…).

**Berkshire Swash et Caveat sont deux écritures parentes**, et c'est assumé.
Caveat garde son rôle d'accent manuscrit rare, mais les deux se ressemblent
davantage qu'avec Fraunces : ne pas les empiler ailleurs que sur l'accueil sans
regarder le résultat.

⚠️ **La pile du site jumeau est à vérifier, pas à recopier.** Le design system de
`../Guinguette_Web` (`src/main.css`) déclare Fraunces / Karla / Caveat ; seules
trois pages chargent encore Bricolage Grotesque / Be Vietnam Pro — des `<link>`
hérités de `stitch-export/` jamais nettoyés. Depuis le passage à Berkshire Swash,
**les deux projets divergent réellement** pour la première fois.

## L'interligne a un plancher, et il se lit dans la police

Sur RN Android, un `lineHeight` inférieur à la hauteur de ligne naturelle de la
fonte (`(ascender − descender) / unitsPerEm`, table `hhea`) **coupe les jambages
descendants** — sans erreur, sans avertissement.

Les ratios mesurés sont dans `MIN_LINE_HEIGHT_RATIO` (`constants/theme.ts`) :

| Police | Plancher |
|---|---|
| Berkshire Swash | **1,242** |
| Karla | **1,169** |
| Caveat | **1,26** |

Toute nouvelle taille doit les respecter. **La règle web « ~1,1 sur un titre »
ne s'applique pas ici** : elle rogne. C'était tout le chantier 1b — le « g » de
Oignies coupé.

Si la police d'affichage change un jour, relever `unitsPerEm`, `ascender` et
`descender` de la table `hhea` du nouveau `.ttf` et reporter le ratio.

## `caption` et `labelSm` ne sont pas interchangeables

- `labelSm` — 12 px, `letterSpacing: 0.6`. Fait pour des **CAPITALES**. Ce chasse
  rend au contraire une phrase courante plus lâche et plus difficile à lire.
- `type.caption` — 13 px, sans chasse. Pour toute mention en **casse normale** :
  dates, notes de démo, légendes, toasts.

La casse est une **présentation** : écrire le texte en casse naturelle et poser
`textTransform: 'uppercase'` au style. Jamais de capitales tapées dans le
contenu ni de `.toUpperCase()` en JS.

## Chiffres à chasse fixe

`tabularNums` (`constants/theme.ts`) sur toute valeur qui **change sous les
yeux** (compte à rebours) ou qui **s'aligne en colonne** (horaires, programme).

⚠️ **Ne marche que sur Karla** : `tnum` est absent de Berkshire Swash, où la
propriété serait un no-op silencieux. Inutile de l'essayer sur les prix de la
carte ou le compteur de couverts.

## Ponctuation française

Apostrophe courbe `’`, demi-cadratin `–` pour les plages, cadratin `—` pour les
incises, et **espace insécable** avant `€`, avant une unité et avant `!`/`?`.

Elle passe par les constantes nommées de `utils/text.ts` (`NBSP`, `NDASH`) —
**jamais tapée au clavier** : un caractère invisible dans un éditeur se fait
écraser à la première retouche.

`NBSP` est **U+00A0** et **pas U+202F**. L'espace fine insécable, pourtant la
forme canonique en français, est absente du `cmap` des trois polices du projet :
elle basculerait sur la police de repli.

Assistants existants : `eur()` dans `data/menu.ts`, `range()` dans
`data/venue.ts`. Les réutiliser plutôt que de reformer « 14€ » à la main.

## Échelles de police Tamagui

`$1/$2/$3` ne valent pas la même chose selon la famille. **Toujours poser
`fontFamily` avant de choisir une taille.**

| Famille | Tailles |
|---|---|
| `$body` | 14 / 16 / 18 |
| `$label` | 12 / 14 / 16 (chassé — boutons, micro-libellés) |
| `$heading` et `$display` | 24 / 32 / 40 |
| `$accent` (Caveat) | 20 / 26 / 34 |

## Texte sur fond mouvant ou photographique

Ne **jamais** atténuer un texte par `opacity` sur un fond qu'on ne maîtrise pas.
Utiliser un voile derrière lui et une ombre portée — voir la section vidéo dans
`.claude/rules/ecrans.md`.
