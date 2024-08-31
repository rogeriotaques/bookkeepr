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
    <ReportData
      :data="reportData?.data || {}"
      :loading="isReportLoading"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import ReportInsights from '@/components/report/ReportInsights.vue';
import ReportData from '@/components/report/ReportData.vue';

import useDataFetch from '@/composable/useDataFetch';

const filterByYear = ref(`${new Date().getFullYear()}`);
const recordedYearsUrl = ref('/entries/recorded-years');
const reportUrl = computed(() => `/reports?year=${filterByYear.value}`);

const { fetchData: getRecordedYears } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const recordedYears = computed(() => (recordedYearsData.value?.years ?? []).map((year: string) => ({ value: year, label: year })));

const { fetchData: getReportData } = useDataFetch(reportUrl);
const { isLoading: isReportLoading, data: reportData } = await getReportData();
</script>

<style lang="scss" scoped>
.report-page {
  &__filter {
    padding-top: 64px;
  }
}
</style>
