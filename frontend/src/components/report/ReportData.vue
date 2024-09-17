<template>
  <div class="report__data">
    <table class="report__table--liability">
      <!-- EXPENSES -->
      <thead>
        <tr>
          <th width="15%">Expenses</th>
          <th
            v-for="month in months"
            :key="`header-expense-${year}-${month.label}`"
          >
            {{ month.label }}
          </th>
          <th width="10%">Total</th>
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
              :key="`body-expense-skeleton-${year}-${month.label}`"
            >
              <BaseSkeleton />
            </td>
            <td>
              <BaseSkeleton />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="(entry, idx) in expenses"
            :key="`body-expense-${year}-${entry[0]}-${idx}`"
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
              :key="`body-expense-${year}-${entry[0]}-${idx}-${month.label}`"
            >
              {{ getFormattedCurrency(entry[month.value] ?? 0) }}
            </td>
            <td>
              {{ getFormattedCurrency(entry.slice(1).reduce((acc: number, amount: number) => acc + amount, 0)) }}
            </td>
          </tr>
          <tr>
            <th width="15%">Total</th>
            <th
              v-for="month in months"
              :key="`header-expense-${year}-${month.label}`"
            >
              {{ getFormattedCurrency(expenses.map((e: any) => e[month.value] ?? 0).reduce((acc: number, amount: number) => acc + amount, 0)) }}
            </th>
            <th width="10%">
              {{
                getFormattedCurrency(
                  expenses
                    .map((e: any) => e.slice(1).reduce((acc: number, amount: number) => acc + amount, 0))
                    .reduce((acc: number, amount: number) => acc + amount, 0)
                )
              }}
            </th>
          </tr>
        </template>
      </tbody>

      <!-- INCOME -->
      <thead>
        <tr>
          <th width="15%">Income</th>
          <th
            v-for="month in months"
            :key="`header-income-${year}-${month.label}`"
          >
            {{ month.label }}
          </th>
          <th width="10%">Total</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="props.loading">
          <tr
            v-for="entry in 3"
            :key="`body-income-skeleton-${year}-${entry}`"
          >
            <td>
              <BaseSkeleton />
            </td>
            <td
              v-for="month in months"
              :key="`body-income-skeleton-${year}-${month.label}`"
            >
              <BaseSkeleton />
            </td>
            <td>
              <BaseSkeleton />
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="(entry, idx) in income"
            :key="`body-income-${year}-${entry[0]}-${idx}`"
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
              :key="`body-income-${year}-${entry[0]}-${idx}-${month.label}`"
            >
              {{ getFormattedCurrency(entry[month.value] ?? 0) }}
            </td>
            <td>
              {{ getFormattedCurrency(entry.slice(1).reduce((acc: number, amount: number) => acc + amount, 0)) }}
            </td>
          </tr>
          <tr>
            <th width="15%">Total</th>
            <th
              v-for="month in months"
              :key="`header-expense-${year}-${month.label}`"
            >
              {{ getFormattedCurrency(income.map((e: any) => e[month.value] ?? 0).reduce((acc: number, amount: number) => acc + amount, 0)) }}
            </th>
            <th width="10%">
              {{
                getFormattedCurrency(
                  income
                    .map((e: any) => e.slice(1).reduce((acc: number, amount: number) => acc + amount, 0))
                    .reduce((acc: number, amount: number) => acc + amount, 0)
                )
              }}
            </th>
          </tr>
        </template>
      </tbody>

      <!-- BALANCE AND TAX ESTIMATION -->
      <tfoot>
        <tr>
          <td width="15%">Balance</td>
          <template v-if="props.loading">
            <td
              v-for="month in months"
              :key="`body-balance-skeleton-${year}-${month.label}`"
            >
              <BaseSkeleton />
            </td>
            <td width="10%">
              <BaseSkeleton />
            </td>
          </template>
          <template v-else>
            <td
              v-for="(amount, idx) in balance"
              :key="`body-balance-${year}-${amount}-${idx}`"
            >
              {{ getFormattedCurrency(amount ?? 0) }}
            </td>
            <td width="10%">{{ getFormattedCurrency(balance.reduce((acc: number, amount: number) => acc + amount, 0)) }}</td>
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
              :key="`body-tax-skeleton-${year}-${month.label}`"
            >
              <BaseSkeleton />
            </td>
            <td>
              <BaseSkeleton />
            </td>
          </template>
          <template v-else>
            <td
              v-for="(amount, idx) in consumptionTax"
              :key="`body-tax-${year}-${amount}-${idx}`"
            >
              {{ getFormattedCurrency(amount ?? 0) }}
            </td>
            <td width="10%">
              {{ getFormattedCurrency(consumptionTax.reduce((acc: number, amount: number) => acc + amount, 0)) }}
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
import { CurrencyLocale } from '@/domain/interfaces';

import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  year: string;
  data: Record<string, any>;
  loading: boolean;
  locale: CurrencyLocale;
}

const props = withDefaults(defineProps<Props>(), {
  year: '',
  data: {} as any,
  loading: true,
  locale: {} as any,
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

const getFormattedCurrency = (value: number) => formatCurrency(value, { currency: props.locale.currencyCode, locale: props.locale.currencyLocale });
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
    padding-top: 48px;
  }

  tbody + tfoot td {
    padding-top: 16px;
    font-weight: bold;
  }

  th:not(:first-child),
  td:not(:first-child) {
    text-align: right;
    width: 6.25%;
  }

  tfoot tr:first-child td {
    padding-top: 48px;
  }
}

@media print {
  [class^='report__table'] tfoot {
    display: table-row-group;
  }

  .has-tooltip {
    display: none;
  }
}
</style>
