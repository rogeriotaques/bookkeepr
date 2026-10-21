import { getCurrentInstance, onBeforeUnmount } from 'vue';

export type HotkeyHandler = (event: KeyboardEvent) => void | boolean;
export type HotkeyMap = Record<string, HotkeyHandler>;

export interface HotkeyScopeOptions {
  // An exclusive scope stops the search. Use it for a modal or a sheet.
  exclusive?: boolean;
  // A higher priority scope sees the key first.
  priority?: number;
}

interface HotkeyScope {
  handlers: HotkeyMap;
  exclusive: boolean;
  priority: number;
  order: number;
}

const SCOPE_TIMEOUT_MS = 1200;

const scopes: HotkeyScope[] = [];
let scopeOrder = 0;
let pendingPrefix: string | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let blockCount = 0;
let installCount = 0;

const clearPending = () => {
  pendingPrefix = null;
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
};

const hasSequenceStartingWith = (prefix: string): boolean =>
  scopes.some((scope) =>
    Object.keys(scope.handlers).some((key) => key.startsWith(`${prefix} `))
  );

const runScope = (key: string, event: KeyboardEvent): boolean => {
  const ordered = [...scopes].sort(
    (a, b) => b.priority - a.priority || b.order - a.order
  );

  for (const scope of ordered) {
    const handler = scope.handlers[key];

    if (handler) {
      const result = handler(event);
      if (result !== false) return true;
      continue;
    }

    if (scope.exclusive) return false;
  }

  return false;
};

const isSequence = (key: string): boolean => key.includes(' ');

const onKeyDown = (event: KeyboardEvent) => {
  if (blockCount > 0) {
    clearPending();
    return;
  }

  if (event.defaultPrevented || event.isComposing) return;

  const key = normalizeKey(event);
  if (!key) return;

  if (isEditableTarget(event.target) && !key.startsWith('mod+') && key !== 'escape') {
    return;
  }

  if (
    (key === 'enter' || key === 'space') &&
    isInteractiveTarget(event.target)
  ) {
    return;
  }

  if (
    event.repeat &&
    (key === 'enter' || key === 'space' || key === 'delete' || key === 'backspace')
  ) {
    return;
  }

  let resolvedKey = key;

  if (pendingPrefix) {
    const combined = `${pendingPrefix} ${key}`;
    clearPending();

    if (isSequence(combined) && runScope(combined, event)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    resolvedKey = key;
  }

  if (!isSequence(resolvedKey) && resolvedKey !== 'escape' && hasSequenceStartingWith(resolvedKey)) {
    pendingPrefix = resolvedKey;
    pendingTimer = setTimeout(clearPending, SCOPE_TIMEOUT_MS);
    event.preventDefault();
    return;
  }

  if (runScope(resolvedKey, event)) {
    event.preventDefault();
    event.stopPropagation();
  }
};

export const normalizeKey = (event: KeyboardEvent): string | null => {
  if (event.isComposing || !event.key) return null;

  const rawKey = event.key;
  const lowerKey = rawKey.toLowerCase();

  if (event.altKey && !event.metaKey && !event.ctrlKey) {
    return `alt+${lowerKey}`;
  }

  if (event.metaKey || event.ctrlKey) {
    return event.shiftKey ? `mod+shift+${lowerKey}` : `mod+${lowerKey}`;
  }

  if (event.shiftKey && /^[A-Z]$/.test(rawKey)) {
    return `shift+${lowerKey}`;
  }

  if (rawKey === ' ' || rawKey === 'Spacebar') return 'space';

  return lowerKey;
};

export const isEditableTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element || typeof element.closest !== 'function') return false;
  if (element.isContentEditable) return true;

  return Boolean(
    element.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
    )
  );
};

const isInteractiveTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element || typeof element.closest !== 'function') return false;

  return Boolean(element.closest('button, a[href], [role="button"], summary'));
};

export const registerHotkeys = (
  handlers: HotkeyMap,
  options: HotkeyScopeOptions = {}
): (() => void) => {
  const scope: HotkeyScope = {
    handlers,
    exclusive: options.exclusive ?? false,
    priority: options.priority ?? 0,
    order: scopeOrder,
  };

  scopeOrder += 1;
  scopes.push(scope);

  return () => {
    const index = scopes.indexOf(scope);
    if (index >= 0) scopes.splice(index, 1);
  };
};

export const useHotkeys = (
  handlers: HotkeyMap,
  options: HotkeyScopeOptions = {}
): (() => void) => {
  const unregister = registerHotkeys(handlers, options);

  if (getCurrentInstance()) {
    onBeforeUnmount(unregister);
  }

  return unregister;
};

export const blockHotkeys = (): (() => void) => {
  blockCount += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    blockCount = Math.max(0, blockCount - 1);
  };
};

export const installHotkeyDispatcher = (): (() => void) => {
  installCount += 1;

  if (installCount === 1 && typeof document !== 'undefined') {
    document.addEventListener('keydown', onKeyDown);
  }

  let released = false;

  return () => {
    if (released) return;
    released = true;
    installCount = Math.max(0, installCount - 1);

    if (installCount === 0 && typeof document !== 'undefined') {
      document.removeEventListener('keydown', onKeyDown);
    }
  };
};

export const resetHotkeys = () => {
  clearPending();
  scopes.splice(0, scopes.length);
  blockCount = 0;
};
