import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.dispatchEvent(event);
  return event;
};

describe('BaseModal keyboard support', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountModal = () =>
    mount(BaseModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Edit category' },
      slots: {
        default:
          '<input data-testid="first" /><input data-testid="second" /><button data-testid="last">Last</button>',
      },
    });

  it('is announced as a modal dialog', () => {
    wrapper = mountModal();
    const dialog = document.querySelector('.base-modal') as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Edit category');
  });

  it('moves focus to the first control when it opens', async () => {
    wrapper = mountModal();
    await flushPromises();

    expect(document.activeElement).toBe(document.querySelector('[data-testid="first"]'));
  });

  it('keeps Tab inside the modal', async () => {
    wrapper = mountModal();
    await flushPromises();

    const focusable = Array.from(
      document.querySelectorAll('.base-modal input, .base-modal button')
    ) as HTMLElement[];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    press('Tab');

    expect(document.activeElement).toBe(first);

    first.focus();
    press('Tab', { shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it('cancels on Escape and confirms on Cmd/Ctrl+Enter or Cmd/Ctrl+S', async () => {
    wrapper = mountModal();
    await flushPromises();

    press('Escape');
    expect(wrapper.emitted('cancel')).toHaveLength(1);

    press('Enter', { metaKey: true });
    press('Enter', { ctrlKey: true });
    press('s', { metaKey: true });
    press('s', { ctrlKey: true });
    expect(wrapper.emitted('confirm')).toHaveLength(4);
  });

  it('restores focus to the opener when it closes', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    wrapper = mountModal();
    await flushPromises();

    await wrapper.setProps({ modelValue: false });
    await nextTick();

    expect(document.activeElement).toBe(opener);
  });
});

describe('BaseConfirmModal keyboard support', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const mountConfirm = () =>
    mount(BaseConfirmModal, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Delete entry', type: 'danger' },
      slots: { default: '<p>Delete this entry?</p>' },
    });

  it('uses native buttons for both actions', () => {
    wrapper = mountConfirm();
    const buttons = Array.from(document.querySelectorAll('.base-confirm-modal button'));
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent?.trim()).toBe('Cancel');
    expect(buttons[1].textContent?.trim()).toBe('Confirm');
  });

  it('starts on Cancel and wraps Tab to it', async () => {
    wrapper = mountConfirm();
    await flushPromises();

    const buttons = Array.from(
      document.querySelectorAll('.base-confirm-modal button')
    ) as HTMLElement[];
    const [cancel, confirm] = buttons;
    expect(document.activeElement).toBe(cancel);

    confirm.focus();
    press('Tab');
    expect(document.activeElement).toBe(cancel);
  });

  it('cancels on Escape', async () => {
    wrapper = mountConfirm();
    await flushPromises();

    press('Escape');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('confirms on Cmd/Ctrl+Enter only', async () => {
    wrapper = mountConfirm();
    await flushPromises();

    press('Enter', { metaKey: true });
    press('Enter', { ctrlKey: true });
    press('s', { metaKey: true });
    expect(wrapper.emitted('confirm')).toHaveLength(2);
  });
});
