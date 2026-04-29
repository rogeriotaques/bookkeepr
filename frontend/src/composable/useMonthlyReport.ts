import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { fetchMonthlyReport } from '@/domain/network';
import { MonthlyReport } from '@/domain/interfaces.budget';

const REPORT_KEY = 'monthly-report';

export function useMonthlyReport(year: number, month: number) {
  const { isLoading, data } = useQuery({
    queryKey: [REPORT_KEY, year, month],
    queryFn: async () => {
      const res = await fetchMonthlyReport(year, month);
      return res.data as MonthlyReport;
    },
  });

  const report = computed(() => data.value ?? null);

  return {
    report,
    isLoading,
  };
}
