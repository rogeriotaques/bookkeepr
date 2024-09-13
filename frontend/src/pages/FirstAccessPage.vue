<template>
  <div class="first-access-page container">
    <div class="first-access-page__wrapper">
      <hgroup class="first-access-page__header">
        <h3>It's your first access!&nbsp;&nbsp;🎉</h3>
        <p>Please, review the following settings. Don't worry, you can change them later as well.</p>
      </hgroup>

      <div class="first-access-page__form">
        <div class="input">
          <input
            v-model="password"
            ref="inputRef"
            type="password"
            placeholder="Your secret password"
            class="first-access-page__password"
            autocomplete="off"
            @keydown.capture.enter="onSubmitClickHandler"
          />
        </div>
        <div class="first-access-page__actions">
          <button
            :disabled="isCancelling || isSubmitting || isFormValid"
            type="button"
            class="first-access-page__button"
            @click="onCancelClickHandler"
          >
            <IconLoader2
              v-if="isCancelling"
              class="is-spinning"
            />
            <span v-else>Don't use password</span>
          </button>
          <button
            :disabled="!isFormValid || isSubmitting || isCancelling"
            type="submit"
            class="first-access-page__button"
            @click="onSubmitClickHandler"
          >
            <IconLoader2
              v-if="isSubmitting"
              class="is-spinning"
            />
            <span v-else>Define password</span>
          </button>
        </div>
      </div>

      <div class="first-access-page__footer">
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

import { saveUserPassword, disableUserPassword } from '@/domain/network';

interface Emit {
  (e: 'update'): void;
}

const emit = defineEmits<Emit>();

const inputRef = ref<HTMLInputElement | null>(null);

const toast = useToast();

const isSubmitting = ref(false);
const isCancelling = ref(false);
const password = ref('');

const isFormValid = computed(() => !!password.value);

const onCancelClickHandler = async () => {
  isCancelling.value = true;

  try {
    await disableUserPassword();
    emit('update');
    toast.success('Password disabled!');
  } catch (error: any) {
    toast.error(error.message || 'Something went wrong');
  } finally {
    isCancelling.value = false;
  }
};

const onSubmitClickHandler = async () => {
  if (!isFormValid.value) inputRef.value?.focus();
  isSubmitting.value = true;

  try {
    await saveUserPassword(password.value);
    emit('update');
    toast.success('Password defined');
  } catch (error: any) {
    toast.error(error.message || 'Something went wrong');

    await nextTick();
    inputRef.value?.focus();
    inputRef.value?.select();
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.first-access-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;

  &__wrapper {
    width: 100%;
    max-width: 500px;
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

  &__actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
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
