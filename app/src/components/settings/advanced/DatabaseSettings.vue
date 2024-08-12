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
      <div class="col-4 has-text-right">
        <button class="button" type="button">
          <IconRefresh />
          <span>Vacuum</span>
        </button>

        <button class="button" type="submit">
          <IconRefresh />
          <span>Backup</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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
}
</style>
