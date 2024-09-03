<template>
  <div class="container">
    <p>2021 &copy; Abtz Labs</p>
    <p>
      <span class="branding">
        BookKeepr
        <code>{{ version }}</code>
      </span>
      <span>•</span>
      <span>
        Chromium
        <code id="chrome-version">#</code>
      </span>
      <span>•</span>
      <span>
        Node
        <code id="node-version">#</code>
      </span>
      <span>•</span>
      <span>
        Electron
        <code id="electron-version">#</code>
      </span>
    </p>
    <p>
      Need help?
      <a href="mailto:hello@abtz.co">hello@abtz.co</a>
    </p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
const version = __VERSION__;
</script>

<style lang="scss" scoped>
.branding {
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;

  code {
    margin-left: 8px;
  }
}
</style>
