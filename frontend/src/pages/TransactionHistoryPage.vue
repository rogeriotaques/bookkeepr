<template>
  <div class="history-page">
    <header class="history-page__header">
      <h1>Transactions History</h1>
    </header>

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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';

import BalanceTable from '@/components/transactions/BalanceTable.vue';
import BalanceFilterForm from '@/components/transactions/BalanceFilterForm.vue';
import BaseProgress from '@/components/shared/BaseProgress.vue';

import { ExtendedEntry } from '@/domain/interfaces';
import useDataFetch from '@/composable/useDataFetch';
import { useBudget } from '@/composable/useBudget';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

const router = useRouter();

const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

const onCmdInputHandler = (e: KeyboardEvent) => {
  if (!e.metaKey || e.key !== 'i') return;

  e.preventDefault();
  e.stopPropagation();

  router.push('/entry');
};

onMounted(() => document.addEventListener('keydown', onCmdInputHandler));
onBeforeUnmount(() => document.removeEventListener('keydown', onCmdInputHandler));

const settingsUrl = ref('/settings');
const recordedYearsUrl = ref('/entries/recorded-years');
const entriesUrl = computed(() => `/entries?year=${year.value}&month=${month.value}`);

const { fetchData: getRecordedYears, invalidateQuery: invalidateRecordedYearsQuery } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const { fetchData: getEntries, invalidateQuery: invalidateEntriesQuery } = useDataFetch(entriesUrl);
const { isLoading: isEntriesLoading, data: entriesData } = await getEntries();

const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { isLoading: isSettingsLoading, data: settingsData } = await getSettingsData();

const { expenseBudgetTotal, isLoading: isBudgetLoading } = useBudget(Number(year.value), Number(month.value));
const { report, isLoading: isReportLoading } = useMonthlyReport(Number(year.value), Number(month.value));

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
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width);
  margin: 0 auto;

  &__header {
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0;
    }
  }

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
        background-color: var(--c-danger);
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
