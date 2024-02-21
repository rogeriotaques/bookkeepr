<script setup>
import { RouterView } from 'vue-router';
import NavBar from '@/components/navigation/NavBar.vue';
import AppFooter from '@/components/navigation/AppFooter.vue';
</script>

<template>
  <div class="app__header">
    <nav-bar />
  </div>
  <div class="app__body">
    <router-view />
  </div>
  <div class="app__footer">
    <app-footer />
  </div>
</template>

<style lang="scss" scoped>
.app {
  &__body {
    height: calc(100vh - 174px);
    min-height: 440px;
  }

  &__footer {
    background-color: #e2e2e2;
    margin: 16px 0 0;
    padding: 24px;
    text-align: center;
  }
}
</style>
