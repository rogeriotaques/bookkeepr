<template>
  <section class="recent-transactions box">
    <header class="recent-transactions__header">
      <h2>{{ title }}</h2>
    </header>

    <div
      v-if="isLoading"
      data-testid="recent-loading"
      class="recent-transactions__loading"
    >
      <BaseSkeleton v-for="n in 3" :key="n" />
    </div>

    <p
      v-else-if="!list.length"
      class="recent-transactions__empty"
    >
      No transactions this month.
    </p>

    <ul
      v-else
      class="recent-transactions__list"
    >
      <li
        v-for="entry in list"
        :key="entry.id"
        data-testid="recent-entry"
        class="recent-transactions__item"
      >
        <span class="recent-transactions__date">
          {{ dayjs(entry.date).format('MMM D') }}
        </span>
        <span class="recent-transactions__description">{{ entry.description }}</span>
        <span
          class="recent-transactions__amount"
          :class="{ 'recent-transactions__amount--income': isIncome(entry) }"
        >
          {{ isIncome(entry) ? '+' : '-' }} {{ formatCurrency(entry.amount) }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';

import { ExtendedEntry } from '@/domain/interfaces';
import { ENTRY_OPERATIONS } from '@/domain/constants';
import { formatCurrency } from '@/domain/utils';

import useDataFetch from '@/composable/useDataFetch';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Props {
  limit?: number;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 5,
  title: 'Recent transactions',
});

const now = dayjs();
const entriesUrl = ref(`/entries?year=${now.year()}&month=${String(now.month() + 1).padStart(2, '0')}`);

const { fetchData } = useDataFetch(entriesUrl);
const { isLoading, data: entriesData } = await fetchData();

const entries = computed(() => (entriesData.value?.entries ?? []) as ExtendedEntry[]);

// Newest first, capped at `limit`.
const list = computed(() => [...entries.value].reverse().slice(0, props.limit));

const isIncome = (entry: ExtendedEntry) => entry.operation === ENTRY_OPERATIONS.INCOME;
</script>

<style lang="scss" scoped>
.recent-transactions {
  &__header {
    h2 {
      font-size: var(--bk-text-lg);
      color: var(--bk-text-primary);
      margin: 0 0 var(--bk-space-md);
    }
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: flex;
    align-items: baseline;
    gap: var(--bk-space-sm);
    padding: var(--bk-space-sm) 0;
    border-bottom: 1px solid var(--bk-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__date {
    flex: 0 0 auto;
    width: 48px;
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-xs);
  }

  &__description {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--bk-text-primary);
    font-size: var(--bk-text-sm);
  }

  &__amount {
    flex: 0 0 auto;
    color: var(--bk-danger);
    font-size: var(--bk-text-sm);
    font-weight: 600;

    &--income {
      color: var(--bk-primary);
    }
  }

  &__empty {
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-sm);
    text-align: center;
    margin: 0;
    padding: var(--bk-space-xl) 0;
  }
}
</style>
