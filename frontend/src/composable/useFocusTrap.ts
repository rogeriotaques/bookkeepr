import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (root: HTMLElement | null): HTMLElement[] => {
  if (!root) return [];

  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' &&
      !element.hasAttribute('disabled') &&
      (element as HTMLInputElement).type !== 'hidden'
  );
};

export const useFocusTrap = (
  root: Ref<HTMLElement | null>,
  isOpen: Ref<boolean | undefined>,
  initialFocus?: Ref<HTMLElement | null>
) => {
  let previouslyFocused: HTMLElement | null = null;
  let active = false;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !active) return;

    const focusable = getFocusable(root.value);
    const activeElement = document.activeElement as HTMLElement | null;

    if (focusable.length === 0) {
      event.preventDefault();
      root.value?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const inside = Boolean(activeElement && root.value?.contains(activeElement));

    if (event.shiftKey) {
      if (!inside || activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (!inside || activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activate = async () => {
    if (active) return;
    active = true;

    previouslyFocused = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeyDown);

    await nextTick();

    const target = initialFocus?.value;
    if (target) {
      target.focus();
      return;
    }

    const focusable = getFocusable(root.value);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      root.value?.focus();
    }
  };

  const deactivate = () => {
    if (!active) return;
    active = false;

    document.removeEventListener('keydown', onKeyDown);

    const target = previouslyFocused;
    previouslyFocused = null;
    target?.focus?.();
  };

  watch(
    isOpen,
    (open) => {
      if (open) {
        activate();
      } else {
        deactivate();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown);
    if (active) {
      const target = previouslyFocused;
      previouslyFocused = null;
      target?.focus?.();
    }
  });
};
