import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getGroups } from '@/domain/network';

const useGroups = () => {
  const queryKey = ['groups'];
  const queryClient = useQueryClient();

  const getAllGroups = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: getGroups,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    getGroups: getAllGroups,
    invalidateQuery,
  };
};

export default useGroups;
