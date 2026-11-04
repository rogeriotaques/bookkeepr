import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils';
import { ref, h, Suspense } from 'vue';
import TransactionEntryPage from '@/pages/TransactionEntryPage.vue';

const { invalidateQueriesMock, addEntryMock, updateEntryMock } = vi.hoisted(() => ({
  invalidateQueriesMock: vi.fn(),
  addEntryMock: vi.fn(),
  updateEntryMock: vi.fn(),
}));

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

vi.mock('@tanstack/vue-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/vue-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
  };
});

vi.mock('@/domain/network', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/network')>();
  return {
    ...actual,
    addEntry: addEntryMock,
    updateEntry: updateEntryMock,
  };
});

vi.mock('vue-toastification', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-toastification')>();
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
  };
});

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

const stubs = {
  EntryForm: true,
  TransactionHistoryPage: true,
  RouterLink: RouterLinkStub,
};

describe('TransactionEntryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows "Transactions" heading', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();
    expect(wrapper.find('h1').text()).toBe('Transactions');
  });

  it('puts EntryForm and TransactionHistoryPage side by side', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const grid = wrapper.find('[data-testid="transactions-grid"]');
    expect(grid.exists()).toBe(true);

    const form = grid.findComponent({ name: 'EntryForm' });
    const history = grid.findComponent({ name: 'TransactionHistoryPage' });

    expect(form.exists()).toBe(true);
    expect(history.exists()).toBe(true);

    // EntryForm is the first column, the history the second.
    expect(form.element.compareDocumentPosition(history.element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('refreshes the list and summary after saving an entry', async () => {
    addEntryMock.mockResolvedValue({ success: true });

    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    wrapper.findComponent({ name: 'EntryForm' }).vm.$emit('submit');
    await flushPromises();

    expect(addEntryMock).toHaveBeenCalledTimes(1);
    // The saved entry must invalidate the list and the report queries.
    expect(invalidateQueriesMock).toHaveBeenCalled();
  });

  it('keeps the last date, category and wallet after saving a new entry', async () => {
    addEntryMock.mockResolvedValue({ success: true });

    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const form = wrapper.findComponent({ name: 'EntryForm' });
    Object.assign(form.props('data') as any, {
      amount: '1,200',
      description: 'Lunch',
      group: '10',
      wallet: 2,
      date: '2026-10-05',
    });

    form.vm.$emit('submit');
    await flushPromises();

    expect(addEntryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '1,200',
        description: 'Lunch',
        group: '10',
        wallet: 2,
        date: '2026-10-05',
      })
    );

    // Amount and description are cleared; the context stays for the next entry.
    expect(form.props('data')).toMatchObject({
      id: null,
      amount: '',
      description: '',
      group: '10',
      wallet: 2,
      date: '2026-10-05',
    });
  });

  it('follows the date picked in the entry form', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const history = wrapper.findComponent({ name: 'TransactionHistoryPage' });
    const form = wrapper.findComponent({ name: 'EntryForm' });

    expect(history.props('referenceDate')).toBe((form.props('data') as any).date);

    form.vm.$emit('date-change', '2026-08-09');
    await flushPromises();

    expect(history.props('referenceDate')).toBe('2026-08-09');
  });

  it('keeps the list month after saving an edit resets the form date', async () => {
    updateEntryMock.mockResolvedValue({ success: true });

    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const form = wrapper.findComponent({ name: 'EntryForm' });
    const history = wrapper.findComponent({ name: 'TransactionHistoryPage' });

    const entry = {
      id: 7,
      amount: 1200,
      description: 'Lunch',
      group: '10',
      wallet: 1,
      date: '2026-08-09',
      groupName: 'Food',
      walletName: 'Cash',
      operation: 'outcome',
      hasMatch: false,
    };

    history.vm.$emit('edit', entry);
    await flushPromises();

    form.vm.$emit('submit');
    await flushPromises();

    // The form date goes back to today; the list must not jump away from the
    // month the user was working in.
    expect((form.props('data') as any).date).not.toBe('2026-08-09');
    expect(history.props('referenceDate')).toBe('2026-08-09');
  });

  it('moves the entry form date when the list changes month', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const history = wrapper.findComponent({ name: 'TransactionHistoryPage' });
    const form = wrapper.findComponent({ name: 'EntryForm' });

    history.vm.$emit('update:referenceDate', '2026-08-09');
    await flushPromises();

    expect((form.props('data') as any).date).toBe('2026-08-09');
  });

  it('forwards the date typed in the entry form to the list month', async () => {
    const wrapper = mountWithSuspense(TransactionEntryPage, {
      global: {
        stubs: {
          BaseDropdown: true,
          TransactionHistoryPage: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    wrapper.findComponent({ name: 'DateInput' }).vm.$emit('update:modelValue', '2026-08-09');
    await flushPromises();

    const history = wrapper.findComponent({ name: 'TransactionHistoryPage' });
    expect(history.props('referenceDate')).toBe('2026-08-09');
  });

  it('loads the selected entry into the form and updates it', async () => {
    updateEntryMock.mockResolvedValue({ success: true });

    const wrapper = mountWithSuspense(TransactionEntryPage, { global: { stubs } });
    await flushPromises();

    const entry = {
      id: 7,
      amount: 1200,
      description: 'Lunch',
      group: '10',
      wallet: 1,
      date: '2026-10-01',
      groupName: 'Food',
      walletName: 'Cash',
      operation: 'outcome',
      hasMatch: false,
    };

    wrapper.findComponent({ name: 'TransactionHistoryPage' }).vm.$emit('edit', entry);
    await flushPromises();

    const form = wrapper.findComponent({ name: 'EntryForm' });
    expect(form.props('isEditing')).toBe(true);
    expect(form.props('data')).toMatchObject({
      id: 7,
      amount: '1,200',
      description: 'Lunch',
      group: '10',
      wallet: 1,
      date: '2026-10-01',
    });

    form.vm.$emit('submit');
    await flushPromises();

    expect(updateEntryMock).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ id: 7, description: 'Lunch' })
    );
    expect(addEntryMock).not.toHaveBeenCalled();
  });
});
