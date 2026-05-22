<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import BStatistic from './BStatistic.vue';
import type { BStatisticTimerType } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  type = 'countdown',
  value,
  format = 'HH:mm:ss',
  title,
  prefix,
  suffix,
  valueStyle,
} = defineProps<{
  /**
   * Timer mode.
   * - `'countdown'` - counts down to `value` (a future timestamp in ms).
   * - `'countup'`   - counts up from `value` (a past timestamp in ms).
   * @default 'countdown'
   */
  type?: BStatisticTimerType;
  /** Target/start timestamp in ms (e.g. `Date.now() + 60_000`). */
  value: number;
  /**
   * Format string. Tokens:
   * - `D`   days
   * - `H` / `HH` hours
   * - `m` / `mm` minutes
   * - `s` / `ss` seconds
   * - `S` / `SSS` milliseconds
   * @default 'HH:mm:ss'
   */
  format?: string;
  /** Title text (mirrors `BStatistic#title`). */
  title?: string;
  /** Prefix text (mirrors `BStatistic#prefix`). */
  prefix?: string;
  /** Suffix text (mirrors `BStatistic#suffix`). */
  suffix?: string;
  /** Inline style on the value element. */
  valueStyle?: string | Record<string, string | number>;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Emitted once a countdown reaches zero. */
  finish: [];
  /** Emitted on every tick with the current ms remaining/elapsed. */
  change: [ms: number];
}>();

defineSlots<{
  title?(): unknown;
  prefix?(): unknown;
  suffix?(): unknown;
}>();

// ─────────────────────────────────────────────
// Tick
// ─────────────────────────────────────────────
const TICK_MS = 1000 / 30; // ~33ms, smooth enough for sub-second formats
const now = ref<number>(0);
let timer: ReturnType<typeof setInterval> | null = null;
let finished = false;

function compute(t: number): number {
  return type === 'countdown' ? Math.max(0, value - t) : Math.max(0, t - value);
}

function tick() {
  const t = Date.now();
  now.value = t;
  const ms = compute(t);
  emit('change', ms);
  if (type === 'countdown' && ms <= 0 && !finished) {
    finished = true;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    emit('finish');
  }
}

onMounted(() => {
  // SSR-safe: timers only run in the browser
  finished = false;
  now.value = Date.now();
  // Emit initial change so consumers see the starting value
  emit('change', compute(now.value));
  timer = setInterval(tick, TICK_MS);
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

// ─────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────
const ms = computed<number>(() => (now.value ? compute(now.value) : compute(Date.now())));

function formatDuration(t: number, fmt: string): string {
  const days = Math.floor(t / 86_400_000);
  let rem = t - days * 86_400_000;
  const hours = Math.floor(rem / 3_600_000);
  rem -= hours * 3_600_000;
  const minutes = Math.floor(rem / 60_000);
  rem -= minutes * 60_000;
  const seconds = Math.floor(rem / 1000);
  const milliseconds = rem - seconds * 1000;

  // Bracketed text is treated as a literal (dayjs-compatible).
  return fmt.replace(/\[([^\]]*)\]|SSS|HH|mm|ss|D|H|m|s|S/g, (match, literal) => {
    if (literal !== undefined) return literal;
    switch (match) {
      case 'SSS':
        return String(milliseconds).padStart(3, '0');
      case 'HH':
        return String(hours).padStart(2, '0');
      case 'mm':
        return String(minutes).padStart(2, '0');
      case 'ss':
        return String(seconds).padStart(2, '0');
      case 'D':
        return String(days);
      case 'H':
        return String(hours);
      case 'm':
        return String(minutes);
      case 's':
        return String(seconds);
      case 'S':
        return String(milliseconds);
      default:
        return match;
    }
  });
}

const formatted = computed<string>(() => formatDuration(ms.value, format));
</script>

<template>
  <BStatistic
    class="b-statistic-timer"
    :title="title"
    :value="formatted"
    :prefix="prefix"
    :suffix="suffix"
    :value-style="valueStyle"
  >
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
    <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
  </BStatistic>
</template>
