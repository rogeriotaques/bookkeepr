<template>
  <div class="balance-filter-form">
    <div class="balance-filter-form__filter-by-string">
      <label for="input">Search by</label>
      <div class="input input--with-addons">
        <input v-model="filterByText" type="text" placeholder="Description, category, wallet, or amount" />
        <p class="input__addon input__addon--icon">
          <IconSearch :size="18" />
        </p>
      </div>
    </div>
    <div class="balance-filter-form__filter-by-date">
      <label for="input">Filter by</label>
      <div>
        <DropdownPopper v-model="filterByYear" :options="yearOptions" />
        <DropdownPopper v-model="filterByMonth" :options="monthOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconSearch } from '@tabler/icons-vue';

import DropdownPopper from '@/components/shared/DropdownPopper.vue';

const yearOptions = [
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
];

const monthOptions = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const now = new Date();

const filterByText = ref('');
const filterByYear = ref(`${now.getFullYear()}`);
const filterByMonth = ref(`00${now.getMonth() + 1}`.slice(-2));
</script>

<style lang="scss" scoped>
.balance-filter-form {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0;
}

.dropdown-popper + .dropdown-popper {
  margin-left: 8px;
}
</style>
