<template>
  <section class="report-page">
    <div class="row">
      <div class="col-1" />
      <div class="col-2 report-page__filter">
        <BaseDropdown
          v-model="filterByYear"
          :options="recordedYears"
        />
      </div>
      <div class="col-6">
        <ReportInsights />
      </div>
    </div>
    <ReportData />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import ReportInsights from '@/components/report/ReportInsights.vue';
import ReportData from '@/components/report/ReportData.vue';

import useEntries from '@/composable/useEntries';

const { getRecordedYears, invalidateQuery: invalidateRecordedYearsQuery } = useEntries();
const { data: recordedYearsData } = await getRecordedYears();

const filterByYear = ref(`${new Date().getFullYear()}`);

const recordedYears = computed(() => (recordedYearsData.value?.years ?? []).map((year) => ({ value: year, label: year })));
</script>

<style lang="scss" scoped>
.report-page {
  &__filter {
    padding-top: 64px;
  }
}
</style>
