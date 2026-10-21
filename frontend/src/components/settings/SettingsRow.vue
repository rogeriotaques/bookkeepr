<template>
  <div class="settings-row">
    <div class="settings-row__info">
      <slot />
    </div>
    <div class="settings-row__control">
      <slot name="control" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
// One setting per row: label and description on the left half, control on the
// right half. The split holds on mobile too, so controls keep the same column
// instead of drifting to the edge below the text.
.settings-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--bk-space-md);
  align-items: start;

  &__info {
    min-width: 0;
  }

  &__control {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--bk-space-sm);
    min-width: 0;
  }
}
</style>
