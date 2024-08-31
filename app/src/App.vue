<template>
  <header class="app__header">
    <app-nav-bar />
  </header>
  <main class="app__body">
    <Suspense>
      <router-view />

      <template #fallback>
        <div class="app__loader">Loading ...</div>
      </template>
    </Suspense>
  </main>
  <footer class="app__footer">
    <app-footer />
  </footer>
</template>

<script setup>
import { RouterView } from 'vue-router';

import AppNavBar from '@/components/navigation/AppNavBar.vue';
import AppFooter from '@/components/navigation/AppFooter.vue';
</script>

<style lang="scss" scoped>
.app {
  &__header {
    background-color: var(--c-background);
    padding: 16px 0 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 999;
  }

  &__body {
    min-height: calc(100vh - 174px);
  }

  &__footer {
    background-color: #e2e2e2;
    margin: 16px 0 0;
    padding: 24px;
    text-align: center;
  }
}
</style>
