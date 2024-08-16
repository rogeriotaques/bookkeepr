import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getSettings } from '@/domain/network';

const useSettings = () => {
  const queryKey = ['settings'];
  const queryClient = useQueryClient();

  const getSettingsData = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: getSettings,
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    getSettingsData,
    invalidateQuery,
  };
};

export default useSettings;
