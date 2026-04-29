<template>
  <div class="mobile-layout">
    <main class="mobile-layout__content">
      <RouterView />
    </main>

    <nav class="mobile-layout__nav" role="navigation" aria-label="Main navigation">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        :data-testid="'nav-tab'"
        class="mobile-layout__tab"
        active-class="mobile-layout__tab--active"
      >
        <component
          :is="tab.icon"
          :size="22"
          class="mobile-layout__icon"
        />
        <span class="mobile-layout__label">{{ tab.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  IconLayoutDashboard,
  IconPlus,
  IconHistory,
  IconTarget,
  IconSettings,
} from '@tabler/icons-vue';

const tabs = [
  { name: 'Dashboard', label: 'Dashboard', to: '/', icon: IconLayoutDashboard },
  { name: 'Entry', label: 'Entry', to: '/entry', icon: IconPlus },
  { name: 'History', label: 'History', to: '/history', icon: IconHistory },
  { name: 'Planning', label: 'Planning', to: '/planning', icon: IconTarget },
  { name: 'Settings', label: 'Settings', to: '/settings', icon: IconSettings },
];
</script>

<style lang="scss" scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: calc(var(--bk-bottom-nav-height) + var(--bk-safe-area-bottom));

  &__content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: calc(var(--bk-bottom-nav-height) + var(--bk-safe-area-bottom));
    padding-bottom: var(--bk-safe-area-bottom);
    background: var(--bk-surface);
    border-top: 1px solid var(--bk-border);
    z-index: 100;
  }

  &__tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: var(--bk-touch-min);
    min-height: var(--bk-touch-min);
    color: var(--bk-text-secondary);
    text-decoration: none;
    font-size: var(--bk-text-xs);
    transition: color 0.15s ease;

    &--active,
    &:hover {
      color: var(--bk-primary);
    }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__label {
    line-height: 1;
  }
}

// Desktop: center the bottom nav or use top nav
@media (min-width: 768px) {
  .mobile-layout__nav {
    justify-content: center;
    gap: var(--bk-space-xl);
  }
}
</style>
