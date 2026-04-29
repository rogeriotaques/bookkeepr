import { describe, it, expect, vi } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(() => ({
    fetchData: vi.fn(() => ({
      isLoading: ref(false),
      data: ref({ config: { currencyCode: 'JPY', currencyLocale: 'ja-JP' } }),
      isError: ref(false),
      error: ref(null),
    })),
    invalidateQuery: vi.fn(),
  })),
}));

const mountWithSuspense = (component: any, options: any = {}) => {
  return mount(
    {
      render() {
        return h(Suspense, null, { default: () => h(component) });
      },
    },
    options
  );
};

describe('TransactionEntryPage', () => {
  it('renders without error', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, {
      global: {
        stubs: {
          EntryForm: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows "Transaction" heading', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, {
      global: {
        stubs: {
          EntryForm: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Transaction');
  });

  it('has link to history page', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, {
      global: {
        stubs: {
          EntryForm: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    const links = wrapper.findAllComponents(RouterLinkStub);
    expect(links.some((l) => l.props('to') === '/history')).toBe(true);
  });

  it('renders EntryForm component', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, {
      global: {
        stubs: {
          EntryForm: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();
    expect(wrapper.findComponent({ name: 'EntryForm' }).exists()).toBe(true);
  });
});
