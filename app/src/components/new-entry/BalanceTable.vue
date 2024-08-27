<template>
  <div class="balance-table">
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th width="25%">Description</th>
          <th>Operation</th>
          <th class="has-text-right">Amount</th>
          <th class="has-text-right">Balance</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in entries"
          :key="entry.id"
        >
          <td>{{ entry.date }}</td>
          <td>{{ entry.description }}</td>
          <td>{{ entry.operation === ENTRY_OPERATIONS.INCOME ? 'Income' : 'Expense' }}</td>
          <td class="has-text-right">{{ formatCurrency(entry.amount) }}</td>
          <td class="has-text-right">{{ formatCurrency(entry.balance) }}</td>
          <td class="has-text-right">
            <a
              class="link"
              @click="emit('edit', entry)"
            >
              <IconEdit />
            </a>
            <a
              class="link is-danger"
              @click="onDeleteHandler(entry.id ?? 0)"
            >
              <IconTrash />
            </a>
          </td>
        </tr>

        <TableEmptyCard v-if="entries.length === 0" />
      </tbody>
      <tfoot>
        <tr>
          <th>Total</th>
          <th
            colspan="4"
            class="has-text-right"
          >
            {{ formatCurrency(finalBalance) }}
          </th>
          <th></th>
        </tr>
      </tfoot>
    </table>
  </div>

  <BaseConfirmModal
    v-model="isDeleteModalOpen"
    :loading="isDeleting"
    type="danger"
    title="Delete entry"
    confirm-text="Delete"
    @confirm="onDeleteConfirmHandler"
    @cancel="onCancelConfirmHandler"
  >
    <p>
      Delete
      <b>{{ selectedEntry?.description }}</b>
      ?
    </p>
    <p>This action cannot be undone.</p>
  </BaseConfirmModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { ExtendedEntry } from '@/domain/interfaces';
import { ENTRY_OPERATIONS } from '@/domain/constants';
import { deleteEntry } from '@/domain/network';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';

interface Props {
  data: ExtendedEntry[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'edit', entry: ExtendedEntry): void;
  (e: 'update'): void;
}

const emit = defineEmits<Emits>();

const selectedEntry = ref<ExtendedEntry | null>(null);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

const entries = computed(() => {
  const entries = props.data.map((entry) => ({ ...entry, balance: 0 }));

  entries.forEach((e, i) => {
    const expense = e.operation === ENTRY_OPERATIONS.EXPENSE;

    if (i === 0) {
      e.balance = expense ? -e.amount : e.amount;
      return;
    }

    e.balance = entries[i - 1].balance + (expense ? -e.amount : e.amount);
  });

  return entries;
});
const finalBalance = computed(() => entries.value[entries.value.length - 1].balance);

const formatCurrency = (value: number) => value.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });

const onDeleteHandler = (id: number) => {
  const entry = props.data.find((entry) => entry.id === id);

  if (entry) {
    selectedEntry.value = entry;
    isDeleteModalOpen.value = true;
  }
};

const onCancelConfirmHandler = () => {
  isDeleteModalOpen.value = false;
  selectedEntry.value = null;
};

const onDeleteConfirmHandler = async () => {
  const toast = useToast();

  isDeleting.value = true;

  try {
    await deleteEntry(selectedEntry.value?.id ?? 0);

    isDeleteModalOpen.value = false;
    selectedEntry.value = null;
    emit('update');

    toast.success('Entry deleted!');
  } catch (error) {
    toast.error(`Error: ${error}`);
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.balance-table {
  table {
    th {
      font-family: Impact, sans-serif;
    }

    th,
    td {
      padding: 8px 16px;
      font-size: 18px;
    }

    tr:nth-child(even) {
      background-color: #e9e9e9;
    }
  }
}

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
