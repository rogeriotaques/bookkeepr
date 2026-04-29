<template>
  <div class="dashboard-page">
    <header class="dashboard-page__header">
      <h1>You're doing great!</h1>
      <p class="dashboard-page__subtitle">Keep it up.</p>
    </header>

    <section class="dashboard-page__summary">
      <!-- Summary cards placeholder -->
      <div class="dashboard-page__cards">
        <div class="dashboard-page__card">
          <span class="dashboard-page__card-label">Budget</span>
          <span class="dashboard-page__card-value">¥ 0</span>
        </div>
        <div class="dashboard-page__card">
          <span class="dashboard-page__card-label">Actual</span>
          <span class="dashboard-page__card-value">¥ 0</span>
        </div>
        <div class="dashboard-page__card">
          <span class="dashboard-page__card-label">Balance</span>
          <span class="dashboard-page__card-value">¥ 0</span>
        </div>
      </div>
    </section>

    <section class="dashboard-page__actions">
      <RouterLink to="/entry" class="dashboard-page__action">
        Record new expense
      </RouterLink>
      <RouterLink to="/history" class="dashboard-page__action">
        Transaction History
      </RouterLink>
      <RouterLink to="/planning" class="dashboard-page__action">
        Planning
      </RouterLink>
      <RouterLink to="/settings" class="dashboard-page__action">
        Settings
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--bk-space-md);
  max-width: var(--bk-max-width);
  margin: 0 auto;

  &__header {
    text-align: center;
    margin-bottom: var(--bk-space-xl);

    h1 {
      font-size: var(--bk-text-2xl);
      color: var(--bk-text-primary);
      margin: 0;
    }
  }

  &__subtitle {
    color: var(--bk-text-secondary);
    font-size: var(--bk-text-sm);
    margin-top: var(--bk-space-xs);
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-xl);
  }

  &__card {
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-lg);
    padding: var(--bk-space-md);
    text-align: center;

    &-label {
      display: block;
      font-size: var(--bk-text-xs);
      color: var(--bk-text-secondary);
      margin-bottom: var(--bk-space-xs);
    }

    &-value {
      display: block;
      font-size: var(--bk-text-lg);
      font-weight: 600;
      color: var(--bk-text-primary);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--bk-space-sm);
  }

  &__action {
    display: block;
    padding: var(--bk-space-md);
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    border-radius: var(--bk-radius-md);
    text-align: center;
    color: var(--bk-text-primary);
    text-decoration: none;
    font-size: var(--bk-text-base);
    min-height: var(--bk-touch-min);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--bk-background);
    }
  }
}
</style>
