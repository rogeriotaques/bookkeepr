<template>
  <div class="base-progress">
    <div
      :style="{ width: width, height: height }"
      class="progress progress--infinite"
    ></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  width?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
});
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
