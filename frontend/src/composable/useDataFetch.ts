import { Ref } from 'vue';
import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { http } from '@/domain/network';
import { ApiResponse } from '@/domain/interfaces';

import { useState } from '@/composable/useState';

const state = useState();

const useDataFetch = (url: Ref<string>) => {
  const queryKey = ['fetch', url];
  const queryClient = useQueryClient();

  const fetchData = async () => {
    const { isLoading, isFetched, isError, data, error } = useQuery({
      queryKey,
      queryFn: async (): Promise<ApiResponse> => {
        const Authorization = `Basic ${state.credential ?? btoa('user:empty-password')}`;

        // Note: Comment/uncomment this to throttle the requests
        // await new Promise((resolve) => setTimeout(resolve, 5000));
        return http.get(url.value, { headers: { Authorization } });
      },
    });

    return { isLoading, isFetched, isError, data, error };
  };

  const invalidateQuery = () => {
    return queryClient.invalidateQueries({ queryKey });
  };

  return {
    fetchData,
    invalidateQuery,
  };
};

export default useDataFetch;
