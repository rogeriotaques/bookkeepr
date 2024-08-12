<template>
  <div class="settings-advanced">
    <h4>Advanced settings</h4>

    <TaxSettings />
    <hr />
    <DatabaseSettings />
  </div>
</template>

<script setup lang="ts">
import DatabaseSettings from '@/components/settings/advanced/DatabaseSettings.vue';
import TaxSettings from '@/components/settings/advanced/TaxSettings.vue';
</script>

<style lang="scss" scoped></style>
