<template>
  <div class="wallet-form">
    <div class="field">
      <label class="label">Wallet name</label>
      <div class="input">
        <input v-model="form.name" ref="nameRef" :disabled="props.submitting" type="text" placeholder="E.g. Bank" />
      </div>
    </div>
    <div class="field">
      <label class="label">Status</label>
      <div class="wallet-form__radio-buttons">
        <div class="input input--radio">
          <input :checked="form.active === 1" :disabled="props.submitting" type="radio" name="radio" id="radio_1" @change="form.active = 1" />
          <label for="radio_1">Active</label>
        </div>
        <div class="input input--radio">
          <input :checked="form.active === 0" :disabled="props.submitting" type="radio" name="radio" id="radio_0" @change="form.active = 0" />
          <label for="radio_0">Inactive</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

import { Wallet } from '@/domain/interfaces';

interface Props {
  form: Wallet;
  submitting: boolean;
}

const props = defineProps<Props>();

const nameRef = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  nameRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.wallet-form {
  &__radio-buttons {
    display: flex;
    gap: 32px;
  }

  .field {
    + .field {
      margin-top: 16px;
    }
  }

  .input--radio > * {
    cursor: pointer;
  }
}
</style>
