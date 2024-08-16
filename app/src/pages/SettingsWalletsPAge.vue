<template>
  <div class="settings-wallets">
    <button type="submit" class="is-auto-width is-pulled-right has-icon has-tooltip has-tooltip--left" data-tooltip="Add new wallet">
      <IconPlus :size="18" />
    </button>
    <hgroup>
      <h4 class="title">Wallets</h4>
      <p class="subtitle">
        <span v-if="isLoading">Loading...</span>
        <span v-else-if="isError">{{ error }}</span>
        <span v-else> Manage your wallets </span>
      </p>
    </hgroup>

    <WalletsTable v-if="isLoaded" :data="wallets" @update="invalidateQuery()" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconPlus } from '@tabler/icons-vue';

import useWallets from '@/composable/useWallets';

import WalletsTable from '@/components/settings/wallets/WalletsTable.vue';

const { getWallets, invalidateQuery } = useWallets();
const { isLoading, isError, data, error } = await getWallets();

const isLoaded = computed(() => !isLoading.value && !isError.value);
const wallets = computed(() => data.value?.wallets ?? []);
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
