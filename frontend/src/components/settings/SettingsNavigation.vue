<template>
  <div class="settings-navigation">
    <nav
      class="settings-navigation__tabs"
      aria-label="Settings sections"
    >
      <RouterLink
        to="/settings/groups"
        class="settings-navigation__tab"
        active-class="settings-navigation__tab--active"
      >
        Categories
      </RouterLink>
      <RouterLink
        to="/settings/wallets"
        class="settings-navigation__tab"
        active-class="settings-navigation__tab--active"
      >
        Wallets
      </RouterLink>
      <RouterLink
        to="/settings/advanced"
        class="settings-navigation__tab"
        active-class="settings-navigation__tab--active"
      >
        Advanced
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<style lang="scss" scoped>
.settings-navigation {
  &__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--bk-space-sm);
    margin-bottom: var(--bk-space-lg);
  }
}

// Boring styles bare anchors with a bottom border and a `::before` highlight at
// (0,2,1). The extra class keeps this above it without `!important`.
.settings-navigation .settings-navigation__tab {
  display: flex;
  align-items: center;
  min-height: var(--bk-touch-min);
  padding: 0 var(--bk-space-md);
  border: 1px solid var(--bk-border);
  border-radius: var(--bk-radius-md);
  color: var(--bk-text-secondary);
  background-color: var(--bk-surface);
  font-size: var(--bk-text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;

  &::before,
  &::after {
    content: none;
  }

  &:hover {
    color: var(--bk-text-primary);
    border-color: var(--bk-text-muted);
  }

  &--active,
  &--active:hover {
    color: var(--bk-primary);
    border-color: var(--bk-primary);
    background-color: var(--c-success-background);
  }
}
</style>
