export interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  badgePercent?: string;
  image: string;
  images?: string[];
  category: string;
  tags?: string[];
  sku?: string;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  reviewCount?: number;
  description?: string;
  specs?: ProductSpecs;
}

export interface ProductSpecs {
  salesPackage: string;
  modelNumber: string;
  secondaryMaterial: string;
  configuration: string;
  upholsteryMaterial: string;
  upholsteryColor: string;
  fillingMaterial: string;
  finishType: string;
  adjustableHeadrest: string;
  maxLoadCapacity: string;
  originOfManufacture: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  seatHeight: string;
  legHeight: string;
  warrantySummary: string;
  warrantyServiceType: string;
  coveredInWarranty: string;
  notCoveredInWarranty: string;
  domesticWarranty: string;
}

export interface RoomSlide {
  id: number;
  room: string;
  title: string;
  image: string;
}
export interface CompareRow { 
  label: string; 
  key: keyof ProductSpecs; 
}
export interface CompareSection {
   title: string; 
   rows: CompareRow[];
}

export interface BlogArticle {
  id: number;
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  excerpt: string;
}

export interface RecentPost {
  title: string;
  date: string;
  image: string;
}

export interface Category {
  name: string;
  count: number;
}
