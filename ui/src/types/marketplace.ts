// types/marketplace.ts
export interface FarmerContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  farmName?: string;
  yearsFarming?: number;
}

export interface MarketplaceProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: string;
  imageUrl: string;
  category: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone: string;
  postedDate: string;
  createdAt?: string;
  updatedAt?: string;
  synced?: boolean;
}

export type ProductCategory = 
  | 'Grains'
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Livestock'
  | 'Seeds'
  | 'Other';