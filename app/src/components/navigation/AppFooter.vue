<template>
  <div class="container">
    <p>2021 &copy; Abtz Labs</p>
    <p>
      <span>
        BookKeepr <code>{{ version }}</code>
      </span>
      <span> • </span>
      <span>Chromium <code id="chrome-version">#</code></span>
      <span> • </span>
      <span>Node <code id="node-version">#</code></span>
      <span> • </span>
      <span>Electron <code id="electron-version">#</code></span>
    </p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
const version = __VERSION__;
</script>

<style lang="scss" scoped></style>
