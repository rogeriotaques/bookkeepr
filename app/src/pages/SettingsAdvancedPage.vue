<template>
  <div class="settings-advanced">
    <h4>Advanced settings</h4>

    <TaxSettings v-if="hasTaxSettingsLoaded" :data="taxSettings" @update="onUpdatedSettingsHandler" />
    <hr />
    <DatabaseSettings />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { setSettings } from '@/domain/network';

import useSettings from '@/composable/useSettings';

import DatabaseSettings from '@/components/settings/advanced/DatabaseSettings.vue';
import TaxSettings from '@/components/settings/advanced/TaxSettings.vue';

const { getSettingsData, invalidateQuery } = useSettings();
const { isLoading: isLoadingTaxSettings, isError: isErrorTaxSettings, data: taxSettingsData, error: taxSettingsError } = await getSettingsData();

const isLoading = ref(false);

const hasTaxSettingsLoaded = computed(() => !isLoadingTaxSettings.value);
const taxSettings = computed(() => (taxSettingsData.value as any)?.config || {});

const onUpdatedSettingsHandler = async (value: number) => {
  isLoading.value = true;

  try {
    await setSettings({ config: { key: 'shouhizei', value } });
  } catch (error) {
  } finally {
    isLoading.value = false;
    invalidateQuery();
  }
};
</script>

<style lang="scss" scoped></style>
