<template>
  <div class="entry-form">
    <div class="box">
      <div class="row">
        <div class="col-12">
          <label for="date">Date</label>
          <DateInput
            v-model="data.date"
            ref="dateRef"
            @keypress.capture.enter="onHitEnterHandler"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <label for="input">Amount</label>
          <div class="input input--with-addons">
            <label
              class="input__addon input__addon--icon"
              for="input"
            >
              <span>{{ getCurrencySymbol(currencyCode) }}</span>
            </label>
            <input
              v-model="data.amount"
              v-money="V_MONEY_OPTIONS"
              ref="amountRef"
              id="input"
              type="text"
              placeholder="E.g. 1,234"
              maxlength="11"
              @keypress.capture.enter="onHitEnterHandler"
            />
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <label for="input">Description</label>
          <div class="input">
            <input
              v-model="data.description"
              type="text"
              placeholder="E.g. Lunch with a friend"
              @keypress.capture.enter="onHitEnterHandler"
            />
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <label for="input">Category</label>
          <BaseDropdown
            v-model="data.group"
            :disabled="isGroupsLoading"
            :options="categoryOptions"
            open-on-focus
            full-width
            searchable
          />
        </div>
        <div class="col-6">
          <label for="input">Wallet</label>
          <BaseDropdown
            v-model="data.wallet"
            :disabled="isWalletsLoading"
            :options="walletOptions"
            open-on-focus
            full-width
            searchable
          />
        </div>
      </div>
    </div>

    <div class="entry-form__actions">
      <button
        v-if="props.isEditing"
        :disabled="props.isSubmitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>

      <button
        :disabled="isSaveButtonDisabled"
        type="submit"
        class="is-full-width"
        @click="onSaveClickHandler"
      >
        <IconLoader2
          v-if="props.isSubmitting"
          width="16"
          height="16"
          class="is-spinning"
        />
        <template v-else>Save</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch, onMounted, nextTick } from 'vue';
import { IconLoader2 } from '@tabler/icons-vue';

import { Entry, Wallet, Group, CurrencyLocale } from '@/domain/interfaces';
import { V_MONEY_OPTIONS } from '@/domain/constants';
import { getCurrencySymbol } from '@/domain/utils';

import useDataFetch from '@/composable/useDataFetch';
import { useHotkeys } from '@/composable/useHotkeys';
import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import DateInput from '@/components/shared/DateInput.vue';

interface Props {
  data: Entry;
  isSubmitting: boolean;
  isEditing: boolean;
  locale: CurrencyLocale;
}

const props = withDefaults(defineProps<Props>(), {
  locale: {} as any,
});

interface Emits {
  (event: 'submit'): void;
  (event: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const amountRef: Ref<HTMLInputElement | null> = ref(null);
const dateRef = ref<{ focus: () => void } | null>(null);
const activeGroupsUrl = ref('/groups?active=1');
const activeWalletsUrl = ref('/wallets?active=1');

const { fetchData: getActiveGroups } = useDataFetch(activeGroupsUrl);
const { isLoading: isGroupsLoading, data: groupsData } = await getActiveGroups();

const { fetchData: getActiveWallets } = useDataFetch(activeWalletsUrl);
const { isLoading: isWalletsLoading, data: walletsData } = await getActiveWallets();

const wallets: any = computed(() => walletsData.value?.wallets ?? []);
const groups: any = computed(() => groupsData.value?.groups ?? []);
const currencyCode = computed(() => props.locale?.currencyCode ?? 'JPY');

interface DropdownOption {
  value: string;
  label: string;
}

const categoryOptions = computed(() =>
  groups.value
    .map((group: Group) => ({
      value: group.code,
      label: group.name,
    }))
    .sort((a: DropdownOption, b: DropdownOption) => a.label.localeCompare(b.label))
);

const walletOptions = computed(() =>
  wallets.value
    .map((wallet: Wallet) => ({
      value: wallet.id,
      label: wallet.name,
    }))
    .sort((a: DropdownOption, b: DropdownOption) => a.label.localeCompare(b.label))
);

const isFormValid = computed(
  () =>
    `${props.data.amount}`.length > 0 &&
    props.data.description.length > 0 &&
    `${props.data.group}`.length > 0 &&
    `${props.data.wallet}`.length > 0 &&
    props.data.date.length > 0
);

const isSaveButtonEnabled = computed(() => isFormValid.value && !props.isSubmitting);
const isSaveButtonDisabled = computed(() => !isSaveButtonEnabled.value);

const onHitEnterHandler = () => {
  if (isSaveButtonEnabled.value) {
    onSaveClickHandler();
  }
};

watch(
  () => props.isSubmitting,
  async (submitting) => {
    if (!submitting) {
      await nextTick();
      dateRef?.value?.focus();
    }
  }
);

watch(
  () => props.isEditing,
  async (editing) => {
    if (editing) {
      await nextTick();
      dateRef?.value?.focus();
    }
  }
);

onMounted(async () => {
  await nextTick();
  dateRef?.value?.focus();
});

const focusAmount = () => {
  amountRef.value?.focus();
};

const saveIfReady = () => {
  if (isSaveButtonEnabled.value) onSaveClickHandler();
};

useHotkeys({
  n: focusAmount,
  'mod+i': focusAmount,
  'mod+s': saveIfReady,
});

const onSaveClickHandler = () => {
  emit('submit');
};
</script>

<style lang="scss" scoped>
.entry-form {
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: var(--bk-space-xl);
  }
}
</style>
