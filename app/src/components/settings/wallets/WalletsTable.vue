<template>
  <table class="table">
    <thead>
      <tr>
        <th width="65%">Name</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="wallet in props.data" :key="wallet.id">
        <td>{{ wallet.name }}</td>
        <td>
          <span v-if="wallet.active" class="badge badge--success">Active</span>
          <span v-else class="badge badge--warning">Inactive</span>
        </td>
        <td class="has-text-right">
          <a class="link" @click="emit('edit', wallet)">
            <IconEdit />
          </a>
          <a class="link is-danger" @click="onDeleteHandler(wallet.id ?? 0)">
            <IconTrash />
          </a>
        </td>
      </tr>
      <TableEmptyCard v-if="!props.data.length" colspan="3" />
    </tbody>
  </table>

  <BaseConfirmModal
    v-model="isDeleteModalOpen"
    :key="selectedWallet?.id"
    :loading="isDeleting"
    type="danger"
    title="Delete wallet"
    confirm-text="Delete"
    @confirm="onDeleteConfirmHandler"
    @cancel="onCancelConfirmHandler"
  >
    <p>
      Are you sure you want to delete <b>{{ selectedWallet?.name }}</b
      >?
    </p>
    <p>This action cannot be undone.</p>
  </BaseConfirmModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { Wallet } from '@/domain/interfaces';
import { deleteWallet } from '@/domain/network';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';

interface Props {
  data: Wallet[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update'): void;
  (e: 'edit', wallet: Wallet): void;
}

const emit = defineEmits<Emits>();

const selectedWallet = ref<Wallet | null>(null);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

const onDeleteHandler = (id: number) => {
  const wallet = props.data.find((wallet) => wallet.id === id);

  if (wallet) {
    selectedWallet.value = wallet;
    isDeleteModalOpen.value = true;
  }
};

const onCancelConfirmHandler = () => {
  isDeleteModalOpen.value = false;
  selectedWallet.value = null;
};

const onDeleteConfirmHandler = async () => {
  const toast = useToast();

  isDeleting.value = true;

  try {
    await deleteWallet(selectedWallet.value?.id ?? 0);

    isDeleteModalOpen.value = false;
    selectedWallet.value = null;
    emit('update');

    toast.success('Wallet deleted!');
  } catch (error) {
    toast.error(`Error deleting wallet: ${error}`);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.link {
  border-bottom-color: transparent !important;
  cursor: pointer;

  + .link {
    margin-left: 8px;
  }

  &::before {
    content: none !important;
  }

  &:hover {
    > svg {
      stroke: var(--c-info);
    }
  }

  &.is-danger:hover {
    > svg {
      stroke: var(--c-danger);
    }
  }
}
</style>
