<template>
  <div class="settings-advanced">
    <hgroup>
      <h4>Advanced settings</h4>
      <p v-if="isLoadingSettings">Loading ...</p>
      <p v-else>Configure advanced settings</p>
    </hgroup>

    <CurrencySettings
      :data="currencySettings"
      :loading="isLoadingSettings"
      @update="onUpdatedCurrencySettingsHandler"
    />

    <hr />

    <TaxSettings
      :tax-percentage="taxPercentage"
      :loading="isLoadingSettings"
      @update="onUpdatedSettingsHandler('shouhizei', $event)"
    />

    <hr />

    <DatabaseSettings
      :data="databaseSettings"
      :loading="isLoadingSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

import { setSettings } from '@/domain/network';

import useDataFetch from '@/composable/useDataFetch';

import CurrencySettings from '@/components/settings/advanced/CurrencySettings.vue';
import DatabaseSettings from '@/components/settings/advanced/DatabaseSettings.vue';
import TaxSettings from '@/components/settings/advanced/TaxSettings.vue';

const isLoading = ref(false);
const settingsUrl = ref('/settings');

const toast = useToast();
const { fetchData, invalidateQuery } = useDataFetch(settingsUrl);
const { isLoading: isLoadingSettings, data: settingsData } = await fetchData();

const taxPercentage = computed(() => (settingsData.value as any)?.config?.shouhizei || 0);
const currencySettings = computed(() => {
  const { config } = settingsData.value as any;

  return {
    currencyCode: config?.currencyCode || 'JPY',
    currencyLocale: config?.currencyLocale || 'ja-JP',
  };
});
const databaseSettings = computed(() => ({
  dbFilePath: (settingsData.value as any)?.dbFilePath || '',
  dbFileSize: (settingsData.value as any)?.dbFileSize || 0,
}));

const onUpdatedCurrencySettingsHandler = async (data: { key: string; value: string }) => {
  isLoading.value = true;

  try {
    await setSettings({ config: { key: data.key, value: data.value } });
    toast.success('Settings updated!');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
    invalidateQuery();
  }
};

const onUpdatedSettingsHandler = async (key: string, value: number) => {
  isLoading.value = true;

  try {
    await setSettings({ config: { key, value } });
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
