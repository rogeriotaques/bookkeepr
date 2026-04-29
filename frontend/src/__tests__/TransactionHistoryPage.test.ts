import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';

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
  useBudget: vi.fn(() => ({
    expenseBudgetTotal: ref(2000),
    isLoading: ref(false),
  })),
}));

vi.mock('@/composable/useMonthlyReport', () => ({
  useMonthlyReport: vi.fn(() => ({
    report: ref({ actualTotal: 1200, progress: 60 }),
    isLoading: ref(false),
  })),
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

describe('TransactionHistoryPage', () => {
  it('renders without error', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      global: {
        stubs: {
          BalanceTable: true,
          BalanceFilterForm: true,
          BaseProgress: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows "Transactions History" heading', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      global: {
        stubs: {
          BalanceTable: true,
          BalanceFilterForm: true,
          BaseProgress: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Transactions History');
  });

  it('has link to entry page', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      global: {
        stubs: {
          BalanceTable: true,
          BalanceFilterForm: true,
          BaseProgress: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/entry')).toBe(true);
  });

  it('shows budget summary bar', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      global: {
        stubs: {
          BalanceTable: true,
          BalanceFilterForm: true,
          BaseProgress: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Budget');
    expect(wrapper.text()).toContain('Actual');
    expect(wrapper.text()).toContain('Progress');
  });

  it('renders BalanceTable and BalanceFilterForm', async () => {
    const wrapper = mountWithSuspense(TransactionHistoryPage, {
      global: {
        stubs: {
          BalanceTable: true,
          BalanceFilterForm: true,
          BaseProgress: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: 'BalanceTable' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'BalanceFilterForm' }).exists()).toBe(true);
  });
});
