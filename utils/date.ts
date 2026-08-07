/**
 * Formatage de dates en français, sans dépendre d'`Intl` : les données de
 * locale ne sont pas garanties sur tous les moteurs Hermes, et la démo doit
 * afficher exactement les mêmes libellés sur iOS et Android.
 */
const DAYS_LONG = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

const DAYS_SHORT = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'] as const;

const MONTHS_LONG = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

const MONTHS_SHORT = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const;

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** « vendredi 8 août » */
export function formatLongDate(date: Date): string {
  return `${DAYS_LONG[date.getDay()]} ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`;
}

/** « Vendredi 8 août » */
export function formatLongDateCapitalized(date: Date): string {
  return capitalize(formatLongDate(date));
}

/** « ven. 8 août » — libellé compact des puces de date de la réservation */
export function formatShortDate(date: Date): string {
  return `${DAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** Décale une date d'un nombre de jours, sans muter l'original. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Prochaine occurrence d'un jour de la semaine (0 = dimanche), toujours dans
 * le futur : « aujourd'hui vendredi » renvoie le vendredi suivant.
 */
export function nextWeekday(weekday: number, from: Date = new Date()): Date {
  const delta = (weekday - from.getDay() + 7) % 7 || 7;
  return addDays(from, delta);
}

/** Fixe l'heure d'une date, sans muter l'original. */
export function atTime(date: Date, hours: number, minutes = 0): Date {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

/** « 20h00 » — la notation française, pas le `20:00` par défaut. */
export function formatTime(date: Date): string {
  return `${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`;
}
