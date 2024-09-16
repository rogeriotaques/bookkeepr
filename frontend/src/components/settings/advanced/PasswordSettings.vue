<template>
  <div class="settings-advanced-password">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Password</h5>
          <p>Manage your current password</p>
        </hgroup>
      </div>
      <div class="col-4 settings-advanced-password__actions">
        <button
          :disabled="props.loading"
          type="button"
          @click="showChangePasswordModal = true"
        >
          <template v-if="props.usePasswd">
            <IconPasswordUser />
            <span>Change</span>
          </template>
          <template v-else>
            <IconPasswordUser />
            <span>Set</span>
          </template>
        </button>

        <button
          :disabled="props.loading || !props.usePasswd"
          type="reset"
          class="has-tooltip has-tooltip--left"
          data-tooltip="Removes your password to access this app"
          @click="showRemovePasswordModal = true"
        >
          <IconEraser />
          <span>Remove</span>
        </button>
      </div>
    </div>
  </div>

  <BaseConfirmModal
    v-model="showRemovePasswordModal"
    :loading="isLoading"
    type="danger"
    title="Remove password"
    confirmText="Remove"
    @cancel="showRemovePasswordModal = false"
    @confirm="onRemovePasswordHandler"
  >
    <div class="settings-advanced-password__alert-icon">
      <IconAlertTriangle
        width="48"
        height="48"
      />
    </div>
    <p>Removing your access password will enble people to view and update your stored data.</p>
    <p>Would you like to proceed?</p>
  </BaseConfirmModal>

  <BaseModal
    v-model="showChangePasswordModal"
    :title="changePasswordModalTitle"
    :loading="isLoading"
    :confirm-disabled="!isPasswordValid"
    width="500px"
    confirm-text="Save"
    prevent-outside-click
    @confirm="onChangePasswordSaveClickHandler"
    @cancel="onChangePasswordCancelHandler"
  >
    <div class="input input--with-helpers">
      <label for="password">Password</label>
      <input
        v-model="password"
        ref="passwordRef"
        id="password"
        type="password"
        placeholder="Your secret password"
        @keydown.capture.enter="onChangePasswordSaveClickHandler"
      />
      <p class="input__helper">
        <IconBulb />
        Avoid too simple passwords
      </p>
    </div>
    <div class="input input--with-helpers">
      <label for="confirm-password">Password confirmation</label>
      <input
        v-model="confirmPassword"
        ref="confirmPasswordRef"
        id="confirm-password"
        type="password"
        placeholder="Type your password again"
        @keydown.capture.enter="onChangePasswordSaveClickHandler"
      />
      <p class="input__helper">
        <template v-if="isPasswordAndConfirmPasswordGiven && !isPasswordValid">
          <IconAlertTriangle />
          Passwords do not match
        </template>
        <template v-else-if="isPasswordAndConfirmPasswordGiven">
          <IconCheck />
          Passwords match
        </template>
      </p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { IconEraser, IconPasswordUser, IconAlertTriangle, IconBulb, IconCheck } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import BaseModal from '@/components/shared/BaseModal.vue';

import { disableUserPassword, saveUserPassword } from '@/domain/network';

interface Props {
  usePasswd: boolean | null;
  loading?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update'): void;
}

const emit = defineEmits<Emits>();

const toast = useToast();

const isLoading = ref(false);
const showRemovePasswordModal = ref(false);
const showChangePasswordModal = ref(false);
const password = ref('');
const confirmPassword = ref('');

const passwordRef = ref<HTMLInputElement | null>(null);
const confirmPasswordRef = ref<HTMLInputElement | null>(null);

const changePasswordModalTitle = computed(() => {
  return props.usePasswd ? 'Change password' : 'Set password';
});

const resetInputs = () => {
  password.value = '';
  confirmPassword.value = '';
};

const onChangePasswordCancelHandler = () => {
  resetInputs();
  showChangePasswordModal.value = false;
};

const isPasswordAndConfirmPasswordGiven = computed(() => password.value.trim().length > 0 && confirmPassword.value.trim().length > 0);
const isPasswordValid = computed(() => isPasswordAndConfirmPasswordGiven.value && password.value === confirmPassword.value);

const onChangePasswordSaveClickHandler = async () => {
  if (!isPasswordValid.value) return;

  isLoading.value = true;

  try {
    await saveUserPassword(password.value);
    showChangePasswordModal.value = false;
    resetInputs();
    toast.success('Password saved!');
    emit('update');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const onRemovePasswordHandler = async () => {
  isLoading.value = true;

  try {
    await disableUserPassword();
    showRemovePasswordModal.value = false;
    toast.success('Password disabled!');
    emit('update');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

watch(showChangePasswordModal, async () => {
  await nextTick();
  if (showChangePasswordModal.value) passwordRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.settings-advanced-password {
  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    > button {
      width: 100px;
    }
  }

  &__alert-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

}

.input__helper {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
