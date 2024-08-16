import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getWallets } from '@/domain/network';

const useWallets = () => {
  const queryKey = ['wallets'];
  const queryClient = useQueryClient();

  const getAllWallets = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: getWallets,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    getWallets: getAllWallets,
    invalidateQuery,
  };
};

export default useWallets;
