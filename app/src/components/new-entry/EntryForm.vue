<template>
  <div class="entry-form">
    <div class="card">
      <div class="card__body">
        <div class="row">
          <div class="col-12">
            <label for="input">Amount</label>
            <div class="input input--with-addons">
              <p class="input__addon input__addon--icon">
                <IconCurrencyYen :size="18" />
              </p>
              <input
                v-model="data.amount"
                v-money="V_MONEY_OPTIONS"
                ref="amountRef"
                type="text"
                placeholder="E.g. 1,234"
                maxlength="11"
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
              full-width
              searchable
            />
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <label for="input">Date</label>
            <div class="input input--with-addons">
              <p class="input__addon input__addon--icon"><IconCalendar :size="18" /></p>
              <input
                v-model="data.date"
                type="date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- .card -->

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
        <template v-else>Save (⌘+S)</template>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { IconCalendar, IconCurrencyYen, IconLoader2 } from '@tabler/icons-vue';

import { Entry, Wallet, Group } from '@/domain/interfaces';
import { V_MONEY_OPTIONS } from '@/domain/constants';
import useDataFetch from '@/composable/useDataFetch';
import BaseDropdown from '@/components/shared/BaseDropdown.vue';

interface Props {
  data: Entry;
  isSubmitting: boolean;
  isEditing: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (event: 'submit'): void;
  (event: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const amountRef: Ref<HTMLInputElement | null> = ref(null);
const activeGroupsUrl = ref('/groups?active=1');
const activeWalletsUrl = ref('/wallets?active=1');

const { fetchData: getActiveGroups } = useDataFetch(activeGroupsUrl);
const { isLoading: isGroupsLoading, data: groupsData } = await getActiveGroups();

const { fetchData: getActiveWallets } = useDataFetch(activeWalletsUrl);
const { isLoading: isWalletsLoading, data: walletsData } = await getActiveWallets();

const wallets: any = computed(() => walletsData.value?.wallets ?? []);
const groups: any = computed(() => groupsData.value?.groups ?? []);

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

watch(
  () => props.isSubmitting,
  async (submitting) => {
    if (!submitting) {
      await nextTick();
      amountRef?.value?.focus();
    }
  }
);

watch(
  () => props.isEditing,
  async (editing) => {
    if (editing) {
      await nextTick();
      amountRef?.value?.focus();
    }
  }
);

onMounted(async () => {
  document.addEventListener('keydown', onCmdSaveHandler);

  await nextTick();
  amountRef?.value?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onCmdSaveHandler);
});

const onCmdSaveHandler = (e: KeyboardEvent) => {
  if (isSaveButtonEnabled.value && e.metaKey && e.key === 's') {
    e.preventDefault();
    e.stopPropagation();
    onSaveClickHandler();
  }
};

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
  }

  .card {
    max-width: 640px;
    box-shadow: none;
    overflow: visible;

    &__body {
      padding: 16px;
    }

    &__link {
      cursor: pointer;
      font-weight: bold;
      font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    }
  }
}
</style>
