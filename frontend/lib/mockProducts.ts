import { ProductVariant, RentalUnit } from '@/context/OrderContext';

type MockProduct = {
  id: string;
  title: string;
  images?: string[];
  basePrice: number;
  rentalUnit: RentalUnit;
  variants?: ProductVariant[];
};

export const PRODUCTS: MockProduct[] = [
  {
    id: 'p1',
    title: 'Electric Bike X1',
    images: ['/images/bike-yellow.jpg'],
    basePrice: 100,
    rentalUnit: 'hour',
    variants: [
      {
        id: 'v1',
        name: 'Color',
        type: 'radio',
        options: [
          { id: 'c-yellow', name: 'Yellow', priceModifier: 0 },
          { id: 'c-black', name: 'Black', priceModifier: 10 },
        ],
      },
      {
        id: 'v2',
        name: 'Extras',
        type: 'checkbox',
        options: [
          { id: 'helmet', name: 'Helmet', priceModifier: 5 },
          { id: 'lock', name: 'Lock', priceModifier: 3 },
        ],
      },
    ],
  },
  {
    id: 'p2',
    title: 'Mountain Bike Pro',
    images: ['/images/bike-pro.jpg'],
    basePrice: 80,
    rentalUnit: 'hour',
    variants: [],
  },
  {
    id: 'p3',
    title: 'Compact Camera',
    images: ['/images/camera.jpg'],
    basePrice: 50,
    rentalUnit: 'day',
    variants: [],
  }
];