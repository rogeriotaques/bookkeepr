<template>
  <section class="annual-chart">
    <header class="annual-chart__header">
      <h2>Annual overview {{ year }}</h2>
    </header>

    <BaseSkeleton
      v-if="isLoading"
      height="260px"
    />

    <div
      v-else-if="hasData"
      class="annual-chart__canvas"
    >
      <Bar
        :options="chartOptions"
        :data="chartData"
      />
    </div>

    <p
      v-else
      class="annual-chart__empty"
    >
      No data for {{ year }}.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, registerables } from 'chart.js';

import useDataFetch from '@/composable/useDataFetch';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

ChartJS.register(...registerables);

interface Props {
  year: number;
}

const props = defineProps<Props>();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const reportUrl = ref(`/reports?year=${props.year}`);
const { fetchData } = useDataFetch(reportUrl);
const { isLoading, data: reportData } = await fetchData();

const datasets = computed(() => {
  const data = (reportData.value as any)?.data;

  if (!data) return [];

  // The API returns each month's net. The chart shows the running annual
  // balance instead, so January's net carries into February and so on.
  const monthlyBalance = (data.balance ?? []).slice(1).map(Number);
  let runningBalance = 0;
  const annualBalance = monthlyBalance.map((amount) => {
    runningBalance += amount;
    return runningBalance;
  });

  const series: any[] = [
    {
      type: 'line',
      label: 'Balance',
      data: annualBalance,
      borderColor: 'rgb(0, 0, 0)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderDash: [5, 5],
      borderWidth: 2,
      fill: true,
      tension: 0.2,
    },
  ];

  (data.income ?? []).forEach((row: any[]) => {
    series.push({
      type: 'bar',
      label: row[0],
      data: row.slice(1).map(Number),
      backgroundColor: 'rgba(55, 172, 40, 0.5)',
      borderWidth: 1,
    });
  });

  (data.outcome ?? []).forEach((row: any[]) => {
    series.push({
      type: 'bar',
      label: row[0],
      data: row.slice(1).map((amount) => -Number(amount)),
      backgroundColor: 'rgba(165, 43, 43, 0.5)',
      borderWidth: 1,
    });
  });

  return series;
});

const hasData = computed(() => datasets.value.length > 0);

const chartData = computed(() => ({
  labels: MONTHS,
  datasets: datasets.value,
}));

const chartOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
  plugins: {
    legend: {
      position: 'left',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        font: { size: 11, family: 'Archivo, sans-serif' },
        padding: 6,
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.annual-chart {
  &__header {
    h2 {
      font-size: var(--bk-text-lg);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-md);
    }
  }

  &__canvas {
    position: relative;
    // Tall enough for the left-hand legend, which can list every category.
    height: 420px;
  }

  &__empty {
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-sm);
    text-align: center;
    margin: 0;
    padding: var(--bk-space-xl) 0;
  }
}
</style>
