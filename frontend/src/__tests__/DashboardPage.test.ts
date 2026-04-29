import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { ref } from 'vue';
import DashboardPage from '@/pages/DashboardPage.vue';

// Mock the composables
vi.mock('@/composable/useBudget', () => ({
  useBudget: vi.fn(),
}));

vi.mock('@/composable/useMonthlyReport', () => ({
  useMonthlyReport: vi.fn(),
}));

import { useBudget } from '@/composable/useBudget';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

const mountDashboard = () =>
  mount(DashboardPage, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        BaseProgress: true,
        BaseSkeleton: true,
      },
    },
  });

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show greeting and month selector', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref(null),
      isLoading: ref(false),
    });

    const wrapper = mountDashboard();
    expect(wrapper.text()).toContain("You're doing great!");
    expect(wrapper.text()).toContain('Keep it up.');
  });

  it('should show empty state when no budget exists', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref(null),
      isLoading: ref(false),
    });

    const wrapper = mountDashboard();
    expect(wrapper.text()).toContain('Set up your budget');
  });

  it('should show summary cards when budget exists', () => {
    (useBudget as any).mockReturnValue({
      budget: ref({ id: 1, year: 2025, month: 1, goal: 'Save' }),
      items: ref([
        { type: 'expense', label: 'Rent', amount: 1500 },
        { type: 'expense', label: 'Food', amount: 500 },
        { type: 'income', label: 'Salary', amount: 5000 },
      ]),
      expenseBudgetTotal: ref(2000),
      isLoading: ref(false),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref({ actualTotal: 1200, progress: 60 }),
      isLoading: ref(false),
    });

    const wrapper = mountDashboard();
    expect(wrapper.text()).toContain('Budget');
    expect(wrapper.text()).toContain('Actual');
    expect(wrapper.text()).toContain('Balance');
  });

  it('should show progress bar', () => {
    (useBudget as any).mockReturnValue({
      budget: ref({ id: 1, year: 2025, month: 1 }),
      items: ref([
        { type: 'expense', label: 'Rent', amount: 1500 },
      ]),
      expenseBudgetTotal: ref(1500),
      isLoading: ref(false),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref({ actualTotal: 750, progress: 50 }),
      isLoading: ref(false),
    });

    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="progress-bar"]').exists()).toBe(true);
  });

  it('should show quick action links', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref(null),
      isLoading: ref(false),
    });

    const wrapper = mountDashboard();
    expect(wrapper.text()).toContain('Record new expense');
    expect(wrapper.text()).toContain('Transaction History');
    expect(wrapper.text()).toContain('Planning');
    expect(wrapper.text()).toContain('Settings');
  });

  it('should show loading state', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(true),
    });
    (useMonthlyReport as any).mockReturnValue({
      report: ref(null),
      isLoading: ref(true),
    });

    const wrapper = mountDashboard();
    expect(wrapper.find('[data-testid="dashboard-loading"]').exists()).toBe(true);
  });
});
