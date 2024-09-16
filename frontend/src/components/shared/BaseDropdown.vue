<template>
  <Popper
    :show="isOpen || props.show"
    :disable-click-away="true"
    :interactive="false"
    :class="{
      'base-dropdown--full-width': props.fullWidth,
      'base-dropdown--searchable': props.searchable,
    }"
    class="base-dropdown"
    trigger="click"
    offset-distance="-12"
    placement="bottom-start"
    @open:popper="onOpenPopperHandler"
  >
    <button
      :disabled="props.disabled"
      class="base-dropdown__trigger"
      type="button"
      @focus="onTriggerHandler(TRIGGER_CONTEXT.FOCUS)"
      @click="onTriggerHandler(TRIGGER_CONTEXT.CLICK)"
      @blur="onTriggerBlurHandler"
    >
      <span class="base-dropdown__trigger-label">{{ selectedOption?.label ?? props.placeholder }}</span>
      <IconChevronDown :size="16" />
    </button>

    <template #content>
      <div
        v-if="props.searchable"
        class="base-dropdown__filter"
      >
        <input
          v-model="filter"
          ref="filterRef"
          class="base-dropdown__filter-input"
          type="text"
          placeholder="Filter"
          @focus="isFilterFocused = true"
          @blur="onFilterInputBlurHandler"
        />
      </div>
      <div
        ref="itemsRef"
        class="base-dropdown__items"
      >
        <button
          v-for="option in filteredOptions"
          :key="option.value ?? 'empty'"
          :class="{ 'base-dropdown__item--selected': option.value === selectedOptionValue }"
          class="base-dropdown__item"
          @click="onItemClickHandler(option.value)"
        >
          {{ option.label }}
        </button>
        <div
          v-if="filteredOptions.length === 0"
          class="base-dropdown__item base-dropdown__item--empty"
        >
          No options found
        </div>
      </div>
    </template>
  </Popper>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { IconChevronDown } from '@tabler/icons-vue';
import Popper from 'vue3-popper';

import type { Nullable } from '@/domain/interfaces';

const TRIGGER_CONTEXT = {
  CLICK: 'click',
  FOCUS: 'focus',
} as const;

interface DropdownOption {
  value: Nullable<string | number>;
  label: string;
}

type PopperPlacement =
  | 'auto'
  | 'auto-start'
  | 'auto-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';

interface Props {
  options: DropdownOption[];
  placeholder?: string;
  fullWidth?: boolean;
  placement?: PopperPlacement;
  disabled?: boolean;
  searchable?: boolean;
  openOnFocus?: boolean;
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select',
});

interface Emits {
  (e: 'select', value: Nullable<string | number>): void;
}

const emit = defineEmits<Emits>();

const filterRef = ref<HTMLInputElement | null>(null);
const itemsRef = ref<HTMLDivElement | null>(null);

const selectedOptionValue = defineModel();
const isFilterFocused = ref(false);
const isTriggerLocked = ref(false);
const isOpen = ref(false);
const filter = ref('');

const selectedOption = computed(() => props.options.find((option) => option.value === selectedOptionValue.value));

const filteredOptions = computed(() => {
  if (!props.searchable) return props.options;
  return props.options.filter((option) => option.label.toLowerCase().includes(filter.value.toLowerCase()));
});

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const onTriggerHandler = (ctx: string) => {
  if (ctx === TRIGGER_CONTEXT.FOCUS && !props.openOnFocus) return;

  // Note: the lock prevents that a click event is triggered after a focus
  if (isTriggerLocked.value) {
    isTriggerLocked.value = false;
    return;
  }

  isOpen.value = !isOpen.value;
  isTriggerLocked.value = true;

  setTimeout(() => {
    isTriggerLocked.value = false;
  }, 250);
};

const onTriggerBlurHandler = async () => {
  // Note: wait to see if the filter input is focused
  await wait(100);
  if (isFilterFocused.value) return;

  isOpen.value = false;
};

const onOpenPopperHandler = async () => {
  await nextTick();
  itemsRef.value?.querySelector('.base-dropdown__item--selected')?.scrollIntoView({ block: 'end' });
};

const onItemClickHandler = (value: Nullable<string | number>) => {
  selectedOptionValue.value = value;
  isOpen.value = false;
  emit('select', value);
};

const onFilterInputBlurHandler = async () => {
  await wait(100);
  isFilterFocused.value = false;

  if (isOpen.value) {
    isOpen.value = false;
  }
};

const onDocumentScrollHandler = () => {
  isOpen.value = false;
};

const navigateItems = (event: KeyboardEvent) => {
  const direction = event.key === 'ArrowDown' ? 'nextSibling' : 'previousSibling';

  let currentItem = itemsRef.value?.querySelector('.base-dropdown__item--focused');
  let sibling = currentItem?.[direction] as HTMLButtonElement;

  if (!currentItem) {
    currentItem = itemsRef.value?.querySelector('.base-dropdown__item:first-child');
    sibling = currentItem as HTMLButtonElement;
  }

  if (!sibling || sibling instanceof HTMLButtonElement === false) return;

  currentItem?.classList?.remove('base-dropdown__item--focused');
  sibling.classList?.add('base-dropdown__item--focused');
  sibling.scrollIntoView({ block: 'end' });
};

const onDocumentKeydownHandler = (event: KeyboardEvent) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) return;

  event.preventDefault();

  switch (event.key) {
    case 'Escape':
      isOpen.value = false;
      break;
    case 'ArrowDown':
    case 'ArrowUp':
      navigateItems(event);
      break;
    default: // Enter,Tab
      const currentItem = itemsRef.value?.querySelector('.base-dropdown__item--focused') as HTMLButtonElement;

      if (!currentItem) return;
      currentItem.click();
      break;
  }
};

const highlightFirstItem = () => {
  let itemToFocus = itemsRef.value?.querySelector('.base-dropdown__item--selected') as HTMLButtonElement;

  if (!itemToFocus) {
    itemToFocus = itemsRef.value?.querySelector(':not(.base-dropdown__item--empty).base-dropdown__item:first-child') as HTMLButtonElement;
  }

  itemToFocus?.classList?.add('base-dropdown__item--focused');
};

watch(isOpen, async () => {
  if (isOpen.value) {
    const document = window.document;
    document.addEventListener('scroll', onDocumentScrollHandler);
    document.addEventListener('keydown', onDocumentKeydownHandler);

    highlightFirstItem();

    if (props.searchable) {
      await await wait(100);
      filterRef.value?.focus();
    }
  } else {
    const document = window.document;
    document.removeEventListener('scroll', onDocumentScrollHandler);
    document.removeEventListener('keydown', onDocumentKeydownHandler);

    // Reset the filter whenever the dropdown is closed
    filter.value = '';
  }
});
</script>

<style lang="scss" scoped>
.base-dropdown {
  width: fit-content;
  margin-bottom: 12px;

  &--full-width {
    width: 100%;
  }

  &__filter {
    &-input {
      background-color: var(--c-white);
      padding: 8px 16px;
      border-top: 0;
      border-left: 0;
      border-right: 0;
      border-radius: 8px 8px 0 0;
      box-shadow: none;
      width: 100%;

      &:focus,
      &:focus-visible {
        outline: none;
        background-color: var(--c-info-background);
      }
    }
  }

  &__trigger {
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;

    &:focus,
    &:active {
      background-color: var(--c-warning-background);
    }

    &-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
    }
  }

  &__items {
    width: 100%;
    overflow: hidden;
    overflow-y: auto;
    max-height: 150px;
  }

  &__item {
    $itemClass: &;

    display: block !important;
    background-color: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    text-align: left;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 8px 16px;

    &:not(:first-child) {
      border-top: 1px solid var(--c-border);
    }

    &:hover,
    &:focus,
    &:active,
    &--focused {
      background-color: var(--c-smoke);
      box-shadow: none;
      transform: none;

      &#{$itemClass}--selected {
        background-color: var(--c-warning);
      }
    }

    &--empty {
      color: var(--c-placeholder);
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }

    &--selected {
      background-color: var(--c-warning-background);

      &:hover,
      &:focus,
      &:active {
        background-color: var(--c-warning);
      }
    }
  }
}

:deep(.popper) {
  text-align: initial;
  padding: 0 !important;
  overflow: hidden;
}
</style>
