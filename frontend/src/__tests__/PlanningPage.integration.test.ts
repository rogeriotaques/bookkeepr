import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import PlanningPage from '@/pages/PlanningPage.vue';

const { fetchBudgetMock, createBudgetMock, updateBudgetMock } = vi.hoisted(() => ({
  fetchBudgetMock: vi.fn(),
  createBudgetMock: vi.fn(),
  updateBudgetMock: vi.fn(),
}));

vi.mock('@/domain/network', () => ({
  fetchBudget: fetchBudgetMock,
  createBudget: createBudgetMock,
  updateBudget: updateBudgetMock,
}));

vi.mock('vue-toastification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-toastification')>();
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  };
});

const now = new Date();
const age = now.getFullYear();
const curMonth = now.getMonth() + 1;
const emptyMonth = curMonth + 2 > 12 ? curMonth - 2 : curMonth + 2;

const server: Record<number, any> = {};

const mountPage = () =>
  mount(PlanningPage, {
    global: {
      plugins: [
        [
          VueQueryPlugin,
          { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
        ],
      ],
      stubs: {
        BaseModal: true,
        BaseConfirmModal: true,
        BaseDropdown: true,
        BaseSkeleton: true,
        IncomeCalculator: true,
        ExpensesCalculator: true,
      },
    },
  });

const typeGoal = async (wrapper: any, value: string) => {
  await wrapper.find('textarea').setValue(value);
  await new Promise((r) => setTimeout(r, 700));
  await flushPromises();
};

describe('PlanningPage autosave integration', () => {
  beforeEach(() => {
    for (const k of Object.keys(server)) delete server[Number(k)];
    server[curMonth] = {
      budget: { id: 1, year: age, month: curMonth, goal: 'Current goal' },
      items: [],
    };

    fetchBudgetMock.mockReset();
    createBudgetMock.mockReset();
    updateBudgetMock.mockReset();
    fetchBudgetMock.mockImplementation(
      async (_y: number, m: number) => server[m] ?? { budget: null, items: [] }
    );
    createBudgetMock.mockImplementation(async (payload: any) => {
      const budget = { id: 99, year: payload.year, month: payload.month, goal: payload.goal };
      server[payload.month] = { budget, items: payload.items };
      return { success: true, budget };
    });
    updateBudgetMock.mockResolvedValue({ success: true });
  });

  it('keeps a goal created in a month after navigating away and back', async () => {
    const wrapper = mountPage();
    await flushPromises();
    expect(wrapper.find('textarea').element.value).toBe('Current goal');

    await wrapper.find('select').setValue(emptyMonth);
    await flushPromises();
    expect(wrapper.find('textarea').element.value).toBe('');

    await typeGoal(wrapper, 'Goal for the empty month');
    expect(createBudgetMock).toHaveBeenCalledTimes(1);

    await wrapper.find('select').setValue(curMonth);
    await flushPromises();
    expect(wrapper.find('textarea').element.value).toBe('Current goal');

    await wrapper.find('select').setValue(emptyMonth);
    await flushPromises();
    expect(wrapper.find('textarea').element.value).toBe('Goal for the empty month');
  });

  it('loads and updates the persisted goal of another month', async () => {
    const wrapper = mountPage();
    await flushPromises();
    await wrapper.find('select').setValue(emptyMonth);
    await flushPromises();
    await typeGoal(wrapper, 'Persisted');

    await wrapper.find('textarea').setValue('Persisted edited');
    await new Promise((r) => setTimeout(r, 700));
    await flushPromises();

    expect(updateBudgetMock).toHaveBeenCalledWith(
      99,
      expect.objectContaining({ goal: 'Persisted edited' })
    );
    expect(createBudgetMock).toHaveBeenCalledTimes(1);
  });
});
