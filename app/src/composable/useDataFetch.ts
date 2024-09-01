import { Ref } from 'vue';
import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { http } from '@/domain/network';
import { ApiResponse } from '@/domain/interfaces';

const useDataFetch = (url: Ref<string>) => {
  const queryKey = ['fetch', url];
  const queryClient = useQueryClient();

  const fetchData = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: async (): Promise<ApiResponse> => {
        // Note: Comment/uncomment this to throttle the requests
        // await new Promise((resolve) => setTimeout(resolve, 5000));
        return http.get(url.value);
      },
    });

    return { isLoading, isError, data, error };
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    fetchData,
    invalidateQuery,
  };
};

export default useDataFetch;
