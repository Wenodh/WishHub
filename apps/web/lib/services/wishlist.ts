import {
  ListWishlistsService,
  CreateWishlistService,
  RenameWishlistService,
  DeleteWishlistService,
  SetDefaultWishlistService,
  AddProductToWishlistService,
  RemoveProductFromWishlistService,
  ListWishlistProductsService,
  WishlistRepository,
  WishlistItemRepository,
  SavedProductRepository,
  CatalogRepository
} from '@wishhub/wishlist';

// Individual repository instances (can be shared if stateless)
const wishlistRepository = new WishlistRepository();
const wishlistItemRepository = new WishlistItemRepository();
const savedProductRepository = new SavedProductRepository();
const catalogRepository = new CatalogRepository();

export const wishlistServiceFactory = {
  listWishlists: () => new ListWishlistsService(wishlistRepository, wishlistItemRepository),

  createWishlist: () => new CreateWishlistService(wishlistRepository),

  renameWishlist: () => new RenameWishlistService(wishlistRepository),

  deleteWishlist: () => new DeleteWishlistService(wishlistRepository, wishlistItemRepository),

  setDefaultWishlist: () => new SetDefaultWishlistService(wishlistRepository),

  addProductToWishlist: () => new AddProductToWishlistService(
    wishlistRepository,
    wishlistItemRepository,
    savedProductRepository
  ),

  removeProductFromWishlist: () => new RemoveProductFromWishlistService(
    wishlistRepository,
    wishlistItemRepository
  ),

  listWishlistProducts: () => new ListWishlistProductsService(
    wishlistRepository,
    wishlistItemRepository,
    savedProductRepository,
    catalogRepository
  ),

  // Repository for direct access if needed (sparingly)
  wishlistRepository: () => wishlistRepository,
};
