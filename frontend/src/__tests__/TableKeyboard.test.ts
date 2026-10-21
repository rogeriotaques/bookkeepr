import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

import {
  installHotkeyDispatcher,
  resetHotkeys,
} from '@/composable/useHotkeys';
import GroupTable from '@/components/settings/groups/GroupTable.vue';
import WalletsTable from '@/components/settings/wallets/WalletsTable.vue';
import BalanceTable from '@/components/transactions/BalanceTable.vue';

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.body.dispatchEvent(event);
  return event;
};

const groups = [
  { id: 1, code: '10', name: 'Food', operation: 'outcome', active: 1, expense_type: 'variable' },
  { id: 2, code: '20', name: 'Salary', operation: 'income', active: 1, expense_type: null },
];

const wallets = [
  { id: 1, name: 'Cash', active: 1 },
  { id: 2, name: 'Bank', active: 1 },
];

const entries = [
  {
    id: 1,
    amount: 100,
    description: 'Lunch',
    group: '10',
    wallet: 1,
    date: '2026-10-01',
    groupName: 'Food',
    walletName: 'Cash',
    operation: 'outcome',
    hasMatch: false,
  },
  {
    id: 2,
    amount: 200,
    description: 'Salary',
    group: '20',
    wallet: 2,
    date: '2026-10-02',
    groupName: 'Salary',
    walletName: 'Bank',
    operation: 'income',
    hasMatch: false,
  },
];

const locale = { currencyCode: 'JPY', currencyLocale: 'ja-JP' };

describe('table keyboard navigation', () => {
  let uninstall: () => void;

  beforeEach(() => {
    resetHotkeys();
    uninstall = installHotkeyDispatcher();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    uninstall();
    resetHotkeys();
  });

  it('moves the GroupTable cursor, edits, and asks before deleting', async () => {
    const wrapper = mount(GroupTable, {
      attachTo: document.body,
      props: { data: groups, loading: false },
    });

    press('j');
    await nextTick();
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(document.activeElement).toBe(rows[0].element);

    press('j');
    await nextTick();
    expect(document.activeElement).toBe(rows[1].element);

    press('Enter');
    expect(wrapper.emitted('edit')?.[0]).toEqual([groups[1]]);

    press('Delete');
    await nextTick();
    expect(document.querySelector('.base-confirm-modal')).not.toBeNull();

    wrapper.unmount();
  });

  it('exposes GroupTable actions as native buttons', () => {
    const wrapper = mount(GroupTable, {
      attachTo: document.body,
      props: { data: groups, loading: false },
    });

    const buttons = wrapper.findAll('button.link');
    expect(buttons).toHaveLength(4);
    expect(buttons[0].attributes('aria-label')).toBe('Edit category');
    expect(buttons[1].attributes('aria-label')).toBe('Delete category');

    wrapper.unmount();
  });

  it('moves the WalletsTable cursor and edits', async () => {
    const wrapper = mount(WalletsTable, {
      attachTo: document.body,
      props: { data: wallets, loading: false },
    });

    press('j');
    await nextTick();
    await flushPromises();

    press('e');
    expect(wrapper.emitted('edit')?.[0]).toEqual([wallets[0]]);

    wrapper.unmount();
  });

  it('selects a BalanceTable row with Space and clears it with Esc', async () => {
    const wrapper = mount(BalanceTable, {
      attachTo: document.body,
      props: { data: entries, loading: false, locale },
    });

    press('j');
    await nextTick();
    await flushPromises();

    press('Space');
    await nextTick();
    expect(wrapper.find('.balance-table__selected-entries').exists()).toBe(true);
    expect(wrapper.text()).toContain('( 1 )');

    press('Escape');
    await nextTick();
    expect(wrapper.find('.balance-table__selected-entries').exists()).toBe(false);

    wrapper.unmount();
  });

  it('edits the focused BalanceTable row', async () => {
    const wrapper = mount(BalanceTable, {
      attachTo: document.body,
      props: { data: entries, loading: false, locale },
    });

    press('j');
    await nextTick();
    await flushPromises();

    press('Enter');
    expect(wrapper.emitted('edit')?.[0]?.[0]).toMatchObject({
      id: entries[0].id,
      description: entries[0].description,
    });

    wrapper.unmount();
  });

  it('exposes BalanceTable actions as native buttons', () => {
    const wrapper = mount(BalanceTable, {
      attachTo: document.body,
      props: { data: entries, loading: false, locale },
    });

    const buttons = wrapper.findAll('button.link');
    expect(buttons).toHaveLength(4);
    expect(buttons[0].attributes('aria-label')).toBe('Edit entry');
    expect(buttons[1].attributes('aria-label')).toBe('Delete entry');

    wrapper.unmount();
  });
});
