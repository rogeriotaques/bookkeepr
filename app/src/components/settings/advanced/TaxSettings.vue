<template>
  <div class="settings-advanced-tax">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Tax</h5>
          <p>Configure taxes for reports</p>
        </hgroup>
      </div>
      <div class="col-4 has-text-right">
        <DropdownPopper v-model="props.data.shouhizei" :options="taxOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TaxData } from '@/domain/interfaces';

import DropdownPopper from '@/components/shared/DropdownPopper.vue';

interface Props {
  data: TaxData;
}

const props = defineProps<Props>();

const taxOptions = [
  { value: 0, label: 'Not applicable' },
  { value: 0.08, label: '8%' },
  { value: 0.1, label: '10%' },
];
</script>

<style lang="scss" scoped>
.settings-advanced-tax {
  hgroup {
    margin-bottom: 16px;

    h5,
    p {
      margin: 0;
    }
  }
}
</style>
