<template>
  <div class="container pro-tip">
    <label>
      <IconBulb :size="18" />
      <span>Pro Tip:</span>
    </label>
    <span
      class="pro-tip__content"
      v-html="currentTip"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconBulb } from '@tabler/icons-vue';
import { modifierLabel } from '@/domain/hotkeys';

interface Props {
  target: string; // What page the pro tip is for
}

const props = defineProps<Props>();

const TIPS: Record<string, string[]> = {
  'new-entry': [
    `Use <code>${modifierLabel()}+S</code> to save an entry, <code>${modifierLabel()}+K</code> or <code>/</code> to search, and <code>${modifierLabel()}+I</code> to focus the amount.`,
    'Click on the rows to select and get their summed amounts, or use <code>j</code>/<code>k</code> and <code>Space</code>.',
    'Press <code>?</code> to see every keyboard shortcut.',
  ],
  report: [
    `Use <code>p</code> or <code>${modifierLabel()}+P</code> to print this report.`,
    'Press <code>?</code> to see every keyboard shortcut.',
  ],
};

const currentTip = computed(() => {
  const tips = TIPS[props.target] ?? [];
  if (tips.length === 0) return '';
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return tip;
});
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

// A tip about screen shortcuts has no place on paper.
@media print {
  .pro-tip {
    display: none;
  }
}
</style>
