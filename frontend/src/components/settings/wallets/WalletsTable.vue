<template>
  <table
    ref="tableRef"
    class="table wallets-table table-scroll"
  >
    <thead>
      <tr>
        <th width="65%">Name</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(wallet, index) in props.data"
        :key="wallet.id"
        :data-row-index="index"
        :tabindex="rowTabIndex(index)"
        :class="{ 'wallets-table__row--focused': activeIndex === index }"
        @focus="onRowFocus(index)"
      >
        <td>{{ wallet.name }}</td>
        <td>
          <span
            v-if="wallet.active"
            class="badge badge--success"
          >
            Active
          </span>
          <span
            v-else
            class="badge badge--warning"
          >
            Inactive
          </span>
        </td>
        <td class="has-text-right">
          <div class="wallets-table__actions">
            <button
              type="button"
              class="link"
              aria-label="Edit wallet"
              @click="emit('edit', wallet)"
            >
              <IconEdit />
            </button>
            <button
              type="button"
              class="link is-danger"
              aria-label="Delete wallet"
              @click="onDeleteHandler(wallet.id ?? 0)"
            >
              <IconTrash />
            </button>
          </div>
        </td>
      </tr>

      <template v-if="props.loading">
        <tr v-for="wallet in 5">
          <td>
            <BaseSkeleton />
          </td>
          <td>
            <BaseSkeleton
              width="55%"
              height="36px"
            />
          </td>
          <td>&nbsp;</td>
        </tr>
      </template>

      <TableEmptyCard
        v-if="!props.data.length"
        colspan="3"
      />
    </tbody>
  </table>

  <BaseConfirmModal
    v-model="isDeleteModalOpen"
    :loading="isDeleting"
    type="danger"
    title="Delete wallet"
    confirm-text="Delete"
    @confirm="onDeleteConfirmHandler"
    @cancel="onCancelConfirmHandler"
  >
    <p>
      Are you sure you want to delete
      <b>{{ selectedWallet?.name }}</b>
      ?
    </p>
    <p>This action cannot be undone.</p>
  </BaseConfirmModal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { Wallet } from '@/domain/interfaces';
import { deleteWallet } from '@/domain/network';
import { useTableCursor } from '@/composable/useTableCursor';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  data?: any;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: [] as Wallet[],
  loading: true,
});

interface Emits {
  (e: 'update'): void;
  (e: 'edit', wallet: Wallet): void;
}

const emit = defineEmits<Emits>();

const tableRef = ref<HTMLTableElement | null>(null);
const selectedWallet = ref<Wallet | null>(null);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

const focusRow = (index: number) => {
  nextTick(() => {
    tableRef.value?.querySelector<HTMLElement>(`[data-row-index="${index}"]`)?.focus();
  });
};

const { activeIndex, rowTabIndex, onRowFocus } = useTableCursor({
  count: () => props.data?.length ?? 0,
  onMove: focusRow,
  onActivate: (index) => {
    const wallet = props.data[index];
    if (wallet) emit('edit', wallet);
  },
  onDelete: (index) => {
    const wallet = props.data[index];
    if (wallet) onDeleteHandler(wallet.id ?? 0);
  },
});

const onDeleteHandler = (id: number) => {
  const wallet = props.data.find((wallet: Wallet) => wallet.id === id);

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

button.link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--bk-touch-min);
  min-height: var(--bk-touch-min);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: inherit;
  font: inherit;

  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background: transparent;
    box-shadow: none;
    transform: none;
  }

  &:hover,
  &:focus-visible {
    > svg {
      stroke: var(--c-info);
    }
  }

  &.is-danger:hover,
  &.is-danger:focus-visible {
    > svg {
      stroke: var(--c-danger);
    }
  }
}

.wallets-table {
  thead {
    position: sticky;
    top: 58px;
    background-color: var(--c-background);
  }

  &__actions {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    white-space: nowrap;
  }

  tbody > tr[tabindex]:focus {
    outline: none;
  }

  tbody > tr.wallets-table__row--focused td {
    box-shadow: inset 0 2px 0 var(--c-info), inset 0 -2px 0 var(--c-info);
  }
}
</style>
