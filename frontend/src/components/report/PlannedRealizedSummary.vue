<template>
  <div class="planned-realized">
    <div class="box planned-realized__summary">
      <h2 v-if="title" class="planned-realized__summary-heading">{{ title }}</h2>
      <table class="planned-realized__summary-table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Planned</th>
            <th scope="col">Realized</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Income</th>
            <td class="planned-realized__value">{{ formatCurrency(planned.income) }}</td>
            <td class="planned-realized__value">{{ formatCurrency(realized.income) }}</td>
          </tr>
          <tr>
            <th scope="row">Expenses</th>
            <td class="planned-realized__value">{{ formatCurrency(planned.expense) }}</td>
            <td class="planned-realized__value">{{ formatCurrency(realized.expense) }}</td>
          </tr>
          <tr>
            <th scope="row">Balance</th>
            <td class="planned-realized__value" :class="plannedBalanceClass">
              {{ formatCurrency(plannedBalance) }}
            </td>
            <td class="planned-realized__value" :class="realizedBalanceClass">
              {{ formatCurrency(realizedBalance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Progress: how much of each plan is realized. -->
    <div class="box planned-realized__progress" data-testid="progress-bar">
      <div class="planned-realized__progress-row">
        <div class="planned-realized__progress-header">
          <span>Income</span>
          <span>{{ incomeProgress }}%</span>
        </div>
        <BaseProgress
          :value="incomeProgress"
          :max="100"
          class="planned-realized__progress-bar planned-realized__progress-bar--income"
        />
      </div>
      <div class="planned-realized__progress-row">
        <div class="planned-realized__progress-header">
          <span>Expenses</span>
          <span>{{ expenseProgress }}%</span>
        </div>
        <BaseProgress
          :value="expenseProgress"
          :max="100"
          class="planned-realized__progress-bar planned-realized__progress-bar--expense"
        />
      </div>
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
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
});

const plannedBalance = computed(() => props.planned.income - props.planned.expense);
const realizedBalance = computed(() => props.realized.income - props.realized.expense);

const percent = (actual: number, target: number) =>
  target === 0 ? 0 : Math.round((actual / target) * 100);

const incomeProgress = computed(() => percent(props.realized.income, props.planned.income));
const expenseProgress = computed(() => percent(props.realized.expense, props.planned.expense));

const plannedBalanceClass = computed(() => ({
  'planned-realized__value--negative': plannedBalance.value < 0,
}));

const realizedBalanceClass = computed(() => ({
  'planned-realized__value--negative': realizedBalance.value < 0,
}));

function formatCurrency(value: number | undefined): string {
  return '¥ ' + Number(value ?? 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.planned-realized {
  // Two panels side by side when the container is wide enough; stacked when
  // it is not (the Dashboard's side column is narrow, the Transactions' is wide).
  // `stretch` keeps both boxes the same height.
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--bk-space-lg);
  align-items: stretch;
  margin-bottom: var(--bk-space-lg);

  &__summary {
    &-heading {
      font-size: var(--bk-text-lg);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-sm);
    }

    &-table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        padding: var(--bk-space-xs) 0;
        text-align: right;
      }

      thead th {
        font-size: var(--bk-text-xs);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--bk-text-secondary);
      }

      tbody th {
        text-align: left;
        font-size: var(--bk-text-sm);
        font-weight: 500;
        color: var(--bk-text-secondary);
      }
    }
  }

  &__value {
    font-size: var(--bk-text-base);
    font-weight: 600;
    color: var(--bk-text-primary);

    &--negative {
      color: var(--bk-danger);
    }
  }

  &__progress {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--bk-space-md);

    &-header {
      display: flex;
      justify-content: space-between;
      font-size: var(--bk-text-sm);
      color: var(--bk-text-secondary);
      margin-bottom: var(--bk-space-xs);
    }

    // Match the Transaction History progress: full width, light blue track.
    // Income fills green; expenses fill red. Shorter than Boring's default so
    // the panel lines up with the summary table.
    &-bar {
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
}
</style>
