<template>
  <div class="history-page">
    <h1>Transactions History</h1>
    <p class="history-page__placeholder">Balance table and filters will be extracted here.</p>
    <RouterLink to="/entry" class="history-page__link">
      ← Record new expense
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style lang="scss" scoped>
.history-page {
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
