<template>
  <div class="entry-form">
    <div class="card">
      <div class="card__body">
        <div class="row">
          <div class="col-12">
            <label for="input">Amount</label>
            <div class="input input--with-addons">
              <p class="input__addon input__addon--icon">
                <IconCurrencyYen size="18" />
              </p>
              <input ref="amount" type="text" placeholder="E.g. 1,234" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <label for="input">Description</label>
            <div class="input">
              <input type="text" placeholder="E.g. Lunch with a friend" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-6">
            <label for="input">Category</label>
            <div class="input">
              <select>
                <option value="">Select</option>
              </select>
            </div>
          </div>
          <div class="col-6">
            <label for="input">Wallet</label>
            <div class="input">
              <select>
                <option value="">Select</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <label for="input">Date</label>
            <div class="input input--with-addons">
              <p class="input__addon input__addon--icon"><IconCalendar size="18" /></p>
              <input type="date" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- .card -->

    <button type="submit" class="is-full-width">Save</button>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, onMounted, nextTick } from 'vue';
import { IconCalendar, IconCurrencyYen } from '@tabler/icons-vue';

const amount: Ref<HTMLInputElement | null> = ref(null);

onMounted(() => {
  nextTick(() => {
    amount?.value?.focus();
  });
});
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
