import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import PlanningPage from '@/pages/PlanningPage.vue';

vi.mock('@/composable/useBudget', () => ({
  useBudget: vi.fn(),
  useSaveBudget: vi.fn(),
}));

import { useBudget, useSaveBudget } from '@/composable/useBudget';

const mountPlanning = () =>
  mount(PlanningPage, {
    global: {
      stubs: {
        BaseModal: true,
        BaseConfirmModal: true,
        BaseDropdown: true,
        BaseSkeleton: true,
      },
    },
  });

describe('PlanningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show month selector', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget: vi.fn(),
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    expect(wrapper.text()).toContain('Planning for');
  });

  it('should show goal textarea', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget: vi.fn(),
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('should show income and expense totals with add buttons', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget: vi.fn(),
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    expect(wrapper.text()).toContain('Expected Total Income');
    expect(wrapper.text()).toContain('Expected Total Expenses');
    expect(wrapper.find('[data-testid="add-income"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-expense"]').exists()).toBe(true);
  });

  it('should show cancel and done buttons', () => {
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget: vi.fn(),
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="done-btn"]').exists()).toBe(true);
  });

  it('should load existing budget data', () => {
    (useBudget as any).mockReturnValue({
      budget: ref({ id: 1, year: 2025, month: 1, goal: 'Save money' }),
      items: ref([
        { type: 'income', label: 'Salary', amount: 5000 },
        { type: 'expense', label: 'Rent', amount: 1500, expense_type: 'fixed', group_code: 23 },
      ]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget: vi.fn(),
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    expect(wrapper.find('textarea').element.value).toBe('Save money');
    expect(wrapper.text()).toContain('¥ 5,000');
    expect(wrapper.text()).toContain('¥ 1,500');
  });

  it('should call saveBudget on done', async () => {
    const saveBudget = vi.fn();
    (useBudget as any).mockReturnValue({
      budget: ref(null),
      items: ref([]),
      isLoading: ref(false),
    });
    (useSaveBudget as any).mockReturnValue({
      saveBudget,
      isSaving: ref(false),
    });

    const wrapper = mountPlanning();
    await wrapper.find('textarea').setValue('New goal');
    await wrapper.find('[data-testid="done-btn"]').trigger('click');

    expect(saveBudget).toHaveBeenCalled();
  });
});
