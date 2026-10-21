import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

const { fetchMonthlyReportMock } = vi.hoisted(() => ({ fetchMonthlyReportMock: vi.fn() }));

vi.mock('@/domain/network', () => ({
  fetchMonthlyReport: fetchMonthlyReportMock,
}));

describe('useMonthlyReport', () => {
  beforeEach(() => {
    fetchMonthlyReportMock.mockReset();
    fetchMonthlyReportMock.mockImplementation(async (_year: number, month: number) => ({
      year: 2026,
      month,
      budgetTotal: month * 100,
      actualTotal: month * 10,
      progress: 10,
      breakdown: [],
    }));
  });

  it('refetches and updates when the month changes', async () => {
    const month = ref(1);
    let report: any;

    const Comp = defineComponent({
      setup() {
        const result = useMonthlyReport(2026, month);
        report = result.report;
        return () => h('div');
      },
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mount(Comp, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });

    await flushPromises();
    expect(fetchMonthlyReportMock).toHaveBeenCalledWith(2026, 1);
    expect(report.value?.budgetTotal).toBe(100);

    month.value = 5;
    await flushPromises();

    expect(fetchMonthlyReportMock).toHaveBeenCalledWith(2026, 5);
    expect(report.value?.budgetTotal).toBe(500);
  });
});
