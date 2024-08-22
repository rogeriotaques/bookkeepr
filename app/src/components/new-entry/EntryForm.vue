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
              <input v-model="data.amount" v-money="V_MONEY_OPTIONS" ref="amount" type="text" placeholder="E.g. 1,234" maxlength="11" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <label for="input">Description</label>
            <div class="input">
              <input v-model="data.description" type="text" placeholder="E.g. Lunch with a friend" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <label for="input">Category</label>
            <BaseDropdown v-if="isGroupsLoaded" v-model="data.group" :options="categoryOptions" full-width />
            <div v-else-if="isGroupsError" class="notification is-danger">{{ groupsError }}</div>
          </div>
          <div class="col-6">
            <label for="input">Wallet</label>
            <BaseDropdown v-if="isWalletsLoaded" v-model="data.wallet" :options="walletOptions" full-width />
            <div v-else-if="isWalletsError" class="notification is-danger">{{ walletsError }}</div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <label for="input">Date</label>
            <div class="input input--with-addons">
              <p class="input__addon input__addon--icon"><IconCalendar :size="18" /></p>
              <input v-model="data.date" type="date" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- .card -->

    <button :disabled="!isFormValid || props.isSubmitting" type="submit" class="is-full-width" @click="onSaveClickHandler">
      <IconLoader2 v-if="props.isSubmitting" width="16" height="16" class="is-spinning" />
      <span v-else>Save</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch, onMounted, nextTick } from 'vue';
import { IconCalendar, IconCurrencyYen, IconLoader2 } from '@tabler/icons-vue';

import { Entry, Wallet, Group } from '@/domain/interfaces';
import { V_MONEY_OPTIONS } from '@/domain/constants';

import useGroups from '@/composable/useGroups';
import useWallets from '@/composable/useWallets';

import BaseDropdown from '@/components/shared/BaseDropdown.vue';

interface Props {
  data: Entry;
  isSubmitting: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submit'): void;
}

const emit = defineEmits<Emits>();

const { getGroups } = useGroups();
const { isLoading: isGroupsLoading, isError: isGroupsError, data: groupsData, error: groupsError } = await getGroups();

const { getWallets } = useWallets();
const { isLoading: isWalletsLoading, isError: isWalletsError, data: walletsData, error: walletsError } = await getWallets();

const amount: Ref<HTMLInputElement | null> = ref(null);

const isGroupsLoaded = computed(() => !isGroupsLoading.value && !isGroupsError.value);
const isWalletsLoaded = computed(() => !isWalletsLoading.value && !isWalletsError.value);
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

watch(
  () => props.isSubmitting,
  (submitting) => {
    if (!submitting) amount?.value?.focus();
  }
);

onMounted(() => {
  nextTick(() => {
    amount?.value?.focus();
  });
});

const onSaveClickHandler = () => {
  emit('submit');
};
</script>

<style lang="scss" scoped>
.entry-form {
  .card {
    max-width: 640px;
    box-shadow: none;

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
