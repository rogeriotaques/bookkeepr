<template>
  <div class="base-progress">
    <div
      :class="progressClasses"
      :style="progressStyle"
    ></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  width?: string;
  height?: string;
  value?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  max: 100,
});

const percent = computed(() => {
  if (props.value === undefined || props.max <= 0) return 0;

  return Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100)));
});

const progressClasses = computed(() =>
  props.value === undefined ? ['progress', 'progress--infinite'] : ['progress', `progress--${percent.value}`]
);

const progressStyle = computed(() => ({
  width: props.width,
  height: props.height,
}));
</script>

<style lang="scss" scoped>
.base-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 90%;
  margin: 0 auto;
  gap: 8px;
}
</style>
