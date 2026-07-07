import { type Result, ok, err } from '@wishhub/core';
import { wishlistRepository } from '../repository/wishlist.repository';
import { wishlistItemRepository } from '../repository/wishlist-item.repository';
import { saveProductService } from '@wishhub/catalog';

export class AddProductToWishlistService {
  async execute(userId: string, data: any, wishlistId?: string): Promise<Result<any, string>> {
    // 1. Save product to catalog/user collection
    const saveResult = await saveProductService.execute(userId, data);
    if (!saveResult.ok) return saveResult;

    const savedProduct = saveResult.value;

    // 2. Resolve target wishlist
    let targetWishlistId = wishlistId;
    if (!targetWishlistId) {
      const defaultWishlist = await wishlistRepository.findDefault(userId);
      if (!defaultWishlist) return err('No default wishlist found');
      targetWishlistId = defaultWishlist.id;
    }

    // 3. Add to wishlist
    await wishlistItemRepository.add(targetWishlistId, savedProduct.id);

    return ok({ savedProduct, wishlistId: targetWishlistId });
  }
}

export const addProductToWishlistService = new AddProductToWishlistService();
