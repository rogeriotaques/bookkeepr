import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import BalanceTable from '@/components/transactions/BalanceTable.vue';

const locale = { currencyCode: 'JPY', currencyLocale: 'ja-JP' };

const entry = {
  id: 1,
  amount: 450,
  description: 'Coffee',
  group: '10',
  wallet: 1,
  date: '2026-10-22',
  groupName: 'Food',
  walletName: 'Credit card',
  operation: 'outcome',
  hasMatch: false,
};

const mountTable = (search: string, data: any[] = [entry]) =>
  mount(BalanceTable, {
    props: { data, locale, search },
  });

describe('BalanceTable search highlight', () => {
  it('highlights the matching description', () => {
    const wrapper = mountTable('coffee');
    const marks = wrapper.findAll('mark');

    expect(marks.some((mark) => mark.text() === 'Coffee')).toBe(true);
  });

  it('highlights matching badges', () => {
    const wrapper = mountTable('credit');

    expect(wrapper.findAll('mark').some((mark) => mark.text() === 'Credit')).toBe(true);
    expect(wrapper.findAll('mark').some((mark) => mark.text() === 'Food')).toBe(false);
  });

  it('does not highlight anything without a search', () => {
    const wrapper = mountTable('');

    expect(wrapper.find('mark').exists()).toBe(false);
  });

  it('treats regular-expression characters as text', () => {
    const wrapper = mountTable('(large', [{ ...entry, description: 'Coffee (large)' }]);

    expect(wrapper.findAll('mark').some((mark) => mark.text() === '(large')).toBe(true);
  });

  it('still filters out rows that do not match', () => {
    const other = { ...entry, id: 2, description: 'Train', groupName: 'Transport' };
    const wrapper = mountTable('coffee', [entry, other]);

    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Coffee');
    expect(wrapper.text()).not.toContain('Train');
  });
});
