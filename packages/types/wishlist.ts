export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
