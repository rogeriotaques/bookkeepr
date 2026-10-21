import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h, reactive, ref, Suspense } from 'vue';

import {
  installHotkeyDispatcher,
  resetHotkeys,
} from '@/composable/useHotkeys';
import EntryForm from '@/components/transactions/EntryForm.vue';

vi.mock('@/composable/useDataFetch', () => ({
  default: vi.fn(() => ({
    fetchData: vi.fn(() => ({
      isLoading: ref(false),
      data: ref({
        groups: [{ id: 1, code: '10', name: 'Food', operation: 'outcome', active: 1 }],
        wallets: [{ id: 1, name: 'Cash', active: 1 }],
      }),
      isError: ref(false),
      error: ref(null),
    })),
    invalidateQuery: vi.fn(),
  })),
}));

const press = (key: string, init: KeyboardEventInit = {}) => {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    })
  );
};

describe('EntryForm hotkeys', () => {
  let uninstall: () => void;

  beforeEach(() => {
    resetHotkeys();
    uninstall = installHotkeyDispatcher();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    uninstall();
    resetHotkeys();
    document.body.innerHTML = '';
  });

  const mountForm = () => {
    const data = reactive({
      id: null as number | null,
      amount: '1,000',
      description: 'Lunch',
      group: '10',
      wallet: 1,
      date: '2026-10-01',
    });
    const onSubmit = vi.fn();

    const wrapper = mount(
      {
        render: () =>
          h(Suspense, null, {
            default: () =>
              h(EntryForm, {
                data,
                isSubmitting: false,
                isEditing: false,
                locale: { currencyCode: 'JPY', currencyLocale: 'ja-JP' },
                onSubmit,
              }),
          }),
      },
      {
        attachTo: document.body,
        global: { stubs: { BaseDropdown: true } },
      }
    );

    return {
      data,
      wrapper,
      onSubmit,
    };
  };

  it('saves with Ctrl+S as well as Cmd+S', async () => {
    const { onSubmit, wrapper } = mountForm();
    await flushPromises();

    press('s', { ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);

    press('s', { metaKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });

  it('does not save an incomplete entry', async () => {
    const { data, onSubmit, wrapper } = mountForm();
    await flushPromises();

    data.description = '';
    press('s', { ctrlKey: true });

    expect(onSubmit).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('focuses the amount with Ctrl+I and n', async () => {
    const { wrapper } = mountForm();
    await flushPromises();

    (document.activeElement as HTMLElement)?.blur();
    press('i', { ctrlKey: true });
    expect(document.activeElement).toBe(wrapper.find('#input').element);

    (document.activeElement as HTMLElement)?.blur();
    press('n');
    expect(document.activeElement).toBe(wrapper.find('#input').element);

    wrapper.unmount();
  });
});
