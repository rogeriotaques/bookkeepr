<template>
  <div class="planning-page">
    <h1>Planning</h1>
    <p class="planning-page__placeholder">
      Budget planning shell. Income/Expenses calculators will open as modals here.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.planning-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width);
  margin: 0 auto;

  h1 {
    font-size: var(--bk-text-2xl);
    color: var(--bk-text-primary);
    margin-bottom: var(--bk-space-md);
  }

  &__placeholder {
    color: var(--bk-text-secondary);
  }
}
</style>
