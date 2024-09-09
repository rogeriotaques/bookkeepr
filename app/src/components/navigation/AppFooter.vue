<template>
  <div class="app_footer container">
    <p>2021 &copy; Abtz Labs</p>
    <p>
      <span class="branding">
        BookKeepr
        <code>{{ version }}</code>
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
.app_footer {
  @media print {
    display: none;
  }

  .branding {
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;

    code {
      margin-left: 8px;
    }
  }
}
</style>
