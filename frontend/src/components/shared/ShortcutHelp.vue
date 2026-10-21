<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="shortcut-help__overlay"
      @click.self="close"
    >
      <div
        ref="panelRef"
        class="shortcut-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcut-help-title"
        tabindex="-1"
      >
        <header class="shortcut-help__header">
          <h2 id="shortcut-help-title">Keyboard shortcuts</h2>
          <button
            type="button"
            class="shortcut-help__close"
            aria-label="Close shortcuts"
            @click="close"
          >
            <IconX :size="20" />
          </button>
        </header>

        <div class="input input--with-addons shortcut-help__search">
          <label
            class="input__addon input__addon--icon"
            for="shortcut-search"
          >
            <IconSearch :size="18" />
          </label>
          <input
            id="shortcut-search"
            ref="searchRef"
            v-model="query"
            type="text"
            placeholder="Search shortcuts"
            aria-label="Search shortcuts"
            autocomplete="off"
          />
        </div>

        <div
          v-if="filteredGroups.length > 0"
          class="shortcut-help__grid"
        >
          <section
            v-for="group in filteredGroups"
            :key="group.title"
            class="shortcut-help__group"
          >
            <h3>{{ group.title }}</h3>
            <dl>
              <div
                v-for="item in group.items"
                :key="`${group.title}-${item.keys}-${item.label}`"
                class="shortcut-help__row"
              >
                <dt><kbd>{{ item.keys }}</kbd></dt>
                <dd>{{ item.label }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div
          v-else
          class="shortcut-help__empty"
          role="status"
          aria-live="polite"
        >
          <p class="shortcut-help__empty-title">No shortcuts found</p>
          <p>Nothing matches "{{ query.trim() }}". Try another word.</p>
        </div>

        <p class="shortcut-help__hint">
          Press <kbd>Esc</kbd> to clear the search or close.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { IconSearch, IconX } from '@tabler/icons-vue';

import { blockHotkeys, isEditableTarget } from '@/composable/useHotkeys';
import { useFocusTrap } from '@/composable/useFocusTrap';
import { hotkeyHelpGroups } from '@/domain/hotkeys';

const isOpen = defineModel<boolean>('open', { default: false });

const panelRef = ref<HTMLDivElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const query = ref('');
const groups = hotkeyHelpGroups();

let unblockHotkeys: (() => void) | null = null;

const filteredGroups = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(needle)
      ),
    }))
    .filter((group) => group.items.length > 0);
});

useFocusTrap(
  panelRef,
  computed(() => Boolean(isOpen.value)),
  searchRef
);

const close = () => {
  isOpen.value = false;
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();

    if (query.value) {
      query.value = '';
      return;
    }

    close();
    return;
  }

  if (event.key === '?' && !isEditableTarget(event.target)) {
    event.preventDefault();
    close();
  }
};

const activate = async () => {
  document.body?.classList.add('noscroll');
  document.addEventListener('keydown', onKeyDown);

  if (!unblockHotkeys) unblockHotkeys = blockHotkeys();

  await nextTick();
  if (!isOpen.value) return;
  searchRef.value?.focus();
};

const deactivate = () => {
  document.body?.classList.remove('noscroll');
  document.removeEventListener('keydown', onKeyDown);

  unblockHotkeys?.();
  unblockHotkeys = null;
};

watch(
  isOpen,
  (open) => {
    if (open) {
      activate();
    } else {
      query.value = '';
      deactivate();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  deactivate();
});
</script>

<style lang="scss" scoped>
.shortcut-help {
  width: min(560px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--bk-space-lg);
  border: 1px solid var(--bk-border);
  border-radius: var(--bk-radius-lg);
  background-color: var(--bk-surface);
  box-shadow: var(--bk-shadow-lg);

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--bk-space-md);
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.25);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bk-space-md);
    margin-bottom: var(--bk-space-md);

    h2 {
      margin: 0;
      font-size: var(--bk-text-xl);
      color: var(--bk-text-primary);
    }
  }

  &__close {
    min-width: var(--bk-touch-min);
    min-height: var(--bk-touch-min);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    color: var(--bk-text-secondary);

    &:not(:disabled):hover,
    &:not(:disabled):focus {
      color: var(--bk-danger);
      background: transparent;
      box-shadow: none;
      transform: none;
    }
  }

  &__search {
    width: 100%;
    margin-bottom: var(--bk-space-lg);
  }

  &__grid {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-lg);
  }

  &__group {
    h3 {
      margin: 0 0 var(--bk-space-sm);
      color: var(--bk-text-secondary);
      font-size: var(--bk-text-xs);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    dl {
      margin: 0;
    }
  }

  &__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--bk-space-md);
    padding: var(--bk-space-xs) 0;
    border-bottom: 1px solid var(--bk-border);

    &:last-child {
      border-bottom: 0;
    }

    dt {
      flex: 0 0 auto;
    }

    dd {
      margin: 0;
      color: var(--bk-text-secondary);
      font-size: var(--bk-text-sm);
      text-align: right;
    }
  }

  &__empty {
    padding: var(--bk-space-xl) var(--bk-space-md);
    text-align: center;
    color: var(--bk-text-secondary);

    p {
      margin: 0;
      font-size: var(--bk-text-sm);
    }

    &-title {
      margin-bottom: var(--bk-space-xs) !important;
      color: var(--bk-text-primary);
      font-size: var(--bk-text-base) !important;
      font-weight: 700;
    }
  }

  kbd {
    display: inline-block;
    padding: 2px 6px;
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-sm);
    background-color: var(--bk-background);
    color: var(--bk-text-primary);
    font-family: 'Source Code Pro', monospace;
    font-size: var(--bk-text-xs);
    white-space: nowrap;
  }

  &__hint {
    margin: var(--bk-space-lg) 0 0;
    color: var(--bk-text-muted);
    font-size: var(--bk-text-xs);
    text-align: center;
  }
}

@media (max-width: 767px) {
  .shortcut-help {
    padding: var(--bk-space-md);
  }
}

@media print {
  .shortcut-help__overlay {
    display: none;
  }
}
</style>
