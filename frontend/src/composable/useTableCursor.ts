import { ref, watch } from 'vue';

import { isEditableTarget, useHotkeys, type HotkeyMap } from './useHotkeys';

interface TableCursorOptions {
  count: () => number;
  onActivate?: (index: number) => void;
  onDelete?: (index: number) => void;
  onToggle?: (index: number) => void;
  onClear?: () => void;
  onMove?: (index: number) => void;
}

export const useTableCursor = (options: TableCursorOptions) => {
  const activeIndex = ref(-1);

  const clamp = () => {
    const count = options.count();

    if (count === 0) {
      activeIndex.value = -1;
      return;
    }

    if (activeIndex.value >= count) {
      activeIndex.value = count - 1;
    }
  };

  watch(() => options.count(), clamp);

  const move = (delta: number) => {
    const count = options.count();
    if (count === 0) return;

    const current = activeIndex.value;
    const next =
      current < 0
        ? delta > 0
          ? 0
          : count - 1
        : (current + delta + count) % count;

    activeIndex.value = next;
    options.onMove?.(next);
  };

  const withActive = (handler?: (index: number) => void): boolean => {
    const index = activeIndex.value;
    if (index < 0 || index >= options.count()) return false;
    handler?.(index);
    return true;
  };

  const clear = () => {
    activeIndex.value = -1;
    options.onClear?.();
  };

  const handlers: HotkeyMap = {
    j: () => move(1),
    arrowdown: () => move(1),
    k: () => move(-1),
    arrowup: () => move(-1),
    escape: () => {
      if (isEditableTarget(document.activeElement) || activeIndex.value < 0) {
        return false;
      }

      clear();
    },
  };

  if (options.onActivate) {
    handlers.enter = () => withActive(options.onActivate);
    handlers.e = () => withActive(options.onActivate);
  }

  if (options.onToggle) {
    handlers.space = () => withActive(options.onToggle);
  }

  if (options.onDelete) {
    handlers.delete = () => withActive(options.onDelete);
    handlers.backspace = () => withActive(options.onDelete);
  }

  useHotkeys(handlers);

  const rowTabIndex = (index: number) => {
    const active = activeIndex.value < 0 ? 0 : activeIndex.value;
    return index === active ? 0 : -1;
  };

  const onRowFocus = (index: number) => {
    activeIndex.value = index;
  };

  return { activeIndex, rowTabIndex, onRowFocus, clear };
};
