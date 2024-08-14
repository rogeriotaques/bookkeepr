<template>
  <div class="settings-advanced-database">
    <div class="row">
      <div class="col-8">
        <hgroup>
          <h5>Database</h5>
          <p>Maintenace actions for this app database</p>
          <code>File: /Users/rogerio/Library/Application Support/BookKeepr/bookkeepr.db</code>
        </hgroup>
      </div>
      <div class="col-4 settings-advanced-database__actions">
        <button class="button" type="button">
          <IconRefresh />
          <span>Vacuum</span>
        </button>

        <button class="button" type="submit">
          <IconDeviceFloppy />
          <span>Backup</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconRefresh, IconDeviceFloppy } from '@tabler/icons-vue';
</script>

<style lang="scss" scoped>
.settings-advanced-database {
  hgroup {
    margin-bottom: 16px;

    h5,
    p {
      margin: 0;
    }

    p + code {
      padding: 4px;
      margin-top: 8px;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;

    > button {
      width: 100px;
    }
  }
}
</style>
