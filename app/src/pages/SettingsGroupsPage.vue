<template>
  <div class="settings-groups">
    <button
      type="submit"
      class="is-auto-width is-pulled-right has-icon has-tooltip has-tooltip--left"
      data-tooltip="Add new category"
      @click="isModalOpen = true"
    >
      <IconPlus :size="18" />
    </button>

    <hgroup>
      <h4 class="title">Categories</h4>
      <p class="subtitle">
        <span v-if="isLoading">Loading...</span>
        <span v-else-if="isError">{{ error }}</span>
        <span v-else> Manage your categories </span>
      </p>
    </hgroup>

    <GroupTable v-if="isLoaded" :data="groups" @update="invalidateQuery('groups')" @edit="onEditClickHandler" />
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
    <GroupForm :form="form" :submitting="isSubmitting" />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { IconPlus } from '@tabler/icons-vue';
import { useToast } from 'vue-toastification';

import useGroups from '@/composable/useGroups';

import { Group } from '@/domain/interfaces';
import { addGroup, updateGroup } from '@/domain/network';

import BaseModal from '@/components/shared/BaseModal.vue';
import GroupForm from '@/components/settings/groups/GroupForm.vue';
import GroupTable from '@/components/settings/groups/GroupTable.vue';

const toast = useToast();
const { getGroups, invalidateQuery } = useGroups();
const { isLoading, isError, data, error } = await getGroups();

const isModalOpen = ref(false);
const isSubmitting = ref(false);

const form = reactive<Group>({
  id: undefined,
  code: '',
  name: '',
  operation: 'income',
  active: 1,
});

const isLoaded = computed(() => !isLoading.value && !isError.value);
const groups = computed(() => data.value?.groups ?? []);
const isEditing = computed(() => form.id !== undefined);
const modalTitle = computed(() => (isEditing.value ? 'Edit category' : 'Add new category'));
const isFormValid = computed(() => `${form.code}`.length > 0 && form.name.length > 0 && form.operation.length > 0 && form.active !== undefined);

const onCancelModalHandler = () => {
  isModalOpen.value = false;

  form.id = undefined;
  form.code = '';
  form.name = '';
  form.operation = 'income';
  form.active = 1;
};

const onEditClickHandler = (group: Group) => {
  form.id = group.id;
  form.code = group.code;
  form.name = group.name;
  form.operation = group.operation;
  form.active = group.active;

  isModalOpen.value = true;
};

const onAddConfirmClickHandler = async () => {
  isSubmitting.value = true;
  await nextTick();

  try {
    let message;

    if (isEditing.value) {
      message = 'Category updated!';
      await updateGroup(form.id ?? 0, form);
    } else {
      message = 'Category added!';
      await addGroup(form);
    }

    onCancelModalHandler();
    invalidateQuery('groups');

    toast.success(message);
  } catch (error) {
    toast.error(`Error adding category: ${error}`);
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
