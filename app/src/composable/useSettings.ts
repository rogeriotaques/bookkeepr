import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getSettings } from '@/domain/network';

const useSettings = () => {
  const queryClient = useQueryClient();

  const getSettingsData = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey: ['settings'],
      queryFn: getSettings,
    });

    return { isLoading, isError, data, error };
  };

  return {
    getSettingsData,
  };
};

export default useSettings;
