<template>
  <div class="dashboard-page">
    <div class="dashboard-page__grid" data-testid="dashboard-grid">
      <!-- Row 1: insight (left) + annual budget card (right). -->
      <header v-if="isLoading || hasBudget" class="dashboard-page__header">
        <InsightPanel
          class="box dashboard-page__heading"
          :insight="insightData?.insight"
          :loading="insightLoading"
          :error="insightError"
        />
      </header>

      <div v-if="isLoading || hasBudget" class="dashboard-page__summary">
        <div v-if="isLoading" data-testid="dashboard-loading" class="dashboard-page__loading">
          <BaseSkeleton />
        </div>

        <PlannedRealizedTable
          v-else
          :planned="planned"
          :realized="realized"
          :title="`Annual budget ${year}`"
        />
      </div>

      <!-- No budget: one full-row notice replaces both top cards. -->
      <div v-if="!isLoading && !hasBudget" class="box dashboard-page__notice">
        <div class="dashboard-page__notice-copy">
          <h1>No budget set for {{ year }}</h1>
          <p>Setting a budget helps BookKeepr to provide you with better insights.</p>
        </div>
        <RouterLink to="/planning" class="button dashboard-page__cta">
          Set up your budget
        </RouterLink>
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

      <!-- Mobile only: the bottom bar has no room for it, so it closes the page. -->
      <button
        type="button"
        class="is-full-width dashboard-page__logout"
        aria-keyshortcuts="Shift+L"
        @click="onLogout"
      >
        Logout
      </button>
    </div>

    <BaseConfirmModal
      v-model="isLogoutOpen"
      type="danger"
      title="Log out"
      confirm-text="Log out"
      @confirm="onConfirmLogout"
      @cancel="isLogoutOpen = false"
    >
      <p>Are you sure you want to log out?</p>
    </BaseConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import AnnualChart from '@/components/report/AnnualChart.vue';
import InsightPanel from '@/components/report/InsightPanel.vue';
import PlannedRealizedTable from '@/components/report/PlannedRealizedTable.vue';
import PlannedRealizedProgress from '@/components/report/PlannedRealizedProgress.vue';
import RecentTransactions from '@/components/transactions/RecentTransactions.vue';
import useDataFetch from '@/composable/useDataFetch';
import { useHotkeys } from '@/composable/useHotkeys';
import { logout } from '@/composable/useState';

const router = useRouter();
const year = dayjs().year();
const month = dayjs().month() + 1;
const isLogoutOpen = ref(false);

// The same query the annual chart makes, so vue-query shares one request.
const reportUrl = ref(`/reports?year=${year}`);
const insightUrl = ref(`/reports/insight?year=${year}&month=${month}`);
const annualFetch = useDataFetch(reportUrl);
const insightFetch = useDataFetch(insightUrl);

// Both fetchData calls run before this await so both useQuery calls keep the
// setup injection context. Awaiting one first makes the second throw.
const [annualResult, insightResult] = await Promise.all([
  annualFetch.fetchData(),
  insightFetch.fetchData(),
]);

const { isLoading, data: reportData } = annualResult;
const {
  isLoading: insightLoading,
  isError: insightError,
  data: insightData,
} = insightResult;

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

useHotkeys({
  n: () => {
    router?.push('/transactions');
  },
});

const onLogout = () => {
  isLogoutOpen.value = true;
};

const onConfirmLogout = () => {
  isLogoutOpen.value = false;
  logout();
};
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

  // The insight card owns its typography; this class owns the cell.
  &__heading {
    text-align: center;
  }

  &__logout {
    color: var(--bk-text-secondary);
    border-color: var(--bk-border);
    background-color: var(--bk-surface);
    margin-top: var(--bk-space-md);
  }

  // Mobile: everything stacks in one column, in template order:
  // insight, budget card, chart, progress + recent transactions.
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

  // Replaces the insight and the budget card while the year has no budget.
  &__notice {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--bk-space-lg);
    padding: var(--bk-space-lg);
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-sm);
      text-transform: none;
    }

    p {
      color: var(--bk-text-secondary);
      margin: 0;
      max-width: 60ch;
    }
  }

  // Boring's `[type=submit]` palette, on a link that navigates instead of
  // submitting a form. `inline-flex` restores Boring's auto width; the global
  // `button, .button` rule stretches every button to its container.
  &__cta {
    display: inline-flex !important;
    color: var(--c-black);
    background-color: var(--c-success-background);
    border-color: var(--c-success);
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

// Desktop: row 1 is insight | annual budget, row 2 is the overview chart |
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

    &__notice {
      grid-column: 1 / -1;
      margin: 0;
      padding: var(--bk-space-xl);

      h1 {
        font-size: var(--bk-text-3xl);
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
