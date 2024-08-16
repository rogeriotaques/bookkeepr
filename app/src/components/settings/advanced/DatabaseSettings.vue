<template>
  <div class="settings-advanced-database">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Database</h5>
          <p>Maintenace actions for this app database</p>
          <code>File: /Users/rogerio/Library/Application Support/BookKeepr/bookkeepr.db</code>
        </hgroup>
      </div>
      <div class="col-4 settings-advanced-database__actions">
        <button class="has-tooltip has-tooltip--left" type="button" data-tooltip="Free up space and reduce database size" @click="onVacuumHandler">
          <IconLoader2 v-if="isLoading" class="animate-spin" />
          <IconRefresh v-else />
          <span>Vacuum</span>
        </button>

        <button disabled type="button">
          <IconDeviceFloppy />
          <span>Backup</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconRefresh, IconDeviceFloppy, IconLoader2 } from '@tabler/icons-vue';

import { runVacuum } from '@/domain/network';

const isLoading = ref(false);

const onVacuumHandler = async () => {
  isLoading.value = true;

  try {
    const { success = false } = await runVacuum();

    if (success) {
      alert('Database vacuumed successfully!');
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.settings-advanced-database {
  hgroup {
    margin-bottom: 16px;

    h5,
    p {
      margin: 0;
    }

    p + code {
      padding: 4px;
      margin-top: 8px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    > button {
      width: 100px;
    }
  }
}
</style>
