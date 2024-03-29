<template>
  <table class="table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Operation</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>2</td>
        <td>Food</td>
        <td>Outcome</td>
        <td class="has-text-right">
          <a class="link">
            <IconEdit />
          </a>
          <a class="link is-danger">
            <IconTrash />
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { IconEdit, IconTrash } from '@tabler/icons-vue';
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
