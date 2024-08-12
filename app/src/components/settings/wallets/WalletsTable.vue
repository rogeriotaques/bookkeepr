<template>
  <table class="table">
    <thead>
      <tr>
        <th width="65%">Name</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <!-- <tr>
        <td>Bank</td>
        <td>
          <span class="badge badge--success">Active</span>
        </td>
        <td class="has-text-right">
          <a class="link">
            <IconEdit />
          </a>
          <a class="link is-danger">
            <IconTrash />
          </a>
        </td>
      </tr> -->
      <TableEmptyCard colspan="3" />
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { IconEdit, IconTrash } from '@tabler/icons-vue';

import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';
</script>

<style lang="scss" scoped>
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
