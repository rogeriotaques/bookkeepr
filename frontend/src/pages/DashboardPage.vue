<template>
  <div class="dashboard-page">
    <header class="dashboard-page__header">
      <div class="dashboard-page__heading">
        <h1>You're doing great!</h1>
        <p class="dashboard-page__subtitle">Keep it up.</p>
      </div>

      <button
        type="button"
        class="is-full-width dashboard-page__logout"
        @click="onLogout"
      >
        Logout
      </button>
    </header>

    <div class="dashboard-page__grid" data-testid="dashboard-grid">
      <!-- Left: the annual overview. -->
      <div class="box dashboard-page__chart" data-testid="dashboard-chart">
        <AnnualChart :year="year" />
      </div>

      <!-- Right: summary, progress and the latest entries, stacked. -->
      <div class="dashboard-page__side">
        <div v-if="isLoading" data-testid="dashboard-loading" class="dashboard-page__loading">
          <BaseSkeleton />
        </div>

        <template v-else>
          <!-- Empty state: no budget anywhere in the year -->
          <div v-if="annualBudgetTotal === 0" class="dashboard-page__empty">
            <p>No budget set for {{ year }}.</p>
            <RouterLink to="/planning" class="dashboard-page__cta">
              Set up your budget
            </RouterLink>
          </div>

          <template v-else>
            <!-- Summary -->
            <div class="box dashboard-page__summary">
              <h2 class="dashboard-page__summary-heading">Annual budget {{ year }}</h2>
              <div class="dashboard-page__summary-item">
                <span class="dashboard-page__summary-label">Budget</span>
                <span class="dashboard-page__summary-value">{{ formatCurrency(annualBudgetTotal) }}</span>
              </div>
              <div class="dashboard-page__summary-item">
                <span class="dashboard-page__summary-label">Actual</span>
                <span class="dashboard-page__summary-value">{{ formatCurrency(annualActualTotal) }}</span>
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
                <span>Annual spending progress</span>
                <span>{{ progressPercent }}%</span>
              </div>
              <BaseProgress
                :value="progressPercent"
                :max="100"
                class="dashboard-page__progress-bar"
              />
            </div>

            <!-- Empty state: no transactions -->
            <div v-if="annualActualTotal === 0" class="dashboard-page__empty">
              <p>No transactions recorded this year.</p>
            </div>
          </template>
        </template>

        <RecentTransactions :limit="5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import dayjs from 'dayjs';
import BaseProgress from '@/components/shared/BaseProgress.vue';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import AnnualChart from '@/components/report/AnnualChart.vue';
import RecentTransactions from '@/components/transactions/RecentTransactions.vue';
import useDataFetch from '@/composable/useDataFetch';
import { logout } from '@/composable/useState';

const year = dayjs().year();

// The same query the annual chart makes, so vue-query shares one request.
const reportUrl = ref(`/reports?year=${year}`);
const { fetchData: getAnnualReport } = useDataFetch(reportUrl);
const { isLoading, data: reportData } = await getAnnualReport();

// The year's budget is the sum of every month that has one, and the year's
// spending is the report's own expense total.
const annualBudgetTotal = computed(() =>
  ((reportData.value?.budgets ?? []) as { budget: number }[]).reduce(
    (sum, month) => sum + Number(month.budget ?? 0),
    0
  )
);

const annualActualTotal = computed(() => Number(reportData.value?.insights?.thisYear?.outcome ?? 0));

const balance = computed(() => annualBudgetTotal.value - annualActualTotal.value);
const progressPercent = computed(() => {
  if (annualBudgetTotal.value === 0) return 0;
  return Math.round((annualActualTotal.value / annualBudgetTotal.value) * 100);
});

const balanceClass = computed(() => ({
  'dashboard-page__summary-value--negative': balance.value < 0,
}));

const onLogout = () => logout();

function formatCurrency(value: number | undefined): string {
  const num = Number(value ?? 0);
  return '¥ ' + num.toLocaleString();
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width-wide);
  margin: 0 auto;

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-md);
    margin-bottom: var(--bk-space-xl);
  }

  &__heading {
    text-align: center;

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

  &__logout {
    color: var(--bk-text-secondary);
    border-color: var(--bk-border);
    background-color: var(--bk-surface);
  }

  // Mobile: everything stacks in one column.
  &__grid {
    display: block;
  }

  &__side {
    min-width: 0;
  }

  // The annual chart needs room for its left legend. On small screens the full
  // chart lives on the Report page instead.
  &__chart {
    display: none;
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

    &-heading {
      grid-column: 1 / -1;
      font-size: var(--bk-text-lg);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-sm);
    }

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
        background-color: var(--bk-danger-light);
      }
    }
  }
}

// Boring's `button:hover` (0,3,1) tints the button, so the red hover needs the
// extra ancestor to win.
.dashboard-page .dashboard-page__logout:hover,
.dashboard-page .dashboard-page__logout:focus,
.dashboard-page .dashboard-page__logout:active {
  color: var(--bk-danger);
  border-color: var(--bk-danger);
  background-color: var(--bk-surface);
}

// Desktop: the chart on the left, the summary / progress / recent transactions
// stacked on the right.
@media (min-width: 1024px) {
  .dashboard-page {
    &__header {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }

    &__heading {
      text-align: left;

      h1 {
        font-size: var(--bk-text-3xl);
      }
    }

    // The top navigation owns the Logout action on desktop. `!important` beats
    // the global `button { display: flex !important }` rule.
    &__logout {
      display: none !important;
    }

    &__grid {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      gap: var(--bk-space-lg);
      align-items: start;
    }

    &__chart {
      display: block;
      margin: 0;
    }
  }
}
</style>
