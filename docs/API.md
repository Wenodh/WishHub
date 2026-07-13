# WishHub API Documentation

All API endpoints follow a consistent response format and require authentication via Better Auth.

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Authentication

Every request must include valid session headers/cookies managed by Better Auth.
Unauthorized requests return `401 Unauthorized`.

## Endpoints

### Products

#### GET `/api/products`
Lists products saved by the user.
- **Query Params**: `limit` (number), `cursor` (string)
- **Response**: `{ success: true, data: { products: [] } }`

#### POST `/api/products`
Saves a new product.
- **Body**: `CreateProductRequest`
- **Response**: `{ success: true, data: { product: {} } }`

#### DELETE `/api/products/:id`
Deletes a saved product.
- **Response**: `{ success: true }`

### Wishlists

#### GET `/api/wishlists`
Lists all wishlists for the user.
- **Response**: `{ success: true, data: { wishlists: [] } }`

#### POST `/api/wishlists`
Creates a new wishlist.
- **Body**: `{ name: string, isDefault?: boolean }`
- **Response**: `{ success: true, data: { wishlist: {} } }`

#### GET `/api/wishlists/default`
Returns the user's default wishlist.
- **Response**: `{ success: true, data: { wishlist: {} } }`

#### PATCH `/api/wishlists/default`
Sets a new default wishlist.
- **Body**: `{ wishlistId: string }`
- **Response**: `{ success: true }`

#### PATCH `/api/wishlists/:id`
Renames a wishlist.
- **Body**: `{ name: string }`
- **Response**: `{ success: true, data: { wishlist: {} } }`

#### DELETE `/api/wishlists/:id`
Deletes a wishlist. Items are preserved in the user's general collection.
- **Response**: `204 No Content`

### Wishlist Products

#### GET `/api/wishlists/:id/products`
Lists products within a specific wishlist.
- **Query Params**: `page` (number), `pageSize` (number)
- **Response**: `{ success: true, data: { wishlist: {}, products: [], pagination: {} } }`

#### POST `/api/wishlists/:id/products`
Adds a product to a wishlist.
- **Body**: `{ savedProductId: string }`
- **Response**: `{ success: true }`

#### DELETE `/api/wishlists/:id/products/:savedProductId`
Removes a product from a wishlist.
- **Response**: `204 No Content`
