import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';

import {
  installHotkeyDispatcher,
  resetHotkeys,
} from '@/composable/useHotkeys';
import BalanceFilterForm from '@/components/transactions/BalanceFilterForm.vue';

const press = (key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
};

describe('BalanceFilterForm hotkeys', () => {
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

  it('focuses the search field with / and Cmd/Ctrl+K', async () => {
    const wrapper = mount(BalanceFilterForm, {
      attachTo: document.body,
      props: { year: '2026', month: '10', search: '', years: ['2026'] },
      global: { stubs: { BaseDropdown: true } },
    });

    press('/');
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find('input').element);

    (document.activeElement as HTMLElement)?.blur();
    press('k', document.body, { ctrlKey: true });
    await wrapper.vm.$nextTick();
    expect(document.activeElement).toBe(wrapper.find('input').element);

    wrapper.unmount();
  });

  it('clears the search with Escape from the field', async () => {
    const wrapper = mount(BalanceFilterForm, {
      attachTo: document.body,
      props: { year: '2026', month: '10', search: 'lunch', years: ['2026'] },
      global: { stubs: { BaseDropdown: true } },
    });

    const input = wrapper.find('input').element as HTMLInputElement;
    input.focus();

    press('Escape', input);

    expect(wrapper.emitted('update:search')?.[0]).toEqual(['']);

    wrapper.unmount();
  });
});
