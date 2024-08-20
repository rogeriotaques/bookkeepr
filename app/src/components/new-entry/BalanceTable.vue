<template>
  <div class="balance-table">
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th width="25%">Description</th>
          <th>Outcome</th>
          <th>Income</th>
          <th>Balance</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2021-01-01</td>
          <td>Salary</td>
          <td>¥0.00</td>
          <td>¥10,000.00</td>
          <td>¥10,000.00</td>
          <td class="has-text-right">
            <a class="link">
              <IconEdit />
            </a>
            <a class="link is-danger">
              <IconTrash />
            </a>
          </td>
        </tr>
        <tr>
          <td>2021-01-01</td>
          <td>Salary</td>
          <td>¥0.00</td>
          <td>¥10,000.00</td>
          <td>¥20,000.00</td>
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
          <th>Total</th>
          <th></th>
          <th>¥0.00</th>
          <th>¥20,000.00</th>
          <th>¥20,000.00</th>
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

import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';

const entries = computed(() => []);
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
