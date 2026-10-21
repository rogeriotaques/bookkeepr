<template>
  <template v-for="(part, index) in parts" :key="index">
    <mark v-if="part.match" class="highlight-match">{{ part.text }}</mark>
    <span v-else>{{ part.text }}</span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { escapeRegExp } from '@/domain/utils';

interface Props {
  text: string | number;
  search?: string;
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
});

const parts = computed(() => {
  const text = String(props.text ?? '');
  const search = props.search.trim();

  if (!search) {
    return [{ text, match: false }];
  }

  const regex = new RegExp(`(${escapeRegExp(search)})`, 'ig');

  return text
    .split(regex)
    .filter((part) => part !== '')
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === search.toLowerCase(),
    }));
});
</script>

<style lang="scss" scoped>
.highlight-match {
  background-color: var(--bk-highlight);
  color: var(--bk-highlight-text);
  border-radius: 2px;
  padding: 0 2px;
}
</style>
