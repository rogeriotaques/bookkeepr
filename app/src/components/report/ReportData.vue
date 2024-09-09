<template>
  <div class="report__data">
    <table class="report__table--liability">
      <thead>
        <tr>
          <th width="10%">Expenses</th>
          <th
            v-for="month in months"
            :key="month.label"
          >
            {{ month.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="props.loading">
          <tr v-for="entry in 3">
            <td>
              <BaseSkeleton />
            </td>
            <td
              v-for="month in months"
              :key="month.label"
            >
              <BaseSkeleton />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="entry in expenses"
            :key="entry[0]"
          >
            <td>
              <span
                class="report__item-title"
                :title="entry[0]"
              >
                {{ entry[0] }}
              </span>
            </td>
            <td
              v-for="month in months"
              :key="month.label"
            >
              {{ formatCurrency(entry[month.value] ?? 0) }}
            </td>
          </tr>
        </template>
      </tbody>

      <thead>
        <tr>
          <th width="10%">Income</th>
          <th
            v-for="month in months"
            :key="month.label"
          >
            {{ month.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="props.loading">
          <tr v-for="entry in 3">
            <td>
              <BaseSkeleton />
            </td>
            <td
              v-for="month in months"
              :key="month.label"
            >
              <BaseSkeleton />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="entry in income"
            :key="entry[0]"
          >
            <td>
              <span
                class="report__item-title"
                :title="entry[0]"
              >
                {{ entry[0] }}
              </span>
            </td>
            <td
              v-for="month in months"
              :key="month.label"
            >
              {{ formatCurrency(entry[month.value] ?? 0) }}
            </td>
          </tr>
        </template>
      </tbody>

      <tfoot>
        <tr>
          <td width="15%">Balance</td>
          <template v-if="props.loading">
            <td
              v-for="month in months"
              :key="month.label"
            >
              <BaseSkeleton />
            </td>
          </template>
          <template v-else>
            <td
              v-for="entry in balance"
              :key="`balance-${entry}`"
            >
              {{ formatCurrency(entry ?? 0) }}
            </td>
          </template>
        </tr>
        <tr v-if="shouldShowConsumptionTax">
          <td width="15%">
            Consumption tax
            <span
              class="has-tooltip has-tooltip--right"
              data-tooltip="Estimation to be provisioned and paid to the government"
            >
              <IconInfoCircle
                :width="16"
                :height="16"
              />
            </span>
          </td>
          <template v-if="props.loading">
            <td
              v-for="month in months"
              :key="month.label"
            >
              <BaseSkeleton />
            </td>
          </template>
          <template v-else>
            <td
              v-for="entry in consumptionTax"
              :key="entry"
            >
              {{ formatCurrency(entry ?? 0) }}
            </td>
          </template>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IconInfoCircle } from '@tabler/icons-vue';

import useDataFetch from '@/composable/useDataFetch';
import { formatCurrency } from '@/domain/utils';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  data: Record<string, any>;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: {} as any,
  loading: true,
});

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

const settingsUrl = ref('/settings');
const { fetchData } = useDataFetch(settingsUrl);
const { data: settingsData } = await fetchData();

const expenses = computed(() => props.data?.outcome ?? []);
const income = computed(() => props.data?.income ?? []);
const balance = computed(() => props.data?.balance?.slice(1) ?? []);
const consumptionTax = computed(() => props.data?.tax?.slice(1) ?? []);
const shouldShowConsumptionTax = computed(() => (settingsData.value as any)?.config?.shouhizei > 0 || false);
</script>

<style lang="scss" scoped>
.report {
  &__data {
    padding: 24px 16px;
  }

  &__item-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 214px;
  }
}

[class^='report__table'] {
  margin-top: 16px;

  thead {
    background-color: var(--c-background);
    position: sticky;
    top: 60px;
  }

  tbody + thead th {
    padding-top: 16px;
  }

  tbody + tfoot td {
    padding-top: 16px;
    font-weight: bold;
  }

  th:not(:first-child),
  td:not(:first-child) {
    text-align: right;
    width: 6.9%;
  }

  tfoot tr:first-child td {
    padding-top: 48px;
  }
}
</style>
