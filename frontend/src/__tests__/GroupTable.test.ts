import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GroupTable from '@/components/settings/groups/GroupTable.vue';

describe('GroupTable (Phase 4)', () => {
  it('shows expense_type column in header', () => {
    const wrapper = mount(GroupTable, {
      props: { data: [], loading: false },
    });
    const headers = wrapper.findAll('th');
    const texts = headers.map((h) => h.text());
    expect(texts).toContain('Type');
  });

  it('shows expense_type for outcome groups', () => {
    const wrapper = mount(GroupTable, {
      props: {
        data: [
          { id: 1, code: 14, name: 'Food', operation: 'outcome', active: 1, expense_type: 'variable' },
          { id: 2, code: 23, name: 'Rent', operation: 'outcome', active: 1, expense_type: 'fixed' },
          { id: 3, code: 101, name: 'Salary', operation: 'income', active: 1 },
        ],
        loading: false,
      },
    });

    const cells = wrapper.findAll('td');
    const texts = cells.map((c) => c.text());
    expect(texts).toContain('Variable');
    expect(texts).toContain('Fixed');
  });

  it('shows dash for income groups', () => {
    const wrapper = mount(GroupTable, {
      props: {
        data: [
          { id: 3, code: 101, name: 'Salary', operation: 'income', active: 1 },
        ],
        loading: false,
      },
    });

    const cells = wrapper.findAll('td');
    expect(cells.some((c) => c.text() === '-')).toBe(true);
  });
});
