import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getWallets, getActiveWallets } from '@/domain/network';

const useWallets = () => {
  const queryClient = useQueryClient();

  const getAllWallets = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey: ['wallets'],
      queryFn: getWallets,
    });

    return { isLoading, isError, data, error };
  };

  const getAllActiveWallets = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey: ['wallets-active'],
      queryFn: getActiveWallets,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = (key: string) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return {
    getWallets: getAllWallets,
    getActiveWallets: getAllActiveWallets,
    invalidateQuery,
  };
};

export default useWallets;
