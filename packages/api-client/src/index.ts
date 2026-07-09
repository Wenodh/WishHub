import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WishHubSDK } from '@wishhub/sdk';
import {
    type CreateProductRequest,
    type CreateWishlistRequest,
    type UpdateWishlistRequest
} from '@wishhub/contracts';

const sdk = new WishHubSDK(process.env.NEXT_PUBLIC_APP_URL || '');

// Products
export const useProducts = (params?: { limit?: number; cursor?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => sdk.products.list(params),
  });
};

export const useSaveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => sdk.products.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sdk.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
};

// Wishlists
export const useWishlists = () => {
    return useQuery({
        queryKey: ['wishlists'],
        queryFn: async () => {
            const res = await fetch('/api/wishlists');
            if (!res.ok) throw new Error('Failed to fetch wishlists');
            const data = await res.json();
            return data.wishlists;
        }
    });
};

export const useWishlist = (id: string | null) => {
    return useQuery({
        queryKey: ['wishlists', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await fetch(`/api/wishlists/${id}`);
            if (!res.ok) throw new Error('Failed to fetch wishlist');
            const data = await res.json();
            return data.wishlist;
        },
        enabled: !!id
    });
};

export const useCreateWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateWishlistRequest) => {
            const res = await fetch('/api/wishlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create wishlist');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
        }
    });
};

export const useUpdateWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UpdateWishlistRequest & { id: string }) => {
            const res = await fetch(`/api/wishlists/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update wishlist');
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            queryClient.invalidateQueries({ queryKey: ['wishlists', variables.id] });
        }
    });
};

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/wishlists/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete wishlist');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

// Session
export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => sdk.auth.getSession(),
  });
};
