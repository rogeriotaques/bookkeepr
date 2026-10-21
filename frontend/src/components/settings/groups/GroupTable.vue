<template>
  <table
    ref="tableRef"
    class="table group-table table-scroll"
  >
    <thead>
      <tr>
        <th width="10%">Code</th>
        <th width="30%">Name</th>
        <th>Operation</th>
        <th>Type</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(group, index) in props.data"
        :key="group.id"
        :data-row-index="index"
        :tabindex="rowTabIndex(index)"
        :class="{ 'group-table__row--focused': activeIndex === index }"
        @focus="onRowFocus(index)"
      >
        <td>{{ group.code }}</td>
        <td>{{ group.name }}</td>
        <td>{{ toCamelCase(group.operation) }}</td>
        <td>
          <span v-if="group.operation === 'outcome' && group.expense_type">
            {{ toCamelCase(group.expense_type) }}
          </span>
          <span v-else>-</span>
        </td>
        <td>
          <span
            v-if="group.active"
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
          <div class="group-table__actions">
            <button
              type="button"
              class="link"
              aria-label="Edit category"
              @click="emit('edit', group)"
            >
              <IconEdit />
            </button>
            <button
              type="button"
              class="link is-danger"
              aria-label="Delete category"
              @click="onDeleteHandler(group.id ?? 0)"
            >
              <IconTrash />
            </button>
          </div>
        </td>
      </tr>

      <template v-if="props.loading">
        <tr v-for="group in 5">
          <td>
            <BaseSkeleton width="50%" />
          </td>
          <td>
            <BaseSkeleton />
          </td>
          <td>
            <BaseSkeleton width="55%" />
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

      <TableEmptyCard v-else-if="!props.data.length" />
    </tbody>
  </table>

  <BaseConfirmModal
    v-model="isDeleteModalOpen"
    :loading="isDeleting"
    type="danger"
    title="Delete category"
    confirm-text="Delete"
    @confirm="onDeleteConfirmHandler"
    @cancel="onCancelConfirmHandler"
  >
    <p>
      Delete
      <b>{{ selectedGroup?.name }}</b>
      ?
    </p>
    <p>This action cannot be undone.</p>
  </BaseConfirmModal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { Group } from '@/domain/interfaces';
import { deleteGroup } from '@/domain/network';
import { useTableCursor } from '@/composable/useTableCursor';

import BaseConfirmModal from '@/components/shared/BaseConfirmModal.vue';
import TableEmptyCard from '@/components/shared/TableEmptyCard.vue';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  data?: any;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: [] as Group[],
  loading: true,
});

interface Emits {
  (e: 'edit', group: Group): void;
  (e: 'update'): void;
}

const emit = defineEmits<Emits>();

const tableRef = ref<HTMLTableElement | null>(null);
const selectedGroup = ref<Group | null>(null);
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
    const group = props.data[index];
    if (group) emit('edit', group);
  },
  onDelete: (index) => {
    const group = props.data[index];
    if (group) onDeleteHandler(group.id ?? 0);
  },
});

const toCamelCase = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const onDeleteHandler = (id: number) => {
  const group = props.data.find((group: Group) => group.id === id);

  if (group) {
    selectedGroup.value = group;
    isDeleteModalOpen.value = true;
  }
};

const onCancelConfirmHandler = () => {
  isDeleteModalOpen.value = false;
  selectedGroup.value = null;
};

const onDeleteConfirmHandler = async () => {
  const toast = useToast();

  isDeleting.value = true;

  try {
    await deleteGroup(selectedGroup.value?.id ?? 0);

    isDeleteModalOpen.value = false;
    selectedGroup.value = null;
    emit('update');

    toast.success('Category deleted!');
  } catch (error) {
    toast.error(`Error deleting category: ${error}`);
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

.group-table {
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

  tbody > tr.group-table__row--focused td {
    box-shadow: inset 0 2px 0 var(--c-info), inset 0 -2px 0 var(--c-info);
  }
}
</style>
