<template>
  <div class="auth-page container">
    <div class="auth-page__wrapper">
      <hgroup class="auth-page__header">
        <h3>Authentication required</h3>
        <p>Enter your pin/password</p>
      </hgroup>

      <div class="auth-page__form">
        <div class="input">
          <input
            v-model="password"
            ref="inputRef"
            type="password"
            placeholder="Your secret password"
            class="auth-page__password"
            autocomplete="off"
            @keydown.capture.enter="onAuthClickHandler"
          />
        </div>

        <button
          :disabled="!isFormValid || isAuthenticating"
          type="submit"
          class="auth-page__button"
          @click="onAuthClickHandler"
        >
          <IconLoader2
            v-if="isAuthenticating"
            class="is-spinning"
          />
          <span v-else>Login</span>
        </button>
      </div>

      <div class="auth-page__footer">
        <AppFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import AppFooter from '@/components/navigation/AppFooter.vue';

import { authUser } from '@/domain/network';

interface Emit {
  (e: 'authenticate', value: boolean): void;
}

const emit = defineEmits<Emit>();

const inputRef = ref<HTMLInputElement | null>(null);

const toast = useToast();

const isAuthenticating = ref(false);
const password = ref('');

const isFormValid = computed(() => !!password.value);

const onAuthClickHandler = async () => {
  if (!isFormValid.value) inputRef.value?.focus();
  isAuthenticating.value = true;

  try {
    const { isAuthenticated } = await authUser(password.value);

    if (!isAuthenticated) {
      throw new Error('Invalid password');
    }

    emit('authenticate', isAuthenticated);
    toast.success('Welcome back!');
  } catch (error: any) {
    toast.error(error.message || 'Something went wrong');

    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select();
  } finally {
    isAuthenticating.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;

  &__wrapper {
    width: 100%;
    max-width: 400px;
    padding: 32px 24px 0;
    text-align: center;
  }

  &__header {
    margin-bottom: 64px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .input {
      width: 100%;
    }
  }

  &__password {
    text-align: center;
  }

  &__footer {
    margin-top: 64px;

    ::v-deep(p) {
      margin: 0;
    }

    ::v-deep(code) {
      margin-bottom: 0;
    }
  }
}
</style>
