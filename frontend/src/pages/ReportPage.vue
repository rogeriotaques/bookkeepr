<template>
  <section class="report-page">
    <header class="report-page__header">
      <h1>Annual Report for {{ filterByYear }}</h1>
    </header>

    <div
      v-if="isReportError"
      class="error-banner"
    >
      <p>Failed to load report. {{ reportError?.message }}</p>
    </div>
    <div class="report-page__insights row">
      <div class="col-10">
        <ReportInsights
          :data="reportData?.insights || {}"
          :loading="isReportLoading || isSettingsLoading"
          :locale="locale"
        />
      </div>
      <div class="col-2 report-page__controls">
        <BaseDropdown
          v-model="filterByYear"
          class="report-page__control"
          :options="recordedYears"
          :disabled="isRecordedYearsLoading"
          full-width
        />
        <button
          type="button"
          class="report-page__control report-page__print has-tooltip has-tooltip--bottom"
          :data-tooltip="`Print report (${modifierLabel()}+P)`"
          :aria-label="`Print report (${modifierLabel()}+P)`"
          aria-keyshortcuts="p"
          @click="onPrintClickHandler"
        >
          <IconPrinter />
        </button>
      </div>
    </div>

    <div class="report-page__charts row">
      <div class="col-4 report-page__pie">
        <Pie
          ref="pieRef"
          :data="pieData"
          :options="pieOptions"
        />
        <img
          v-if="pieSnapshot"
          class="report-page__snapshot"
          :src="pieSnapshot"
          alt=""
        >
      </div>
      <div class="col-8 report-page__chart">
        <Bar
          id="my-chart-id"
          ref="barRef"
          :style="chartStyles"
          :options="chartOptions"
          :data="chartData"
        />
        <img
          v-if="barSnapshot"
          class="report-page__snapshot"
          :src="barSnapshot"
          alt=""
        >
      </div>
    </div>

    <div class="pagebreak" />

    <ReportData
      :year="filterByYear"
      :data="reportData?.data || {}"
      :loading="isReportLoading"
      :locale="locale"
    />

    <ProTip target="report" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Bar, Pie } from 'vue-chartjs';
import { Chart as ChartJS, registerables } from 'chart.js';
import { IconPrinter } from '@tabler/icons-vue';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import ProTip from '@/components/shared/ProTip.vue';
import ReportInsights from '@/components/report/ReportInsights.vue';
import ReportData from '@/components/report/ReportData.vue';

import useDataFetch from '@/composable/useDataFetch';
import { useHotkeys } from '@/composable/useHotkeys';
import { modifierLabel } from '@/domain/hotkeys';

ChartJS.register(...registerables);

const filterByYear = ref(`${new Date().getFullYear()}`);
const recordedYearsUrl = ref('/entries/recorded-years');
const reportUrl = computed(() => `/reports?year=${filterByYear.value}`);
const settingsUrl = ref('/settings');

const { fetchData: getRecordedYears } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const recordedYears = computed(() => (recordedYearsData.value?.years ?? []).map((year: string) => ({ value: year, label: year })));

const stepYear = (delta: number) => {
  const years: string[] = (recordedYearsData.value?.years ?? []).map(String);
  if (years.length === 0) return;

  const current = years.indexOf(filterByYear.value);
  const index = Math.min(
    years.length - 1,
    Math.max(0, (current < 0 ? 0 : current) + delta)
  );

  filterByYear.value = years[index];
};

useHotkeys({
  p: () => onPrintClickHandler(),
  '[': () => stepYear(-1),
  ']': () => stepYear(1),
  t: () => {
    filterByYear.value = String(new Date().getFullYear());
  },
});

  const { fetchData: getReportData } = useDataFetch(reportUrl);
  const { isLoading: isReportLoading, isError: isReportError, data: reportData, error: reportError } = await getReportData();

const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { isLoading: isSettingsLoading, data: settingsData } = await getSettingsData();

const locale = computed(() => {
  const { config } = settingsData?.value || ({} as any);

  return {
    currencyCode: config?.currencyCode || 'JPY',
    currencyLocale: config?.currencyLocale || 'ja-JP',
  };
});

const datasets = computed(() => {
  const _ds: any = [];
  const data = reportData.value?.data;

  if (!data) return _ds;

  // One bar series per operation, summed across categories per month.
  const sumByMonth = (rows: any[]) =>
    Array.from({ length: 12 }, (_, month) =>
      rows.reduce((total, row) => total + Number(row[month + 1] ?? 0), 0)
    );

  if (data.income?.length) {
    _ds.push({
      type: 'bar',
      label: 'Income',
      borderWidth: 1,
      backgroundColor: 'rgba(55, 172, 40, 0.5)',
      data: sumByMonth(data.income),
      yAxisID: 'y',
    });
  }

  if (data.outcome?.length) {
    _ds.push({
      type: 'bar',
      label: 'Expenses',
      borderWidth: 1,
      backgroundColor: 'rgba(165, 43, 43, 0.5)',
      data: sumByMonth(data.outcome).map((amount) => -amount),
      yAxisID: 'y',
    });
  }

  _ds.push({
    type: 'line',
    label: 'Net worth',
    data: data.netWorth.slice(1),
    yAxisID: 'y1',
    fill: false,
  });

  return _ds;
});

const chartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: datasets.value,
}));

// Each category's yearly total, income and expenses combined. A pie cannot
// show a zero slice, so categories with no activity are left out.
const pieData = computed(() => {
  const data = reportData.value?.data;

  if (!data) return { labels: [], datasets: [] };

  const slices = [...(data.income ?? []), ...(data.outcome ?? [])]
    .map((row: any[]) => ({
      label: row[0] ?? 'N/A',
      total: row.slice(1).reduce((sum, amount) => sum + Number(amount ?? 0), 0),
    }))
    .filter((slice) => slice.total > 0);

  return {
    labels: slices.map((slice) => slice.label),
    datasets: [
      {
        data: slices.map((slice) => slice.total),
        backgroundColor: slices.map(
          (_, index) => `hsl(${Math.round((index * 137.5) % 360)}, 60%, 55%)`
        ),
        borderWidth: 1,
      },
    ],
  };
});

const pieOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        font: { size: 10, family: 'Archivo, sans-serif' },
        padding: 4,
      },
    },
  },
};

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      borderDash: [5, 5],
      borderWidth: 2,
      borderColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  scales: {
    x: { stacked: true },
    // Bars use the left axis; the lifetime net worth gets the right one so
    // its larger scale does not squash them.
    y: { stacked: true },
    y1: {
      position: 'right',
      grid: { drawOnChartArea: false },
    },
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        font: { size: 11, family: 'Archivo, sans-serif' },
        padding: 6,
      },
    },
  },
};

const chartStyles: any = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const onPrintClickHandler = () => {
  window.print();
};

const pieRef = ref<any>();
const barRef = ref<any>();
const pieSnapshot = ref('');
const barSnapshot = ref('');

// Chart.js redraws whenever the print layout changes the size of its container,
// and a redraw caught mid-flight prints a clipped or squashed chart. Handing the
// printer a bitmap taken just before it starts keeps the charts off that race.
const onBeforePrint = () => {
  pieSnapshot.value = pieRef.value?.chart?.canvas?.toDataURL('image/png') ?? '';
  barSnapshot.value = barRef.value?.chart?.canvas?.toDataURL('image/png') ?? '';
};

onMounted(() => window.addEventListener('beforeprint', onBeforePrint));
onBeforeUnmount(() => window.removeEventListener('beforeprint', onBeforePrint));
</script>

<style lang="scss" scoped>
.report-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width-wide);
  margin: 0 auto;

  &__header {
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0;
      // The year reads as "Annual Report for 2026", not Title Case.
      text-transform: none;
    }
  }

  &__insights {
    margin-bottom: var(--bk-space-xl);
  }

  // Mobile: the year selector leads the section, above the insights. Printing
  // stays a desktop action.
  &__controls {
    order: -1;
  }

  &__print {
    display: none !important;
  }

  &__pie,
  &__chart {
    position: relative;
    height: 420px;
    // Clothes the canvas on every side, not just above and below.
    padding: 16px;
    background-color: var(--c-background-disabled);
    box-shadow: rgba(0, 0, 0, 0.15) 0 0 12px inset;
    // Matches the boxes and cards.
    border-radius: var(--bk-radius-md);
  }

  // The print bitmap of each chart, see `onBeforePrint`.
  &__snapshot {
    display: none;

    // Boring frames every `img`; this one is a bitmap, not a figure.
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-md);

    // The dropdown and the print button share the column width.
    :deep(.base-dropdown) {
      width: 100%;
      margin-bottom: 0;
    }

    button {
      width: 100%;
      min-width: 0;
      margin: 0;
    }
  }
}

// Boring splits the 12 column grid at 768px, so the controls return to the
// right column and the print button appears from there up.
@media (min-width: 768px) {
  .report-page__controls {
    order: initial;
  }

  .report-page__print {
    display: flex !important;
  }
}

@media (min-width: 1024px) {
  .report-page__header h1 {
    font-size: var(--bk-text-3xl);
  }
}

@media print {
  .report-page {
    padding: 0;
    max-width: none;

    &__header {
      margin-bottom: var(--bk-space-xl);
    }

    &__insights {
      // The figures belong on the chart sheet, above the charts themselves.
      margin-bottom: var(--bk-space-xl);

      // Boring's grid does not split columns in print, see below.
      > .col-10 {
        grid-column: span 12;
      }
    }

    &__controls {
      display: none;
    }

    // Boring only splits the grid inside `@media screen`, so print would stack
    // both charts on their own full-width row. Restate the spans here.
    &__charts > &__pie {
      grid-column: span 4;
    }

    &__charts > &__chart {
      grid-column: span 8;
    }

    &__pie,
    &__chart {
      // One printed height for both, so the charts line up on the sheet.
      height: 360px;
      box-shadow: none;
      background-color: transparent;
      break-inside: avoid;
      // A stale canvas can be taller than the sheet box.
      overflow: hidden;
    }

    // Sits over the live canvas, which may be a half-drawn frame by now.
    &__snapshot {
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      // Same padding as its wrapper, so the bitmap fills the content box.
      padding: 16px;
      background-color: #fff;
      object-fit: contain;
    }

    // `visibility` keeps Chart.js's measurements intact, unlike `display`.
    &__pie:has(&__snapshot) :deep(canvas),
    &__chart:has(&__snapshot) :deep(canvas) {
      visibility: hidden;
    }

    .pagebreak {
      break-before: page;
      page-break-before: always;
    }
  }
}
</style>
