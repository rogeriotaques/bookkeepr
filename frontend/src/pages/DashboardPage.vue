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

      <template v-else>
        <!-- Summary -->
        <div class="box dashboard-page__summary">
          <div class="dashboard-page__summary-item">
            <span class="dashboard-page__summary-label">Budget</span>
            <span class="dashboard-page__summary-value">{{ formatCurrency(expenseBudgetTotal) }}</span>
          </div>
          <div class="dashboard-page__summary-item">
            <span class="dashboard-page__summary-label">Actual</span>
            <span class="dashboard-page__summary-value">{{ formatCurrency(actualTotal) }}</span>
          </div>
          <div class="dashboard-page__summary-item">
            <span class="dashboard-page__summary-label">Balance</span>
            <span class="dashboard-page__summary-value" :class="balanceClass">
              {{ formatCurrency(balance) }}
            </span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="box dashboard-page__progress" data-testid="progress-bar">
          <div class="dashboard-page__progress-header">
            <span>Spending Progress</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <BaseProgress
            :value="progressPercent"
            :max="100"
            class="dashboard-page__progress-bar"
          />
        </div>
      </template>

      <!-- Empty state: no transactions -->
      <div v-if="budget && actualTotal === 0" class="dashboard-page__empty">
        <p>No transactions recorded this month.</p>
      </div>

      <!-- Quick Actions -->
      <section class="dashboard-page__actions">
        <RouterLink
          to="/entry"
          class="button is-full-width dashboard-page__action dashboard-page__action--primary"
        >
          Record new expense
        </RouterLink>
        <RouterLink to="/history" class="button is-full-width dashboard-page__action">
          Transaction History
        </RouterLink>
        <RouterLink to="/planning" class="button is-full-width dashboard-page__action">
          Planning
        </RouterLink>
        <RouterLink to="/settings" class="button is-full-width dashboard-page__action">
          Settings
        </RouterLink>
        <button
          type="button"
          class="is-full-width dashboard-page__action dashboard-page__action--danger"
          @click="onLogout"
        >
          Logout
        </button>
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
import { logout } from '@/composable/useState';

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
  'dashboard-page__summary-value--negative': balance.value < 0,
}));

const monthLabel = computed(() => now.format('MMMM'));

const onLogout = () => logout();

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

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-lg);

    &-item {
      text-align: center;
    }

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
    margin-bottom: var(--bk-space-lg);

    &-header {
      display: flex;
      justify-content: space-between;
      font-size: var(--bk-text-sm);
      color: var(--bk-text-secondary);
      margin-bottom: var(--bk-space-sm);
    }

    // Match the Transaction History progress: full width, budget track (light
    // blue) and actual spending fill (red).
    &-bar {
      width: 100%;
      max-width: 100%;

      :deep(.progress) {
        background-color: var(--c-info-background);
      }

      :deep(.progress::before) {
        background-color: var(--c-danger);
      }
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-sm);
  }

  &__action {
    margin: 0;

    // Separate the trailing Logout from the nav group by the same gap used
    // between the progress box and the first action (8px flex gap + 16px).
    &:last-child {
      margin-top: var(--bk-space-md);
    }

    // Mirror Boring's `button[type=submit]` (primary) and `button[type=reset]`
    // (danger) colours, since these are nav links / plain buttons.
    &--primary {
      background-color: var(--c-success-background);
      border-color: var(--c-success);
      color: var(--c-black);
    }

    &--danger {
      background-color: var(--c-danger-background);
      border-color: var(--c-danger);
      color: var(--c-black);
    }
  }
}
</style>
