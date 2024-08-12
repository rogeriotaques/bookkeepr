<template>
  <div class="settings-advanced-tax">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Tax</h5>
          <p>Configure taxes for reports</p>
        </hgroup>
      </div>
      <div class="col-4 has-text-right">
        <div class="input">
          <Popper trigger="click" arrow>
            <button type="button" class="dropdown__trigger">
              <span>10%</span>
              <IconChevronDown :size="16" />
            </button>

            <template #content>
              <dl class="dropdown__items">
                <dt class="dropdown__item">Not applicable</dt>
                <dt class="dropdown__item">8%</dt>
                <dt class="dropdown__item">10%</dt>
              </dl>
            </template>
          </Popper>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue';
import Popper from 'vue3-popper';
</script>

<style lang="scss" scoped>
.settings-advanced-tax {
  hgroup {
    margin-bottom: 16px;

    h5,
    p {
      margin: 0;
    }
  }
}

.dropdown {
  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__items {
    margin: 0;
  }

  &__item {
    padding: 4px 8px;
    cursor: pointer;

    &:not(:first-child) {
      border-top: var(--popper-theme-border-width) var(--popper-theme-border-style) var(--popper-theme-border-color);
    }

    &:hover {
      background-color: var(--c-smoke);
    }
  }
}

:deep(.popper) {
  min-width: 150px;
  max-width: 300px;
  text-align: initial;
  padding: 4px;
}
</style>
