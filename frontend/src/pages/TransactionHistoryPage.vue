<template>
  <div class="history-page">
    <!-- Planned vs realized: table and progress, side by side when wide -->
    <div v-if="!isLoading" class="history-page__summary">
      <PlannedRealizedTable
        :planned="planned"
        :realized="realized"
      />
      <PlannedRealizedProgress
        :planned="planned"
        :realized="realized"
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
      :editing="props.editing"
      @update="invalidateEntriesQuery"
      @edit="emit('edit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';

import BalanceTable from '@/components/transactions/BalanceTable.vue';
import BalanceFilterForm from '@/components/transactions/BalanceFilterForm.vue';
import PlannedRealizedTable from '@/components/report/PlannedRealizedTable.vue';
import PlannedRealizedProgress from '@/components/report/PlannedRealizedProgress.vue';

import { ExtendedEntry } from '@/domain/interfaces';
import useDataFetch from '@/composable/useDataFetch';
import { useHotkeys } from '@/composable/useHotkeys';
import { useMonthlyReport } from '@/composable/useMonthlyReport';

interface Props {
  editing?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  editing: null,
});

interface Emits {
  (e: 'edit', entry: ExtendedEntry): void;
}

const emit = defineEmits<Emits>();

const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

// The summary and the progress bar follow the year/month filter, so the
// composables get reactive sources rather than a snapshot of the mount month.
const selectedYear = computed(() => Number(year.value));
const selectedMonth = computed(() => Number(month.value));

const padMonth = (value: number) => `00${value}`.slice(-2);

const stepMonth = (delta: number) => {
  const next = Number(month.value) + delta;

  if (next < 1) {
    month.value = '12';
    year.value = String(Number(year.value) - 1);
    return;
  }

  if (next > 12) {
    month.value = '01';
    year.value = String(Number(year.value) + 1);
    return;
  }

  month.value = padMonth(next);
};

const stepYear = (delta: number) => {
  const next = Number(year.value) + delta;
  if (next < 1900 || next > 2999) return;
  year.value = String(next);
};

const goToCurrentMonth = () => {
  const now = dayjs();
  year.value = String(now.year());
  month.value = padMonth(now.month() + 1);
};

useHotkeys({
  '[': () => stepMonth(-1),
  ']': () => stepMonth(1),
  '{': () => stepYear(-1),
  '}': () => stepYear(1),
  t: goToCurrentMonth,
});

const settingsUrl = ref('/settings');
const recordedYearsUrl = ref('/entries/recorded-years');
const entriesUrl = computed(() => `/entries?year=${year.value}&month=${month.value}`);

const { fetchData: getRecordedYears, invalidateQuery: invalidateRecordedYearsQuery } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const { fetchData: getEntries, invalidateQuery: invalidateEntriesQuery } = useDataFetch(entriesUrl);
const { isLoading: isEntriesLoading, data: entriesData } = await getEntries();

const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { isLoading: isSettingsLoading, data: settingsData } = await getSettingsData();

const { report, isLoading: isReportLoading } = useMonthlyReport(selectedYear, selectedMonth);

const isLoading = computed(() =>
  isEntriesLoading.value || isSettingsLoading.value || isReportLoading.value
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

const planned = computed(() => ({
  income: Number(report.value?.planned?.income ?? 0),
  expense: Number(report.value?.planned?.expense ?? 0),
}));

const realized = computed(() => ({
  income: Number(report.value?.realized?.income ?? 0),
  expense: Number(report.value?.realized?.expense ?? 0),
}));

watch([year, month], () => {
  search.value = '';
  invalidateEntriesQuery();
  invalidateRecordedYearsQuery();
});
</script>

<style lang="scss" scoped>
.history-page {
  // No page chrome: this is the right-hand column of the Transactions page,
  // which owns the width and the gutter.

  // Table and progress sit side by side when there is room, stacked when not.
  &__summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
    gap: var(--bk-space-lg);
    align-items: stretch;
    margin-bottom: var(--bk-space-lg);
  }
}
</style>
