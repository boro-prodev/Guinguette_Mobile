/**
 * Artist Spot — DÉMO : roster placeholder des artistes déjà venus ou à venir.
 *
 * Chaque artiste reste relié à une soirée précise de `events.ts` via
 * `eventId` — passée ou à venir, la démo simule un vrai calendrier. C'est
 * cette référence qui alimente le compte à rebours (ou sa date passée) sur
 * l'affiche d'Artist Spot ; rien n'est dupliqué ici.
 *
 * `website`/`instagram`/`facebook` restent vides tant qu'aucune URL réelle
 * n'est fournie : leur pastille s'affiche alors désactivée plutôt que de
 * risquer un lien mort en pleine démo client (même posture que le reste de
 * la démo).
 *
 * Modifier la démo pour un prospect = éditer ce fichier, rien d'autre.
 */
import type { ImageSourcePropType } from 'react-native';

export type Artist = {
  id: string;
  name: string;
  /** Genre musical, affiché en pastille sur l'affiche. */
  style: string;
  bio: string;
  image: ImageSourcePropType;
  alt: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  /** La soirée où on peut les voir — `data/events.ts`. */
  eventId: string;
};

export const artists: Artist[] = [
  {
    id: 'les-lampions-swing',
    name: 'Les Lampions Swing',
    style: 'Jazz manouche',
    bio: 'Trio local formé autour d’une passion commune pour Django Reinhardt. Guitare, contrebasse et violon pour des standards qui donnent envie de danser entre les tables.',
    image: require('../assets/images/jazz-band.webp'),
    alt: 'Le trio, violon, guitare et contrebasse',
    eventId: 'trio-jazz-manouche',
  },
  {
    id: 'orchestre-du-viroin',
    name: 'L’Orchestre du Viroin',
    style: 'Bal populaire, musette',
    bio: 'Une dizaine de musiciens de la vallée, accordéon en tête, qui font tourner les valses et les javas depuis plus de quinze ans dans les fêtes de village.',
    image: require('../assets/images/orchestre-band.webp'),
    alt: 'L’orchestre, accordéon en tête, entouré de ses musiciens',
    eventId: 'bal-populaire-ete',
  },
  {
    id: 'amandine-teo',
    name: 'Duo Amandine & Téo',
    style: 'Guitare et voix, acoustique',
    bio: 'Une guitare, deux voix, et un répertoire de chansons françaises et de reprises tout en douceur — le duo qu’on écoute un verre de vin nature à la main.',
    image: require('../assets/images/solo-singer.webp'),
    alt: 'Amandine, du duo Amandine & Téo',
    eventId: 'soiree-guinguette-tapas',
  },
];
