import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

import { resetHotkeys } from '@/composable/useHotkeys';
import ShortcutHelp from '@/components/shared/ShortcutHelp.vue';

const press = (key: string) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
};

describe('ShortcutHelp', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    resetHotkeys();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    wrapper?.unmount();
    resetHotkeys();
    document.body.innerHTML = '';
  });

  const mountHelp = () =>
    mount(ShortcutHelp, {
      attachTo: document.body,
      props: { open: true },
    });

  const search = async (value: string) => {
    const input = document.querySelector('#shortcut-search') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await flushPromises();
  };

  it('lists the global and page shortcuts', async () => {
    wrapper = mountHelp();
    await flushPromises();

    const dialog = document.querySelector('.shortcut-help') as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    expect(dialog.textContent).toContain('Keyboard shortcuts');
    expect(dialog.textContent).toContain('g d');
    expect(dialog.textContent).toContain('Dashboard');
    expect(dialog.textContent).toContain('Planning');
    expect(dialog.textContent).toContain('Delete / Backspace');
  });

  it('focuses the search field', async () => {
    wrapper = mountHelp();
    await flushPromises();

    expect(document.activeElement).toBe(
      document.querySelector('#shortcut-search')
    );
  });

  it('filters the rows by description', async () => {
    wrapper = mountHelp();
    await flushPromises();

    await search('print');

    const dialog = document.querySelector('.shortcut-help') as HTMLElement;
    expect(dialog.textContent).toContain('Print the report');
    expect(dialog.textContent).not.toContain('Open a new entry');
    expect(dialog.textContent).not.toContain('Show this panel');
  });

  it('shows a message when no description matches', async () => {
    wrapper = mountHelp();
    await flushPromises();

    await search('zzzz');

    const dialog = document.querySelector('.shortcut-help') as HTMLElement;
    expect(dialog.textContent).toContain('No shortcuts found');
    expect(dialog.querySelectorAll('dl')).toHaveLength(0);
  });

  it('clears the search on Escape before it closes', async () => {
    wrapper = mountHelp();
    await flushPromises();

    await search('print');
    press('Escape');
    await flushPromises();

    expect(wrapper.emitted('update:open')).toBeUndefined();
    expect((document.querySelector('#shortcut-search') as HTMLInputElement).value).toBe('');

    press('Escape');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });

  it('closes with ?', async () => {
    wrapper = mountHelp();
    await flushPromises();

    press('?');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
  });
});
