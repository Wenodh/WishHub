import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WishHubSDK } from '@wishhub/sdk';
import { type CreateProductDTO } from '@wishhub/contracts';

const sdk = new WishHubSDK(process.env.NEXT_PUBLIC_APP_URL || '');

export const useProducts = (params?: { limit?: number; cursor?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => sdk.products.list(params),
  });
};

export const useSaveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDTO) => sdk.products.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sdk.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => sdk.auth.getSession(),
  });
};
