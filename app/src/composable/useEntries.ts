import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getEntries } from '@/domain/network';

const useEntries = () => {
  const queryKey = ['entries'];
  const queryClient = useQueryClient();

  const getAllEntries = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: getEntries,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    getEntries: getAllEntries,
    invalidateQuery,
  };
};

export default useEntries;
