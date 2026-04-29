<template>
  <div class="base-progress">
    <div
      :style="progressStyle"
      class="progress progress--infinite"
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
  height: '4px',
  value: 0,
  max: 100,
});

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
