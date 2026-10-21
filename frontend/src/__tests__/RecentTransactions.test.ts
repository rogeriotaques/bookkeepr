import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import RecentTransactions from '@/components/transactions/RecentTransactions.vue';

const entries = [
  { id: 1, date: '2025-01-01', description: 'Coffee', amount: 300, groupName: 'Food', walletName: 'Cash', operation: 'outcome' },
  { id: 2, date: '2025-01-02', description: 'Book', amount: 2000, groupName: 'Fun', walletName: 'Card', operation: 'outcome' },
  { id: 3, date: '2025-01-03', description: 'Salary', amount: 500000, groupName: 'Job', walletName: 'Bank', operation: 'income' },
];

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(),
}));

import useDataFetch from '@/composable/useDataFetch';

const mockFetch = (data: any, loading = false) => ({
  fetchData: vi.fn(() => ({
    isLoading: ref(loading),
    data: ref(data),
    isError: ref(false),
    error: ref(null),
  })),
  invalidateQuery: vi.fn(),
});

const mountWithSuspense = (props: any = {}) => {
  return mount(
    {
      render() {
        return h(Suspense, null, { default: () => h(RecentTransactions, props) });
      },
    },
    { global: { stubs: { BaseSkeleton: true } } }
  );
};

describe('RecentTransactions', () => {
  it('shows a title', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ entries }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain('Recent');
  });

  it('lists the latest entries first and limits the count', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ entries }));

    const wrapper = mountWithSuspense({ limit: 2 });
    await flushPromises();

    const rows = wrapper.findAll('[data-testid="recent-entry"]');
    expect(rows.length).toBe(2);
    expect(rows[0].text()).toContain('Salary');
    expect(rows[1].text()).toContain('Book');
  });

  it('shows an empty state when there are no entries', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch({ entries: [] }));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.text()).toContain('No transactions');
  });

  it('shows a loading state', async () => {
    (useDataFetch as any).mockReturnValue(mockFetch(null, true));

    const wrapper = mountWithSuspense();
    await flushPromises();
    expect(wrapper.find('[data-testid="recent-loading"]').exists()).toBe(true);
  });
});
