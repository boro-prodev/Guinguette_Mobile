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

⚠️ `venue.email`/`venue.website` ont existé un temps le 7 août 2026, pour une
version de la carte de contact d'Infos qui les affichait — retirés le jour
même quand cette carte s'est resserrée sur l'essentiel (appeler, SMS,
localisation). Ne pas les rajouter sans un vrai appelant.

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
référence alimente le titre, la date et le thème affichés sur l'affiche
d'Artist Spot ; rien n'est dupliqué (pas de `startsAt`/`when` propre à
`Artist`).

`website?` / `instagram?` / `facebook?` restent vides tant qu'aucune URL
réelle n'est fournie : chaque pastille de lien du panneau s'affiche alors
désactivée plutôt que de risquer un lien mort en pleine démo client — même
posture que le reste de la démo.

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

⚠️ **Exception volontaire : « J'y serai » (`EventDetailPane`) ne persiste
plus.** Il passait par `useDemoFlag('rsvp:<id>')` jusqu'au 7 août 2026 —
retiré ce jour-là, demande de Jonathan : coché une fois pendant un essai, il
restait coché à la relance suivante de l'app, y compris pour démarrer une
démo devant un nouveau prospect. `enabled` est redevenu un simple `useState`
local dans `EventDetailContent` : le bouton bascule toujours normalement
pendant que l'écran reste ouvert (toast, jauge d'ambiance qui bondit), mais
repart à `false` à chaque montage. Ne pas le repasser sur `useDemoFlag` sans
revalider ce choix.

## Seule sortie externe admise

`Linking.openURL` pour ouvrir un lien — Google Maps (`venue.mapsUrl`) crée le
précédent. La carte de contact d'Infos (`app/(tabs)/infos.tsx`) l'étend à deux
autres schémas, chacun sur sa propre ligne (`ContactLine`) :

| Schéma | Depuis | Ouvre |
|---|---|---|
| `tel:${venue.phoneDial}` | Ligne téléphone | Le clavier d'appel, numéro déjà composé |
| `sms:${venue.phoneDial}` | Ligne « Envoyer un SMS » | L'app de messages, numéro déjà rempli |

`venue.phoneDial` est le format sans espaces prévu pour ça dans
`data/venue.ts`. Toujours dans le cadre : on n'envoie rien, on ouvre une app
système avec un champ pré-rempli, l'utilisateur reste maître d'envoyer ou non.
