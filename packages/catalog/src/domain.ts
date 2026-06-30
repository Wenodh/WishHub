export interface DomainProduct {
  id: string;
  userId: string;
  name: string;
  url: string;
  canonicalUrl: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  storeName?: string | null;
  images: Array<{
    url: string;
    type?: string | null;
  }>;
  rawMetadata?: any;
  metadataVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
