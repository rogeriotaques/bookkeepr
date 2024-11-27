<template>
  <div class="balance-table">
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th width="25%">Description</th>
          <th class="has-text-right">Outcome</th>
          <th class="has-text-right">Income</th>
          <th class="has-text-right">Balance</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in entries"
          :key="entry.id"
          :class="{
            'balance-table__editing': props.editing === entry.id,
            'balance-table__selected': isSelected(entry),
          }"
        >
          <td @click="onEntryClickHandler(entry)">{{ entry.date }}</td>
          <td @click="onEntryClickHandler(entry)">
            <div>{{ entry.description }}</div>
            <div>
              <span class="badge">{{ entry.groupName }}</span>
              <span class="badge">{{ entry.walletName }}</span>
            </div>
          </td>
          <td
            class="has-text-right"
            @click="onEntryClickHandler(entry)"
          >
            {{ entry.operation === ENTRY_OPERATIONS.EXPENSE ? getFormattedCurrency(entry.amount) : '' }}
          </td>
          <td
            class="has-text-right"
            @click="onEntryClickHandler(entry)"
          >
            {{ entry.operation === ENTRY_OPERATIONS.INCOME ? getFormattedCurrency(entry.amount) : '' }}
          </td>
          <td
            class="has-text-right"
            @click="onEntryClickHandler(entry)"
          >
            {{ getFormattedCurrency(entry.balance) }}
          </td>
          <td class="has-text-right">
            <div class="balance-table__actions">
              <a
                v-if="props.editing !== entry.id"
                class="link"
                @click="emit('edit', entry)"
              >
                <IconEdit />
              </a>
              <span
                v-else
                class="link link--editing"
              >
                <IconEye />
              </span>

              <a
                class="link is-danger"
                @click="onDeleteHandler(entry.id ?? 0)"
              >
                <IconTrash />
              </a>
            </div>
          </td>
        </tr>

        <template v-if="props.loading">
          <tr v-for="entry in 5">
            <td>
              <BaseSkeleton />
            </td>
            <td>
              <BaseSkeleton />
            </td>
            <td class="has-text-right">
              <BaseSkeleton />
            </td>
            <td class="has-text-right">
              <BaseSkeleton />
            </td>
            <td class="has-text-right">
              <BaseSkeleton />
            </td>
            <td>&nbsp;</td>
          </tr>
        </template>

        <TableEmptyCard v-else-if="entries.length === 0" />
      </tbody>
      <tfoot v-if="!props.loading">
        <tr>
          <th colspan="2">Total</th>
          <th class="has-text-right">
            {{ getFormattedCurrency(totalOutcome) }}
          </th>
          <th class="has-text-right">
            {{ getFormattedCurrency(totalIncome) }}
          </th>
          <th class="has-text-right">
            {{ getFormattedCurrency(finalBalance) }}
          </th>
          <th></th>
        </tr>
      </tfoot>
    </table>
  </div>

  <div
    v-if="selectedEntries.length"
    class="balance-table__selected-entries"
    :class="{ 'balance-table__selected-entries--negative': totalSelected < 0 }"
  >
    <div class="balance-table__selected-entries-data">
      <label>Calculator:</label>
      <h5>( {{ selectedEntries.length }} )</h5>
      <h5>{{ getFormattedCurrency(totalSelected) }}</h5>
    </div>
    <div class="balance-table__selected-entries-action">
      <a @click="selectedEntries = []"><IconX /></a>
    </div>
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
      <b>{{ editingEntry?.description }}</b>
      ?
    </p>
    <p>This action cannot be undone.</p>
  </BaseConfirmModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IconEdit, IconTrash, IconEye, IconLoader2, IconX } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { ExtendedEntry, CurrencyLocale } from '@/domain/interfaces';
import { ENTRY_OPERATIONS } from '@/domain/constants';
import { deleteEntry } from '@/domain/network';
import { formatCurrency } from '@/domain/utils';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  data: ExtendedEntry[];
  editing?: number | null;
  loading?: boolean;
  locale: CurrencyLocale;
  search?: string;
}

const props = withDefaults(defineProps<Props>(), {
  locale: {} as any,
  search: '',
});

interface Emits {
  (e: 'edit', entry: ExtendedEntry): void;
  (e: 'update'): void;
}

const emit = defineEmits<Emits>();

const editingEntry = ref<ExtendedEntry | null>(null);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const selectedEntries = ref<ExtendedEntry[]>([]);

const entries = computed(() => {
  const entries = props.data.map((entry) => ({ ...entry, balance: 0 }));
  const searchRegExp = props.search ? new RegExp(props.search, 'ig') : null;

  entries.forEach((e, i) => {
    const expense = e.operation === ENTRY_OPERATIONS.EXPENSE;

    e.balance = i === 0 ? (e.balance = expense ? -e.amount : e.amount) : (e.balance = entries[i - 1].balance + (expense ? -e.amount : e.amount));

    e.hasMatch = !!(
      searchRegExp?.test(e.date) ||
      searchRegExp?.test(e.description) ||
      searchRegExp?.test(e.groupName) ||
      searchRegExp?.test(e.walletName) ||
      searchRegExp?.test(`${e.amount}`) ||
      searchRegExp?.test(`${e.balance}`)
    );
  });

  if (props.search) {
    return entries.filter(({ hasMatch }) => hasMatch);
  }

  return entries;
});

const totalIncome = computed(() => entries.value.filter(isIncome).reduce((acc, entry) => entry.amount + acc, 0));
const totalOutcome = computed(() => entries.value.filter(isOutcome).reduce((acc, entry) => entry.amount + acc, 0));
const finalBalance = computed(() => entries.value[entries.value.length - 1]?.balance ?? 0);

const totalSelected = computed(() =>
  selectedEntries.value.reduce((acc, entry) => {
    if (entry.operation === ENTRY_OPERATIONS.EXPENSE) {
      return acc - entry.amount;
    }

    return acc + entry.amount;
  }, 0)
);

const isIncome = (entry: ExtendedEntry) => entry.operation === ENTRY_OPERATIONS.INCOME;
const isOutcome = (entry: ExtendedEntry) => entry.operation === ENTRY_OPERATIONS.EXPENSE;
const isSelected = (entry: ExtendedEntry) => !!selectedEntries.value.find(({ id }) => id === entry.id);
const getFormattedCurrency = (value: number) => formatCurrency(value, { currency: props.locale.currencyCode, locale: props.locale.currencyLocale });

const onEntryClickHandler = (entry: ExtendedEntry) => {
  if (selectedEntries.value.find(({ id }) => id === entry.id)) {
    selectedEntries.value = selectedEntries.value.filter(({ id }) => id !== entry.id);
    return;
  }

  selectedEntries.value.push(entry);
};

const onDeleteHandler = (id: number) => {
  const entry = props.data.find((entry) => entry.id === id);

  if (entry) {
    editingEntry.value = entry;
    isDeleteModalOpen.value = true;
  }
};

const onCancelConfirmHandler = () => {
  isDeleteModalOpen.value = false;
  editingEntry.value = null;
};

const onDeleteConfirmHandler = async () => {
  const toast = useToast();

  isDeleting.value = true;

  try {
    await deleteEntry(editingEntry.value?.id ?? 0);

    isDeleteModalOpen.value = false;
    editingEntry.value = null;
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
  $class: &;

  table {
    th {
      font-family: Impact, sans-serif;
    }

    th,
    td {
      padding: 8px 16px;
      font-size: 18px;
    }
  }

  thead {
    position: sticky;
    top: 58px;
    background-color: var(--c-background);
  }

  tbody td {
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  tbody > tr:not(#{$class}__editing) {
    #{$class}__actions {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    &:hover #{$class}__actions {
      opacity: 1;
    }
  }

  &__editing {
    td {
      background-color: var(--c-warning-background);
    }

    &:hover {
      td {
        background-color: var(--c-warning);
      }
    }
  }

  &__selected {
    td {
      background-color: var(--c-info-background);
    }

    &:hover {
      td {
        background-color: var(--c-info);
      }
    }
  }

  .badge {
    font-size: 0.65rem;
    padding: 2px 4px;
    min-width: auto;

    + .badge {
      margin-left: 2px;
    }
  }

  &__selected-entries {
    position: sticky;
    bottom: 16px;

    margin: 24px 0 0;
    border: 1px solid var(--c-info);
    border-radius: 8px;
    padding: 8px 16px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--c-info-background);

    z-index: 10;

    h5 {
      color: var(--c-info);
      margin: 0;
    }

    a {
      padding: 0;
      margin: 4px 0 0;
      border: 0;
      cursor: pointer;

      &::before {
        content: none !important;
      }

      &:hover {
        > svg {
          stroke: var(--c-danger);
        }
      }
    }

    &--negative {
      border-color: var(--c-danger);
      background: var(--c-danger-background);

      h5 {
        color: var(--c-danger);
      }
    }

    &-data {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-action {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
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

  &:not(.link--editing):hover {
    > svg {
      stroke: var(--c-info);
    }
  }

  &.is-danger:hover {
    > svg {
      stroke: var(--c-danger);
    }
  }

  &--editing {
    cursor: default;
  }
}
</style>
