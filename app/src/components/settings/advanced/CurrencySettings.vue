<template>
  <div class="settings-advanced-currency">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Currency</h5>
          <p>Defines the currency symbol to be used</p>
        </hgroup>
      </div>
      <div class="col-4 has-text-right">
        <div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CurrencyLocale } from '@/domain/interfaces';

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
  .input > input {
    text-align: center;
    width: 149px;
  }

  .col-4 {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
