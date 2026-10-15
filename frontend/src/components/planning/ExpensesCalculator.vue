<template>
  <BaseModal
    v-model="isOpen"
    title="Expenses Calculator"
    confirm-text="Done"
    @confirm="onDone"
    @cancel="onClose"
  >
    <div class="expense-calc">
      <div class="box expense-calc__total">Total: {{ formatCurrency(total) }}</div>

      <div class="expense-calc__rows">
        <div
          v-for="(item, index) in localItems"
          :key="index"
          class="expense-calc__row"
        >
          <div class="input expense-calc__type">
            <select ref="firstFields" v-model="item.expense_type">
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </div>
          <div class="input expense-calc__group">
            <select v-model.number="item.group_code">
              <option :value="null">Select category</option>
              <option
                v-for="group in outcomeGroups"
                :key="group.code"
                :value="group.code"
              >
                {{ group.name }}
              </option>
            </select>
          </div>
          <div class="input input--with-addons expense-calc__amount">
            <span class="input__addon">¥</span>
            <input
              v-model="item.amount"
              v-money="V_MONEY_OPTIONS"
              type="text"
              inputmode="numeric"
              placeholder="Amount"
            />
          </div>
          <button
            tabindex="-1"
            class="button--auto-width expense-calc__delete"
            aria-label="Remove"
            @click="removeRow(index)"
          >
            ×
          </button>
        </div>
      </div>

      <button class="is-full-width expense-calc__add" @click="addRow">
        + Add
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import { BudgetItem } from '@/domain/interfaces.budget';
import { Group } from '@/domain/interfaces';
import { fetchGroups } from '@/domain/network';
import { V_MONEY_OPTIONS } from '@/domain/constants';
import { parseAmount, formatAmount } from '@/domain/utils';

type EditableItem = Omit<BudgetItem, 'amount'> & { amount: number | string };

const props = defineProps<{
  items: BudgetItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', items: BudgetItem[]): void;
}>();

const isOpen = ref(true);
const firstFields = ref<HTMLSelectElement[]>([]);
const outcomeGroups = ref<Group[]>([]);

onMounted(async () => {
  const res: any = await fetchGroups();
  outcomeGroups.value = (res.groups || []).filter((g: Group) => g.operation === 'outcome');
});

const localItems = ref<EditableItem[]>(
  props.items.length > 0
    ? props.items.map((i) => ({ ...i, amount: formatAmount(i.amount) }))
    : [{ type: 'expense', label: '', amount: '', group_code: null, expense_type: 'fixed', sort_order: 0 }]
);

const total = computed(() =>
  localItems.value.reduce((sum, item) => sum + parseAmount(item.amount), 0)
);

async function addRow() {
  localItems.value.push({
    type: 'expense',
    label: '',
    amount: '',
    group_code: null,
    expense_type: 'variable',
    sort_order: localItems.value.length,
  });
  await nextTick();
  firstFields.value[localItems.value.length - 1]?.focus();
}

function removeRow(index: number) {
  localItems.value.splice(index, 1);
  if (localItems.value.length === 0) {
    addRow();
  }
}

function onClose() {
  isOpen.value = false;
  emit('close');
}

function onDone() {
  // Set label from selected group name if empty
  const enriched = localItems.value.map((item) => {
    const group = outcomeGroups.value.find((g) => g.code === item.group_code);
    return {
      ...item,
      amount: parseAmount(item.amount),
      label: item.label || group?.name || 'Expense',
    };
  });
  const valid = enriched.filter((item) => item.group_code != null && item.amount > 0);
  isOpen.value = false;
  emit('update', valid as BudgetItem[]);
}

function formatCurrency(value: number): string {
  return '¥ ' + (value || 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.expense-calc {
  &__total {
    font-size: var(--bk-text-lg);
    font-weight: 600;
    text-align: center;
    margin-bottom: var(--bk-space-lg);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-sm);
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: var(--bk-space-sm);
  }

  &__type,
  &__group,
  &__amount {
    flex: 1;
  }

  &__delete {
    flex: 0 0 auto;
    color: var(--c-danger);
    background-color: var(--c-danger-background);
    border-color: var(--c-danger);
    box-shadow: var(--s-box-shadow) var(--c-danger);
  }

  &__add {
    margin-top: var(--bk-space-lg);
  }

  .input {
    margin-bottom: 0;
  }
}
</style>
