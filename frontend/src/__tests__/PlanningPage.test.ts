import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';
import PlanningPage from '@/pages/PlanningPage.vue';

vi.mock('@/composable/useBudget', () => ({
  useBudget: vi.fn(),
  useSaveBudget: vi.fn(),
}));

vi.mock('vue-toastification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-toastification')>();
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  };
});

import { useBudget, useSaveBudget } from '@/composable/useBudget';

const now = new Date();

const mockBudget = (budget: any = null, items: any[] = []) => {
  const queryData = ref({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    budget,
    items,
  });
  return {
    budget: computed(() => queryData.value?.budget ?? null),
    items: computed(() => queryData.value?.items ?? []),
    queryData,
    isLoading: ref(false),
  };
};

const mockSave = (saveBudget = vi.fn().mockResolvedValue({})) => ({
  saveBudget,
  isSaving: ref(false),
});

const mountPlanning = () =>
  mount(PlanningPage, {
    global: {
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

describe('PlanningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show month selector', () => {
    (useBudget as any).mockReturnValue(mockBudget());
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('should show year selector next to the month selector', () => {
    (useBudget as any).mockReturnValue(mockBudget());
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    const yearSelect = wrapper.find('[data-testid="year-select"]');
    expect(yearSelect.exists()).toBe(true);
    expect((yearSelect.element as HTMLSelectElement).value).toBe(String(now.getFullYear()));
  });

  it('should show goal textarea', () => {
    (useBudget as any).mockReturnValue(mockBudget());
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should show income and expense totals with add buttons', () => {
    (useBudget as any).mockReturnValue(mockBudget());
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    expect(wrapper.text()).toContain('Expected Total Income');
    expect(wrapper.text()).toContain('Expected Total Expenses');
    expect(wrapper.find('[data-testid="add-income"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-expense"]').exists()).toBe(true);
  });

  it('should not show cancel or done buttons', () => {
    (useBudget as any).mockReturnValue(mockBudget());
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="done-btn"]').exists()).toBe(false);
  });

  it('should load existing budget data', () => {
    const saveBudget = vi.fn().mockResolvedValue({});
    (useBudget as any).mockReturnValue(
      mockBudget(
        { id: 1, year: now.getFullYear(), month: now.getMonth() + 1, goal: 'Save money' },
        [
          { type: 'income', label: 'Salary', amount: 5000 },
          { type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
        ]
      )
    );
    (useSaveBudget as any).mockReturnValue(mockSave(saveBudget));

    const wrapper = mountPlanning();
    expect(wrapper.find('textarea').element.value).toBe('Save money');
    expect(wrapper.text()).toContain('¥ 5,000');
    expect(wrapper.text()).toContain('¥ 1,500');
    expect(saveBudget).not.toHaveBeenCalled();
  });

  it('should auto-save the goal after debounce', async () => {
    const saveBudget = vi.fn().mockResolvedValue({});
    (useBudget as any).mockReturnValue(
      mockBudget({ id: 1, year: now.getFullYear(), month: now.getMonth() + 1, goal: '' })
    );
    (useSaveBudget as any).mockReturnValue(mockSave(saveBudget));

    const wrapper = mountPlanning();
    vi.useFakeTimers();
    await wrapper.find('textarea').setValue('New goal');
    await vi.advanceTimersByTimeAsync(600);
    vi.useRealTimers();

    expect(saveBudget).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, goal: 'New goal' })
    );
  });

  it('should save immediately when the income calculator updates', async () => {
    const saveBudget = vi.fn().mockResolvedValue({});
    (useBudget as any).mockReturnValue(
      mockBudget({ id: 1, year: now.getFullYear(), month: now.getMonth() + 1, goal: '' })
    );
    (useSaveBudget as any).mockReturnValue(mockSave(saveBudget));

    const wrapper = mountPlanning();
    await wrapper.find('[data-testid="add-income"]').trigger('click');

    const items = [
      { type: 'income', label: 'Salary', amount: 1000, group_code: null, expense_type: null, sort_order: 0 },
    ];
    wrapper.findComponent({ name: 'IncomeCalculator' }).vm.$emit('update', items);
    await flushPromises();

    expect(saveBudget).toHaveBeenCalledWith(
      expect.objectContaining({ items: expect.any(Array) })
    );
    expect(saveBudget.mock.calls.at(-1)[0].items).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'Salary' })])
    );
  });

  it('should load the newly selected month', async () => {
    const currentMonth = now.getMonth() + 1;
    const otherMonth = currentMonth === 1 ? 2 : 1;
    const q = mockBudget();
    (useBudget as any).mockReturnValue(q);
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    await wrapper.find('select').setValue(otherMonth);

    q.queryData.value = {
      year: now.getFullYear(),
      month: otherMonth,
      budget: { id: 2, year: now.getFullYear(), month: otherMonth, goal: 'Other goal' },
      items: [],
    };
    await flushPromises();

    expect(wrapper.find('textarea').element.value).toBe('Other goal');
  });

  it('should load the newly selected year', async () => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const otherYear = year + 1;
    const q = mockBudget({ id: 1, year, month, goal: 'This year' });
    (useBudget as any).mockReturnValue(q);
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    await wrapper.find('[data-testid="year-select"]').setValue(String(otherYear));

    q.queryData.value = {
      year: otherYear,
      month,
      budget: { id: 2, year: otherYear, month, goal: 'Next year' },
      items: [],
    };
    await flushPromises();

    expect(wrapper.find('textarea').element.value).toBe('Next year');
  });

  it('should save a pending goal to the year it was typed in', async () => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const saveBudget = vi.fn().mockResolvedValue({});
    (useBudget as any).mockReturnValue(mockBudget({ id: 1, year, month, goal: '' }));
    (useSaveBudget as any).mockReturnValue(mockSave(saveBudget));

    const wrapper = mountPlanning();
    vi.useFakeTimers();
    await wrapper.find('textarea').setValue('Typed before switching year');
    await wrapper
      .find('[data-testid="year-select"]')
      .setValue(String(year + 1));
    vi.useRealTimers();
    await flushPromises();

    expect(saveBudget).toHaveBeenCalledWith(
      expect.objectContaining({ year, month, goal: 'Typed before switching year' })
    );
  });

  it('should not clobber local edits when the same month refetches', async () => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const q = mockBudget({ id: 1, year, month, goal: 'Old' });
    (useBudget as any).mockReturnValue(q);
    (useSaveBudget as any).mockReturnValue(mockSave());

    const wrapper = mountPlanning();
    expect(wrapper.find('textarea').element.value).toBe('Old');

    await wrapper.find('textarea').setValue('Typed');
    q.queryData.value = { year, month, budget: { id: 1, year, month, goal: 'Old' }, items: [] };
    await flushPromises();

    expect(wrapper.find('textarea').element.value).toBe('Typed');
  });
});
