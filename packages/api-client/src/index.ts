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
    onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ['products'] });
        const previousProducts = queryClient.getQueryData(['products']);
        queryClient.setQueryData(['products'], (old: any) => {
            if (!old || !old.products) return old;
            return {
                ...old,
                products: old.products.filter((p: any) => p.id !== id)
            };
        });
        return { previousProducts };
    },
    onError: (err, id, context: any) => {
        queryClient.setQueryData(['products'], context?.previousProducts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
};

// Wishlists
export const useWishlists = () => {
    return useQuery({
        queryKey: ['wishlists'],
        queryFn: () => sdk.wishlists.list(),
    });
};

export const useDefaultWishlist = () => {
    return useQuery({
        queryKey: ['wishlists', 'default'],
        queryFn: () => sdk.wishlists.getDefault(),
    });
};

export const useSetDefaultWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (wishlistId: string) => sdk.wishlists.setDefault(wishlistId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
        }
    });
};

export const useWishlistProducts = (id: string | null, params?: { page?: number; pageSize?: number }) => {
    return useQuery({
        queryKey: ['wishlists', id, 'products', params],
        queryFn: () => id ? sdk.wishlists.getProducts(id, params) : null,
        enabled: !!id
    });
};

export const useCreateWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWishlistRequest) => sdk.wishlists.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
        }
    });
};

export const useUpdateWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: UpdateWishlistRequest & { id: string }) =>
            sdk.wishlists.update(id, data),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['wishlists'] });
            const previousWishlists = queryClient.getQueryData(['wishlists']);
            queryClient.setQueryData(['wishlists'], (old: any) => {
                if (!old) return old;
                return old.map((w: any) => w.id === id ? { ...w, name } : w);
            });
            return { previousWishlists };
        },
        onError: (err, variables, context: any) => {
            queryClient.setQueryData(['wishlists'], context?.previousWishlists);
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            queryClient.invalidateQueries({ queryKey: ['wishlists', variables.id, 'products'] });
        }
    });
};

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => sdk.wishlists.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['wishlists'] });
            const previousWishlists = queryClient.getQueryData(['wishlists']);
            queryClient.setQueryData(['wishlists'], (old: any) => {
                if (!old) return old;
                return old.filter((w: any) => w.id !== id);
            });
            return { previousWishlists };
        },
        onError: (err, id, context: any) => {
            queryClient.setQueryData(['wishlists'], context?.previousWishlists);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useAddProductToWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ wishlistId, savedProductId }: { wishlistId: string; savedProductId: string }) =>
            sdk.wishlists.addProduct(wishlistId, savedProductId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['wishlists', variables.wishlistId, 'products'] });
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
        }
    });
};

export const useRemoveProductFromWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ wishlistId, savedProductId }: { wishlistId: string; savedProductId: string }) =>
            sdk.wishlists.removeProduct(wishlistId, savedProductId),
        onMutate: async ({ wishlistId, savedProductId }) => {
            await queryClient.cancelQueries({ queryKey: ['wishlists', wishlistId, 'products'] });
            const previousData = queryClient.getQueryData(['wishlists', wishlistId, 'products']);
            queryClient.setQueryData(['wishlists', wishlistId, 'products'], (old: any) => {
                if (!old || !old.products) return old;
                return {
                    ...old,
                    products: old.products.filter((p: any) => (p.savedProductId || p.id) !== savedProductId)
                };
            });
            return { previousData };
        },
        onError: (err, variables, context: any) => {
            queryClient.setQueryData(['wishlists', variables.wishlistId, 'products'], context?.previousData);
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: ['wishlists', variables.wishlistId, 'products'] });
            queryClient.invalidateQueries({ queryKey: ['wishlists'] });
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
