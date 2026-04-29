<template>
  <div class="balance-filter-form">
    <div class="balance-filter-form__filter-by-string">
      <label for="search">Search by</label>
      <div class="input input--with-addons">
        <input
          v-model="filterByText"
          ref="searchRef"
          id="search"
          type="text"
          placeholder="Any text or amount"
        />
        <button
          v-if="filterByText"
          class="input__addon input__addon--button"
          @click="onClickClearSearchHandler"
        >
          <IconX :size="18" />
        </button>
        <label
          v-else
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { IconSearch, IconX } from '@tabler/icons-vue';

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

const searchRef = ref<HTMLInputElement | null>(null);

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

const onSearchHotKeyHandler = (e: KeyboardEvent) => {
  if (!e.metaKey || e.key !== 'k') return;

  e.preventDefault();
  e.stopPropagation();

  searchRef.value?.focus();
};

const onClickClearSearchHandler = async () => {
  filterByText.value = '';
  await nextTick();
  searchRef.value?.focus();
};

onMounted(async () => {
  document.addEventListener('keydown', onSearchHotKeyHandler);

  await nextTick();
  searchRef.value?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onSearchHotKeyHandler);
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
