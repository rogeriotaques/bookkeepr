<template>
  <div class="settings-groups">
    <button type="submit" class="is-auto-width is-pulled-right has-icon has-tooltip has-tooltip--left" data-tooltip="Add new category">
      <IconPlus :size="18" />
    </button>

    <hgroup>
      <h4 class="title">Categories</h4>
      <p class="subtitle">
        <span v-if="isLoading">Loading...</span>
        <span v-else-if="isError">{{ error }}</span>
        <span v-else> Manage your categories </span>
      </p>
    </hgroup>

    <GroupTable v-if="isLoaded" :data="groups" @update="invalidateQuery()" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconPlus } from '@tabler/icons-vue';

import useGroups from '@/composable/useGroups';

import GroupTable from '@/components/settings/groups/GroupTable.vue';

const { getGroups, invalidateQuery } = useGroups();
const { isLoading, isError, data, error } = await getGroups();

const isLoaded = computed(() => !isLoading.value && !isError.value);
const groups = computed(() => data.value?.groups ?? []);
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
