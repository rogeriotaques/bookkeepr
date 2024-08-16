<template>
  <div class="settings-advanced">
    <h4>Advanced settings</h4>

    <TaxSettings v-if="hasTaxSettingsLoaded" :data="taxSettings" />
    <hr />
    <DatabaseSettings />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { TaxData } from '@/domain/interfaces';

import useSettings from '@/composable/useSettings';

import DatabaseSettings from '@/components/settings/advanced/DatabaseSettings.vue';
import TaxSettings from '@/components/settings/advanced/TaxSettings.vue';

const { getSettingsData } = useSettings();
const { isLoading: isLoadingTaxSettings, isError: isErrorTaxSettings, data: taxSettingsData, error: taxSettingsError } = await getSettingsData();

const hasTaxSettingsLoaded = computed(() => !isLoadingTaxSettings.value);
const taxSettings = computed(() => taxSettingsData.value?.config || ({} as TaxData));
</script>

<style lang="scss" scoped></style>
