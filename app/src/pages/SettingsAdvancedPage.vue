<template>
  <div class="settings-advanced">
    <h4>Advanced settings</h4>

    <TaxSettings v-if="hasTaxSettingsLoaded" :data="taxSettings" @update="onUpdatedSettingsHandler" />
    <hr />
    <DatabaseSettings :data="databaseSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

import { setSettings } from '@/domain/network';

import useSettings from '@/composable/useSettings';

import DatabaseSettings from '@/components/settings/advanced/DatabaseSettings.vue';
import TaxSettings from '@/components/settings/advanced/TaxSettings.vue';

const { getSettingsData, invalidateQuery } = useSettings();
const { isLoading: isLoadingTaxSettings, isError: isErrorTaxSettings, data: settingsData, error: taxSettingsError } = await getSettingsData();
const toast = useToast();

const isLoading = ref(false);

const hasTaxSettingsLoaded = computed(() => !isLoadingTaxSettings.value);
const taxSettings = computed(() => (settingsData.value as any)?.config || {});
const databaseSettings = computed(() => ({ dbFilePath: (settingsData.value as any)?.dbFilePath || '' }));

const onUpdatedSettingsHandler = async (value: number) => {
  isLoading.value = true;

  try {
    await setSettings({ config: { key: 'shouhizei', value } });
    toast.success('Settings updated!');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
    invalidateQuery();
  }
};
</script>

<style lang="scss" scoped></style>
