<template>
  <div class="entry-page">
    <header class="entry-page__header">
      <h1>Transaction</h1>
      <RouterLink to="/history" class="entry-page__link">
        View transaction history →
      </RouterLink>
    </header>

    <EntryForm
      :data="form"
      :is-submitting="isSubmitting"
      :is-editing="false"
      :locale="locale"
      @submit="onSubmitHandler"
      @cancel="resetForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

import EntryForm from '@/components/transactions/EntryForm.vue';
import { addEntry } from '@/domain/network';
import useDataFetch from '@/composable/useDataFetch';

const isSubmitting = ref(false);
const toast = useToast();

const settingsUrl = ref('/settings');
const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { data: settingsData } = await getSettingsData();

const form = reactive({
  id: null,
  amount: '',
  description: '',
  group: '',
  wallet: '',
  date: dayjs().format('YYYY-MM-DD'),
});

const locale = computed(() => {
  const { config } = settingsData?.value || ({} as any);
  return {
    currencyCode: config?.currencyCode || 'JPY',
    currencyLocale: config?.currencyLocale || 'ja-JP',
  };
});

const resetForm = () => {
  form.id = null;
  form.amount = '';
  form.description = '';
  form.group = '';
  form.wallet = '';
  form.date = dayjs().format('YYYY-MM-DD');
};

const onSubmitHandler = async () => {
  isSubmitting.value = true;

  try {
    await addEntry(form);
    resetForm();
    toast.success('Entry saved!');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.entry-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width);
  margin: 0 auto;

  &__header {
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-sm);
    }
  }

  &__link {
    color: var(--bk-primary);
    text-decoration: none;
    font-size: var(--bk-text-sm);

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
