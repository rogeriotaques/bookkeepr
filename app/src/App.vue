<script setup>
import { RouterView } from 'vue-router';
import AppNavBar from '@/components/navigation/AppNavBar.vue';
import AppFooter from '@/components/navigation/AppFooter.vue';
</script>

<template>
  <header class="app__header">
    <app-nav-bar />
  </header>
  <main class="app__body">
    <router-view />
  </main>
  <footer class="app__footer">
    <app-footer />
  </footer>
</template>

<style lang="scss" scoped>
.app {
  &__header {
    padding: 16px 0 24px;
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
