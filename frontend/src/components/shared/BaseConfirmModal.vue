<template>
  <Teleport to="body" v-if="isOpen">
    <div ref="overlayRef" class="base-confirm-modal__overlay">
      <div class="base-confirm-modal card">
        <div v-if="props.title" class="card__header">
          <h3 class="title">{{ props.title }}</h3>
        </div>
        <div class="card__body">
          <slot />
        </div>
        <div class="card__footer">
          <a :class="{ 'card__link--disabled': props.loading }" class="card__link" @click="emit('cancel')">Cancel</a>
          <a :class="[`card__link--${props.type}`, { 'card__link--disabled': props.loading }]" class="card__link" @click="onConfirmHandler">
            <IconLoader2 v-if="props.loading" class="is-spinning" width="16" height="16" />
            <template v-else>{{ props.confirmText }}</template>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, nextTick, ref, onBeforeUnmount } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';

interface Props {
  title?: string;
  type?: 'success' | 'warning' | 'danger' | 'dark' | 'default';
  confirmText?: string;
  preventOutsideClick?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  confirmText: 'Confirm',
  preventOutsideClick: false,
  loading: false,
});

interface Emits {
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}

const emit = defineEmits<Emits>();

const isOpen = defineModel();
const overlayRef = ref<HTMLDivElement | null>(null);

const onOverlayClick = (e: MouseEvent) => {
  if (props.loading) return;
  if (props.preventOutsideClick) return;
  if (e.target === overlayRef.value) {
    emit('cancel');
  }
};

const onKeyDownHandler = (e: KeyboardEvent) => {
  if (props.loading) return;
  if (e.key === 'Escape') emit('cancel');
  if (e.key === 'Enter') emit('confirm');
};

watch(isOpen, async () => {
  await nextTick();

  if (isOpen.value) {
    document.body?.classList.add('noscroll');
    document.addEventListener('keydown', onKeyDownHandler);
    overlayRef.value?.addEventListener('click', onOverlayClick);
  } else {
    document.body?.classList.remove('noscroll');
    document.removeEventListener('keydown', onKeyDownHandler);
    overlayRef.value?.removeEventListener('click', onOverlayClick);
  }
});

onBeforeUnmount(() => {
  document.body?.classList.remove('noscroll');
  document.removeEventListener('keydown', onKeyDownHandler);
  overlayRef.value?.removeEventListener('click', onOverlayClick);
});

const onConfirmHandler = () => {
  if (props.loading) return;
  emit('confirm');
};
</script>

<style lang="scss" scoped>
@use "sass:color";

.base-confirm-modal {
  position: relative;
  z-index: 1100;

  &__overlay {
    background: rgba(0, 0, 0, 0.25);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: var(--bk-space-md);
  }
}

.card {
  &__link {
    $class: &;
    cursor: pointer;
    display: flex;
    height: 48px;
    align-items: center;
    justify-content: center;

    &--disabled {
      cursor: not-allowed;

      &:hover {
        color: currentColor;
        background-color: transparent;
      }
    }

    &--success {
      color: var(--c-white);
      background-color: var(--c-success);
    }

    &--warning {
      color: var(--c-white);
      background-color: var(--c-warning);
    }

    &--danger {
      color: var(--c-white);
      background-color: var(--c-danger);
    }

    &--disabled,
    &:hover {
      &#{$class}--success {
        background-color: color.adjust(#37ac28, $lightness: -10%);
      }

      &#{$class}--warning {
        background-color: color.adjust(#d4b228, $lightness: -10%);
      }

      &#{$class}--danger {
        background-color: color.adjust(#a52b2b, $lightness: -10%);
      }
    }

    > svg {
      stroke: var(--c-white) !important;
    }
  }
}
</style>
