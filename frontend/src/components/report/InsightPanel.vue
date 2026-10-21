<template>
  <div class="insight-panel">
    <div v-if="loading" class="insight-panel__loading" aria-hidden="true">
      <BaseSkeleton height="48px" />
    </div>

    <template v-else-if="error || !insight">
      <h1 class="insight-panel__title">Insight unavailable</h1>
      <p class="insight-panel__subtitle">Refresh to try again.</p>
    </template>

    <template v-else>
      <h1 class="insight-panel__title">{{ insight.title }}</h1>
      <p class="insight-panel__subtitle">{{ insight.subtitle }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Insight {
  title: string;
  subtitle: string;
}

withDefaults(
  defineProps<{
    insight?: Insight | null;
    loading?: boolean;
    error?: boolean;
  }>(),
  {
    insight: null,
    loading: false,
    error: false,
  }
);
</script>

<style lang="scss" scoped>
.insight-panel {
  &__loading {
    display: flex;
  }

  &__title {
    font-size: var(--bk-text-xl);
    color: var(--bk-text-primary);
    margin: 0;
    text-transform: none;
  }

  &__subtitle {
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-sm);
    margin-top: var(--bk-space-xs);
  }
}

@media (min-width: 1024px) {
  .insight-panel__title {
    font-size: var(--bk-text-3xl);
  }
}
</style>
