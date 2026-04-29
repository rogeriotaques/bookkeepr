<template>
  <div class="dashboard-page">
    <header class="dashboard-page__header">
      <h1>You're doing great!</h1>
      <p class="dashboard-page__subtitle">Keep it up.</p>
    </header>

    <div v-if="isLoading" data-testid="dashboard-loading" class="dashboard-page__loading">
      <BaseSkeleton />
    </div>

    <template v-else>
      <!-- Empty state: no budget -->
      <div v-if="!budget" class="dashboard-page__empty">
        <p>No budget set for {{ monthLabel }}.</p>
        <RouterLink to="/planning" class="dashboard-page__cta">
          Set up your budget for {{ monthLabel }}
        </RouterLink>
      </div>

      <!-- Summary cards -->
      <section v-else class="dashboard-page__summary">
        <div class="dashboard-page__cards">
          <div class="dashboard-page__card">
            <span class="dashboard-page__card-label">Budget</span>
            <span class="dashboard-page__card-value">{{ formatCurrency(expenseBudgetTotal) }}</span>
          </div>
          <div class="dashboard-page__card">
            <span class="dashboard-page__card-label">Actual</span>
            <span class="dashboard-page__card-value">{{ formatCurrency(actualTotal) }}</span>
          </div>
          <div class="dashboard-page__card">
            <span class="dashboard-page__card-label">Balance</span>
            <span class="dashboard-page__card-value" :class="balanceClass">
              {{ formatCurrency(balance) }}
            </span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="dashboard-page__progress" data-testid="progress-bar">
          <div class="dashboard-page__progress-header">
            <span>Spending Progress</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <BaseProgress
            :value="progressPercent"
            :max="100"
            height="12px"
          />
        </div>
      </section>

      <!-- Empty state: no transactions -->
      <div v-if="budget && actualTotal === 0" class="dashboard-page__empty">
        <p>No transactions recorded this month.</p>
      </div>

      <!-- Quick Actions -->
      <section class="dashboard-page__actions">
        <RouterLink to="/entry" class="dashboard-page__action">
          Record new expense
        </RouterLink>
        <RouterLink to="/history" class="dashboard-page__action">
          Transaction History
        </RouterLink>
        <RouterLink to="/planning" class="dashboard-page__action">
          Planning
        </RouterLink>
        <RouterLink to="/settings" class="dashboard-page__action">
          Settings
        </RouterLink>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import dayjs from 'dayjs';
import BaseProgress from '@/components/shared/BaseProgress.vue';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import { useBudget } from '@/composable/useBudget';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

const now = dayjs();
const year = now.year();
const month = now.month() + 1;

const { budget, expenseBudgetTotal, isLoading: budgetLoading } = useBudget(year, month);
const { report, isLoading: reportLoading } = useMonthlyReport(year, month);

const isLoading = computed(() => budgetLoading.value || reportLoading.value);

const actualTotal = computed(() => report.value?.actualTotal ?? 0);
const balance = computed(() => expenseBudgetTotal.value - actualTotal.value);
const progressPercent = computed(() => {
  if (expenseBudgetTotal.value === 0) return 0;
  return Math.round((actualTotal.value / expenseBudgetTotal.value) * 100);
});

const balanceClass = computed(() => ({
  'dashboard-page__card-value--negative': balance.value < 0,
}));

const monthLabel = computed(() => now.format('MMMM'));

function formatCurrency(value: number | undefined): string {
  const num = Number(value ?? 0);
  return '¥ ' + num.toLocaleString();
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width);
  margin: 0 auto;

  &__header {
    text-align: center;
    margin-bottom: var(--bk-space-xl);

    h1 {
      font-size: var(--bk-text-xl);
      color: var(--bk-text-primary);
      margin: 0;
    }
  }

  &__subtitle {
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-sm);
    margin-top: var(--bk-space-xs);
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: var(--bk-space-xl);
  }

  &__empty {
    text-align: center;
    padding: var(--bk-space-xl);
    color: var(--bk-text-secondary);

    p {
      margin-bottom: var(--bk-space-md);
    }
  }

  &__cta {
    display: inline-block;
    padding: var(--bk-space-sm) var(--bk-space-md);
    background: var(--bk-primary);
    color: white;
    border-radius: var(--bk-radius-md);
    text-decoration: none;
    font-size: var(--bk-text-sm);
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-xl);
  }

  &__card {
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
    padding: var(--bk-space-md);
    text-align: center;

    &-label {
      display: block;
      font-size: var(--bk-text-xs);
      color: var(--bk-text-secondary);
      margin-bottom: var(--bk-space-xs);
    }

    &-value {
      display: block;
      font-size: var(--bk-text-base);
      font-weight: 600;
      color: var(--bk-text-primary);

      &--negative {
        color: var(--bk-danger);
      }
    }
  }

  &__progress {
    margin-bottom: var(--bk-space-xl);
    padding: var(--bk-space-md);
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);

    &-header {
      display: flex;
      justify-content: space-between;
      font-size: var(--bk-text-sm);
      color: var(--bk-text-secondary);
      margin-bottom: var(--bk-space-sm);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-sm);
  }

  &__action {
    display: block;
    padding: var(--bk-space-md);
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-md);
    text-align: center;
    color: var(--bk-text-primary);
    text-decoration: none;
    font-size: var(--bk-text-base);
    min-height: var(--bk-touch-min);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--bk-background);
    }
  }
}
</style>
