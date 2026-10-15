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
          <div v-if="!hasBudget" class="dashboard-page__empty">
            <p>No budget set for {{ year }}.</p>
            <RouterLink to="/planning" class="dashboard-page__cta">
              Set up your budget
            </RouterLink>
          </div>

          <template v-else>
            <!-- Summary (planned vs realized) and progress -->
            <PlannedRealizedSummary
              :planned="planned"
              :realized="realized"
              :title="`Annual budget ${year}`"
            />

            <!-- Empty state: no transactions -->
            <div v-if="realized.income === 0 && realized.expense === 0" class="dashboard-page__empty">
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
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import AnnualChart from '@/components/report/AnnualChart.vue';
import PlannedRealizedSummary from '@/components/report/PlannedRealizedSummary.vue';
import RecentTransactions from '@/components/transactions/RecentTransactions.vue';
import useDataFetch from '@/composable/useDataFetch';
import { logout } from '@/composable/useState';

const year = dayjs().year();

// The same query the annual chart makes, so vue-query shares one request.
const reportUrl = ref(`/reports?year=${year}`);
const { fetchData: getAnnualReport } = useDataFetch(reportUrl);
const { isLoading, data: reportData } = await getAnnualReport();

// Planned: what the year's budget items add up to, split by operation.
// Realized: what the report recorded, same split. Both fall back to zero so
// the template never touches an undefined field.
const planned = computed(() => ({
  income: Number(reportData.value?.planned?.income ?? 0),
  expense: Number(reportData.value?.planned?.expense ?? 0),
}));

const realized = computed(() => ({
  income: Number(reportData.value?.realized?.income ?? 0),
  expense: Number(reportData.value?.realized?.expense ?? 0),
}));

const hasBudget = computed(() => planned.value.income > 0 || planned.value.expense > 0);

const onLogout = () => logout();
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
