import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getGroups, getActiveGroups } from '@/domain/network';

const useGroups = () => {
  const queryClient = useQueryClient();

  const getAllGroups = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey: ['groups'],
      queryFn: getGroups,
    });

    return { isLoading, isError, data, error };
  };

  const getAllActiveGroups = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey: ['groups-active'],
      queryFn: getActiveGroups,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = (key: string) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return {
    getGroups: getAllGroups,
    getActiveGroups: getAllActiveGroups,
    invalidateQuery,
  };
};

export default useGroups;
