<template>
  <div class="settings-advanced-tax">
    <SettingsRow>
      <hgroup>
        <h5>Tax</h5>
        <p>Configure consumption tax estimation to be displayed in reports</p>
      </hgroup>

      <template #control>
        <BaseDropdown
          :modelValue="props.taxPercentage"
          :options="taxOptions"
          :disabled="props.loading"
          @select="emit('update', $event)"
        />
      </template>
    </SettingsRow>
  </div>
</template>

<script setup lang="ts">
import BaseDropdown from '@/components/shared/BaseDropdown.vue';
import SettingsRow from '@/components/settings/SettingsRow.vue';

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

<style lang="scss" scoped>
.settings-advanced-tax {
  // Long labels ("Not applicable") must not push the dropdown past its column.
  :deep(.base-dropdown) {
    max-width: 100%;
  }
}
</style>
