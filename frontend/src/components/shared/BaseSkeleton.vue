<template>
  <div
    :class="wrapperClasses"
    class="skeleton__wrapper"
  >
    <div
      :style="{ width: props.width, height: props.height }"
      class="skeleton"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  width?: string;
  height?: string;
  right?: boolean;
  centered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '24px',
});

const wrapperClasses = computed(() => ({
  'skeleton__wrapper--right': props.right && !props.centered,
  'skeleton__wrapper--centered': props.centered,
}));
</script>

<style lang="scss" scoped>
.skeleton {
  $class: &;

  background-color: #e0e0e0;
  background-image: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  background-position: 100% 0;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;

  &__wrapper {
    display: flex;
    width: 100%;
    padding: 0 4px;

    &--right {
      justify-content: flex-end;
    }

    &--centered {
      justify-content: center;
    }

    + #{$class}__wrapper {
      margin-top: 8px;
    }
  }
}

/* Shimmer animation */
@keyframes shimmer {
  100% {
    background-position: -100% 0;
  }
}
</style>
