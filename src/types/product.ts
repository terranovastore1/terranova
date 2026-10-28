export type ProductCategory =
  | 'streaming'
  | 'editing'
  | 'listening'
  | 'study'
  | 'lainnya'
  | 'topup';

export interface ProductPackage {
  label: string;
  price: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  badge?: string;
  iconUrl: string;
  hasPackages?: boolean;
  price?: string;
  packages: ProductPackage[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PresetIcon {
  filename: string;
  path: string;
  name: string;
}

export interface CategoryMeta {
  key: ProductCategory;
  label: string;
  shortLabel: string;
  adminLabel: string;
  emoji: string;
  path: string;
  sectionTitle: string;
  sectionSubtitle: string;
  categoryCardName: string;
  categoryCardAccent: string;
  sectionAccent: string;
  productCardAccent: string;
  pricelistAccent: string;
  pricelistGlow: string;
}
