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
        <DropdownPopper :options="taxOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DropdownPopper from '@/components/shared/DropdownPopper.vue';

const taxOptions = [
  { value: '0', label: 'Not applicable' },
  { value: '8', label: '8%' },
  { value: '10', label: '10%' },
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
