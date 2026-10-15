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
  insights: { thisYear: { income: 5000, outcome: 1900 } },
  planned: { income: 5500, expense: 2200 },
  realized: { income: 5000, expense: 1900 },
  budgets: [
    { month: 1, budget: 1000, actual: 500 },
    { month: 2, budget: 2000, actual: 1000 },
    { month: 3, budget: 0, actual: 0 },
  ],
};

const noBudgetReport = {
  ...annualReport,
  planned: { income: 0, expense: 0 },
  realized: { income: 0, expense: 0 },
  budgets: [],
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
    (useDataFetch as any).mockReturnValue(mockReport(noBudgetReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain('Set up your budget');
  });

  it('should show planned vs realized for income and expenses', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();

    expect(wrapper.text()).toContain('Planned');
    expect(wrapper.text()).toContain('Realized');
    expect(wrapper.text()).toContain('Income');
    expect(wrapper.text()).toContain('Expenses');
    expect(wrapper.text()).toContain('Balance');

    // Planned income / expense and realized income / expense.
    expect(wrapper.text()).toContain('¥ 5,500');
    expect(wrapper.text()).toContain('¥ 2,200');
    expect(wrapper.text()).toContain('¥ 5,000');
    expect(wrapper.text()).toContain('¥ 1,900');
  });

  it('should show the planned and realized balance', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();

    // 5500 - 2200 planned, and 5000 - 1900 realized.
    expect(wrapper.text()).toContain('¥ 3,300');
    expect(wrapper.text()).toContain('¥ 3,100');
  });

  it('should show planned vs realized progress for income and expenses', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();

    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
    // 5000 / 5500 income, 1900 / 2200 expenses.
    expect(wrapper.text()).toContain('91%');
    expect(wrapper.text()).toContain('86%');
  });

  it('should label the summary as annual', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(annualReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain(`Annual budget ${YEAR}`);
  });

  it('should not render a quick-action list or a record button', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(noBudgetReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    // The tab bar owns Transactions / Planning / Report / Settings now.
    expect(wrapper.find('[data-testid="dashboard-primary-action"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="dashboard-actions"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Record new expense');
  });

  it('should render the annual chart and recent transactions in a grid', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(noBudgetReport));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.find('[data-testid="dashboard-grid"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'AnnualChart' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RecentTransactions' }).exists()).toBe(true);
  });

  it('should log out when Logout is clicked', async () => {
    (useDataFetch as any).mockReturnValue(mockReport(noBudgetReport));

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
