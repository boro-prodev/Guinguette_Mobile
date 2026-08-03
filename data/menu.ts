/**
 * La Carte — DÉMO : plats, descriptions et prix sont des placeholders.
 * La carte est modélisée en « blocs » pour que l'écran puisse la rendre dans
 * une FlatList unique et la filtrer par catégorie sans démonter la mise en page.
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

export type MenuFilter = 'tout' | MenuCategory;

export const MENU_FILTERS: { id: MenuFilter; label: string }[] = [
  { id: 'tout', label: 'Tout' },
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
      kind: 'photo';
      id: string;
      category: MenuCategory;
      image: ImageSourcePropType;
      alt: string;
      title: string;
      description: string;
      price: string;
    }
  | {
      kind: 'heading';
      id: string;
      category: MenuCategory;
      title: string;
    }
  | {
      kind: 'list';
      id: string;
      category: MenuCategory;
      icon?: IconName;
      title?: string;
      items: MenuItem[];
    };

export const menuBlocks: MenuBlock[] = [
  {
    kind: 'feature',
    id: 'toasts-saumon',
    category: 'partager',
    image: require('../assets/images/nourriture-6.jpeg'),
    alt: 'Toasts de saumon fumé, roquette et tomates confites',
    badge: 'Suggestion de saison',
    title: 'Toasts de Saumon Fumé',
    description:
      'Pain de campagne grillé, saumon fumé, roquette, crème acidulée, tomates cerises et balsamique.',
    price: eur('14'),
  },
  {
    kind: 'list',
    id: 'a-partager',
    category: 'partager',
    icon: 'tapas',
    title: 'À partager',
    items: [
      {
        id: 'planche-mixte',
        name: 'Planche Mixte',
        description: 'Charcuteries locales & fromages',
        price: eur('18'),
      },
      {
        id: 'fritures-eperlans',
        name: 'Fritures d’Éperlans',
        description: 'Sauce tartare maison',
        price: eur('9'),
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
    kind: 'heading',
    id: 'plats-heading',
    category: 'plats',
    title: 'Plats Principaux',
  },
  {
    kind: 'photo',
    id: 'salade-guinguette',
    category: 'plats',
    image: require('../assets/images/nourriture-1.jpeg'),
    alt: 'Salade composée : magret fumé, fruits et roquette',
    title: 'Salade Guinguette',
    description:
      'Magret fumé, quartiers de figues, tomates confites, roquette, vinaigrette au miel.',
    price: eur('16'),
  },
  {
    kind: 'photo',
    id: 'cassolette-pecheur',
    category: 'plats',
    image: require('../assets/images/nourriture-2.jpeg'),
    alt: 'Cassolette du pêcheur servie dans son ramequin',
    title: 'Cassolette du Pêcheur',
    description:
      'Poisson frais du jour, pommes de terre grenailles, tomates cerises, petite salade.',
    price: eur('19'),
  },
  {
    kind: 'list',
    id: 'plats-liste',
    category: 'plats',
    items: [
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
        id: 'cafe-gourmand',
        name: 'Café Gourmand',
        description: 'Trio de mignardises maison',
        price: eur('9'),
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
