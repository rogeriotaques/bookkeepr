import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import VMoney from 'v-money';
import IncomeCalculator from '@/components/planning/IncomeCalculator.vue';
import ExpensesCalculator from '@/components/planning/ExpensesCalculator.vue';

vi.mock('@/domain/network', () => ({
  fetchGroups: vi.fn().mockResolvedValue({
    groups: [
      { code: 10, name: 'Water', operation: 'outcome', active: 1 },
      { code: 1, name: 'Salary', operation: 'income', active: 1 },
    ],
  }),
}));

const mountCalc = (component: any) =>
  mount(component, {
    props: { items: [] },
    global: { plugins: [VMoney] },
    attachTo: document.body,
  });

describe('Planning calculators', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('IncomeCalculator renders its modal', () => {
    const wrapper = mountCalc(IncomeCalculator);
    expect(document.body.textContent).toContain('Income Calculator');
    wrapper.unmount();
  });

  it('ExpensesCalculator renders its modal', () => {
    const wrapper = mountCalc(ExpensesCalculator);
    expect(document.body.textContent).toContain('Expenses Calculator');
    wrapper.unmount();
  });

  it('lists only outcome categories in the expense calculator', async () => {
    const wrapper = mountCalc(ExpensesCalculator);
    await flushPromises();
    await nextTick();
    const options = Array.from(document.querySelectorAll('.expense-calc__group option')).map((o) =>
      o.textContent?.trim()
    );
    expect(options).toContain('Water');
    expect(options).not.toContain('Salary');
    wrapper.unmount();
  });

  it('keeps the delete buttons out of the tab order', () => {
    const income = mountCalc(IncomeCalculator);
    expect(document.querySelector('.income-calc__delete')?.getAttribute('tabindex')).toBe('-1');
    income.unmount();
    document.body.innerHTML = '';

    const expenses = mountCalc(ExpensesCalculator);
    expect(document.querySelector('.expense-calc__delete')?.getAttribute('tabindex')).toBe('-1');
    expenses.unmount();
  });

  it('focuses the new row when adding', async () => {
    const wrapper = mountCalc(IncomeCalculator);
    (document.querySelector('.income-calc__add') as HTMLButtonElement).click();
    await nextTick();
    const labels = document.querySelectorAll('.income-calc__label input');
    expect(labels.length).toBe(2);
    expect(document.activeElement).toBe(labels[1]);
    wrapper.unmount();
  });

  it('masks the amount and reflects it in the total', async () => {
    const wrapper = mountCalc(IncomeCalculator);
    const input = document.querySelector('.income-calc__amount input') as HTMLInputElement;
    input.value = '1000';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    expect(input.value).toBe('1,000');
    expect(document.querySelector('.income-calc__total')?.textContent).toContain('¥ 1,000');
    wrapper.unmount();
  });
});
