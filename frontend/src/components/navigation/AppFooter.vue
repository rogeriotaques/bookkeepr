<template>
  <div
    class="app_footer"
    :class="{ 'app_footer--inline': props.inline }"
  >
    <p class="app_footer__copyright">2021 &copy; Abtz Labs</p>
    <p class="app_footer__brand">
      <span class="branding">
        BookKeepr
        <code>{{ version }}</code>
      </span>
    </p>
    <p class="app_footer__help">
      Need help?
      <a href="mailto:hello@abtz.co">hello@abtz.co</a>
    </p>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
const version = __VERSION__;

interface Props {
  // Lays the three items on one line: copyright, help, branding.
  inline?: boolean;
}

const props = defineProps<Props>();
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

  p.app_footer__help {
    margin-top: var(--bk-space-md);
  }

  // In-app footer: shares the page width and spreads the same content on one
  // row, with the help link centred between the copyright and the branding.
  &--inline {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: var(--bk-space-sm) var(--bk-space-md);
    width: 100%;
    max-width: var(--bk-max-width-wide);
    margin: 0 auto;
    padding: var(--bk-space-lg) var(--bk-space-md);

    p,
    p.app_footer__help {
      margin: 0;
    }

    // DOM order is copyright, branding, help; read them the other way.
    .app_footer__help {
      order: 1;
    }

    .app_footer__brand {
      order: 2;
      justify-self: end;
    }
  }
}
</style>
