<template>
  <div class="group-form">
    <div class="row">
      <div class="col-4">
        <div class="field">
          <label class="label">Code</label>
          <div class="input">
            <input v-model="form.code" ref="codeRef" :disabled="props.submitting" type="text" placeholder="E.g. 10" />
          </div>
        </div>
      </div>
      <div class="col-8">
        <div class="field">
          <label class="label">Category name</label>
          <div class="input">
            <input v-model="form.name" :disabled="props.submitting" type="text" placeholder="E.g. Suppliers" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <div class="field">
          <label class="label">Operation</label>
          <div class="group-form__radio-buttons">
            <div class="input input--radio">
              <input
                :checked="form.operation === 'income'"
                :disabled="props.submitting"
                type="radio"
                name="radio_operation"
                id="radio_operation_income"
                @change="form.operation = 'income'"
              />
              <label for="radio_operation_income">Income</label>
            </div>
            <div class="input input--radio">
              <input
                :checked="form.operation === 'outcome'"
                :disabled="props.submitting"
                type="radio"
                name="radio_operation"
                id="radio_operation_outcome"
                @change="form.operation = 'outcome'"
              />
              <label for="radio_operation_outcome">Outcome</label>
            </div>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="field">
          <label class="label">Status</label>
          <div class="group-form__radio-buttons">
            <div class="input input--radio">
              <input
                :checked="form.active === 1"
                :disabled="props.submitting"
                type="radio"
                name="radio_status"
                id="radio_status_1"
                @change="form.active = 1"
              />
              <label for="radio_status_1">Active</label>
            </div>
            <div class="input input--radio">
              <input
                :checked="form.active === 0"
                :disabled="props.submitting"
                type="radio"
                name="radio_status"
                id="radio_status_0"
                @change="form.active = 0"
              />
              <label for="radio_status_0">Inactive</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

import { Group } from '@/domain/interfaces';

interface Props {
  form: Group;
  submitting: boolean;
}

const props = defineProps<Props>();

const codeRef = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  codeRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.group-form {
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
