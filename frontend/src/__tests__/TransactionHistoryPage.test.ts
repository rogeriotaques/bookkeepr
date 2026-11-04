import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense, toValue, reactive } from 'vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';
import {
  installHotkeyDispatcher,
  resetHotkeys,
} from '@/composable/useHotkeys';

const { useMonthlyReportMock } = vi.hoisted(() => ({
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

vi.mock('@/composable/useMonthlyReport', () => ({
  useMonthlyReport: useMonthlyReportMock,
}));

const mountWithSuspense = (component: any, options: any = {}) => {
  const { props, ...mountOptions } = options;
  return mount(
    {
      render() {
        return h(Suspense, null, { default: () => h(component, props) });
      },
    },
    mountOptions
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

    useMonthlyReportMock.mockReturnValue({
      report: ref({
        actualTotal: 1900,
        progress: 86,
        planned: { income: 5500, expense: 2200 },
        realized: { income: 5000, expense: 1900 },
      }),
      isLoading: ref(false),
    });
  });

  it('renders without error', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows a planned vs realized summary for income and expenses', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.text()).toContain('Planned');
    expect(wrapper.text()).toContain('Realized');
    expect(wrapper.text()).toContain('Income');
    expect(wrapper.text()).toContain('Expenses');
    expect(wrapper.text()).toContain('Balance');

    expect(wrapper.text()).toContain('¥ 5,500');
    expect(wrapper.text()).toContain('¥ 2,200');
    expect(wrapper.text()).toContain('¥ 5,000');
    expect(wrapper.text()).toContain('¥ 1,900');
  });

  it('shows planned vs realized progress for income and expenses', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
    // 5000 / 5500 income, 1900 / 2200 expenses.
    expect(wrapper.text()).toContain('91%');
    expect(wrapper.text()).toContain('86%');
  });

  it('renders BalanceTable and BalanceFilterForm', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.findComponent({ name: 'BalanceTable' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BalanceFilterForm' }).exists()).toBe(true);
  });

  it('follows the reference date when the entry form changes month', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      props: { referenceDate: '2025-12-15' },
      global: { stubs },
    });
    await flushPromises();

    const filters = wrapper.findComponent({ name: 'BalanceFilterForm' });
    expect(filters.props('year')).toBe('2025');
    expect(filters.props('month')).toBe('12');
  });

  it('follows the reference date when it moves to another month', async () => {
    const props = reactive({ referenceDate: '2025-12-15' });
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      props,
      global: { stubs },
    });
    await flushPromises();

    const filters = wrapper.findComponent({ name: 'BalanceFilterForm' });
    expect(filters.props('year')).toBe('2025');
    expect(filters.props('month')).toBe('12');

    props.referenceDate = '2026-03-02';
    await flushPromises();

    expect(filters.props('year')).toBe('2026');
    expect(filters.props('month')).toBe('03');
  });

  it('reports the chosen month back to the reference date', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      props: { referenceDate: '2026-11-04' },
      global: { stubs },
    });
    await flushPromises();

    const filters = wrapper.findComponent({ name: 'BalanceFilterForm' });
    filters.vm.$emit('update:year', '2025');
    filters.vm.$emit('update:month', '08');
    await flushPromises();

    const history = wrapper.findComponent(TransactionHistoryPage);
    const events = history.emitted('update:referenceDate') as string[][];
    expect(events.at(-1)?.[0]).toBe('2025-08-04');
  });

  it('clamps the reference day when the new month is shorter', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      props: { referenceDate: '2026-01-31' },
      global: { stubs },
    });
    await flushPromises();

    wrapper
      .findComponent({ name: 'BalanceFilterForm' })
      .vm.$emit('update:month', '02');
    await flushPromises();

    const history = wrapper.findComponent(TransactionHistoryPage);
    const events = history.emitted('update:referenceDate') as string[][];
    expect(events.at(-1)?.[0]).toBe('2026-02-28');
  });

  it('pins the filters above the table and offsets the sticky header', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();

    const filters = wrapper.find('.history-page__filters');
    expect(filters.exists()).toBe(true);
    expect(filters.findComponent({ name: 'BalanceFilterForm' }).exists()).toBe(true);

    // jsdom has no layout, so the measured height is 0.
    expect(wrapper.find('.history-page').attributes('style')).toContain(
      '--bk-table-sticky-top: calc(var(--bk-sticky-nav) + 0px)'
    );
  });

  it('keeps the summary in step with the selected year and month', async () => {
    const calls: Record<string, any[]> = {};

    useMonthlyReportMock.mockImplementation((year: any, month: any) => {
      calls.report = [year, month];
      return {
        report: ref({
          actualTotal: 1900,
          progress: 86,
          planned: { income: 5500, expense: 2200 },
          realized: { income: 5000, expense: 1900 },
        }),
        isLoading: ref(false),
      };
    });

    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();

    const filter = wrapper.findComponent({ name: 'BalanceFilterForm' });
    filter.vm.$emit('update:year', '2025');
    filter.vm.$emit('update:month', '07');
    await flushPromises();

    // The summary must track the filter, not the month the page mounted on.
    const args = calls.report;
    expect(toValue(args[0])).toBe(2025);
    expect(toValue(args[1])).toBe(7);
  });

  it('changes the period with brackets and returns to today with t', async () => {
    const uninstall = installHotkeyDispatcher();
    const wrapper = mountWithSuspense(TransactionHistoryPage, { global: { stubs } });
    await flushPromises();

    const filter = wrapper.findComponent({ name: 'BalanceFilterForm' });
    const startMonth = filter.props('month') as string;
    const expectedMonth =
      startMonth === '12' ? '01' : `00${Number(startMonth) + 1}`.slice(-2);

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: ']', bubbles: true, cancelable: true })
    );
    await flushPromises();

    expect(filter.props('month')).toBe(expectedMonth);

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true })
    );
    await flushPromises();

    const now = new Date();
    expect(filter.props('month')).toBe(`00${now.getMonth() + 1}`.slice(-2));
    expect(filter.props('year')).toBe(String(now.getFullYear()));

    wrapper.unmount();
    uninstall();
    resetHotkeys();
  });
});
