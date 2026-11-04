import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

describe('BalanceTable calculator copy', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    writeText.mockReset();
  });

  const mountSelected = async (data = [entry]) => {
    const wrapper = mount(BalanceTable, { props: { data, locale } });
    await wrapper.find('td.balance-table__description').trigger('click');
    return wrapper;
  };

  const copyButton = (wrapper: Awaited<ReturnType<typeof mountSelected>>) =>
    wrapper.find('[aria-label="Copy calculator total"]');

  it('copies the plain total when an expense is selected', async () => {
    const wrapper = await mountSelected();

    await copyButton(wrapper).trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith('-450');
  });

  it('copies expenses and incomes combined as one signed number', async () => {
    const income = {
      ...entry,
      id: 2,
      description: 'Salary',
      operation: 'income',
      amount: 2000,
    };
    const wrapper = await mountSelected([entry, income]);

    await wrapper.findAll('td.balance-table__description')[1].trigger('click');
    await copyButton(wrapper).trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith('1550');
  });

  it('shows a check icon after copying and reverts it later', async () => {
    vi.useFakeTimers();
    const wrapper = await mountSelected();

    await copyButton(wrapper).trigger('click');
    await flushPromises();

    expect(copyButton(wrapper).find('.tabler-icon-check').exists()).toBe(true);
    expect(wrapper.find('[role="status"]').text()).toBe('Copied');

    vi.advanceTimersByTime(1500);
    await flushPromises();

    expect(copyButton(wrapper).find('.tabler-icon-copy').exists()).toBe(true);
    expect(wrapper.find('[role="status"]').text()).toBe('');
  });

  it('has no copy button while nothing is selected', () => {
    const wrapper = mountTable('');

    expect(copyButton(wrapper).exists()).toBe(false);
  });

  it('offers a tooltip on the copy button', async () => {
    const wrapper = await mountSelected();
    const button = copyButton(wrapper);

    expect(button.classes()).toContain('has-tooltip');
    expect(button.attributes('data-tooltip')).toBe('Copy total');
  });

  it('labels the bar with a calculator icon instead of text', async () => {
    const wrapper = await mountSelected();
    const icon = wrapper.find('.balance-table__selected-entries-icon');

    expect(icon.exists()).toBe(true);
    expect(icon.attributes('aria-label')).toBe('Calculator');
    expect(wrapper.text()).not.toContain('Calculator:');
  });

  it('falls back to a hidden field when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand });

    const wrapper = await mountSelected();
    await copyButton(wrapper).trigger('click');
    await flushPromises();

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });
});
