<template>
  <div class="dashboard-page">
    <div class="dashboard-page__grid" data-testid="dashboard-grid">
      <!-- Row 1: greeting (left) + annual budget card (right). -->
      <header class="dashboard-page__header">
        <div class="box dashboard-page__heading">
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

      <div class="dashboard-page__summary">
        <div v-if="isLoading" data-testid="dashboard-loading" class="dashboard-page__loading">
          <BaseSkeleton />
        </div>

        <!-- Empty state: no budget anywhere in the year -->
        <div v-else-if="!hasBudget" class="dashboard-page__empty">
          <p>No budget set for {{ year }}.</p>
          <RouterLink to="/planning" class="dashboard-page__cta">
            Set up your budget
          </RouterLink>
        </div>

        <PlannedRealizedTable
          v-else
          :planned="planned"
          :realized="realized"
          :title="`Annual budget ${year}`"
        />
      </div>

      <!-- Row 2: the annual overview (left) + progress and latest entries (right). -->
      <div class="box dashboard-page__chart" data-testid="dashboard-chart">
        <AnnualChart :year="year" />
      </div>

      <div class="dashboard-page__side">
        <PlannedRealizedProgress
          v-if="!isLoading && hasBudget"
          :planned="planned"
          :realized="realized"
        />

        <!-- Empty state: no transactions -->
        <div
          v-if="!isLoading && hasBudget && realized.income === 0 && realized.expense === 0"
          class="dashboard-page__empty"
        >
          <p>No transactions recorded this year.</p>
        </div>

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
import PlannedRealizedTable from '@/components/report/PlannedRealizedTable.vue';
import PlannedRealizedProgress from '@/components/report/PlannedRealizedProgress.vue';
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

  // The greeting is an account insight, not a title: keep its own casing.
  &__heading {
    text-align: center;

    h1 {
      font-size: var(--bk-text-xl);
      color: var(--bk-text-primary);
      margin: 0;
      text-transform: none;
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

  // Mobile: everything stacks in one column, in template order:
  // greeting, budget card, chart, progress + recent transactions.
  &__grid {
    display: block;
  }

  &__summary {
    margin-bottom: var(--bk-space-lg);
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

// Desktop: row 1 is greeting | annual budget, row 2 is the overview chart |
// progress + recent transactions. Rows share a band, so the chart lines up
// with the progress panel.
@media (min-width: 1024px) {
  .dashboard-page {
    // The insight card fills its cell, so it matches the annual budget card
    // beside it. Its text is centred vertically and reads left-aligned.
    &__header {
      grid-area: header;
      align-self: stretch;
      align-items: stretch;
      margin-bottom: 0;
    }

    &__heading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      text-align: left;
      margin: 0;

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
      grid-template-areas:
        'header summary'
        'chart side';
      gap: var(--bk-space-lg);
      align-items: start;
    }

    &__summary {
      grid-area: summary;
      margin-bottom: 0;

      // The card is the child component's root; drop Boring's box margin so the
      // grid gap owns the spacing.
      :deep(.box) {
        margin: 0;
      }
    }

    &__chart {
      grid-area: chart;
      display: block;
      margin: 0;
    }

    &__side {
      grid-area: side;

      :deep(.planned-realized-progress) {
        margin-bottom: var(--bk-space-lg);
      }
    }
  }
}
</style>
