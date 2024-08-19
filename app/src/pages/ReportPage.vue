<template>
  <section class="report-page">
    <div class="row">
      <div class="col-1" />
      <div class="col-2 report-page__filter">
        <BaseDropdown v-model="filterByYear" :options="yearOptions" />
      </div>
      <div class="col-6">
        <ReportInsights />
      </div>
    </div>
    <ReportData />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import ReportInsights from '@/components/report/ReportInsights.vue';
import ReportData from '@/components/report/ReportData.vue';

const now = new Date();
const yearOptions = [
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
];

const filterByYear = ref(`${now.getFullYear()}`);
</script>

<style lang="scss" scoped>
.report-page {
  &__filter {
    padding-top: 64px;
  }
}
</style>
