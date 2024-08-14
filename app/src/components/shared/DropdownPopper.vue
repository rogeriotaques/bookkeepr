<template>
  <Popper
    :class="{ 'dropdown-popper--full-width': props.fullWidth }"
    class="dropdown-popper"
    trigger="click"
    offset-distance="-12"
    @open:popper="onOpenPopperHandler"
  >
    <button class="dropdown-popper__trigger" type="button" @click="isOpen = !isOpen">
      <span>{{ selectedOption?.label ?? props.placeholder }}</span>
      <IconChevronDown :size="16" />
    </button>

    <template #content="{ close }">
      <div ref="itemsRef" class="dropdown-popper__dropdown-items">
        <button
          v-for="option in props.options"
          :key="option.value"
          :class="{ 'dropdown-popper__dropdown-item--selected': option.value === selectedOptionValue }"
          class="dropdown-popper__dropdown-item"
          @click="
            onClickHandler(option.value);
            close();
          "
        >
          {{ option.label }}
        </button>
        <div v-if="props.options.length === 0" class="dropdown-popper__dropdown-item dropdown-popper__dropdown-item--empty">No options found</div>
      </div>
    </template>
  </Popper>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { IconChevronDown } from '@tabler/icons-vue';
import Popper from 'vue3-popper';

const itemsRef = ref<HTMLDivElement | null>(null);

const selectedOptionValue = defineModel();
const isOpen = ref(false);

interface DropdownOption {
  value: string;
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
  (e: 'input', value: string): void;
}

const emit = defineEmits<Emits>();

const selectedOption = computed(() => props.options.find((option) => option.value === selectedOptionValue.value));

const onClickHandler = (value: string) => {
  selectedOptionValue.value = value;
  emit('input', value);
};

const onOpenPopperHandler = async () => {
  await nextTick();
  itemsRef.value?.querySelector('.dropdown-popper__dropdown-item--selected')?.scrollIntoView({ block: 'nearest' });
};
</script>

<style lang="scss" scoped>
.dropdown-popper {
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

  &__dropdown-items {
    width: 100%;
    overflow: hidden;
    overflow-y: auto;
    max-height: 150px;
  }

  &__dropdown-item {
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
