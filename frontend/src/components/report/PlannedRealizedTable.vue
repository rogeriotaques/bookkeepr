<template>
  <div class="box planned-realized-table">
    <h2 v-if="title" class="planned-realized-table__heading">{{ title }}</h2>
    <table class="planned-realized-table__table">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col">Planned</th>
          <th scope="col">Realized</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Income</th>
          <td class="planned-realized-table__value">{{ formatCurrency(planned.income) }}</td>
          <td class="planned-realized-table__value" :class="realizedIncomeClass">
            {{ formatCurrency(realized.income) }}
          </td>
        </tr>
        <tr>
          <th scope="row">Expenses</th>
          <td class="planned-realized-table__value">{{ formatCurrency(planned.expense) }}</td>
          <td class="planned-realized-table__value" :class="realizedExpenseClass">
            {{ formatCurrency(realized.expense) }}
          </td>
        </tr>
        <tr>
          <th scope="row">Balance</th>
          <td class="planned-realized-table__value" :class="plannedBalanceClass">
            {{ formatCurrency(plannedBalance) }}
          </td>
          <td class="planned-realized-table__value" :class="realizedBalanceClass">
            {{ formatCurrency(realizedBalance) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Amounts {
  income: number;
  expense: number;
}

interface Props {
  planned: Amounts;
  realized: Amounts;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
});

const plannedBalance = computed(() => props.planned.income - props.planned.expense);
const realizedBalance = computed(() => props.realized.income - props.realized.expense);

const plannedBalanceClass = computed(() => ({
  'planned-realized-table__value--negative': plannedBalance.value < 0,
}));

// Realized is on track when income meets the plan, expenses stay under it and
// the balance meets the plan. A tie is neutral, so it keeps the default color.
function realizedClass(realized: number, planned: number, better: 'higher' | 'lower'): string {
  if (realized === planned) return '';

  const onTrack = better === 'higher' ? realized > planned : realized < planned;
  return onTrack
    ? 'planned-realized-table__value--positive'
    : 'planned-realized-table__value--negative';
}

const realizedIncomeClass = computed(() =>
  realizedClass(props.realized.income, props.planned.income, 'higher')
);
const realizedExpenseClass = computed(() =>
  realizedClass(props.realized.expense, props.planned.expense, 'lower')
);
const realizedBalanceClass = computed(() =>
  realizedClass(realizedBalance.value, plannedBalance.value, 'higher')
);

function formatCurrency(value: number | undefined): string {
  return '¥ ' + Number(value ?? 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.planned-realized-table {
  &__heading {
    font-size: var(--bk-text-lg);
    color: var(--bk-text-primary);
    margin: 0 0 var(--bk-space-sm);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: var(--bk-space-xs) 0;
      text-align: right;
    }

    thead th {
      font-size: var(--bk-text-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--bk-text-secondary);
    }

    tbody th {
      text-align: left;
      font-size: var(--bk-text-sm);
      font-weight: 500;
      color: var(--bk-text-secondary);
    }
  }

  &__value {
    font-size: var(--bk-text-base);
    font-weight: 600;
    color: var(--bk-text-primary);

    &--negative {
      color: var(--bk-danger);
    }

    &--positive {
      color: var(--bk-primary);
    }
  }
}
</style>
