import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { useBudget } from '@/composable/useBudget';

const { fetchBudgetMock } = vi.hoisted(() => ({ fetchBudgetMock: vi.fn() }));

vi.mock('@/domain/network', () => ({
  fetchBudget: fetchBudgetMock,
  createBudget: vi.fn(),
  updateBudget: vi.fn(),
}));

describe('useBudget', () => {
  beforeEach(() => {
    fetchBudgetMock.mockReset();
    fetchBudgetMock.mockImplementation(async (_year: number, month: number) => ({
      budget: { id: month, year: 2026, month, goal: `Goal ${month}` },
      items: [],
    }));
  });

  it('refetches and updates when the month changes', async () => {
    const month = ref(1);
    let budget: any;

    const Comp = defineComponent({
      setup() {
        const result = useBudget(2026, month);
        budget = result.budget;
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
    expect(fetchBudgetMock).toHaveBeenCalledWith(2026, 1);
    expect(budget.value?.goal).toBe('Goal 1');

    month.value = 5;
    await flushPromises();

    expect(fetchBudgetMock).toHaveBeenCalledWith(2026, 5);
    expect(budget.value?.goal).toBe('Goal 5');
  });
});
