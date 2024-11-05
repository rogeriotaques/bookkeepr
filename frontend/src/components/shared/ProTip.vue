<template>
  <div class="container pro-tip">
    <label>
      <IconBulb :size="18" />
      <span>Pro Tip:</span>
    </label>
    <span
      class="pro-tip__content"
      v-html="currentTip()"
    />
  </div>
</template>

<script setup lang="ts">
import { IconBulb } from '@tabler/icons-vue';

interface Props {
  target: string; // What page the pro tip is for
}

const props = defineProps<Props>();

const TIPS: Record<string, string[]> = {
  'new-entry': ['Use <code>⌘+S</code> to save an entry, <code>⌘+K</code> to search, and <code>⌘+I</code> to entry a new amount.'],
  report: ['Use <code>⌘+P</code> to print this report.'],
};

const currentTip = () => {
  const tip = TIPS[props.target][Math.floor(Math.random() * TIPS[props.target].length)];
  return tip;
};
</script>

<style lang="scss" scoped>
.pro-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  margin-top: 16px;
  margin-bottom: 16px;

  > label {
    border: 1px solid var(--c-grey);
    border-radius: 8px;
    padding: 2px 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--c-grey);

    > span {
      color: var(--c-white);
    }

    > svg {
      fill: var(--c-white);
      stroke: var(--c-white);
    }
  }

  &__content > * {
    margin: 0;
  }
}
</style>
