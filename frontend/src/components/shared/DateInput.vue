<template>
  <div class="input input--with-addons">
    <label
      class="input__addon input__addon--icon"
      :for="id"
    >
      <IconCalendar :size="18" />
    </label>
    <input
      :id="id"
      ref="inputRef"
      class="date-input__field"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="display"
      @focus="onFocus"
      @blur="onBlur"
      @click="onClick"
      @keydown="onKeydown"
      @paste="onPaste"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, nextTick, watch } from 'vue';
import { IconCalendar } from '@tabler/icons-vue';

type Segment = 'year' | 'month' | 'day';

const SEGMENTS: Segment[] = ['year', 'month', 'day'];
const WIDTHS: Record<Segment, number> = { year: 4, month: 2, day: 2 };

interface Props {
  modelValue?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  id: 'date',
});

const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>();

const inputRef = ref<HTMLInputElement | null>(null);
const active = ref<Segment>('day');
const fresh = ref(true);
const parts = reactive<Record<Segment, string>>({ year: '', month: '', day: '' });

const pad = (value: number, width: number) => String(value).padStart(width, '0');

const today = () => {
  const now = new Date();
  return {
    year: pad(now.getFullYear(), 4),
    month: pad(now.getMonth() + 1, 2),
    day: pad(now.getDate(), 2),
  };
};

const toISO = (): string => {
  if (parts.year.length !== 4 || parts.month.length !== 2 || parts.day.length !== 2) return '';

  const month = Number(parts.month);
  const day = Number(parts.day);

  if (month < 1 || month > 12 || day < 1 || day > 31) return '';

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const hydrate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const source = match ? { year: match[1], month: match[2], day: match[3] } : today();

  parts.year = source.year;
  parts.month = source.month;
  parts.day = source.day;
};

watch(
  () => props.modelValue,
  (value) => {
    if (toISO() !== value) hydrate(value);
  },
  { immediate: true }
);

const display = computed(() => `${parts.year}/${parts.month}/${parts.day}`);

const segmentRange = (segment: Segment): [number, number] => {
  const yearEnd = parts.year.length;
  const monthStart = yearEnd + 1;
  const monthEnd = monthStart + parts.month.length;
  const dayStart = monthEnd + 1;

  if (segment === 'year') return [0, yearEnd];
  if (segment === 'month') return [monthStart, monthEnd];
  return [dayStart, dayStart + parts.day.length];
};

const placeCaret = (segment: Segment) => {
  nextTick(() => {
    const el = inputRef.value;
    if (!el) return;

    const [start, end] = segmentRange(segment);
    el.setSelectionRange(start, end);
  });
};

const selectSegment = (segment: Segment) => {
  active.value = segment;
  fresh.value = true;
  placeCaret(segment);
};

const emitIfValid = () => {
  const iso = toISO();
  if (iso && iso !== props.modelValue) emit('update:modelValue', iso);
};

const typeDigit = (digit: string) => {
  const segment = active.value;
  const width = WIDTHS[segment];
  let value = fresh.value ? '' : parts[segment];

  if (value.length >= width) value = value.slice(1);
  value += digit;
  parts[segment] = value;
  fresh.value = false;

  if (value.length >= width) {
    const index = SEGMENTS.indexOf(segment);
    if (index < SEGMENTS.length - 1) {
      active.value = SEGMENTS[index + 1];
      fresh.value = true;
    }
  }

  placeCaret(active.value);
  emitIfValid();
};

const clearActive = () => {
  parts[active.value] = '';
  fresh.value = true;
  placeCaret(active.value);
};

const bumpActive = (direction: number) => {
  const segment = active.value;
  const width = WIDTHS[segment];

  if (parts[segment].length < width) return;

  const max = segment === 'year' ? 9999 : segment === 'month' ? 12 : 31;
  let value = Number(parts[segment]) + direction;

  if (value < 1) value = max;
  if (value > max) value = 1;

  parts[segment] = pad(value, width);
  fresh.value = true;
  placeCaret(segment);
  emitIfValid();
};

const onFocus = () => selectSegment('day');

const onClick = () => {
  const el = inputRef.value;
  if (!el) return;

  const position = el.selectionStart ?? 0;
  const yearEnd = parts.year.length;
  const monthStart = yearEnd + 1;
  const monthEnd = monthStart + parts.month.length;
  const dayStart = monthEnd + 1;

  if (position >= dayStart) selectSegment('day');
  else if (position >= monthStart) selectSegment('month');
  else selectSegment('year');
};

const onBlur = () => {
  const iso = toISO();
  if (!iso) hydrate(props.modelValue);
  else emitIfValid();
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    typeDigit(event.key);
    return;
  }

  switch (event.key) {
    case 'Backspace':
    case 'Delete':
      event.preventDefault();
      clearActive();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      moveActive(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      moveActive(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      bumpActive(1);
      break;
    case 'ArrowDown':
      event.preventDefault();
      bumpActive(-1);
      break;
    default:
      break;
  }
};

const moveActive = (direction: number) => {
  const index = SEGMENTS.indexOf(active.value) + direction;
  if (index < 0 || index >= SEGMENTS.length) return;

  selectSegment(SEGMENTS[index]);
};

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const text = event.clipboardData?.getData('text') ?? '';
  const match = /(\d{4})[-/]?(\d{1,2})[-/]?(\d{1,2})/.exec(text);

  if (!match) return;

  parts.year = pad(Number(match[1]), 4);
  parts.month = pad(Number(match[2]), 2);
  parts.day = pad(Number(match[3]), 2);
  fresh.value = true;
  emitIfValid();
};

defineExpose({ focus: () => inputRef.value?.focus() });
</script>
