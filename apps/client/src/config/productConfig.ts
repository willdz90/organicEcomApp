// src/config/productConfig.ts
export const CATEGORY_OPTIONS = [
  "Belleza",
  "Skincare",
  "Haircare",
  "Home",
  "Pets",
  "Gadgets",
  "Fitness",
  "Kids",
  "Kitchen",
  "Accessories",
  // … podrás añadir más aquí rápido
];

export const COUNTRY_GROUP_OPTIONS = [
  "GENERAL",
  "COD_LATAM",
  "LATAM Anticipado",
  "USA",
  "Mexico",
  "Colombia",
  "Chile",
  "Italia",
  "Francia",
  "Alemania",
  "Paises Bajos",
  "Hungria",
  "Polonia"
] as const;

export type CountryGroup = (typeof COUNTRY_GROUP_OPTIONS)[number];
