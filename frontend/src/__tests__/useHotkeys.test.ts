import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerHotkeys,
  installHotkeyDispatcher,
  blockHotkeys,
  resetHotkeys,
  isEditableTarget,
  normalizeKey,
} from '@/composable/useHotkeys';

interface PressOptions extends KeyboardEventInit {
  target?: EventTarget;
}

const press = (key: string, options: PressOptions = {}) => {
  const { target = document.body, ...init } = options;
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
};

describe('useHotkeys', () => {
  let uninstall: () => void;

  beforeEach(() => {
    resetHotkeys();
    uninstall = installHotkeyDispatcher();
  });

  afterEach(() => {
    uninstall();
    resetHotkeys();
  });

  describe('normalizeKey', () => {
    const key = (init: KeyboardEventInit) =>
      normalizeKey(new KeyboardEvent('keydown', init));

    it('normalizes letters, sequences, and special keys', () => {
      expect(key({ key: 'j' })).toBe('j');
      expect(key({ key: 'J', shiftKey: true })).toBe('shift+j');
      expect(key({ key: '?' })).toBe('?');
      expect(key({ key: '{' })).toBe('{');
      expect(key({ key: ' ' })).toBe('space');
      expect(key({ key: 'ArrowDown' })).toBe('arrowdown');
      expect(key({ key: 'Escape' })).toBe('escape');
    });

    it('normalizes meta and ctrl to the same modifier', () => {
      expect(key({ key: 's', metaKey: true })).toBe('mod+s');
      expect(key({ key: 's', ctrlKey: true })).toBe('mod+s');
    });
  });

  describe('isEditableTarget', () => {
    it('detects inputs, textareas, selects, and contenteditable hosts', () => {
      const input = document.createElement('input');
      const textarea = document.createElement('textarea');
      const select = document.createElement('select');
      const editable = document.createElement('div');
      editable.setAttribute('contenteditable', 'true');

      expect(isEditableTarget(input)).toBe(true);
      expect(isEditableTarget(textarea)).toBe(true);
      expect(isEditableTarget(select)).toBe(true);
      expect(isEditableTarget(editable)).toBe(true);
      expect(isEditableTarget(document.body)).toBe(false);
    });
  });

  it('dispatches a registered key and prevents the browser default', () => {
    const handler = vi.fn();
    registerHotkeys({ j: handler });

    const event = press('j');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('accepts Cmd and Ctrl for the same chord', () => {
    const handler = vi.fn();
    registerHotkeys({ 'mod+s': handler });

    press('s', { metaKey: true });
    press('s', { ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('ignores single letters while the user types in a field', () => {
    const handler = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    registerHotkeys({ j: handler });

    press('j', { target: input });

    expect(handler).not.toHaveBeenCalled();
    input.remove();
  });

  it('still runs modifier chords while the user types in a field', () => {
    const handler = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    registerHotkeys({ 'mod+s': handler });

    press('s', { metaKey: true, target: input });

    expect(handler).toHaveBeenCalledTimes(1);
    input.remove();
  });

  it('lets Escape run from a field', () => {
    const handler = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);
    registerHotkeys({ escape: handler });

    press('Escape', { target: input });

    expect(handler).toHaveBeenCalledTimes(1);
    input.remove();
  });

  it('runs a g sequence', () => {
    const handler = vi.fn();
    registerHotkeys({ 'g d': handler });

    press('g');
    expect(handler).not.toHaveBeenCalled();

    press('d');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('expires a pending g prefix', () => {
    vi.useFakeTimers();
    const handler = vi.fn();
    registerHotkeys({ 'g d': handler });

    press('g');
    vi.advanceTimersByTime(1300);
    press('d');

    expect(handler).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('stops at an exclusive scope', () => {
    const globalHandler = vi.fn();
    registerHotkeys({ j: globalHandler });
    registerHotkeys({}, { exclusive: true });

    press('j');

    expect(globalHandler).not.toHaveBeenCalled();
  });

  it('falls through when a handler returns false', () => {
    const pageHandler = vi.fn();
    const tableHandler = vi.fn(() => false);
    registerHotkeys({ j: pageHandler });
    registerHotkeys({ j: tableHandler });

    press('j');

    expect(tableHandler).toHaveBeenCalledTimes(1);
    expect(pageHandler).toHaveBeenCalledTimes(1);
  });

  it('runs a higher-priority scope first', () => {
    const calls: string[] = [];
    registerHotkeys({ escape: () => { calls.push('table'); return false; } });
    registerHotkeys({ escape: () => { calls.push('search'); } }, { priority: 10 });

    press('Escape');

    expect(calls).toEqual(['search']);
  });

  it('does nothing while an overlay blocks hotkeys', () => {
    const handler = vi.fn();
    registerHotkeys({ j: handler });
    const unblock = blockHotkeys();

    press('j');
    expect(handler).not.toHaveBeenCalled();

    unblock();
    press('j');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores events that another handler already consumed', () => {
    const handler = vi.fn();
    registerHotkeys({ j: handler });

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true, cancelable: true });
    event.preventDefault();
    document.body.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('ignores keys while an IME composition is active', () => {
    const handler = vi.fn();
    registerHotkeys({ j: handler });

    press('j', { isComposing: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it('unregisters a scope', () => {
    const handler = vi.fn();
    const unregister = registerHotkeys({ j: handler });

    unregister();
    press('j');

    expect(handler).not.toHaveBeenCalled();
  });
});
