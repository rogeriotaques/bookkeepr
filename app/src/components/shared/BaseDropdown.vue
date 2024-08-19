<template>
  <Popper
    :show="isOpen"
    :class="{ 'base-dropdown--full-width': props.fullWidth }"
    class="base-dropdown"
    trigger="click"
    offset-distance="-12"
    @open:popper="onOpenPopperHandler"
  >
    <button class="base-dropdown__trigger" type="button" @click="isOpen = !isOpen" @blur="isOpen = false">
      <span>{{ selectedOption?.label ?? props.placeholder }}</span>
      <IconChevronDown :size="16" />
    </button>

    <template #content="{ close }">
      <div ref="itemsRef" class="base-dropdown__items">
        <button
          v-for="option in props.options"
          :key="option.value ?? 'empty'"
          :class="{ 'base-dropdown__item--selected': option.value === selectedOptionValue }"
          class="base-dropdown__item"
          @click="
            onClickHandler(option.value);
            close();
          "
        >
          {{ option.label }}
        </button>
        <div v-if="props.options.length === 0" class="base-dropdown__item base-dropdown__item--empty">No options found</div>
      </div>
    </template>
  </Popper>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { IconChevronDown } from '@tabler/icons-vue';
import Popper from 'vue3-popper';

import type { Nullable } from '@/domain/interfaces';

const itemsRef = ref<HTMLDivElement | null>(null);

const selectedOptionValue = defineModel();
const isOpen = ref(false);

interface DropdownOption {
  value: Nullable<string | number>;
  label: string;
}

interface Props {
  options: DropdownOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select',
});

interface Emits {
  (e: 'select', value: Nullable<string | number>): void;
}

const emit = defineEmits<Emits>();

const selectedOption = computed(() => props.options.find((option) => option.value === selectedOptionValue.value));

const onClickHandler = (value: Nullable<string | number>) => {
  selectedOptionValue.value = value;
  emit('select', value);
};

const onOpenPopperHandler = async () => {
  await nextTick();
  itemsRef.value?.querySelector('.base-dropdown-item--selected')?.scrollIntoView({ block: 'nearest' });
};

const onDocumentScrollHandler = () => {
  isOpen.value = false;
};

watch(isOpen, (value) => {
  if (value) {
    const document = window.document;
    document.addEventListener('scroll', onDocumentScrollHandler);
  } else {
    const document = window.document;
    document.removeEventListener('scroll', onDocumentScrollHandler);
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

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;

    &:focus,
    &:active {
      background-color: var(--c-warning-background);
    }
  }

  &__items {
    width: 100%;
    overflow: hidden;
    overflow-y: auto;
    max-height: 150px;
  }

  &__item {
    display: block;
    background-color: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    text-align: left;
    width: 100%;
    height: auto;
    margin: 0;
    padding: 8px 16px;

    &:not(:first-child) {
      border-top: 1px solid var(--c-border);
    }

    &:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    &:hover,
    &:focus,
    &:active {
      background-color: var(--c-smoke);
      box-shadow: none;
      transform: none;
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
    }
  }
}

:deep(.popper) {
  text-align: initial;
  padding: 0 !important;
}
</style>
