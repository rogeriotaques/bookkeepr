import { Ref } from 'vue';
import { useQueryClient, useQuery } from '@tanstack/vue-query';

import { getEntries } from '@/domain/network';

const useEntries = (year: Ref<string>, month: Ref<string>) => {
  const queryKey = ['entries', year, month];
  const queryClient = useQueryClient();

  const getAllEntries = async () => {
    const { isLoading, isError, data, error } = useQuery({
      queryKey,
      queryFn: () => getEntries(year.value, month.value),
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
