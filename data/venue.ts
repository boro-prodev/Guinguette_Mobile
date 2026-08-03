/**
 * Coordonnées et horaires de l'établissement.
 * DÉMO : toutes ces valeurs sont des placeholders, modifiables sans validation
 * métier — c'est le seul endroit à éditer pour adapter la démo à un prospect.
 */
import { NBSP, NDASH } from '@/utils/text';

export const venue = {
  name: 'La Guinguette de Oignies',
  tagline: 'Un air de fête, une brise d’été, et la douceur de l’instant.',
  kicker: 'Sous les lampions',
  street: 'Rue de Revin 16',
  /** Casse naturelle : les capitales sont posées au style, côté écran. */
  city: '5670 Viroinval',
  /**
   * Espaces insécables : sans elles, la mention de bas de feuille coupait le
   * numéro en fin de ligne (« …appelez le 0490 » / « 007 007 »).
   */
  phone: `0490${NBSP}007${NBSP}007`,
  /** Format composable par `tel:` — sans espaces. */
  phoneDial: '0490007007',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Rue+de+Revin+16+5670+Viroinval',
} as const;

export type OpeningRow = {
  id: string;
  days: string;
  hours: string;
  /** Met la ligne en avant (le samedi, jour phare de la guinguette). */
  highlight?: boolean;
};

/** Une plage « borne – borne », insécable d'un bout à l'autre. */
const range = (from: string, to: string) => `${from}${NBSP}${NDASH}${NBSP}${to}`;

/**
 * Demi-cadratin et non cadratin : le premier marque une plage, le second
 * isole une incise. Les emplois de cadratin ailleurs dans l'app
 * (« Démo — aucune donnée n'est envoyée ») sont, eux, corrects.
 */
export const openingHours: OpeningRow[] = [
  { id: 'lun-jeu', days: range('Lundi', 'Jeudi'), hours: 'Fermé' },
  { id: 'ven', days: 'Vendredi', hours: range('17h00', '23h00') },
  { id: 'sam', days: 'Samedi', hours: range('12h00', '00h00'), highlight: true },
  { id: 'dim', days: 'Dimanche', hours: range('11h00', '22h00') },
];

/** Créneaux proposés par le parcours de réservation simulé. */
export const RESERVATION_TIMES = [
  '12:00',
  '12:30',
  '13:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
] as const;

export const MAX_GUESTS = 12;
