<template>
  <div class="settings-wallets">
    <button
      type="submit"
      class="is-auto-width is-pulled-right has-icon has-tooltip has-tooltip--left"
      data-tooltip="Add new wallet"
      @click="isModalOpen = true"
    >
      <IconPlus :size="18" />
    </button>

    <hgroup>
      <h4 class="title">Wallets</h4>
      <p class="subtitle">
        <span v-if="isLoading">Loading...</span>
        <span v-else-if="isError">{{ error }}</span>
        <span v-else>Manage your wallets</span>
      </p>
    </hgroup>

    <WalletsTable
      v-if="isLoaded"
      :data="wallets"
      @update="invalidateQuery()"
      @edit="onEditClickHandler"
    />
  </div>

  <BaseModal
    v-model="isModalOpen"
    :title="modalTitle"
    :loading="isSubmitting"
    :confirm-disabled="!isFormValid"
    confirm-text="Save"
    prevent-outside-click
    @confirm="onAddConfirmClickHandler"
    @cancel="onCancelModalHandler"
  >
    <WalletForm
      :form="form"
      :submitting="isSubmitting"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { IconPlus } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { Wallet } from '@/domain/interfaces';
import { addWallet, updateWallet } from '@/domain/network';

import useDataFetch from '@/composable/useDataFetch';
import BaseModal from '@/components/shared/BaseModal.vue';
import WalletForm from '@/components/settings/wallets/WalletForm.vue';
import WalletsTable from '@/components/settings/wallets/WalletsTable.vue';

const isModalOpen = ref(false);
const isSubmitting = ref(false);
const walletsUrl = ref('/wallets');

const toast = useToast();
const { fetchData, invalidateQuery } = useDataFetch(walletsUrl);
const { isLoading, isError, data, error } = await fetchData();

const form = reactive<Wallet>({
  id: undefined,
  name: '',
  active: 1,
});

const isLoaded = computed(() => !isLoading.value && !isError.value);
const wallets = computed(() => data.value?.wallets ?? []);
const isEditing = computed(() => form.id !== undefined);
const modalTitle = computed(() => (isEditing.value ? 'Edit wallet' : 'Add new wallet'));
const isFormValid = computed(() => form.name.length > 0 && form.active !== undefined);

const onCancelModalHandler = () => {
  isModalOpen.value = false;

  form.id = undefined;
  form.name = '';
  form.active = 1;
};

const onEditClickHandler = (wallet: Wallet) => {
  form.id = wallet.id;
  form.name = wallet.name;
  form.active = wallet.active;

  isModalOpen.value = true;
};

const onAddConfirmClickHandler = async () => {
  isSubmitting.value = true;
  await nextTick();

  try {
    let message;

    if (isEditing.value) {
      message = 'Wallet updated!';
      await updateWallet(form.id ?? 0, form);
    } else {
      message = 'Wallet added!';
      await addWallet(form);
    }

    onCancelModalHandler();
    invalidateQuery();

    toast.success(message);
  } catch (error) {
    toast.error(`Error adding wallet: ${error}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.new-group.input {
  > .input__addon {
    width: calc(50% - 4px);
  }
}

.is-pulled-right {
  float: right;
}

button {
  &.has-icon > svg {
    margin-top: 4px;
  }
}
</style>
