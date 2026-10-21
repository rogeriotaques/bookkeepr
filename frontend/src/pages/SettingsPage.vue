<template>
  <section class="settings-page">
    <SettingsNavigation />
  </section>
</template>

<script setup lang="ts">
import SettingsNavigation from '@/components/settings/SettingsNavigation.vue';
</script>

<style lang="scss" scoped>
// Matches the shell of the other pages (Planning, Report, Transactions).
.settings-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width-wide);
  margin: 0 auto;
}
</style>
