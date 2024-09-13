<template>
  <div class="app__navbar">
    <div class="tabs">
      <router-link
        class="tab"
        to="/"
      >
        New entry
      </router-link>
      <router-link
        class="tab"
        to="/report"
      >
        Report
      </router-link>
      <router-link
        class="tab"
        to="/settings"
      >
        Settings
      </router-link>
      <a
        v-if="props.isUsingPassword"
        class="tab tab--sign-out"
        @click="onSignOutClickHandler"
      >
        Sign out
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

interface Props {
  isUsingPassword: boolean;
}

const props = defineProps<Props>();

interface Emit {
  (e: 'sign-out'): void;
}

const emit = defineEmits<Emit>();

const onSignOutClickHandler = () => {
  emit('sign-out');
};
</script>

<style lang="scss" scoped>
@media print {
  .app__navbar {
    display: none;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  margin: 0;
  gap: 8px;
  border-bottom: 2px solid #000;

  .tab {
    transition: background-color 0.15s, color 0.15s;

    padding: 8px 16px;
    border: 0;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    cursor: pointer;

    &--sign-out {
      position: absolute;
      right: 0;
    }

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
