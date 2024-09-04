<template>
  <section class="report-page">
    <div class="row">
      <div class="col-1" />
      <div class="col-2 report-page__filter">
        <BaseDropdown
          v-model="filterByYear"
          :options="recordedYears"
          :disabled="isRecordedYearsLoading"
        />
      </div>
      <div class="col-6">
        <ReportInsights
          :data="reportData?.insights || {}"
          :loading="isReportLoading"
        />
      </div>
    </div>

    <div class="report-page__chart">
      <Bar
        id="my-chart-id"
        :style="chartStyles"
        :options="chartOptions"
        :data="chartData"
      />
    </div>

    <ReportData
      :data="reportData?.data || {}"
      :loading="isReportLoading"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';

import { ENTRY_OPERATIONS } from '@/domain/constants';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import ReportInsights from '@/components/report/ReportInsights.vue';
import ReportData from '@/components/report/ReportData.vue';

import useDataFetch from '@/composable/useDataFetch';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

const randomColor = (opacity = 0.1) => {
  const o = Math.round,
    r = Math.random,
    s = 255;
  return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + opacity + ')';
};

const filterByYear = ref(`${new Date().getFullYear()}`);
const recordedYearsUrl = ref('/entries/recorded-years');
const reportUrl = computed(() => `/reports?year=${filterByYear.value}`);

const { fetchData: getRecordedYears } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const recordedYears = computed(() => (recordedYearsData.value?.years ?? []).map((year: string) => ({ value: year, label: year })));

const { fetchData: getReportData } = useDataFetch(reportUrl);
const { isLoading: isReportLoading, data: reportData } = await getReportData();

const datasets = computed(() => {
  const _ds: any = [];

  _ds.push({
    type: 'line',
    label: 'Net worth',
    data: reportData.value?.data.balance.slice(1),
  });

  Object.keys(reportData.value?.data ?? {}).forEach((table) => {
    if (['balance', 'tax'].includes(table)) return;

    reportData.value?.data[table].forEach((group: any) => {
      _ds.push({
        type: 'bar',
        label: group[0] ?? 'N/A',
        borderWidth: 1,
        backgroundColor: randomColor(0.5),
        data: group.slice(1).map((amount: any) => (table === ENTRY_OPERATIONS.EXPENSE ? amount * -1 : amount)),
      });
    });
  });

  return _ds;
});

const chartData = computed(() => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: datasets.value,
}));

const chartOptions: any = {
  responsive: true,
  elements: {
    line: {
      fill: true,
      borderDash: [5, 5],
      borderWidth: 2,
      borderColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
  plugins: {
    legend: {
      position: 'right',
    },
  },
};

const chartStyles: any = {
  position: 'relative',
  margin: '8px auto',
  width: '850px',
};
</script>

<style lang="scss" scoped>
.report-page {
  &__chart {
    padding: 16px 0;
    background-color: var(--c-background-disabled);
    box-shadow: rgba(0, 0, 0, 0.15) 0 0 12px inset;
  }

  &__filter {
    padding-top: 64px;
  }
}
</style>
