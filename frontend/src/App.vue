<template>
  <header
    v-if="showFullTemplate"
    class="app__header"
  >
    <AppNavBar
      :is-using-password="isUsingPasswd"
      @sign-out="onAuthHandler(false)"
    />
  </header>
  <main
    :class="{ 'app__body--headless': !showFullTemplate }"
    class="app__body"
  >
    <Suspense>
      <div
        v-if="isLoadingSettings"
        class="app__loader"
      >
        <BaseProgress
          width="300px"
          height="24px"
        >
          Loading ...
        </BaseProgress>
      </div>
      <FirstAccessPage
        v-else-if="isFirstAccess"
        @update="onAuthHandler(true)"
      />
      <RouterView v-else-if="state.isAuthenticated || !isUsingPasswd" />
      <AuthPage
        v-else
        @authenticate="onAuthHandler"
      />
    </Suspense>
  </main>
  <footer
    v-if="showFullTemplate"
    class="app__footer"
  >
    <AppFooter />
  </footer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { RouterView } from 'vue-router';

import AppNavBar from '@/components/navigation/AppNavBar.vue';
import AppFooter from '@/components/navigation/AppFooter.vue';
import BaseProgress from '@/components/shared/BaseProgress.vue';

import AuthPage from '@/pages/AuthPage.vue';
import FirstAccessPage from '@/pages/FirstAccessPage.vue';

import { useState } from '@/composable/useState';
import useDataFetch from '@/composable/useDataFetch';

const state = useState();
const settingsUrl = ref('/settings');

const { fetchData, invalidateQuery } = useDataFetch(settingsUrl);
const { isLoading: isLoadingSettings, data: settingsData } = await fetchData();

const isFirstAccess = computed(() => (settingsData.value as any)?.config?.usePasswd === null);
const isUsingPasswd = computed(() => (settingsData.value as any)?.config?.usePasswd || false);
const showFullTemplate = computed(() => state.isAuthenticated);

const watchImmediate = (value: any, callback: any) => watch(value, callback, { immediate: true });

const onAuthHandler = (status: boolean) => {
  state.isAuthenticated = status;
  if (!status) state.credential = null;
  invalidateQuery();
};

watchImmediate(isLoadingSettings, () => {
  if (!isLoadingSettings.value && !isFirstAccess.value && !isUsingPasswd.value) state.isAuthenticated = true;
});
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

    &--headless {
      margin: 0;
      min-height: 100vh;
    }
  }

  &__footer {
    background-color: #e2e2e2;
    margin: 16px 0 0;
    padding: 24px;
    text-align: center;
  }

  &__loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
}
</style>
