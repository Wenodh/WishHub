export interface ProductImage {
  url: string;
  type?: string | null;
}

export interface ProductEntity {
  id: string;
  userId: string;
  name: string;
  url: string;
  canonicalUrl: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  storeName?: string | null;
  images: ProductImage[];
  rawMetadata?: any;
  metadataVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
