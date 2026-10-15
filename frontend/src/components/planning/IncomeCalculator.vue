<template>
  <BaseModal
    v-model="isOpen"
    title="Income Calculator"
    confirm-text="Done"
    @confirm="onDone"
    @cancel="onClose"
  >
    <div class="income-calc">
      <div class="box income-calc__total">Total: {{ formatCurrency(total) }}</div>

      <div class="income-calc__rows">
        <div
          v-for="(item, index) in localItems"
          :key="index"
          class="income-calc__row"
        >
          <div class="input income-calc__label">
            <input
              ref="firstFields"
              v-model="item.label"
              placeholder="Label"
            />
          </div>
          <div class="input input--with-addons income-calc__amount">
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
            class="button--auto-width income-calc__delete"
            aria-label="Remove"
            @click="removeRow(index)"
          >
            ×
          </button>
        </div>
      </div>

      <button class="is-full-width income-calc__add" @click="addRow">
        + Add
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import { BudgetItem } from '@/domain/interfaces.budget';
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
const firstFields = ref<HTMLInputElement[]>([]);

const localItems = ref<EditableItem[]>(
  props.items.length > 0
    ? props.items.map((i) => ({ ...i, amount: formatAmount(i.amount) }))
    : [{ type: 'income', label: '', amount: '', group_code: null, expense_type: null, sort_order: 0 }]
);

const total = computed(() =>
  localItems.value.reduce((sum, item) => sum + parseAmount(item.amount), 0)
);

async function addRow() {
  localItems.value.push({
    type: 'income',
    label: '',
    amount: '',
    group_code: null,
    expense_type: null,
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
  // Filter out empty rows
  const valid = localItems.value
    .map((item) => ({ ...item, label: item.label.trim(), amount: parseAmount(item.amount) }))
    .filter((item) => item.label !== '' && item.amount > 0);
  isOpen.value = false;
  emit('update', valid as BudgetItem[]);
}

function formatCurrency(value: number): string {
  return '¥ ' + (value || 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.income-calc {
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

  &__label,
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
