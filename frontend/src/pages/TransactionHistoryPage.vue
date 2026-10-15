<template>
  <div class="history-page">
    <!-- Budget Summary Bar -->
    <div v-if="!isLoading" class="box history-page__summary">
      <div class="history-page__summary-item">
        <span class="history-page__summary-label">Budget</span>
        <span class="history-page__summary-value">{{ formatCurrency(expenseBudgetTotal) }}</span>
      </div>
      <div class="history-page__summary-item">
        <span class="history-page__summary-label">Actual</span>
        <span class="history-page__summary-value">{{ formatCurrency(actualTotal) }}</span>
      </div>
      <div class="history-page__summary-item">
        <span class="history-page__summary-label">Progress</span>
        <span class="history-page__summary-value">{{ progressPercent }}%</span>
      </div>
      <BaseProgress
        :value="progressPercent"
        :max="100"
        class="history-page__summary-progress"
      />
    </div>

    <BalanceFilterForm
      v-model:year="year"
      v-model:month="month"
      v-model:search="search"
      :years="recordedYears"
      :loading="isRecordedYearsLoading"
    />

    <BalanceTable
      :data="entries"
      :loading="isEntriesLoading || isSettingsLoading"
      :locale="locale"
      :search="search"
      @update="invalidateEntriesQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

import BalanceTable from '@/components/transactions/BalanceTable.vue';
import BalanceFilterForm from '@/components/transactions/BalanceFilterForm.vue';
import BaseProgress from '@/components/shared/BaseProgress.vue';

import { ExtendedEntry } from '@/domain/interfaces';
import useDataFetch from '@/composable/useDataFetch';
import { useBudget } from '@/composable/useBudget';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

// The summary and the progress bar follow the year/month filter, so the
// composables get reactive sources rather than a snapshot of the mount month.
const selectedYear = computed(() => Number(year.value));
const selectedMonth = computed(() => Number(month.value));

const settingsUrl = ref('/settings');
const recordedYearsUrl = ref('/entries/recorded-years');
const entriesUrl = computed(() => `/entries?year=${year.value}&month=${month.value}`);

const { fetchData: getRecordedYears, invalidateQuery: invalidateRecordedYearsQuery } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const { fetchData: getEntries, invalidateQuery: invalidateEntriesQuery } = useDataFetch(entriesUrl);
const { isLoading: isEntriesLoading, data: entriesData } = await getEntries();

const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { isLoading: isSettingsLoading, data: settingsData } = await getSettingsData();

const { expenseBudgetTotal, isLoading: isBudgetLoading } = useBudget(selectedYear, selectedMonth);
const { report, isLoading: isReportLoading } = useMonthlyReport(selectedYear, selectedMonth);

const isLoading = computed(() =>
  isEntriesLoading.value || isSettingsLoading.value || isBudgetLoading.value || isReportLoading.value
);

const locale = computed(() => {
  const { config } = settingsData?.value || ({} as any);
  return {
    currencyCode: config?.currencyCode || 'JPY',
    currencyLocale: config?.currencyLocale || 'ja-JP',
  };
});

const entries = computed(() => (entriesData.value?.entries ?? []) as ExtendedEntry[]);
const recordedYears = computed(() => (recordedYearsData.value?.years ?? []) as string[]);

const actualTotal = computed(() => report.value?.actualTotal ?? 0);
const progressPercent = computed(() => {
  if (expenseBudgetTotal.value === 0) return 0;
  return Math.round((actualTotal.value / expenseBudgetTotal.value) * 100);
});

watch([year, month], () => {
  search.value = '';
  invalidateEntriesQuery();
  invalidateRecordedYearsQuery();
});

function formatCurrency(value: number): string {
  return '¥ ' + (value || 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.history-page {
  // No page chrome: this is the right-hand column of the Transactions page,
  // which owns the width and the gutter.

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-lg);

    &-progress {
      grid-column: 1 / -1;
      width: 100%;
      max-width: 100%;
      margin: var(--bk-space-sm) 0 0;

      // Track = budget (light blue); fill = actual spending (red).
      :deep(.progress) {
        background-color: var(--c-info-background);
      }

      :deep(.progress::before) {
        background-color: var(--bk-danger-light);
      }
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
    }
  }
}
</style>
