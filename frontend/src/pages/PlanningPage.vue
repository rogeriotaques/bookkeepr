<template>
  <div class="planning-page">
    <header class="planning-page__header">
      <h1>Planning</h1>
      <div class="planning-page__month">
        <span>Planning for</span>
        <select v-model="selectedMonth" class="planning-page__month-select">
          <option v-for="m in 12" :key="m" :value="m">
            {{ monthName(m) }}
          </option>
        </select>
      </div>
    </header>

    <div v-if="isLoading" class="planning-page__loading">
      <BaseSkeleton />
    </div>

    <template v-else>
      <!-- Goal -->
      <section class="planning-page__section">
        <label class="planning-page__label">Goal for this month</label>
        <textarea
          v-model="goal"
          class="planning-page__textarea"
          rows="3"
          placeholder="What do you want to achieve this month?"
        />
      </section>

      <!-- Income -->
      <section class="planning-page__section">
        <div class="planning-page__row">
          <label class="planning-page__label">Expected Total Income</label>
          <button
            data-testid="add-income"
            class="planning-page__add-btn"
            @click="showIncomeCalc = true"
          >
            +
          </button>
        </div>
        <div class="planning-page__total">{{ formatCurrency(incomeTotal) }}</div>
      </section>

      <!-- Expenses -->
      <section class="planning-page__section">
        <div class="planning-page__row">
          <label class="planning-page__label">Expected Total Expenses</label>
          <button
            data-testid="add-expense"
            class="planning-page__add-btn"
            @click="showExpenseCalc = true"
          >
            +
          </button>
        </div>
        <div class="planning-page__total">{{ formatCurrency(expenseTotal) }}</div>
      </section>

      <!-- Actions -->
      <div class="planning-page__actions">
        <button
          data-testid="cancel-btn"
          class="planning-page__btn planning-page__btn--secondary"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          data-testid="done-btn"
          class="planning-page__btn planning-page__btn--primary"
          :disabled="isSaving"
          @click="onSave"
        >
          {{ isSaving ? 'Saving...' : 'Done' }}
        </button>
      </div>
    </template>

    <!-- Income Calculator Modal -->
    <IncomeCalculator
      v-if="showIncomeCalc"
      :items="incomeItems"
      @close="showIncomeCalc = false"
      @update="onIncomeUpdate"
    />

    <!-- Expenses Calculator Modal -->
    <ExpensesCalculator
      v-if="showExpenseCalc"
      :items="expenseItems"
      @close="showExpenseCalc = false"
      @update="onExpenseUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import IncomeCalculator from '@/components/planning/IncomeCalculator.vue';
import ExpensesCalculator from '@/components/planning/ExpensesCalculator.vue';
import { useBudget, useSaveBudget } from '@/composable/useBudget';
import { BudgetItem } from '@/domain/interfaces.budget';

const router = useRouter();
const now = dayjs();

const selectedMonth = ref(now.month() + 1);
const selectedYear = now.year();

const { budget, items, isLoading } = useBudget(selectedYear, selectedMonth.value);
const { saveBudget, isSaving } = useSaveBudget();

// Local state
const goal = ref('');
const incomeItems = ref<BudgetItem[]>([]);
const expenseItems = ref<BudgetItem[]>([]);
const showIncomeCalc = ref(false);
const showExpenseCalc = ref(false);

// Sync with fetched budget
watch(
  () => budget.value,
  (b) => {
    if (b) {
      goal.value = b.goal;
    }
  },
  { immediate: true }
);

watch(
  () => items.value,
  (list) => {
    incomeItems.value = list.filter((i) => i.type === 'income');
    expenseItems.value = list.filter((i) => i.type === 'expense');
  },
  { immediate: true }
);

const incomeTotal = computed(() =>
  incomeItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
);

const expenseTotal = computed(() =>
  expenseItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
);

function monthName(m: number): string {
  return dayjs().month(m - 1).format('MMMM');
}

function formatCurrency(value: number): string {
  return '¥ ' + (value || 0).toLocaleString();
}

function onIncomeUpdate(items: BudgetItem[]) {
  incomeItems.value = items;
  showIncomeCalc.value = false;
}

function onExpenseUpdate(items: BudgetItem[]) {
  expenseItems.value = items;
  showExpenseCalc.value = false;
}

function onCancel() {
  router.push('/');
}

function onSave() {
  const payload = {
    id: budget.value?.id,
    year: selectedYear,
    month: selectedMonth.value,
    goal: goal.value,
    items: [...incomeItems.value, ...expenseItems.value],
  };
  saveBudget(payload, {
    onSuccess: () => router.push('/'),
  });
}
</script>

<style lang="scss" scoped>
.planning-page {
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

  &__month {
    display: flex;
    align-items: center;
    gap: var(--bk-space-sm);
    font-size: var(--bk-text-base);
    color: var(--bk-text-secondary);

    &-select {
      padding: var(--bk-space-xs) var(--bk-space-sm);
      border: 1px solid var(--bk-border);
      border-radius: var(--bk-radius-md);
      background: var(--bk-surface);
      font-size: var(--bk-text-base);
      color: var(--bk-text-primary);
    }
  }

  &__section {
    margin-bottom: var(--bk-space-lg);
    padding: var(--bk-space-md);
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
  }

  &__label {
    display: block;
    font-size: var(--bk-text-sm);
    color: var(--bk-text-secondary);
    margin-bottom: var(--bk-space-sm);
  }

  &__textarea {
    width: 100%;
    padding: var(--bk-space-sm);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-md);
    font-size: var(--bk-text-base);
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--bk-primary);
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__add-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--bk-radius-full);
    border: 1px solid var(--bk-primary);
    background: var(--bk-surface);
    color: var(--bk-primary);
    font-size: var(--bk-text-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    min-width: var(--bk-touch-min);
    min-height: var(--bk-touch-min);

    &:hover {
      background: var(--bk-primary);
      color: white;
    }
  }

  &__total {
    font-size: var(--bk-text-xl);
    font-weight: 600;
    color: var(--bk-text-primary);
    margin-top: var(--bk-space-sm);
  }

  &__actions {
    display: flex;
    gap: var(--bk-space-md);
    margin-top: var(--bk-space-xl);
  }

  &__btn {
    flex: 1;
    padding: var(--bk-space-md);
    border-radius: var(--bk-radius-md);
    font-size: var(--bk-text-base);
    font-weight: 500;
    cursor: pointer;
    min-height: var(--bk-touch-min);
    border: none;

    &--primary {
      background: var(--bk-primary);
      color: white;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--secondary {
      background: var(--bk-surface);
      color: var(--bk-text-primary);
      border: 1px solid var(--bk-border);
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: var(--bk-space-xl);
  }
}
</style>
