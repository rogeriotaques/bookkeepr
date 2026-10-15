import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense, toValue } from 'vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';

const { useBudgetMock, useMonthlyReportMock } = vi.hoisted(() => ({
  useBudgetMock: vi.fn(),
  useMonthlyReportMock: vi.fn(),
}));

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(() => ({
    fetchData: vi.fn(() => ({
      isLoading: ref(false),
      data: ref({}),
      isError: ref(false),
      error: ref(null),
    })),
    invalidateQuery: vi.fn(),
  })),
}));

vi.mock('@/composable/useBudget', () => ({
  useBudget: useBudgetMock,
}));

vi.mock('@/composable/useMonthlyReport', () => ({
  useMonthlyReport: useMonthlyReportMock,
}));

const mountWithSuspense = (component: any, options: any = {}) => {
  return mount(
    {
      render() {
        return h(Suspense, null, { default: () => h(component) });
      },
    },
    options
  );
};

const stubs = {
  BalanceTable: true,
  BalanceFilterForm: true,
  BaseProgress: true,
  RouterLink: RouterLinkStub,
};

describe('TransactionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useBudgetMock.mockReturnValue({
      expenseBudgetTotal: ref(2000),
      isLoading: ref(false),
    });
    useMonthlyReportMock.mockReturnValue({
      report: ref({ actualTotal: 1200, progress: 60 }),
      isLoading: ref(false),
    });
  });

  it('renders without error', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows budget summary bar', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.text()).toContain('Budget');
    expect(wrapper.text()).toContain('Actual');
    expect(wrapper.text()).toContain('Progress');
  });

  it('renders BalanceTable and BalanceFilterForm', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.findComponent({ name: 'BalanceTable' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BalanceFilterForm' }).exists()).toBe(true);
  });

  it('keeps the summary in step with the selected year and month', async () => {
    const calls: Record<string, any[]> = {};

    useBudgetMock.mockImplementation((year: any, month: any) => {
      calls.budget = [year, month];
      return { expenseBudgetTotal: ref(2000), isLoading: ref(false) };
    });
    useMonthlyReportMock.mockImplementation((year: any, month: any) => {
      calls.report = [year, month];
      return { report: ref({ actualTotal: 1200, progress: 60 }), isLoading: ref(false) };
    });

    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();

    const filter = wrapper.findComponent({ name: 'BalanceFilterForm' });
    filter.vm.$emit('update:year', '2025');
    filter.vm.$emit('update:month', '07');
    await flushPromises();

    // The summary must track the filter, not the month the page mounted on.
    for (const args of [calls.budget, calls.report]) {
      expect(toValue(args[0])).toBe(2025);
      expect(toValue(args[1])).toBe(7);
    }
  });
});
