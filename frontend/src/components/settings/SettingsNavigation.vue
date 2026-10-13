<template>
  <div class="settings-navigation">
    <div class="row">
      <div class="col-3 col-3--sticky">
        <dl class="box is-shadowless settings-navigation__menu">
          <dt class="settings-navigation__menu-item">
            <router-link to="/settings/groups">Categories</router-link>
          </dt>
          <dt class="settings-navigation__menu-item">
            <router-link to="/settings/wallets">Wallets</router-link>
          </dt>
          <dt class="settings-navigation__menu-item">
            <router-link to="/settings/advanced">Advanced</router-link>
          </dt>
        </dl>
      </div>
      <div class="col-9">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.settings-navigation {
  &__menu {
    &-item {
      margin-bottom: 1rem;
    }
  }
}

.router-link-active {
  border-left: 4px solid var(--c-success) !important;
  border-bottom: none !important;
  padding-left: 4px !important;

  &::before {
    content: none !important;
  }
}

.col-3--sticky {
  position: sticky;
  top: 85px;
  z-index: 1;
}

@media (max-width: 767px) {
  .settings-navigation__menu {
    display: flex;
    flex-wrap: wrap;
    gap: var(--bk-space-md);
    width: 100%;
    padding: 0 0 var(--bk-space-sm);
    margin-bottom: var(--bk-space-md);
    background-color: transparent;
    border: none;
    border-bottom: var(--s-border-width) solid var(--c-grey-dark);
    border-radius: 0;

    &-item {
      margin-bottom: 0;
    }

    a {
      border-bottom: none !important;

      &::before {
        content: none !important;
      }
    }
  }

  .col-3--sticky {
    position: static;
  }
}
</style>
