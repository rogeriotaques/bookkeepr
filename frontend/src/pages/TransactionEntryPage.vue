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
          :is-editing="isEditing"
          :locale="locale"
          @submit="onSubmitHandler"
          @cancel="resetForm"
        />
      </div>

      <div class="entry-page__side">
        <TransactionHistoryPage
          :editing="editingId"
          @edit="onEditHandler"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useQueryClient } from '@tanstack/vue-query';
import dayjs from 'dayjs';

import EntryForm from '@/components/transactions/EntryForm.vue';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage.vue';
import { ExtendedEntry } from '@/domain/interfaces';
import { addEntry, updateEntry } from '@/domain/network';
import { formatAmount } from '@/domain/utils';
import useDataFetch from '@/composable/useDataFetch';

const isSubmitting = ref(false);
const toast = useToast();
const queryClient = useQueryClient();

const settingsUrl = ref('/settings');
const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { data: settingsData } = await getSettingsData();

const form = reactive({
  id: null as number | null,
  amount: '',
  description: '',
  group: '',
  wallet: '' as string | number,
  date: dayjs().format('YYYY-MM-DD'),
});

const editingId = computed(() => form.id);
const isEditing = computed(() => form.id !== null);

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

const onEditHandler = (entry: ExtendedEntry) => {
  form.id = entry.id ?? null;
  form.amount = formatAmount(entry.amount);
  form.description = entry.description;
  form.group = entry.group;
  form.wallet = entry.wallet;
  form.date = entry.date;
};

const onSubmitHandler = async () => {
  isSubmitting.value = true;

  try {
    const id = form.id;
    const payload = { ...form };
    const isNew = id === null;

    if (isNew) {
      await addEntry(payload);
    } else {
      await updateEntry(id, payload);
    }

    resetForm();

    // Sequential entries usually share the date, category and wallet. Keep
    // those three; the amount and description are cleared by resetForm.
    if (isNew) {
      form.date = payload.date;
      form.group = payload.group;
      form.wallet = payload.wallet;
    }

    await invalidateAfterSave();
    toast.success(isNew ? 'Entry saved!' : 'Entry updated!');
  } catch (error: any) {
    toast.error(`Error: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

// A new entry changes the month's list, its report (summary + progress) and the
// year's reports (the Dashboard chart). Refetch those, but leave settings,
// groups and wallets alone.
const invalidateAfterSave = () =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [root, url] = query.queryKey;
      if (root === 'monthly-report') return true;
      if (root !== 'fetch') return false;

      const target = String(url);
      return target.startsWith('/entries') || target.startsWith('/reports');
    },
  });
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

      // The table's calculator bar is fixed to the viewport, so tell it where
      // the table column starts and ends: past the form column and the gap,
      // inside the page gutter.
      --bk-calculator-left: calc(
        max(0px, (100% - var(--bk-max-width-wide)) / 2) + 380px + var(--bk-space-md) + var(--bk-space-lg)
      );
      --bk-calculator-right: calc(
        max(0px, (100% - var(--bk-max-width-wide)) / 2) + var(--bk-space-md)
      );
    }
  }
}
</style>
