<template>
  <div class="settings-groups">
    <button type="submit" class="is-auto-width is-pulled-right has-icon">
      <IconPlus :size="18" />
    </button>

    <h4>Categories</h4>
    <GroupTable />
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue';

import GroupTable from '@/components/settings/groups/GroupTable.vue';
</script>

<style lang="scss" scoped>
.new-group.input {
  > .input__addon {
    width: calc(50% - 4px);
  }
}

.is-pulled-right {
  float: right;
}

button {
  &.has-icon > svg {
    margin-top: 4px;
  }
}
</style>
