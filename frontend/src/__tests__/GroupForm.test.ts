import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import GroupForm from '@/components/settings/groups/GroupForm.vue';

describe('GroupForm (Phase 4)', () => {
  it('shows expense_type dropdown when operation is outcome', () => {
    const form = reactive({
      code: '99',
      name: 'Test',
      operation: 'outcome',
      active: 1,
      expense_type: null,
    });

    const wrapper = mount(GroupForm, {
      props: { form, submitting: false },
    });

    expect(wrapper.find('[data-testid="expense-type"]').exists()).toBe(true);
  });

  it('hides expense_type dropdown when operation is income', () => {
    const form = reactive({
      code: '99',
      name: 'Test',
      operation: 'income',
      active: 1,
      expense_type: null,
    });

    const wrapper = mount(GroupForm, {
      props: { form, submitting: false },
    });

    expect(wrapper.find('[data-testid="expense-type"]').exists()).toBe(false);
  });

  it('expense_type select has fixed and variable options', () => {
    const form = reactive({
      code: '99',
      name: 'Test',
      operation: 'outcome',
      active: 1,
      expense_type: 'fixed',
    });

    const wrapper = mount(GroupForm, {
      props: { form, submitting: false },
    });

    const options = wrapper.find('[data-testid="expense-type"]').findAll('option');
    const values = options.map((o) => o.element.value);
    expect(values).toContain('fixed');
    expect(values).toContain('variable');
    expect(values).toContain('');
  });
});
