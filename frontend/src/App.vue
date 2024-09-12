<template>
  <header
    v-if="isAuthenticated"
    class="app__header"
  >
    <AppNavBar />
  </header>
  <main class="app__body">
    <Suspense>
      <RouterView v-if="isAuthenticated" />
      <AuthPage
        v-else
        @authenticate="onAuthHandler"
      />

      <template #fallback>
        <div class="app__loader">Loading ...</div>
      </template>
    </Suspense>
  </main>
  <footer
    v-if="isAuthenticated"
    class="app__footer"
  >
    <AppFooter />
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { useToast } from 'vue-toastification';

import AppNavBar from '@/components/navigation/AppNavBar.vue';
import AppFooter from '@/components/navigation/AppFooter.vue';
import AuthPage from '@/pages/AuthPage.vue';

const toast = useToast();

const isAuthenticated = ref(false);

const onAuthHandler = (status: boolean) => {
  isAuthenticated.value = status;
};
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
    margin: 60px 0 0;
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
