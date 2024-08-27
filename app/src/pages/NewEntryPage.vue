<template>
  <section class="new-entry">
    <div class="row">
      <div class="col-4">
        <EntryForm
          :data="form"
          :is-submitting="isSubmitting"
          @submit="onSubmitHandler"
        />
      </div>
      <div class="col-8">
        <BalanceFilterForm
          v-model:year="year"
          v-model:month="month"
          v-model:search="search"
        />
        <BalanceTable
          :data="entries"
          @update="invalidateEntriesQuery"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

import EntryForm from '@/components/new-entry/EntryForm.vue';
import BalanceTable from '@/components/new-entry/BalanceTable.vue';
import BalanceFilterForm from '@/components/new-entry/BalanceFilterForm.vue';

import { addEntry } from '@/domain/network';
import { ExtendedEntry } from '@/domain/interfaces';

import useEntries from '@/composable/useEntries';

const isSubmitting = ref(false);
const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

const toast = useToast();
const { getEntries, invalidateQuery: invalidateEntriesQuery } = useEntries(year, month);
const { isLoading: isEntriesLoading, isError: isEntriesError, data: entriesData, error: entriesError } = await getEntries();

const form = reactive<any>({
  id: null,
  amount: '',
  description: '',
  group: '',
  wallet: '',
  date: '',
});

const entries = computed(() => (entriesData.value?.entries ?? []) as ExtendedEntry[]);

const resetForm = (hard = false) => {
  form.id = null;
  form.amount = '';
  form.description = '';

  if (hard) {
    form.group = '';
    form.wallet = '';
    form.date = '';
  }
};

const onSubmitHandler = async () => {
  isSubmitting.value = true;

  try {
    if (form.id) {
      resetForm(true);
      toast.success('Entry updated!');
    } else {
      await addEntry(form);
      resetForm();
      toast.success('Entry saved!');
    }
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    invalidateEntriesQuery();
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped></style>
