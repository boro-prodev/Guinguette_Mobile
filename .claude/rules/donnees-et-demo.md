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

## `data/events.ts` : `startsAt` est la source, tout le reste en découle

C'est une vraie `Date` (jour *et* heure) qui alimente le compte à rebours. Le
libellé `when` en est **dérivé** par `withDerivedLabels()`, jamais saisi à la
main.

Les dates doivent être générées **relatives à aujourd'hui** pour que la démo ne
paraisse jamais périmée, quel que soit le jour où on la montre.

Chaque soirée porte aussi un `theme` (`primary` | `secondary` | `tertiary`) qui
peint sa carte entière — c'est **là** qu'on change la couleur d'une soirée, pas
dans `EventCard`.

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
