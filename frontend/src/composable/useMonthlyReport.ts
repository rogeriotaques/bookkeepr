import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { fetchMonthlyReport } from '@/domain/network';
import { MonthlyReport } from '@/domain/interfaces.budget';

const REPORT_KEY = 'monthly-report';

export function useMonthlyReport(
  year: MaybeRefOrGetter<number>,
  month: MaybeRefOrGetter<number>
) {
  const { isLoading, data } = useQuery({
    queryKey: computed(() => [REPORT_KEY, toValue(year), toValue(month)]),
    queryFn: async () => {
      const res = await fetchMonthlyReport(toValue(year), toValue(month));
      return res as unknown as MonthlyReport;
    },
  });

  const report = computed(() => data.value ?? null);

  return {
    report,
    isLoading,
  };
}
