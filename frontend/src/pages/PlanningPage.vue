<template>
  <div class="planning-page">
    <header class="planning-page__header">
      <h1>Planning</h1>
      <div class="planning-page__period">
        <div class="input planning-page__period-field">
          <select v-model="selectedMonth" data-testid="month-select" aria-label="Month">
            <option v-for="m in 12" :key="m" :value="m">
              {{ monthName(m) }}
            </option>
          </select>
        </div>
        <div class="input planning-page__period-field planning-page__period-field--year">
          <select v-model="selectedYear" data-testid="year-select" aria-label="Year">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="planning-page__loading">
      <BaseSkeleton />
    </div>

    <div v-else class="planning-page__grid">
      <!-- Goal -->
      <section class="planning-page__section planning-page__goal">
        <label class="label">Goal for this month</label>
        <div class="input">
          <textarea
            v-model="goal"
            rows="3"
            placeholder="What do you want to achieve this month?"
            @blur="flushGoalSave"
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
    </div>

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
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import { useToast } from 'vue-toastification';
import BaseSkeleton from '@/components/shared/BaseSkeleton.vue';
import IncomeCalculator from '@/components/planning/IncomeCalculator.vue';
import ExpensesCalculator from '@/components/planning/ExpensesCalculator.vue';
import { useBudget, useSaveBudget } from '@/composable/useBudget';
import { BudgetItem } from '@/domain/interfaces.budget';

const now = dayjs();
const toast = useToast();

const selectedMonth = ref(now.month() + 1);
const selectedYear = ref(now.year());

// Planning is open-ended: past years to review and the next one to prepare.
const years = Array.from({ length: 7 }, (_, i) => now.year() - 5 + i);

const { budget, queryData, isLoading } = useBudget(selectedYear, selectedMonth);
const { saveBudget } = useSaveBudget();

// Local state
const goal = ref('');
const budgetId = ref<number | null>(null);
const incomeItems = ref<BudgetItem[]>([]);
const expenseItems = ref<BudgetItem[]>([]);
const showIncomeCalc = ref(false);
const showExpenseCalc = ref(false);

// Sync local state when data for the selected month arrives. While there are
// unsaved local edits, skip re-syncing the same month so background refetches
// (e.g. window focus) never clobber in-progress edits.
let loadedKey = '';
let dirty = false;
watch(
  queryData,
  (d) => {
    if (!d || d.year !== selectedYear.value || d.month !== selectedMonth.value) return;
    const key = `${d.year}-${d.month}`;
    if (key === loadedKey && dirty) return;
    loadedKey = key;
    budgetId.value = d.budget?.id ?? null;
    goal.value = d.budget?.goal ?? '';
    incomeItems.value = d.items.filter((i) => i.type === 'income');
    expenseItems.value = d.items.filter((i) => i.type === 'expense');
    dirty = false;
  },
  { immediate: true }
);

// Auto-save: debounce the goal, save calculator changes immediately.
const DEBOUNCE_MS = 600;
let goalTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
let queued: SaveSnapshot | null = null;

interface SaveSnapshot {
  year: number;
  month: number;
  goal: string;
  items: BudgetItem[];
}

watch(goal, (value) => {
  if (value === (budget.value?.goal ?? '')) return;
  dirty = true;
  scheduleGoalSave();
});

function snapshot(year: number, month: number): SaveSnapshot {
  return { year, month, goal: goal.value, items: [...incomeItems.value, ...expenseItems.value] };
}

function scheduleGoalSave() {
  if (goalTimer) clearTimeout(goalTimer);
  goalTimer = setTimeout(() => {
    goalTimer = null;
    saveNow();
  }, DEBOUNCE_MS);
}

function flushGoalSave() {
  if (!goalTimer) return;
  clearTimeout(goalTimer);
  goalTimer = null;
  saveNow();
}

function saveNow(yearOverride?: number, monthOverride?: number) {
  const snap = snapshot(
    yearOverride ?? selectedYear.value,
    monthOverride ?? selectedMonth.value
  );
  if (inFlight) {
    queued = snap;
    return;
  }
  inFlight = runSave(snap);
}

async function runSave(snap: SaveSnapshot) {
  try {
    await doSave(snap);
  } finally {
    inFlight = null;
    if (queued) {
      const next = queued;
      queued = null;
      inFlight = runSave(next);
    }
  }
}

async function doSave(snap: SaveSnapshot) {
  try {
    const res: any = await saveBudget({
      id: budgetId.value ?? undefined,
      year: snap.year,
      month: snap.month,
      goal: snap.goal,
      items: snap.items,
    });
    if (!budgetId.value && res?.budget?.id) budgetId.value = res.budget.id;
    if (isCurrent(snap)) dirty = false;
  } catch (error: any) {
    toast.error(`Error saving plan: ${error?.message ?? error}`);
  }
}

function isCurrent(snap: SaveSnapshot): boolean {
  if (snap.year !== selectedYear.value) return false;
  if (snap.month !== selectedMonth.value) return false;
  if (snap.goal !== goal.value) return false;
  const current = [...incomeItems.value, ...expenseItems.value];
  return JSON.stringify(snap.items) === JSON.stringify(current);
}

// Flush a pending goal edit for the month we are leaving.
watch([selectedYear, selectedMonth], (_value, previous) => {
  const [previousYear, previousMonth] = previous;
  if (goalTimer) {
    clearTimeout(goalTimer);
    goalTimer = null;
    saveNow(previousYear, previousMonth);
  }
});

onBeforeUnmount(() => {
  if (!goalTimer) return;
  clearTimeout(goalTimer);
  goalTimer = null;
  saveNow();
});

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

function onIncomeUpdate(newItems: BudgetItem[]) {
  incomeItems.value = newItems;
  showIncomeCalc.value = false;
  dirty = true;
  saveNow();
}

function onExpenseUpdate(newItems: BudgetItem[]) {
  expenseItems.value = newItems;
  showExpenseCalc.value = false;
  dirty = true;
  saveNow();
}
</script>

<style lang="scss" scoped>
.planning-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width-wide);
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

  &__period {
    display: flex;
    align-items: center;
    gap: var(--bk-space-sm);
  }

  &__period-field {
    display: inline-block;
    width: auto;
    margin: 0;

    // A four-digit year is short, so the shrink-to-fit width lands under the
    // select's own padding and clips the last digit. Reserve room for it.
    &--year {
      min-width: 120px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--bk-space-lg);
  }

  &__goal {
    grid-column: 1 / -1;
  }

  &__section {
    min-width: 0;
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

  &__loading {
    display: flex;
    justify-content: center;
    padding: var(--bk-space-xl);
  }
}

// Tablet and up: goal full width, then the two totals side by side.
@media (min-width: 768px) {
  .planning-page {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }
  }
}

// Desktop: larger title.
@media (min-width: 1024px) {
  .planning-page {
    &__header h1 {
      font-size: var(--bk-text-3xl);
    }
  }
}
</style>
