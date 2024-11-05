<template>
  <section class="new-entry">
    <div class="row">
      <div class="col-4 col-4--sticky">
        <EntryForm
          :data="form"
          :is-submitting="isSubmitting"
          :is-editing="!!editingID"
          :locale="locale"
          @submit="onSubmitHandler"
          @cancel="resetForm(true)"
        />
      </div>
      <div class="col-8">
        <BalanceFilterForm
          v-model:year="year"
          v-model:month="month"
          v-model:search="search"
          :years="recordedYears"
          :loading="isRecordedYearsLoading"
        />
        <BalanceTable
          :data="entries"
          :editing="editingID"
          :loading="isEntriesLoading || isSettingsLoading"
          :locale="locale"
          :search="search"
          @update="invalidateEntriesQuery"
          @edit="onEditHandler"
        />
      </div>
    </div>

    <br />

    <ProTip target="new-entry" />
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUpdated, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

import EntryForm from '@/components/new-entry/EntryForm.vue';
import BalanceTable from '@/components/new-entry/BalanceTable.vue';
import BalanceFilterForm from '@/components/new-entry/BalanceFilterForm.vue';
import ProTip from '@/components/shared/ProTip.vue';

import { addEntry, updateEntry } from '@/domain/network';
import { ExtendedEntry } from '@/domain/interfaces';

import useDataFetch from '@/composable/useDataFetch';

const editingID = ref<number | null>(null);
const isSubmitting = ref(false);
const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

const settingsUrl = ref('/settings');
const recordedYearsUrl = ref('/entries/recorded-years');
const entriesUrl = computed(() => `/entries?year=${year.value}&month=${month.value}`);

const toast = useToast();

const { fetchData: getRecordedYears, invalidateQuery: invalidateRecordedYearsQuery } = useDataFetch(recordedYearsUrl);
const { isLoading: isRecordedYearsLoading, data: recordedYearsData } = await getRecordedYears();

const { fetchData: getEntries, invalidateQuery: invalidateEntriesQuery } = useDataFetch(entriesUrl);
const { isLoading: isEntriesLoading, isFetched: isEntriesFeched, data: entriesData } = await getEntries();

const { fetchData: getSettingsData } = useDataFetch(settingsUrl);
const { isLoading: isSettingsLoading, data: settingsData } = await getSettingsData();

const form = reactive<any>({
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

const entries = computed(() => (entriesData.value?.entries ?? []) as ExtendedEntry[]);
const recordedYears = computed(() => (recordedYearsData.value?.years ?? []) as string[]);

const resetForm = (hard = false) => {
  form.id = null;
  form.amount = '';
  form.description = '';

  if (hard) {
    form.group = '';
    form.wallet = '';
    form.date = dayjs().format('YYYY-MM-DD');

    editingID.value = null;
  }
};

const onEditHandler = (entry: ExtendedEntry) => {
  editingID.value = entry.id ?? null;

  form.id = entry.id;
  form.amount = entry.amount;
  form.description = entry.description;
  form.group = entry.group;
  form.wallet = entry.wallet;
  form.date = entry.date;
};

const onSubmitHandler = async () => {
  isSubmitting.value = true;

  try {
    if (form.id) {
      await updateEntry(form.id, form);
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
    invalidateRecordedYearsQuery();
    refreshAllTextNodes();

    isSubmitting.value = false;
  }
};

let searchTarget = null;
let treeWalker = null;

const allTextNodes: any[] = [];

const refreshAllTextNodes = () => {
  if (isEntriesLoading.value) return;

  searchTarget = document.querySelector('.balance-table tbody');
  treeWalker = document.createTreeWalker(searchTarget as Node, NodeFilter.SHOW_TEXT);

  let currentNode = treeWalker.nextNode();

  while (currentNode) {
    allTextNodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }
};

const applySearchHighlight = async () => {
  await nextTick();

  if (!CSS.highlights) return;

  // @ts-ignore
  CSS.highlights.clear();

  const searchText = search.value.trim().toLowerCase();
  if (!searchText) return;

  const mapRanges = (el: any) => {
    return { el, text: el.textContent.toLowerCase() };
  };

  const mapRangesToHighlight = ({ text, el }: { text: string; el: any }) => {
    const indexes = [];
    let startPos = 0;

    while (startPos < text.length) {
      const index = text.replace(/[,.]/g, '').indexOf(searchText, startPos);
      if (index === -1) break;
      indexes.push(index);
      startPos = index + searchText.length;
    }

    return indexes.map((index) => {
      const range = new Range();
      const gut = /[,.]/g.test(text.slice(index, index + searchText.length)) ? 1 : 0;

      range.setStart(el, index);
      range.setEnd(el, index + searchText.length + gut);

      return range;
    });
  };

  const ranges = allTextNodes.map(mapRanges).map(mapRangesToHighlight);

  const searchResultsHighlight = new Highlight(...ranges.flat());

  // @ts-ignore
  CSS.highlights.set('search-results', searchResultsHighlight);
};

onUpdated(() => {
  refreshAllTextNodes();
  applySearchHighlight();
});

watch([year, month], () => {
  search.value = '';
});

watch(search, () => {
  applySearchHighlight();
});
</script>

<style lang="scss" scoped>
::highlight(search-results) {
  background-color: #f06;
  color: white;
}

.col-4--sticky {
  position: sticky;
  top: 85px;
  z-index: 1;
}

.new-entry {
  &__hot-keys {
    text-align: center;
  }

  &__pro-tip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
