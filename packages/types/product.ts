export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  url: string;
  imageUrl?: string;
  storeName?: string;
  createdAt: Date;
  updatedAt: Date;
}
