<template>
  <Teleport to="body" v-if="isOpen">
    <div
      class="base-modal__overlay"
      @click.self="onOverlayClick"
    >
      <div
        ref="modalRef"
        class="base-modal box"
        :style="style"
        role="dialog"
        aria-modal="true"
        :aria-label="props.title || 'Dialog'"
        tabindex="-1"
      >
        <div v-if="props.title" class="box__header">
          <h3 class="title">{{ props.title }}</h3>
        </div>
        <div class="box__body">
          <slot />
        </div>
        <div class="box__footer">
          <button type="button" :disabled="props.loading" @click="!props.loading && emit('cancel')">Cancel</button>
          <button :type="buttonType" :disabled="props.confirmDisabled || props.loading" @click="onConfirmHandler">
            <IconLoader2 v-if="props.loading" class="is-spinning" width="16" height="16" />
            <template v-else>{{ props.confirmText }}</template>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';

import { blockHotkeys } from '@/composable/useHotkeys';
import { useFocusTrap } from '@/composable/useFocusTrap';

interface Props {
  title?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
  type?: 'default' | 'success' | 'danger';
  preventOutsideClick?: boolean;
  loading?: boolean;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  confirmText: 'Confirm',
  preventOutsideClick: false,
  loading: false,
  width: '800px',
});

interface Emits {
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}

const emit = defineEmits<Emits>();

const isOpen = defineModel();
const modalRef = ref<HTMLDivElement | null>(null);

useFocusTrap(modalRef, computed(() => Boolean(isOpen.value)));

let unblockHotkeys: (() => void) | null = null;

const style = computed(() => ({ width: props.width }));
const buttonType = computed(() => {
  switch (props.type) {
    case 'success':
      return 'submit';
    case 'danger':
      return 'reset';
    default:
      return 'button';
  }
});

const onOverlayClick = () => {
  if (props.loading) return;
  if (props.preventOutsideClick) return;
  emit('cancel');
};

const onEscapeKeyHandler = (e: KeyboardEvent) => {
  if (props.loading) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    emit('cancel');
    return;
  }

  if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'Enter')) {
    e.preventDefault();
    if (!props.confirmDisabled) emit('confirm');
  }
};

const onConfirmHandler = () => {
  if (props.loading) return;
  emit('confirm');
};

watch(
  isOpen,
  () => {
    if (isOpen.value) {
      document.body?.classList.add('noscroll');
      document.addEventListener('keydown', onEscapeKeyHandler);

      if (!unblockHotkeys) unblockHotkeys = blockHotkeys();
    } else {
      document.body?.classList.remove('noscroll');
      document.removeEventListener('keydown', onEscapeKeyHandler);

      unblockHotkeys?.();
      unblockHotkeys = null;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  document.body?.classList.remove('noscroll');
  document.removeEventListener('keydown', onEscapeKeyHandler);

  unblockHotkeys?.();
  unblockHotkeys = null;
});
</script>

<style lang="scss" scoped>
.base-modal {
  position: relative;
  max-width: 90%;
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

.box {
  padding: 32px;

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 0 0;

    button {
      flex: 1 1 0;
      min-width: 0;
      margin: 0;
    }
  }
}
</style>
