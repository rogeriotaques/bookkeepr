<template>
  <div class="settings-advanced-database">
    <SettingsRow>
      <hgroup>
        <h5>Database</h5>
        <p>Maintenace actions for this app database</p>
      </hgroup>

      <div>
        <b>Database size:</b>
      </div>
      <code>{{ props.loading ? '...' : props.data.dbFileSize.toFixed(2) }} MB</code>

      <template #control>
        <button
          :disabled="props.loading"
          class="has-tooltip has-tooltip--left"
          type="button"
          data-tooltip="Free up space and reduce database size"
          @click="onVacuumHandler"
        >
          <IconLoader2
            v-if="isLoading"
            class="is-spinning"
            width="16"
            height="16"
          />
          <IconLayoutBottombarCollapseFilled v-else />
          <span>Vacuum</span>
        </button>

        <button
          disabled
          type="button"
          class="has-tooltip has-tooltip--left"
          data-tooltip="Download a copy of your database"
        >
          <IconDeviceFloppy />
          <span>Backup</span>
        </button>
      </template>
    </SettingsRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconDeviceFloppy, IconLoader2, IconLayoutBottombarCollapseFilled } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { runVacuum } from '@/domain/network';

import SettingsRow from '@/components/settings/SettingsRow.vue';

interface Props {
  data: {
    dbFilePath: string;
    dbFileSize: number;
  };
  loading?: boolean;
}

const props = defineProps<Props>();

const toast = useToast();

const isLoading = ref(false);

const onVacuumHandler = async () => {
  isLoading.value = true;

  try {
    const { success = false } = await runVacuum();

    if (success) {
      toast.success('Database vacuumed!');
    }
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.settings-advanced-database {
  button {
    width: 100px;
    max-width: 100%;
  }
}
</style>
