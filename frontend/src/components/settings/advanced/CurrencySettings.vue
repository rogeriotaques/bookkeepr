<template>
  <div class="settings-advanced-currency">
    <SettingsRow>
      <hgroup>
        <h5>Locale</h5>
        <p>Define the symbols and formats to be used for currency and dates</p>
      </hgroup>

      <template #control>
        <div class="input">
          <!-- @vue-expect-error -->
          <input
            :value="props.data.currencyCode"
            :disabled="props.loading"
            type="text"
            placeholder="E.g. JPY"
            maxlength="3"
            @change="emit('update', { key: 'currencyCode', value: $event.target.value })"
          />
        </div>

        <div class="input">
          <!-- @vue-expect-error -->
          <input
            :value="props.data.currencyLocale"
            :disabled="props.loading"
            type="text"
            placeholder="E.g. ja-JP"
            maxlength="5"
            @change="emit('update', { key: 'currencyLocale', value: $event.target.value })"
          />
        </div>
      </template>
    </SettingsRow>
  </div>
</template>

<script setup lang="ts">
import { CurrencyLocale } from '@/domain/interfaces';

import SettingsRow from '@/components/settings/SettingsRow.vue';

interface Props {
  data: CurrencyLocale;
  loading?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update', value: any): void;
}

const emit = defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.settings-advanced-currency {
  .input {
    width: 100%;
  }

  .input > input {
    text-align: center;
    width: 149px;
    max-width: 100%;
    margin-left: auto;
    margin-right: 0;
  }
}
</style>
