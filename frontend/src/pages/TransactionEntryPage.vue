<template>
  <div class="entry-page">
    <header class="entry-page__header">
      <h1>Transactions</h1>
    </header>

    <div class="entry-page__grid" data-testid="transactions-grid">
      <div class="entry-page__main">
        <EntryForm
          :data="form"
          :is-submitting="isSubmitting"
          :is-editing="false"
          :locale="locale"
          @submit="onSubmitHandler"
          @cancel="resetForm"
        />
      </div>

      <div class="entry-page__side">
        <TransactionHistoryPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

import EntryForm from '@/components/transactions/EntryForm.vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';
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
  max-width: var(--bk-max-width-wide);
  margin: 0 auto;

  &__header {
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0;
    }
  }

  &__grid {
    display: block;
  }

  &__main {
    min-width: 0;
  }

  &__side {
    margin-top: var(--bk-space-lg);
  }
}

// Desktop: the entry form on the left, the month's transactions on the right.
@media (min-width: 1024px) {
  .entry-page {
    &__header h1 {
      font-size: var(--bk-text-3xl);
    }

    &__grid {
      display: grid;
      grid-template-columns: minmax(0, 380px) minmax(0, 1fr);
      gap: var(--bk-space-lg);
      align-items: start;
    }

    &__side {
      margin-top: 0;
    }
  }
}
</style>
