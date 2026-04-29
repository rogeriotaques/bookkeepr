<template>
  <BaseModal title="Expenses Calculator" @close="onClose">
    <div class="expense-calc">
      <div class="expense-calc__total">
        Total: {{ formatCurrency(total) }}
      </div>

      <div class="expense-calc__rows">
        <div
          v-for="(item, index) in localItems"
          :key="index"
          class="expense-calc__row"
        >
          <select v-model="item.expense_type" class="expense-calc__select">
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
          </select>

          <select v-model.number="item.group_code" class="expense-calc__select">
            <option :value="null">Select category</option>
            <option
              v-for="group in outcomeGroups"
              :key="group.code"
              :value="group.code"
            >
              {{ group.name }}
            </option>
          </select>

          <input
            v-model.number="item.amount"
            type="number"
            class="expense-calc__input"
            placeholder="Amount"
          />

          <button
            class="expense-calc__delete"
            @click="removeRow(index)"
          >
            ×
          </button>
        </div>
      </div>

      <button class="expense-calc__add" @click="addRow">
        + Add
      </button>

      <div class="expense-calc__actions">
        <button class="expense-calc__btn expense-calc__btn--secondary" @click="onClose">
          Cancel
        </button>
        <button class="expense-calc__btn expense-calc__btn--primary" @click="onDone">
          Done
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseModal from '@/components/shared/BaseModal.vue';
import { BudgetItem } from '@/domain/interfaces.budget';
import { Group } from '@/domain/interfaces';
import { http } from '@/domain/network';

const props = defineProps<{
  items: BudgetItem[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update', items: BudgetItem[]): void;
}>();

const outcomeGroups = ref<Group[]>([]);

onMounted(async () => {
  const res = await http.get('/groups?active=1');
  outcomeGroups.value = (res.data.groups || []).filter((g: Group) => g.operation === 'outcome');
});

const localItems = ref<BudgetItem[]>(
  props.items.length > 0
    ? props.items.map((i) => ({ ...i }))
    : [{ type: 'expense', label: '', amount: 0, group_code: null, expense_type: 'fixed', sort_order: 0 }]
);

const total = computed(() =>
  localItems.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
);

function addRow() {
  localItems.value.push({
    type: 'expense',
    label: '',
    amount: 0,
    group_code: null,
    expense_type: 'variable',
    sort_order: localItems.value.length,
  });
}

function removeRow(index: number) {
  localItems.value.splice(index, 1);
  if (localItems.value.length === 0) {
    addRow();
  }
}

function onClose() {
  emit('close');
}

function onDone() {
  // Set label from selected group name if empty
  const enriched = localItems.value.map((item) => {
    const group = outcomeGroups.value.find((g) => g.code === item.group_code);
    return {
      ...item,
      label: item.label || group?.name || 'Expense',
    };
  });
  const valid = enriched.filter((item) => item.group_code != null && item.amount > 0);
  emit('update', valid);
}

function formatCurrency(value: number): string {
  return '¥ ' + (value || 0).toLocaleString();
}
</script>

<style lang="scss" scoped>
.expense-calc {
  padding: var(--bk-space-md);

  &__total {
    font-size: var(--bk-text-lg);
    font-weight: 600;
    text-align: center;
    padding: var(--bk-space-md);
    background: var(--bk-background);
    border-radius: var(--bk-radius-md);
    margin-bottom: var(--bk-space-lg);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-md);
    max-height: 300px;
    overflow-y: auto;
  }

  &__row {
    display: flex;
    gap: var(--bk-space-sm);
    align-items: center;
  }

  &__select,
  &__input {
    flex: 1;
    padding: var(--bk-space-sm);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-md);
    font-size: var(--bk-text-base);
    min-height: var(--bk-touch-min);
    background: var(--bk-surface);

    &:focus {
      outline: none;
      border-color: var(--bk-primary);
    }
  }

  &__delete {
    width: 36px;
    height: 36px;
    border-radius: var(--bk-radius-md);
    border: none;
    background: transparent;
    color: var(--bk-danger);
    font-size: var(--bk-text-xl);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: var(--bk-touch-min);
    min-height: var(--bk-touch-min);
  }

  &__add {
    width: 100%;
    padding: var(--bk-space-sm);
    border: 1px dashed var(--bk-border);
    border-radius: var(--bk-radius-md);
    background: var(--bk-surface);
    color: var(--bk-primary);
    font-size: var(--bk-text-base);
    cursor: pointer;
    margin-bottom: var(--bk-space-lg);
    min-height: var(--bk-touch-min);
  }

  &__actions {
    display: flex;
    gap: var(--bk-space-md);
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
    }

    &--secondary {
      background: var(--bk-surface);
      color: var(--bk-text-primary);
      border: 1px solid var(--bk-border);
    }
  }
}
</style>
