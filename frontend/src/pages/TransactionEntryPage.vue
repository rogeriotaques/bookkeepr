<template>
  <div class="entry-page">
    <h1>Transaction</h1>
    <p class="entry-page__placeholder">Entry form will be extracted here.</p>
    <RouterLink to="/history" class="entry-page__link">
      View transaction history →
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style lang="scss" scoped>
.entry-page {
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
    margin-bottom: var(--bk-space-lg);
  }

  &__link {
    color: var(--bk-primary);
    text-decoration: none;
    font-size: var(--bk-text-sm);
  }
}
</style>
