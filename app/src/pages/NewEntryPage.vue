<template>
  <section class="new-entry">
    <div class="row">
      <div class="col-4">
        <EntryForm
          :data="form"
          :is-submitting="isSubmitting"
          :is-editing="!!editingID"
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
        />
        <BalanceTable
          :data="entries"
          :editing="editingID"
          :loading="isEntriesLoading"
          @update="invalidateEntriesQuery"
          @edit="onEditHandler"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUpdated, nextTick } from 'vue';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

import EntryForm from '@/components/new-entry/EntryForm.vue';
import BalanceTable from '@/components/new-entry/BalanceTable.vue';
import BalanceFilterForm from '@/components/new-entry/BalanceFilterForm.vue';

import { addEntry, updateEntry } from '@/domain/network';
import { ExtendedEntry } from '@/domain/interfaces';

import useDataFetch from '@/composable/useDataFetch';

const editingID = ref<number | null>(null);
const isSubmitting = ref(false);
const year = ref(`${dayjs().year()}`);
const month = ref(`00${dayjs().month() + 1}`.slice(-2));
const search = ref('');

const recordedYearsUrl = ref('/entries/recorded-years');
const entriesUrl = computed(() => `/entries?year=${year.value}&month=${month.value}`);

const toast = useToast();

const { fetchData: getRecordedYears } = useDataFetch(recordedYearsUrl);
const { data: recordedYearsData } = await getRecordedYears();

const { fetchData: getEntries, invalidateQuery: invalidateEntriesQuery } = useDataFetch(entriesUrl);
const { isLoading: isEntriesLoading, data: entriesData } = await getEntries();

const form = reactive<any>({
  id: null,
  amount: '',
  description: '',
  group: '',
  wallet: '',
  date: '',
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
    form.date = '';

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
    isSubmitting.value = false;
  }
};

let isSearchTargetReady = false;
let searchTarget = null;
let treeWalker = null;
const allTextNodes: any[] = [];

onUpdated(() => {
  if (isEntriesLoading.value || isSearchTargetReady) return;

  searchTarget = document.querySelector('.balance-table tbody');
  treeWalker = document.createTreeWalker(searchTarget as Node, NodeFilter.SHOW_TEXT);

  let currentNode = treeWalker.nextNode();

  while (currentNode) {
    allTextNodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  isSearchTargetReady = true;
});

watch(search, async () => {
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
    const indices = [];
    let startPos = 0;

    while (startPos < text.length) {
      const index = text.indexOf(searchText, startPos);
      if (index === -1) break;
      indices.push(index);
      startPos = index + searchText.length;
    }

    return indices.map((index) => {
      const range = new Range();
      range.setStart(el, index);
      range.setEnd(el, index + searchText.length);
      return range;
    });
  };

  const ranges = allTextNodes.map(mapRanges).map(mapRangesToHighlight);
  const searchResultsHighlight = new Highlight(...ranges.flat());

  // @ts-ignore
  CSS.highlights.set('search-results', searchResultsHighlight);
});
</script>

<style lang="scss" scoped>
::highlight(search-results) {
  background-color: #f06;
  color: white;
}
</style>
