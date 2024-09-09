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
        <div class="input">
          <input
            v-model="props.symbol"
            type="text"
            placeholder="E.g. ¥"
            maxlength="2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  symbol: string;
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
  hgroup {
    margin-bottom: 16px;

    h5,
    p {
      margin: 0;
    }
  }

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
