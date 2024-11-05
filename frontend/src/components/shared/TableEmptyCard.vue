<template>
  <tr class="table__empty">
    <td :colspan="colspan">
      <div class="table__empty-card">
        <slot>
          <div>
            <IconReportOff
              :size="48"
              color="gray"
            />
          </div>
          <p>
            No entries yet!
            <br />
            Use
            <code>⌘+I</code>
            to add a new one.
          </p>
        </slot>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { IconReportOff } from '@tabler/icons-vue';

interface Props {
  colspan?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  colspan: 5,
});
</script>

<style lang="scss" scoped>
.table__empty {
  td {
    border: 0;
  }

  &-card {
    padding: 8px 16px;
    font-size: 24px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
  }
}
</style>
