<template>
  <div class="dashboard">
    <main class="dashboard__content">
      <RouterView />
    </main>

    <div class="dashboard__footer">
      <AppFooter inline />
    </div>

    <nav class="dashboard__nav" role="navigation" aria-label="Main navigation">
      <div class="dashboard__nav-inner">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          :data-testid="'nav-tab'"
          :aria-label="tab.label"
          class="dashboard__tab"
          active-class="dashboard__tab--active"
        >
          <component
            :is="tab.icon"
            :size="22"
            class="dashboard__icon"
            aria-hidden="true"
          />
          <span class="dashboard__label">{{ tab.label }}</span>
        </RouterLink>

        <button
          type="button"
          data-testid="nav-logout"
          class="is-auto-width dashboard__logout"
          @click="onLogout"
        >
          <IconLogout :size="20" aria-hidden="true" />
          <span class="dashboard__label">Logout</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  IconLayoutDashboard,
  IconReceipt,
  IconTarget,
  IconChartBar,
  IconSettings,
  IconLogout,
} from '@tabler/icons-vue';

import { logout } from '@/composable/useState';
import AppFooter from '@/components/navigation/AppFooter.vue';

const tabs = [
  { name: 'Dashboard', label: 'Dashboard', to: '/', icon: IconLayoutDashboard },
  { name: 'Transactions', label: 'Transactions', to: '/transactions', icon: IconReceipt },
  { name: 'Planning', label: 'Planning', to: '/planning', icon: IconTarget },
  { name: 'Report', label: 'Report', to: '/report', icon: IconChartBar },
  { name: 'Settings', label: 'Settings', to: '/settings', icon: IconSettings },
];

const onLogout = () => logout();
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: calc(var(--bk-bottom-nav-height) + var(--bk-safe-area-bottom));

  &__content {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: var(--bk-space-xl);
  }

  &__nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    height: calc(var(--bk-bottom-nav-height) + var(--bk-safe-area-bottom));
    padding-bottom: var(--bk-safe-area-bottom);
    background: var(--bk-surface);
    border-top: 1px solid var(--bk-border);
    overflow-x: auto;
    z-index: 100;
  }

  // Shared by the bottom bar and the desktop top bar, so both line up with the
  // page content (`--bk-max-width-wide` plus the same 16px gutter).
  &__nav-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    max-width: var(--bk-max-width-wide);
    margin: 0 auto;
    padding: 0 var(--bk-space-md);
  }

  &__icon {
    flex-shrink: 0;
  }

  &__label {
    line-height: 1;
  }

  // The bottom tabs own the navigation on mobile. The Logout action stays on
  // the Dashboard page there (see DashboardPage). `!important` is required to
  // beat the global `button { display: flex !important }` rule.
  &__logout {
    display: none !important;
  }

  // The footer would crowd the bottom navigation on phones; the desktop bar has
  // the room for it.
  &__footer {
    display: none;
  }
}

// Boring styles bare anchors (`a:not(.button):not(.card__link)`) with a bottom
// border. The extra `.dashboard__nav` ancestor keeps this above that rule
// without `!important`.
.dashboard__nav .dashboard__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: var(--bk-touch-min);
  min-height: var(--bk-touch-min);
  // Six tabs must fit a 375px bar, so the mobile label is small and tight.
  padding: 0 var(--bk-space-xs);
  border: 0;
  border-bottom: 0;
  border-radius: var(--bk-radius-md);
  color: var(--bk-text-secondary);
  font-size: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;

  &::before,
  &::after {
    content: none;
  }

  &:hover {
    color: var(--bk-primary);
  }

  &--active {
    color: var(--bk-primary);
    font-weight: 700;
  }
}

// Desktop: a sticky top bar that shares the page's content width.
@media (min-width: 1024px) {
  .dashboard {
    padding-bottom: 0;

    &__nav {
      position: sticky;
      top: 0;
      bottom: auto;
      order: -1;
      height: auto;
      padding: var(--bk-space-sm) 0;
      border-top: none;
      border-bottom: 1px solid var(--bk-border);
    }

    &__nav-inner {
      justify-content: flex-start;
      gap: var(--bk-space-sm);
    }

    &__content {
      padding-top: var(--bk-space-lg);
    }

    &__footer {
      display: block;
    }
  }

  .dashboard__nav .dashboard__tab {
    flex-direction: row;
    gap: var(--bk-space-xs);
    padding: 0 var(--bk-space-md);
    font-size: var(--bk-text-sm);
    font-weight: 600;

    &:hover,
    &--active {
      background-color: var(--c-success-background);
    }
  }

  // Boring's `button:hover` (0,3,1) sets the colour, a shadow and a transform,
  // so this also needs the `.dashboard__nav` ancestor to win.
  .dashboard__nav .dashboard__logout {
    display: flex !important;
    position: absolute;
    right: var(--bk-space-md);
    // Boring's `button` carries `margin: 0 4px 8px 0`, which would offset the
    // absolutely positioned right edge by 4px.
    margin: 0;
    padding: 0 var(--bk-space-md);
    color: var(--bk-text-secondary);
    border-color: transparent;
    background-color: transparent;
    box-shadow: none;

    &:hover,
    &:focus,
    &:active {
      color: var(--bk-danger);
      border-color: transparent;
      background-color: var(--bk-danger-light);
      box-shadow: none;
      transform: none;
    }
  }
}

// Print comes last so it wins over the desktop rules above; print media
// queries carry no extra specificity.
@media print {
  .dashboard {
    min-height: auto;
    padding-bottom: 0;

    &__content {
      // A scroll container would clip the report to a single sheet.
      overflow: visible;
      padding-top: 0;
    }

    &__nav {
      display: none;
    }
  }
}
</style>
