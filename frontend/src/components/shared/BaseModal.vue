<template>
  <Teleport to="body" v-if="isOpen">
    <div ref="overlayRef" class="base-modal__overlay">
      <div class="base-modal box" :style="style">
        <div v-if="props.title" class="box__header">
          <h3 class="title">{{ props.title }}</h3>
        </div>
        <div class="box__body">
          <slot />
        </div>
        <div class="box__footer">
          <a class="box__link" @click="!props.loading && emit('cancel')">Cancel</a>
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
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';

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
const overlayRef = ref<HTMLDivElement | null>(null);

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

const onOverlayClick = (e: MouseEvent) => {
  if (props.loading) return;
  if (props.preventOutsideClick) return;
  if (e.target === overlayRef.value) {
    emit('cancel');
  }
};

const onEscapeKeyHandler = (e: KeyboardEvent) => {
  if (props.loading) return;
  if (e.key === 'Escape') emit('cancel');
};

const onConfirmHandler = () => {
  if (props.loading) return;
  emit('confirm');
};

watch(isOpen, async () => {
  await nextTick();

  if (isOpen.value) {
    document.body?.classList.add('noscroll');
    document.addEventListener('keydown', onEscapeKeyHandler);
    overlayRef.value?.addEventListener('click', onOverlayClick);
  } else {
    document.body?.classList.remove('noscroll');
    document.removeEventListener('keydown', onEscapeKeyHandler);
    overlayRef.value?.removeEventListener('click', onOverlayClick);
  }
});

onBeforeUnmount(() => {
  document.body?.classList.remove('noscroll');
  document.removeEventListener('keydown', onEscapeKeyHandler);
  overlayRef.value?.removeEventListener('click', onOverlayClick);
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

  &__link {
    cursor: pointer;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 16px 0 0;
  }
}
</style>
