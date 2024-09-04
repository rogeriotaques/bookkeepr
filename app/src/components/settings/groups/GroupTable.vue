<template>
  <table class="table group-table">
    <thead>
      <tr>
        <th width="10%">Code</th>
        <th width="35%">Name</th>
        <th>Operation</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="group in props.data"
        :key="group.id"
      >
        <td>{{ group.code }}</td>
        <td>{{ group.name }}</td>
        <td>{{ toCamelCase(group.operation) }}</td>
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
            <a
              class="link"
              @click="emit('edit', group)"
            >
              <IconEdit />
            </a>
            <a
              class="link is-danger"
              @click="onDeleteHandler(group.id ?? 0)"
            >
              <IconTrash />
            </a>
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
import { ref } from 'vue';
import { IconEdit, IconTrash } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import { Group } from '@/domain/interfaces';
import { deleteGroup } from '@/domain/network';

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

const selectedGroup = ref<Group | null>(null);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

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

.group-table {
  $class: &;

  tbody > tr {
    #{$class}__actions {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    &:hover #{$class}__actions {
      opacity: 1;
    }
  }
}
</style>
