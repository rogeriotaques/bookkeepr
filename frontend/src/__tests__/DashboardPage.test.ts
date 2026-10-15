import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import DashboardPage from '@/pages/DashboardPage.vue';

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(),
}));

vi.mock('@/composable/useState', () => ({
  useState: () => ({}),
  logout: vi.fn(),
}));

import useDataFetch from '@/composable/useDataFetch';
import { logout } from '@/composable/useState';

const YEAR = new Date().getFullYear();

const mockReport = (data: any) => ({
  fetchData: vi.fn(() => ({
    isLoading: ref(false),
    data: ref(data),
    isError: ref(false),
    error: ref(null),
  })),
  invalidateQuery: vi.fn(),
});

const mockLoading = () => ({
  fetchData: vi.fn(() => ({
    isLoading: ref(true),
    data: ref(null),
    isError: ref(false),
    error: ref(null),
  })),
  invalidateQuery: vi.fn(),
});

// Three months of budget; only two of them carry an amount.
const annualReport = {
  year: YEAR,
  data: { income: [], outcome: [], balance: [], tax: [] },
  insights: { thisYear: { income: 0, outcome: 1500 } },
  budgets: [
    { month: 1, budget: 1000, actual: 500 },
    { month: 2, budget: 2000, actual: 1000 },
    { month: 3, budget: 0, actual: 0 },
  ],
};

const mountWithSuspense = (options: any = {}) =>
  mount(
    { render: () => h(Suspense, null, { default: () => h(DashboardPage) }) },
    {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          BaseProgress: true,
          BaseSkeleton: true,
          AnnualChart: true,
          RecentTransactions: true,
        },
      },
      ...options,
    }
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show greeting and month selector', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain("You're doing great!");
    expect(wrapper.text()).toContain('Keep it up.');
  });

  it('should show empty state when the year has no budget', async () => {
    (useDataFetch as any).mockReturnValue(mockReport({ ...annualReport, budgets: [] }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain('Set up your budget');
  });

  it('should total the monthly budgets into an annual summary', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();

    expect(wrapper.text()).toContain('Budget');
    expect(wrapper.text()).toContain('Actual');
    expect(wrapper.text()).toContain('Balance');

    // 1000 + 2000 + 0 = 3000 budget, 1500 spent, 1500 left.
    expect(wrapper.text()).toContain('¥ 3,000');
    expect(wrapper.text()).toContain('¥ 1,500');
  });

  it('should show the annual spending progress', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
    // 1500 / 3000
    expect(wrapper.text()).toContain('50%');
  });

  it('should label the summary as annual', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain(`Annual budget ${YEAR}`);
  });

  it('should not render a quick-action list or a record button', async () => {
    (useDataFetch as any).mockReturnValue(mockReport({ ...annualReport, budgets: [] }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    // The tab bar owns Transactions / Planning / Report / Settings now.
    expect(wrapper.find('[data-testid="dashboard-primary-action"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="dashboard-actions"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Record new expense');
  });

  it('should render the annual chart and recent transactions in a grid', async () => {
    (useDataFetch as any).mockReturnValue(mockReport({ ...annualReport, budgets: [] }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.find('[data-testid="dashboard-grid"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AnnualChart' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecentTransactions' }).exists()).toBe(true);
  });

  it('should log out when Logout is clicked', async () => {
    (useDataFetch as any).mockReturnValue(mockReport({ ...annualReport, budgets: [] }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    const logoutButton = wrapper.findAll('button').find((b) => /logout/i.test(b.text()));
    expect(logoutButton).toBeDefined();

    await logoutButton?.trigger('click');
    expect(logout).toHaveBeenCalled();
  });

  it('should show loading state', async () => {
    (useDataFetch as any).mockReturnValue(mockLoading());

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.find('[data-testid="dashboard-loading"]').exists()).toBe(true);
  });
});
