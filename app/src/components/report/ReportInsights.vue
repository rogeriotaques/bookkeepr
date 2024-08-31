<template>
  <div class="report__insight">
    <div class="row has-text-centered">
      <div
        v-for="card in cards"
        :key="card.label"
        class="col-4"
      >
        <div class="card">
          <div class="card__math">
            <p class="card__figure card__figure--income">
              <BaseSkeleton
                v-if="props.loading"
                width="60%"
                centered
              />
              <span v-else>+ {{ formatCurrency(card.income) }}</span>
            </p>
            <p class="card__figure card__figure--outcome">
              <BaseSkeleton
                v-if="props.loading"
                width="60%"
                centered
              />
              <span v-else>- {{ formatCurrency(card.outcome) }}</span>
            </p>
          </div>
          <h3 class="title">
            <BaseSkeleton
              v-if="props.loading"
              class="skeleton__title"
              width="75%"
              height="40px"
              centered
            />
            <template v-else>
              {{ formatCurrency(card.income - card.outcome) }}
            </template>
          </h3>
          <p class="subtitle">{{ card.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatCurrency } from '@/domain/utils';
import { ENTRY_OPERATIONS } from '@/domain/constants';

import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Insight {
  income: number;
  outcome: number;
}

interface Props {
  data: Record<string, Insight>;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: {} as any,
  loading: true,
});

const cards = computed(() => [
  {
    label: 'This year',
    income: props.data.thisYear.income,
    outcome: props.data.thisYear.outcome,
  },
  {
    label: 'This month',
    income: props.data.thisMonth.income,
    outcome: props.data.thisMonth.outcome,
  },
  {
    label: 'Today',
    income: props.data.today.income,
    outcome: props.data.today.outcome,
  },
]);
</script>

<style lang="scss" scoped>
.card {
  .title {
    margin: 0 0 16px;
  }

  &__math {
    padding-top: 16px;
    margin: 0 0 4px;
  }

  &__figure {
    text-align: center;
    margin: 0 0 4px;
  }
}

.skeleton__title {
  margin: 12px auto 24px;
}
</style>
