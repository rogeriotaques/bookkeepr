<template>
  <div class="settings-advanced-tax">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Tax</h5>
          <p>Configure consumption tax estimation to be displayed in reports</p>
        </hgroup>
      </div>
      <div class="col-4 has-text-right">
        <BaseDropdown
          :modelValue="props.taxPercentage"
          :options="taxOptions"
          :disabled="props.loading"
          @select="emit('update', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseDropdown from '@/components/shared/BaseDropdown.vue';

interface Props {
  taxPercentage: number;
  loading?: boolean;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'update', value: any): void;
}

const emit = defineEmits<Emits>();

const taxOptions = [
  { value: 0, label: 'Not applicable' },
  { value: 0.08, label: '8%' },
  { value: 0.1, label: '10%' },
];
</script>

<style lang="scss" scoped></style>
