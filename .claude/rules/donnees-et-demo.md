---
paths:
  - "data/**"
  - "hooks/useDemoFlag.ts"
  - "features/reserve/**"
---

# Données placeholder et parcours simulés

> À lire **avant** de modifier le contenu de la démo, d'ajouter un parcours
> « transactionnel », ou de persister quoi que ce soit.

## Toutes les données sont des placeholders

Menu, prix, dates de soirées, horaires, adresse (Rue de Revin 16,
5670 Viroinval) et téléphone (0490 007 007) sont du **contenu d'exemple**,
modifiable sans validation métier. Ne pas s'inquiéter de leur exactitude ; les
garder plausibles et en français.

**Elles sont centralisées dans `data/`** — adapter la démo pour un prospect
consiste à éditer `menu.ts`, `events.ts`, `venue.ts`, **jamais les écrans**.

## `data/menu.ts` : une catégorie = une suggestion, puis une liste

Chaque catégorie tient en **deux blocs**, et toujours dans cet ordre : un
`feature` (le produit mis en avant, en grande photo, badge « Suggestion de
saison ») puis un `list` (tout le reste, sans image). Ajouter une catégorie,
c'est ajouter ces deux blocs **et** sa puce dans `MENU_FILTERS` — dont l'ordre
est celui des puces à l'écran, la **première** étant celle sur laquelle l'écran
s'ouvre.

⚠️ **La description d'une suggestion doit décrire sa photo.** Elles sont
placeholder, mais elles se lisent côte à côte : une « bière blonde » sous une
bouteille de cidre rosé se voit immédiatement en démo (rencontré le 6 août
2026).

## `data/events.ts` : `startsAt` est la source, tout le reste en découle

C'est une vraie `Date` (jour *et* heure) qui alimente le compte à rebours. Le
libellé `when` en est **dérivé** par `withDerivedLabels()`, jamais saisi à la
main.

Les dates doivent être générées **relatives à aujourd'hui** pour que la démo ne
paraisse jamais périmée, quel que soit le jour où on la montre.

Chaque soirée porte aussi un `theme` (`primary` | `secondary` | `tertiary`) qui
peint sa carte entière — c'est **là** qu'on change la couleur d'une soirée, pas
dans `EventSpotlight`/`EventDetailPane`.

## `data/artists.ts` : le roster d'« Artist Spot »

Chaque `Artist` reste relié à une soirée précise de `events.ts` via
`eventId` — passée ou à venir, la démo simule un vrai calendrier. Cette
référence alimente le compte à rebours de l'affiche d'Artist Spot ; rien
n'est dupliqué (pas de `startsAt`/`when` propre à `Artist`).

`website?` / `instagram?` / `facebook?` restent vides tant qu'aucune URL
réelle n'est fournie : chaque pastille de lien du panneau s'affiche alors
désactivée plutôt que de risquer un lien mort en pleine démo client — même
posture que le reste de la démo.

⚠️ Un artiste lié à une soirée **passée** ne doit jamais afficher de compte à
rebours (`Countdown`) : `utils/date.ts` → `formatCountdown` répond
« C'est maintenant ! » sans limite de durée une fois `startsAt` dépassé.
`ArtistSpotlight` ne monte `<Countdown>` que si la soirée liée est à venir.

## Parcours simulés

Toute interaction « transactionnelle » (réserver, s'inscrire…) doit :

1. guider l'utilisateur jusqu'à un **écran de confirmation**, avec validation et
   retours visuels ;
2. **ne rien envoyer** — aucun backend, aucun appel réseau, aucune collecte
   réelle ;
3. porter une mention discrète, par convention « Démo — aucune donnée n'est
   envoyée ».

Cette mention est du contenu de premier plan, pas une note de bas de page : ne
jamais la rendre illisible en l'atténuant.

## Persistance

`AsyncStorage`, toujours avec le préfixe **`demo:`** (`hooks/useDemoFlag.ts`
pour les booléens, `demo:reservation` pour la feuille de réservation).

## Seule sortie externe admise

`Linking.openURL` pour ouvrir un lien dans le navigateur — le bouton « M'y
rendre » de l'écran Infos crée le précédent. Ça reste dans le cadre : on n'envoie
rien, on ouvre un lien.
