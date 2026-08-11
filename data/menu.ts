/**
 * La Carte — DÉMO : plats, descriptions et prix sont des placeholders.
 * La carte est modélisée en « blocs » pour que l'écran puisse la rendre dans
 * une FlatList unique et la filtrer par catégorie sans démonter la mise en page.
 *
 * ## Une catégorie = une suggestion, puis une liste
 *
 * Chaque catégorie tient en **deux blocs**, et toujours dans cet ordre :
 *
 * 1. un `feature` — le produit mis en avant, en grande photo, avec son badge
 *    « Suggestion de saison » et sa description qui se déplie ;
 * 2. un `list` — tout le reste, en lignes nom / description / prix, **sans
 *    image**.
 *
 * ⚠️ **Il n'y a plus de filtre « Tout »** (6 août 2026) : on entre sur
 * « À partager », et on ne voit jamais qu'une catégorie à la fois. Deux formes
 * de blocs ont disparu avec ce remaniement, parce que plus aucune donnée ne
 * les utilisait :
 * - `heading`, l'intertitre pleine largeur qui annonçait « Plats Principaux » —
 *   c'est le titre de la liste qui le porte maintenant, comme pour les autres
 *   catégories ;
 * - `photo`, le plat illustré **sans** badge : les deux plats qui l'utilisaient
 *   sont redescendus en lignes de liste. Une seule photo par catégorie, c'est
 *   ce qui fait qu'elle met quelque chose en avant.
 */
import type { ImageSourcePropType } from 'react-native';

import type { IconName } from '@/components/ui/Icon';
import { NBSP } from '@/utils/text';

/**
 * Un prix en euros. L'espace avant le symbole est insécable et non
 * facultative : le français l'exige, et sans elle « 14€ » contredisait déjà
 * les « 8 € » de data/events.ts d'un écran à l'autre de la même démo.
 */
const eur = (amount: string) => `${amount}${NBSP}€`;

export type MenuCategory = 'partager' | 'plats' | 'desserts' | 'boissons';

/** L'ordre de cette liste est celui des puces — et la première est celle sur
 *  laquelle l'écran s'ouvre. */
export const MENU_FILTERS: { id: MenuCategory; label: string }[] = [
  { id: 'partager', label: 'À partager' },
  { id: 'plats', label: 'Plats' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'boissons', label: 'Boissons' },
];

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type MenuBlock =
  | {
      kind: 'feature';
      id: string;
      category: MenuCategory;
      image: ImageSourcePropType;
      alt: string;
      badge: string;
      title: string;
      description: string;
      price: string;
    }
  | {
      kind: 'list';
      id: string;
      category: MenuCategory;
      icon?: IconName;
      title?: string;
      items: MenuItem[];
    };

const SUGGESTION = 'Suggestion de saison';

export const menuBlocks: MenuBlock[] = [
  {
    kind: 'feature',
    id: 'planche-mixte',
    category: 'partager',
    image: require('../assets/images/planche-charcuterie-fromage.webp'),
    alt: 'Planche de charcuteries locales et de fromages affinés',
    badge: SUGGESTION,
    title: 'Planche Mixte',
    description:
      'Charcuteries locales, fromages affinés de la région, pickles maison et pain de campagne grillé.',
    price: eur('18'),
  },
  {
    kind: 'list',
    id: 'a-partager',
    category: 'partager',
    icon: 'tapas',
    title: 'À partager',
    items: [
      {
        id: 'fritures-eperlans',
        name: 'Fritures d’Éperlans',
        description: 'Sauce tartare maison',
        price: eur('9'),
      },
      {
        id: 'croquettes-crevettes',
        name: 'Croquettes de Crevettes Grises',
        description: 'Persil frit, quartier de citron',
        price: eur('11'),
      },
      {
        id: 'camembert-roti',
        name: 'Camembert Rôti',
        description: 'Miel, noix, croûtons',
        price: eur('12'),
      },
    ],
  },
  {
    kind: 'feature',
    id: 'toasts-saumon',
    category: 'plats',
    image: require('../assets/images/nourriture-6.webp'),
    alt: 'Toasts de saumon fumé, roquette et tomates confites',
    badge: SUGGESTION,
    title: 'Toasts de Saumon Fumé',
    description:
      'Pain de campagne grillé, saumon fumé, roquette, crème acidulée, tomates cerises et balsamique.',
    price: eur('14'),
  },
  {
    kind: 'list',
    id: 'plats-liste',
    category: 'plats',
    icon: 'menu',
    title: 'Plats Principaux',
    items: [
      {
        id: 'salade-guinguette',
        name: 'Salade Guinguette',
        description: 'Magret fumé, figues, roquette, miel',
        price: eur('16'),
      },
      {
        id: 'cassolette-pecheur',
        name: 'Cassolette du Pêcheur',
        description: 'Poisson du jour, grenailles, petite salade',
        price: eur('19'),
      },
      {
        id: 'burger-rustique',
        name: 'Burger Rustique',
        description: 'Bœuf haché, tomme, confit d’oignons, frites',
        price: eur('17'),
      },
      {
        id: 'tartare-boeuf',
        name: 'Tartare de Bœuf',
        description: 'Préparé, frites et salade',
        price: eur('18'),
      },
      {
        id: 'entrecote',
        name: 'Entrecôte Grillée',
        description: 'Sauce au choix, frites',
        price: eur('24'),
      },
      {
        id: 'salade-vege',
        name: 'Salade Végétarienne',
        description: 'Légumes grillés, quinoa, feta',
        price: eur('15'),
      },
    ],
  },
  {
    kind: 'feature',
    id: 'cafe-gourmand',
    category: 'desserts',
    image: require('../assets/images/cafe-gourmand.webp'),
    alt: 'Café gourmand : expresso, part de gâteau au chocolat, croissant et confiture',
    badge: SUGGESTION,
    title: 'Café Gourmand',
    description:
      'Un expresso de torréfaction artisanale et son trio de douceurs : part de gâteau au chocolat, croissant tiède et confiture maison.',
    price: eur('9'),
  },
  {
    kind: 'list',
    id: 'desserts',
    category: 'desserts',
    icon: 'cake',
    title: 'Desserts',
    items: [
      {
        id: 'tarte-tatin',
        name: 'Tarte Tatin',
        description: 'Servie tiède, crème fraîche',
        price: eur('8'),
      },
      {
        id: 'mousse-chocolat',
        name: 'Mousse au Chocolat',
        description: 'Chocolat noir, fleur de sel',
        price: eur('7'),
      },
      {
        id: 'coupe-glacee',
        name: 'Coupe Glacée',
        description: 'Glaces artisanales, chantilly',
        price: eur('6'),
      },
    ],
  },
  {
    kind: 'feature',
    id: 'deglinguette',
    category: 'boissons',
    image: require('../assets/images/boisson-deglinguette.webp'),
    alt: 'La Déglinguette, bouteille de cidre rosé artisanal sur une table en bois',
    badge: SUGGESTION,
    title: 'La Déglinguette',
    description:
      'La bouteille de la maison : cidre rosé artisanal du Viroin, peu sucré, légèrement pétillant, servi très frais.',
    price: eur('5'),
  },
  {
    kind: 'list',
    id: 'boissons',
    category: 'boissons',
    icon: 'glass',
    title: 'Boissons',
    items: [
      {
        id: 'biere-pression',
        name: 'Bière Pression 25cl',
        description: 'Brasserie locale',
        price: eur('3'),
      },
      {
        id: 'verre-vin',
        name: 'Verre de Vin',
        description: 'Blanc, rosé ou rouge',
        price: eur('4'),
      },
      {
        id: 'limonade',
        name: 'Limonade Artisanale',
        description: 'Citron ou fruits rouges',
        price: eur('3,50'),
      },
      {
        id: 'cafe-the',
        name: 'Café · Thé',
        description: 'Torréfaction artisanale',
        price: eur('2,50'),
      },
    ],
  },
];
