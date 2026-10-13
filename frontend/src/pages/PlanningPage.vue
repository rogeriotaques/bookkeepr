<template>
  <div class="planning-page">
    <header class="planning-page__header">
      <h1>Planning</h1>
      <div class="input planning-page__month-input">
        <select v-model="selectedMonth">
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
        <label class="label">Goal for this month</label>
        <div class="input">
          <textarea
            v-model="goal"
            rows="3"
            placeholder="What do you want to achieve this month?"
          />
        </div>
      </section>

      <!-- Income -->
      <section class="box planning-page__section">
        <div class="planning-page__row">
          <label class="label">Expected Total Income</label>
          <button
            data-testid="add-income"
            class="is-auto-width"
            @click="showIncomeCalc = true"
          >
            +
          </button>
        </div>
        <div class="planning-page__total">{{ formatCurrency(incomeTotal) }}</div>
      </section>

      <!-- Expenses -->
      <section class="box planning-page__section">
        <div class="planning-page__row">
          <label class="label">Expected Total Expenses</label>
          <button
            data-testid="add-expense"
            class="is-auto-width"
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
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          data-testid="done-btn"
          type="submit"
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-lg);

    h1 {
      font-size: var(--bk-text-2xl);
      margin: 0;
    }
  }

  &__month-input {
    display: inline-block;
    width: auto;
    margin: 0;
  }

  &__section {
    margin-bottom: var(--bk-space-lg);
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--bk-space-sm);
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

    button {
      flex: 1;
      margin: 0;
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: var(--bk-space-xl);
  }
}
</style>
