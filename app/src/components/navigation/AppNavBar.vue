<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="app__navbar">
    <div class="tabs">
      <router-link class="tab" to="/">New entry</router-link>
      <router-link class="tab" to="/report">Report</router-link>
      <router-link class="tab" to="/settings">Settings</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin: 16px 0 24px;
  gap: 8px;
  border-bottom: 2px solid #000;

  .tab {
    transition: background-color 0.15s, color 0.15s;

    padding: 8px 16px;
    border: 0;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    cursor: pointer;

    &::before {
      content: unset;
    }

    &:not(.router-link-active):hover,
    &:not(.router-link-active):active {
      background-color: #ddd;
    }
  }
}

.router-link-active {
  background-color: #000;
  color: whitesmoke !important;
}
</style>
