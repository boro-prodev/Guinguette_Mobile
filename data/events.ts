/**
 * Soirées & Bal — DÉMO : programmation placeholder.
 *
 * Les dates sont calculées relativement à aujourd'hui pour que la démo ne
 * paraisse jamais périmée quel que soit le jour où on la montre. C'est aussi
 * ce qui fait vivre le compte à rebours : `startsAt` est une vraie date, pas
 * une chaîne — l'affichage en est dérivé, jamais l'inverse.
 *
 * Modifier la démo pour un prospect = éditer ce fichier, rien d'autre.
 */
import type { ImageSourcePropType } from 'react-native';

import { colors } from '@/constants/theme';
import {
  addDays,
  atTime,
  formatLongDateCapitalized,
  formatTime,
  nextWeekday,
} from '@/utils/date';

/** Une étape du déroulé de la soirée, révélée quand on déplie la carte. */
export type EventProgramStep = {
  time: string;
  label: string;
};

export type GuinguetteEvent = {
  id: string;
  tag: string;
  tagColor: string;
  tagTextColor: string;
  /**
   * Thème Tamagui de la carte. C'est lui qui décide de la couleur du bouton
   * « J'y serai », de la jauge et du compte à rebours : chaque soirée a sa
   * teinte sans qu'aucune couleur ne soit écrite dans les composants.
   */
  theme: 'primary' | 'secondary' | 'tertiary';
  title: string;
  /** L'artiste ou la formation à l'affiche. */
  artist: string;
  description: string;
  /** Date ET heure réelles — la source du compte à rebours. */
  startsAt: Date;
  /** « Vendredi 8 août • 20h00 » — dérivé de `startsAt`. */
  when: string;
  /** Déroulé de la soirée, du premier au dernier moment. */
  program: EventProgramStep[];
  price: string;
  /** Jauge de la soirée (démo) : total et places déjà réservées. */
  capacity: number;
  taken: number;
  image: ImageSourcePropType;
  alt: string;
  /**
   * Coché par l'exploitant pour faire apparaître la soirée dans « Les
   * pépites » — jamais déduit d'une règle automatique (cf. ROADMAP.md,
   * chantier 2).
   */
  pepite: boolean;
  /** Site ou réseau social de l'artiste. Laissé vide tant qu'aucune URL
   *  réelle n'est fournie : la pastille de lien s'affiche alors désactivée
   *  plutôt que de risquer un lien mort en démo. */
  artistUrl?: string;
};

const FRIDAY = 5;

type EventSeed = Omit<GuinguetteEvent, 'when'>;

function withDerivedLabels(seed: EventSeed): GuinguetteEvent {
  return {
    ...seed,
    when: `${formatLongDateCapitalized(seed.startsAt)} • ${formatTime(seed.startsAt)}`,
  };
}

function buildEvents(today: Date): GuinguetteEvent[] {
  // Annotation nécessaire : sans elle, TypeScript élargit `theme` à `string`
  // et l'union des trois thèmes se perd.
  const seeds: EventSeed[] = [
    {
      id: 'trio-jazz-manouche',
      tag: 'Musique Live',
      tagColor: colors.tertiaryFixed,
      tagTextColor: colors.onTertiaryFixed,
      theme: 'tertiary',
      title: 'Trio Jazz Manouche',
      artist: 'Les Lampions Swing',
      description:
        "Une soirée sous le signe du swing avec le célèbre trio local. Préparez-vous à taper du pied en sirotant un verre de vin blanc.",
      startsAt: atTime(nextWeekday(FRIDAY, today), 20, 0),
      program: [
        { time: '19h00', label: 'Ouverture des portes et service en terrasse' },
        { time: '20h00', label: 'Premier set — standards de Django' },
        { time: '21h15', label: 'Pause gourmande, planches à partager' },
        { time: '22h00', label: 'Second set et bœuf avec le public' },
      ],
      price: 'Entrée libre',
      capacity: 80,
      taken: 63,
      image: require('../assets/images/programmation_01.webp'),
      alt: 'Concert live à la guinguette',
      pepite: false,
    },
    {
      id: 'bal-populaire-ete',
      tag: 'Grand Bal',
      tagColor: colors.primaryContainer,
      tagTextColor: colors.onPrimaryContainer,
      theme: 'primary',
      title: 'Bal Populaire d’Été',
      artist: 'L’Orchestre du Viroin',
      description:
        "L’événement incontournable de la saison. Accordéon, lampions et grande piste de danse sur les berges.",
      startsAt: atTime(addDays(today, 12), 21, 30),
      program: [
        { time: '19h30', label: 'Apéritif au bord de l’eau' },
        { time: '21h30', label: 'Ouverture du bal, valse et javas' },
        { time: '23h00', label: 'Retraite aux flambeaux le long du Viroin' },
        { time: '00h00', label: 'Dernière danse sous les lampions' },
      ],
      price: '8 € · gratuit pour les moins de 12 ans',
      capacity: 200,
      taken: 88,
      image: require('../assets/images/ambiance-soiree.webp'),
      alt: 'Grand bal populaire sous les lampions',
      pepite: true,
    },
    {
      id: 'soiree-guinguette-tapas',
      tag: 'Ambiance',
      tagColor: colors.secondaryContainer,
      tagTextColor: colors.onSecondaryContainer,
      theme: 'secondary',
      title: 'Soirée Guinguette & Tapas',
      artist: 'Duo Amandine & Téo',
      description:
        "Une soirée douce pour clore la semaine. Dégustation de produits locaux au son d’une guitare acoustique.",
      startsAt: atTime(addDays(today, 21), 19, 0),
      program: [
        { time: '19h00', label: 'Planches de producteurs et vins nature' },
        { time: '20h00', label: 'Guitare et voix, en acoustique' },
        { time: '21h30', label: 'Dégustation commentée, fromages de Viroinval' },
      ],
      price: '22 € la formule dégustation',
      capacity: 45,
      taken: 41,
      image: require('../assets/images/programmation_02.webp'),
      alt: 'Soirée guinguette et tapas en terrasse',
      pepite: true,
    },
  ];

  return seeds.map(withDerivedLabels);
}

export const events = buildEvents(new Date());
