<template>
  <div class="settings-navigation">
    <div class="row">
      <div class="col-3">
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
</style>
