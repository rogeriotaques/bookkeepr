<template>
  <div class="app">
    <!-- Loading / Error / Auth states (no layout) -->
    <template v-if="isLoadingSettings || settingsError || isFirstAccess || (!state.isAuthenticated && isUsingPasswd)">
      <main class="app__body app__body--headless">
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
        <div
          v-else-if="settingsError"
          class="app__error"
        >
          <p>Unable to load settings.</p>
          <p class="app__error-message">{{ settingsError.message }}</p>
        </div>
        <FirstAccessPage
          v-else-if="isFirstAccess"
          @update="onAuthHandler(true)"
        />
        <AuthPage
          v-else
          @authenticate="onAuthHandler"
        />
      </main>
    </template>

    <!-- Authenticated: MobileLayout with bottom nav -->
    <MobileLayout v-else>
      <Suspense>
        <RouterView />
      </Suspense>
    </MobileLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';

import MobileLayout from '@/components/layout/MobileLayout.vue';
import BaseProgress from '@/components/shared/BaseProgress.vue';

import AuthPage from '@/pages/AuthPage.vue';
import FirstAccessPage from '@/pages/FirstAccessPage.vue';

import { useState, logout } from '@/composable/useState';
import { authEvents } from '@/composable/useAuthEvents';
import useDataFetch from '@/composable/useDataFetch';

const state = useState();
const router = useRouter();
const settingsUrl = ref('/settings');

const { fetchData, invalidateQuery } = useDataFetch(settingsUrl);
const { isLoading: isLoadingSettings, data: settingsData, error: settingsError } = await fetchData();

const isFirstAccess = computed(() => (settingsData.value as any)?.config?.usePasswd === null);
const isUsingPasswd = computed(() => (settingsData.value as any)?.config?.usePasswd || false);

const watchImmediate = (value: any, callback: any) => watch(value, callback, { immediate: true });

const onAuthHandler = (status: boolean) => {
  if (!status) logout();
  invalidateQuery();
};

watchImmediate(isLoadingSettings, () => {
  if (!isLoadingSettings.value && !isFirstAccess.value && !isUsingPasswd.value) state.isAuthenticated = true;
});

onMounted(() => {
  authEvents.on('unauthorized', () => {
    logout();
    router.push('/auth');
  });
});
</script>

<style lang="scss" scoped>
.app {
  &__body {
    min-height: 100vh;

    &--headless {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

  &__loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: var(--bk-danger);

    &-message {
      margin-top: var(--bk-space-sm);
      font-size: var(--bk-text-sm);
      opacity: 0.8;
    }
  }
}
</style>
