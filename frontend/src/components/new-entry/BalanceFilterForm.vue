<template>
  <div class="balance-filter-form">
    <div class="balance-filter-form__filter-by-string">
      <label for="search">Search by</label>
      <div class="input input--with-addons">
        <input
          v-model="filterByText"
          id="search"
          type="text"
          placeholder="Description, category, wallet, or amount"
        />
        <label
          class="input__addon input__addon--icon"
          for="search"
        >
          <IconSearch :size="18" />
        </label>
      </div>
    </div>
    <div class="balance-filter-form__filter-by-date">
      <label for="input">Filter by</label>
      <div>
        <BaseDropdown
          v-model="filterByYear"
          :options="yearOptions"
          :disabled="props.loading"
        />
        <BaseDropdown
          v-model="filterByMonth"
          :options="monthOptions"
          searchable
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconSearch } from '@tabler/icons-vue';
import dayjs from 'dayjs';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';

interface Props {
  year: string;
  month: string;
  search: string;
  years: string[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: true,
});

interface Emits {
  (event: 'update:year', value: string): void;
  (event: 'update:month', value: string): void;
  (event: 'update:search', value: string): void;
}

const emit = defineEmits<Emits>();

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

const yearOptions = computed(() => props.years.map((year) => ({ value: year, label: year })));

const filterByYear = computed({
  get() {
    return props.year;
  },
  set(value) {
    emit('update:year', value);
  },
});

const filterByMonth = computed({
  get() {
    return props.month;
  },
  set(value) {
    emit('update:month', value);
  },
});

const filterByText = computed({
  get() {
    return props.search;
  },
  set(value) {
    emit('update:search', value);
  },
});
</script>

<style lang="scss" scoped>
.balance-filter-form {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 0;
}

.base-dropdown + .base-dropdown {
  margin-left: 8px;
}
</style>
