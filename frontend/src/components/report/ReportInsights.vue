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
              <span v-else>+ {{ getFormattedCurrency(card.income) }}</span>
            </p>
            <p class="card__figure card__figure--outcome">
              <BaseSkeleton
                v-if="props.loading"
                width="60%"
                centered
              />
              <span v-else>- {{ getFormattedCurrency(card.outcome) }}</span>
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
              {{ formatCurrency(card.income - card.outcome, { style: 'decimal' }) }}
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
import { CurrencyLocale } from '@/domain/interfaces';

import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';

interface Insight {
  income: number;
  outcome: number;
}

interface Props {
  data: Record<string, Insight>;
  loading: boolean;
  locale: CurrencyLocale;
}

const props = withDefaults(defineProps<Props>(), {
  data: {} as any,
  loading: true,
  locale: {} as CurrencyLocale
});

const cards = computed(() => [
  {
    label: 'This year',
    income: props.data?.thisYear?.income ?? 0,
    outcome: props.data?.thisYear?.outcome ?? 0,
  },
  {
    label: 'This month',
    income: props.data?.thisMonth?.income ?? 0,
    outcome: props.data?.thisMonth?.outcome ?? 0,
  },
  {
    label: 'Today',
    income: props.data?.today?.income ?? 0,
    outcome: props.data?.today?.outcome ?? 0,
  },
]);

const getFormattedCurrency = (value: number) => formatCurrency(value, { currency: props.locale.currencyCode, locale: props.locale.currencyLocale });
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
