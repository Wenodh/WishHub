# API Documentation

## Authentication
All requests require a valid session cookie managed via **Better Auth**.

## Products
### GET /api/products
Lists products saved by the authenticated user.
- **Query Params**: `limit`, `cursor`, `search`, `sort`
- **Response**: `200 OK` with `ProductListResponse`

### POST /api/products
Saves a product to the user's collection.
- **Request Body**: `AddProductRequest` (extraction data + optional wishlistId)
- **Response**: `201 Created` or `200 OK` (if duplicate)

## Wishlists
### GET /api/wishlists
Lists all wishlists for the authenticated user.
- **Response**: `{ success: true, data: { wishlists: WishlistSummary[] } }`

### POST /api/wishlists
Creates a new wishlist.
- **Request Body**: `CreateWishlistRequest`

### GET /api/wishlists/:id/products
Lists all products within a specific wishlist.
- **Query Params**: `page`, `pageSize`

### POST /api/wishlists/:id/products
Adds an existing saved product to a wishlist.
- **Request Body**: `{ savedProductId: string }`

## Error Responses
- `401 Unauthorized`: Session missing or expired.
- `403 Forbidden`: Attempting to access a resource owned by another user.
- `404 Not Found`: Resource does not exist.
- `422 Unprocessable Entity`: Validation failed (Zod issues).
