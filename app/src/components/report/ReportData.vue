<template>
  <div class="report__data">
    <table class="report__table--liability">
      <thead>
        <tr>
          <th width="10%">&nbsp;</th>
          <th v-for="month in months" :key="month.label">{{ month.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in liabilityCategories" :key="category.label">
          <td>{{ category.label }}</td>
          <td v-for="month in months" :key="month.label">¥0,000</td>
        </tr>
      </tbody>

      <thead>
        <tr>
          <th width="10%">&nbsp;</th>
          <th v-for="month in months" :key="month.label">{{ month.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in assetsCategories" :key="category.label">
          <td>{{ category.label }}</td>
          <td v-for="month in months" :key="month.label">¥0,000</td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <td width="15%">&nbsp;</td>
          <td v-for="month in months" :key="month.label">¥0,000</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
const months = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const liabilityCategories = [
  { value: '1', label: '00 - Food' },
  { value: '2', label: '00 - Transport' },
  { value: '3', label: '00 - Entertainment' },
  { value: '4', label: '00 - Health' },
  { value: '5', label: '00 - Education' },
  { value: '6', label: '00 - Other' },
];

const assetsCategories = [
  { value: '1', label: '00 - Salary' },
  { value: '2', label: '00 - Bonus' },
  { value: '3', label: '00 - Invoice' },
  { value: '4', label: '00 - Other' },
];
</script>

<style lang="scss" scoped>
.report {
  &__data {
    padding: 24px 16px;
  }
}

[class^='report__table'] {
  margin-top: 16px;

  tbody + thead th {
    padding-top: 16px;
  }

  tbody + tfoot td {
    padding-top: 16px;
    font-weight: bold;
  }

  th:not(:first-child) {
    text-align: center;
  }

  td:not(:first-child) {
    text-align: right;
  }
}
</style>
