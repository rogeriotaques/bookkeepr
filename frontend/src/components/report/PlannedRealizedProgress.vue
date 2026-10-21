<template>
  <div class="box planned-realized-progress" data-testid="progress-bar">
    <div class="planned-realized-progress__row">
      <div class="planned-realized-progress__header">
        <span>Income</span>
        <span>{{ percentLabel(incomeProgress) }}</span>
      </div>
      <BaseProgress
        :value="incomeProgress"
        :max="100"
        class="planned-realized-progress__bar planned-realized-progress__bar--income"
      />
    </div>
    <div class="planned-realized-progress__row">
      <div class="planned-realized-progress__header">
        <span>Expenses</span>
        <span>{{ percentLabel(expenseProgress) }}</span>
      </div>
      <BaseProgress
        :value="expenseProgress"
        :max="100"
        class="planned-realized-progress__bar planned-realized-progress__bar--expense"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BaseProgress from '@/components/shared/BaseProgress.vue';

interface Amounts {
  income: number;
  expense: number;
}

interface Props {
  planned: Amounts;
  realized: Amounts;
}

const props = defineProps<Props>();

const percent = (actual: number, target: number) =>
  target === 0 ? 0 : Math.round((actual / target) * 100);

const percentLabel = (value: number) => `${value.toLocaleString('en-US')}%`;

const incomeProgress = computed(() => percent(props.realized.income, props.planned.income));
const expenseProgress = computed(() => percent(props.realized.expense, props.planned.expense));
</script>

<style lang="scss" scoped>
.planned-realized-progress {
  display: flex;
  flex-direction: column;
  gap: var(--bk-space-md);

  &__header {
    display: flex;
    justify-content: space-between;
    font-size: var(--bk-text-sm);
    color: var(--bk-text-secondary);
    margin-bottom: var(--bk-space-xs);
  }

  // Match the Transaction History progress: full width, light blue track.
  // Income fills green; expenses fill red. Shorter than Boring's default so
  // the panel lines up with the summary table.
  &__bar {
    width: 100%;
    max-width: 100%;

    :deep(.progress) {
      background-color: var(--c-info-background);
      height: 28px;
      margin-bottom: 0;
    }

    &--income :deep(.progress::before) {
      background-color: var(--bk-primary);
    }

    &--expense :deep(.progress::before) {
      background-color: var(--bk-danger-light);
    }
  }
}
</style>
