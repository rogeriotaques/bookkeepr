<template>
  <div class="balance-table">
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th width="25%">Description</th>
          <th>Operation</th>
          <th class="has-text-right">Amount</th>
          <th class="has-text-right">Balance</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td>{{ entry.date }}</td>
          <td>{{ entry.description }}</td>
          <td>{{ entry.operation === ENTRY_OPERATIONS.INCOME ? 'Income' : 'Expense' }}</td>
          <td class="has-text-right">{{ formatCurrency(entry.amount) }}</td>
          <td class="has-text-right">{{ formatCurrency(entry.balance) }}</td>
          <td class="has-text-right">
            <a class="link">
              <IconEdit />
            </a>
            <a class="link is-danger">
              <IconTrash />
            </a>
          </td>
        </tr>

        <TableEmptyCard v-if="entries.length === 0" />
      </tbody>
      <tfoot>
        <tr>
          <th colspan="4">Total</th>
          <th class="has-text-right">{{ formatCurrency(balance) }}</th>
          <th></th>
        </tr>
      </tfoot>
    </table>
  </div>
  <!-- .balance-table -->
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';

import { ExtendedEntry } from '@/domain/interfaces';
import { ENTRY_OPERATIONS } from '@/domain/constants';

import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';

interface Props {
  data: ExtendedEntry[];
}

const props = defineProps<Props>();

let balance = 0;

const entries = computed(() =>
  props.data.map((entry) => {
    if (entry.operation === ENTRY_OPERATIONS.INCOME) {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }

    return {
      ...entry,
      balance: balance,
    };
  })
);

const formatCurrency = (value: number) => value.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
</script>

<style lang="scss" scoped>
.balance-table {
  table {
    th {
      font-family: Impact, sans-serif;
    }

    th,
    td {
      padding: 8px 16px;
      font-size: 18px;
    }

    tr:nth-child(even) {
      background-color: #e9e9e9;
    }
  }
}

.link {
  border-bottom-color: transparent !important;
  cursor: pointer;

  + .link {
    margin-left: 8px;
  }

  &::before {
    content: none !important;
  }

  &:hover {
    > svg {
      stroke: var(--c-info);
    }
  }

  &.is-danger:hover {
    > svg {
      stroke: var(--c-danger);
    }
  }
}
</style>
