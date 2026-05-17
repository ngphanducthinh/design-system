<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  BTimePickerPlacement,
  BTimePickerSize,
  BTimePickerStatus,
  BTimePickerVariant,
  type BTimePickerDisabledTime,
} from './types';

const {
  size = BTimePickerSize.Medium,
  variant = BTimePickerVariant.Outlined,
  placeholder = 'Select time',
  disabled = false,
  inputReadOnly = false,
  allowClear = true,
  showNow = true,
  use12Hours = false,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  format,
  placement = BTimePickerPlacement.BottomLeft,
  status,
  hideDisabledOptions = false,
  needConfirm = true,
  changeOnScroll = false,
  showHour = true,
  showMinute = true,
  showSecond = true,
  defaultOpen = false,
  defaultValue,
  open,
  disabledTime,
} = defineProps<{
  /** Size of the input */
  size?: `${BTimePickerSize}`;
  /** Visual variant */
  variant?: `${BTimePickerVariant}`;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Make input read-only (useful for touch devices) */
  inputReadOnly?: boolean;
  /** Show clear button */
  allowClear?: boolean;
  /** Show "Now" button in footer */
  showNow?: boolean;
  /** Use 12-hour format with AM/PM */
  use12Hours?: boolean;
  /** Hour selection step */
  hourStep?: number;
  /** Minute selection step */
  minuteStep?: number;
  /** Second selection step */
  secondStep?: number;
  /** Time format string (e.g. 'HH:mm:ss', 'hh:mm a') */
  format?: string;
  /** Popup placement */
  placement?: `${BTimePickerPlacement}`;
  /** Validation status */
  status?: `${BTimePickerStatus}`;
  /** Hide disabled time options from columns */
  hideDisabledOptions?: boolean;
  /** Require OK button confirmation before applying value */
  needConfirm?: boolean;
  /** Update value on scroll instead of click */
  changeOnScroll?: boolean;
  /** Show hour column */
  showHour?: boolean;
  /** Show minute column */
  showMinute?: boolean;
  /** Show second column */
  showSecond?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Default value (uncontrolled) */
  defaultValue?: Date;
  /** Controlled open state */
  open?: boolean;
  /** Function returning disabled hours/minutes/seconds */
  disabledTime?: () => BTimePickerDisabledTime;
}>();

const model = defineModel<Date | null>({ default: undefined });

const emit = defineEmits<{
  change: [time: Date | null, timeString: string];
  openChange: [open: boolean];
}>();

const inputEl = ref<HTMLInputElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const hourColEl = ref<HTMLElement | null>(null);
const minuteColEl = ref<HTMLElement | null>(null);
const secondColEl = ref<HTMLElement | null>(null);
const ampmColEl = ref<HTMLElement | null>(null);

defineExpose({
  focus: () => inputEl.value?.focus(),
  blur: () => inputEl.value?.blur(),
});

const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-time-picker-${componentUID.value}`);

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const isOpen = ref(defaultOpen);
const isPanelOpen = ref(open !== undefined ? !!open : defaultOpen);
const internalValue = ref<Date | null>(defaultValue ?? null);
const pendingHour = ref<number | null>(null);
const pendingMinute = ref<number | null>(null);
const pendingSecond = ref<number | null>(null);
const pendingAmpm = ref<'AM' | 'PM' | null>(null);
const inputText = ref('');
const focusedColumn = ref<'hour' | 'minute' | 'second' | 'ampm'>('hour');

const selectedTime = computed({
  get: () => model.value ?? internalValue.value,
  set: (val) => {
    internalValue.value = val;
    model.value = val;
  },
});

// ─────────────────────────────────────────────
// Format
// ─────────────────────────────────────────────
const activeFormat = computed(() => {
  if (format) return format;
  const parts: string[] = [];
  if (showHour) parts.push(use12Hours ? 'hh' : 'HH');
  if (showMinute) parts.push('mm');
  if (showSecond) parts.push('ss');
  const base = parts.join(':');
  return use12Hours ? `${base} A` : base;
});

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTime(d: Date | null): string {
  if (!d) return '';
  let h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';

  let result = activeFormat.value;
  if (use12Hours) {
    const h12 = h % 12 || 12;
    result = result.replace('hh', pad(h12));
    result = result.replace('h', String(h12));
    result = result.replace('A', ampm);
    result = result.replace('a', ampm.toLowerCase());
  } else {
    result = result.replace('HH', pad(h));
    result = result.replace('H', String(h));
  }
  result = result.replace('mm', pad(m));
  result = result.replace('ss', pad(s));
  return result;
}

function parseTimeString(str: string): Date | null {
  if (!str.trim()) return null;
  const timeRegex12 = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/;
  const match = str.match(timeRegex12);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  const period = match[4]?.toUpperCase();

  if (use12Hours && period) {
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
  }

  if (h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) return null;

  const d = new Date();
  d.setHours(h, m, s, 0);
  return d;
}

// ─────────────────────────────────────────────
// Disabled time logic
// ─────────────────────────────────────────────
const disabledHours = computed<number[]>(() => {
  if (!disabledTime) return [];
  const dt = disabledTime();
  return dt.disabledHours?.() ?? [];
});

const disabledMinutes = computed<number[]>(() => {
  if (!disabledTime) return [];
  const dt = disabledTime();
  const h = pendingHour.value ?? selectedTime.value?.getHours() ?? 0;
  return dt.disabledMinutes?.(h) ?? [];
});

const disabledSeconds = computed<number[]>(() => {
  if (!disabledTime) return [];
  const dt = disabledTime();
  const h = pendingHour.value ?? selectedTime.value?.getHours() ?? 0;
  const m = pendingMinute.value ?? selectedTime.value?.getMinutes() ?? 0;
  return dt.disabledSeconds?.(h, m) ?? [];
});

// ─────────────────────────────────────────────
// Column data
// ─────────────────────────────────────────────
const hours = computed(() => {
  const list: number[] = [];
  if (use12Hours) {
    for (let i = 1; i <= 12; i += hourStep) list.push(i);
  } else {
    for (let i = 0; i < 24; i += hourStep) list.push(i);
  }
  if (hideDisabledOptions) {
    return list.filter((h) => !disabledHours.value.includes(use12Hours ? to24Hour(h, pendingAmpm.value ?? 'AM') : h));
  }
  return list;
});

const minutes = computed(() => {
  const list: number[] = [];
  for (let i = 0; i < 60; i += minuteStep) list.push(i);
  if (hideDisabledOptions) {
    return list.filter((m) => !disabledMinutes.value.includes(m));
  }
  return list;
});

const seconds = computed(() => {
  const list: number[] = [];
  for (let i = 0; i < 60; i += secondStep) list.push(i);
  if (hideDisabledOptions) {
    return list.filter((s) => !disabledSeconds.value.includes(s));
  }
  return list;
});

function to24Hour(h12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function to12Hour(h24: number): { hour: number; period: 'AM' | 'PM' } {
  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  const hour = h24 % 12 || 12;
  return { hour, period };
}

// ─────────────────────────────────────────────
// Panel open/close
// ─────────────────────────────────────────────
function openPanel() {
  if (disabled) return;
  isOpen.value = true;
  isPanelOpen.value = true;
  emit('openChange', true);
  panelEl.value?.showPopover?.();
  syncPendingFromValue();
  nextTick(() => scrollToSelected());
}

function closePanel() {
  isOpen.value = false;
  isPanelOpen.value = false;
  emit('openChange', false);
  panelEl.value?.hidePopover?.();
  inputEl.value?.focus();
}

function togglePanel() {
  if (isPanelOpen.value) closePanel();
  else openPanel();
}

function handlePopoverToggle(e: Event) {
  const toggleEvent = e as ToggleEvent;
  const nowOpen = toggleEvent.newState === 'open';
  isOpen.value = nowOpen;
  isPanelOpen.value = nowOpen;
  if (!nowOpen) emit('openChange', false);
}

// ─────────────────────────────────────────────
// Sync pending state
// ─────────────────────────────────────────────
function syncPendingFromValue() {
  const t = selectedTime.value;
  if (t) {
    if (use12Hours) {
      const { hour, period } = to12Hour(t.getHours());
      pendingHour.value = hour;
      pendingAmpm.value = period;
    } else {
      pendingHour.value = t.getHours();
    }
    pendingMinute.value = t.getMinutes();
    pendingSecond.value = t.getSeconds();
  } else {
    pendingHour.value = null;
    pendingMinute.value = null;
    pendingSecond.value = null;
    pendingAmpm.value = null;
  }
}

// ─────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────
function selectHour(h: number) {
  const h24 = use12Hours ? to24Hour(h, pendingAmpm.value ?? 'AM') : h;
  if (disabledHours.value.includes(h24)) return;
  pendingHour.value = h;
  if (!needConfirm && !changeOnScroll) applyPendingIfComplete();
  else if (changeOnScroll) applyPending();
}

function selectMinute(m: number) {
  if (disabledMinutes.value.includes(m)) return;
  pendingMinute.value = m;
  if (!needConfirm && !changeOnScroll) applyPendingIfComplete();
  else if (changeOnScroll) applyPending();
}

function selectSecond(s: number) {
  if (disabledSeconds.value.includes(s)) return;
  pendingSecond.value = s;
  if (!needConfirm && !changeOnScroll) applyPendingIfComplete();
  else if (changeOnScroll) applyPending();
}

function selectAmpm(val: 'AM' | 'PM') {
  pendingAmpm.value = val;
  if (!needConfirm && !changeOnScroll) applyPendingIfComplete();
  else if (changeOnScroll) applyPending();
}

function applyPendingIfComplete() {
  if (pendingHour.value !== null && pendingMinute.value !== null) {
    if (showSecond && pendingSecond.value === null) return;
    if (use12Hours && pendingAmpm.value === null) return;
    applyPending();
    closePanel();
  }
}

function applyPending() {
  const h = pendingHour.value ?? 0;
  const m = pendingMinute.value ?? 0;
  const s = pendingSecond.value ?? 0;
  const h24 = use12Hours ? to24Hour(h, pendingAmpm.value ?? 'AM') : h;

  const d = new Date();
  d.setHours(h24, m, s, 0);
  selectedTime.value = d;
  inputText.value = formatTime(d);
  emit('change', d, formatTime(d));
}

function handleOk() {
  applyPending();
  closePanel();
}

function handleNow() {
  const now = new Date();
  if (use12Hours) {
    const { hour, period } = to12Hour(now.getHours());
    pendingHour.value = hour;
    pendingAmpm.value = period;
  } else {
    pendingHour.value = now.getHours();
  }
  pendingMinute.value = now.getMinutes();
  pendingSecond.value = now.getSeconds();
  nextTick(() => scrollToSelected());
  if (!needConfirm) {
    applyPending();
    closePanel();
  }
}

function handleClear(e: Event) {
  e.stopPropagation();
  selectedTime.value = null;
  inputText.value = '';
  pendingHour.value = null;
  pendingMinute.value = null;
  pendingSecond.value = null;
  pendingAmpm.value = null;
  emit('change', null, '');
}

// ─────────────────────────────────────────────
// Input handling
// ─────────────────────────────────────────────
function handleInputChange(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  inputText.value = val;
}

function handleInputBlur() {
  if (!isPanelOpen.value) {
    const parsed = parseTimeString(inputText.value);
    if (parsed) {
      selectedTime.value = parsed;
      inputText.value = formatTime(parsed);
      emit('change', parsed, formatTime(parsed));
    } else if (inputText.value === '') {
      selectedTime.value = null;
      emit('change', null, '');
    } else {
      inputText.value = formatTime(selectedTime.value);
    }
  }
}

function handleInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    if (!isPanelOpen.value) {
      e.preventDefault();
      openPanel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const parsed = parseTimeString(inputText.value);
      if (parsed) {
        selectedTime.value = parsed;
        inputText.value = formatTime(parsed);
        emit('change', parsed, formatTime(parsed));
      }
      closePanel();
    }
  } else if (e.key === 'Escape') {
    if (isPanelOpen.value) {
      e.preventDefault();
      closePanel();
    }
  }
}

// ─────────────────────────────────────────────
// Panel keyboard navigation
// ─────────────────────────────────────────────
function handlePanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closePanel();
    return;
  }

  if (e.key === 'Tab') {
    const columns: ('hour' | 'minute' | 'second' | 'ampm')[] = [];
    if (showHour) columns.push('hour');
    if (showMinute) columns.push('minute');
    if (showSecond) columns.push('second');
    if (use12Hours) columns.push('ampm');

    const idx = columns.indexOf(focusedColumn.value);
    if (e.shiftKey) {
      if (idx > 0) {
        e.preventDefault();
        focusedColumn.value = columns[idx - 1];
      }
    } else {
      if (idx < columns.length - 1) {
        e.preventDefault();
        focusedColumn.value = columns[idx + 1];
      }
    }
    return;
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const delta = e.key === 'ArrowUp' ? -1 : 1;
    adjustFocusedColumn(delta);
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    handleOk();
  }
}

function adjustFocusedColumn(delta: number) {
  if (focusedColumn.value === 'hour') {
    const list = hours.value;
    const current = pendingHour.value ?? list[0];
    const idx = list.indexOf(current);
    const next = list[Math.max(0, Math.min(list.length - 1, idx + delta))];
    selectHour(next);
    scrollColumnTo(hourColEl.value, list.indexOf(next));
  } else if (focusedColumn.value === 'minute') {
    const list = minutes.value;
    const current = pendingMinute.value ?? list[0];
    const idx = list.indexOf(current);
    const next = list[Math.max(0, Math.min(list.length - 1, idx + delta))];
    selectMinute(next);
    scrollColumnTo(minuteColEl.value, list.indexOf(next));
  } else if (focusedColumn.value === 'second') {
    const list = seconds.value;
    const current = pendingSecond.value ?? list[0];
    const idx = list.indexOf(current);
    const next = list[Math.max(0, Math.min(list.length - 1, idx + delta))];
    selectSecond(next);
    scrollColumnTo(secondColEl.value, list.indexOf(next));
  } else if (focusedColumn.value === 'ampm') {
    const val = pendingAmpm.value === 'AM' ? 'PM' : 'AM';
    selectAmpm(val);
  }
}

// ─────────────────────────────────────────────
// Scroll helpers
// ─────────────────────────────────────────────
function scrollColumnTo(col: HTMLElement | null, idx: number) {
  if (!col || !col.scrollTo) return;
  const cellHeight = 28;
  col.scrollTo({ top: idx * cellHeight, behavior: 'smooth' });
}

function scrollToSelected() {
  if (pendingHour.value !== null) {
    const idx = hours.value.indexOf(pendingHour.value);
    if (idx >= 0) scrollColumnTo(hourColEl.value, idx);
  }
  if (pendingMinute.value !== null) {
    const idx = minutes.value.indexOf(pendingMinute.value);
    if (idx >= 0) scrollColumnTo(minuteColEl.value, idx);
  }
  if (pendingSecond.value !== null && showSecond) {
    const idx = seconds.value.indexOf(pendingSecond.value);
    if (idx >= 0) scrollColumnTo(secondColEl.value, idx);
  }
  if (pendingAmpm.value && use12Hours) {
    const idx = pendingAmpm.value === 'AM' ? 0 : 1;
    scrollColumnTo(ampmColEl.value, idx);
  }
}

// ─────────────────────────────────────────────
// Click outside
// ─────────────────────────────────────────────
function handleClickOutside(e: MouseEvent) {
  if (!isPanelOpen.value) return;
  const target = e.target as Node;
  if (panelEl.value?.contains(target)) return;
  if (inputEl.value?.parentElement?.contains(target)) return;
  closePanel();
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// ─────────────────────────────────────────────
// Watchers
// ─────────────────────────────────────────────
watch(
  () => open,
  (val) => {
    if (val !== undefined) {
      if (val) openPanel();
      else closePanel();
    }
  },
);

watch(selectedTime, (val) => {
  inputText.value = formatTime(val);
});

// Init display
inputText.value = formatTime(selectedTime.value);

// ─────────────────────────────────────────────
// Computed classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-time-picker',
  `b-time-picker--${size}`,
  `b-time-picker--${variant}`,
  {
    'b-time-picker--disabled': disabled,
    'b-time-picker--open': isPanelOpen.value,
    [`b-time-picker--${status}`]: !!status,
  },
]);

const isHourDisabled = (h: number) => {
  const h24 = use12Hours ? to24Hour(h, pendingAmpm.value ?? 'AM') : h;
  return disabledHours.value.includes(h24);
};
const isMinuteDisabled = (m: number) => disabledMinutes.value.includes(m);
const isSecondDisabled = (s: number) => disabledSeconds.value.includes(s);
</script>

<template>
  <div :class="rootClasses">
    <div
      class="b-time-picker__input-wrap"
      :style="{ anchorName }"
      @click="togglePanel"
    >
      <input
        :id="`b-time-picker-input-${componentUID}`"
        ref="inputEl"
        class="b-time-picker__input"
        type="text"
        role="combobox"
        :aria-expanded="isPanelOpen"
        aria-haspopup="dialog"
        :aria-controls="isPanelOpen ? `b-time-picker-panel-${componentUID}` : undefined"
        :aria-describedby="status ? `b-time-picker-status-${componentUID}` : undefined"
        :aria-label="placeholder"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="inputReadOnly"
        :value="inputText"
        autocomplete="off"
        @input="handleInputChange"
        @blur="handleInputBlur"
        @keydown="handleInputKeydown"
      />
      <span class="b-time-picker__suffix">
        <svg
          v-if="!allowClear || !selectedTime"
          class="b-time-picker__icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <button
          v-else
          class="b-time-picker__clear"
          type="button"
          aria-label="Clear time"
          tabindex="-1"
          @click="handleClear"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </button>
      </span>
      <span
        v-if="status"
        :id="`b-time-picker-status-${componentUID}`"
        class="b-time-picker__status-text"
        aria-live="polite"
      >
        {{ status }}
      </span>
    </div>

    <div
      :id="`b-time-picker-panel-${componentUID}`"
      ref="panelEl"
      class="b-time-picker__panel"
      popover
      role="dialog"
      :aria-label="'Time picker'"
      :aria-modal="true"
      :style="{ positionAnchor: anchorName }"
      @toggle="handlePopoverToggle"
      @keydown="handlePanelKeydown"
    >
      <div class="b-time-picker__columns" role="group" aria-label="Time selection columns">
        <!-- Hour Column -->
        <div
          v-if="showHour"
          ref="hourColEl"
          class="b-time-picker__column"
          role="listbox"
          :aria-label="'Hours'"
          :aria-activedescendant="pendingHour !== null ? `b-time-picker-hour-${pendingHour}-${componentUID}` : undefined"
        >
          <div
            v-for="h in hours"
            :id="`b-time-picker-hour-${h}-${componentUID}`"
            :key="h"
            class="b-time-picker__cell"
            :class="{
              'b-time-picker__cell--selected': pendingHour === h,
              'b-time-picker__cell--disabled': isHourDisabled(h),
              'b-time-picker__cell--focused': focusedColumn === 'hour' && pendingHour === h,
            }"
            role="option"
            :aria-selected="pendingHour === h"
            :aria-disabled="isHourDisabled(h)"
            @click="selectHour(h)"
          >
            {{ pad(h) }}
          </div>
        </div>

        <!-- Minute Column -->
        <div
          v-if="showMinute"
          ref="minuteColEl"
          class="b-time-picker__column"
          role="listbox"
          :aria-label="'Minutes'"
          :aria-activedescendant="pendingMinute !== null ? `b-time-picker-minute-${pendingMinute}-${componentUID}` : undefined"
        >
          <div
            v-for="m in minutes"
            :id="`b-time-picker-minute-${m}-${componentUID}`"
            :key="m"
            class="b-time-picker__cell"
            :class="{
              'b-time-picker__cell--selected': pendingMinute === m,
              'b-time-picker__cell--disabled': isMinuteDisabled(m),
              'b-time-picker__cell--focused': focusedColumn === 'minute' && pendingMinute === m,
            }"
            role="option"
            :aria-selected="pendingMinute === m"
            :aria-disabled="isMinuteDisabled(m)"
            @click="selectMinute(m)"
          >
            {{ pad(m) }}
          </div>
        </div>

        <!-- Second Column -->
        <div
          v-if="showSecond"
          ref="secondColEl"
          class="b-time-picker__column"
          role="listbox"
          :aria-label="'Seconds'"
          :aria-activedescendant="pendingSecond !== null ? `b-time-picker-second-${pendingSecond}-${componentUID}` : undefined"
        >
          <div
            v-for="s in seconds"
            :id="`b-time-picker-second-${s}-${componentUID}`"
            :key="s"
            class="b-time-picker__cell"
            :class="{
              'b-time-picker__cell--selected': pendingSecond === s,
              'b-time-picker__cell--disabled': isSecondDisabled(s),
              'b-time-picker__cell--focused': focusedColumn === 'second' && pendingSecond === s,
            }"
            role="option"
            :aria-selected="pendingSecond === s"
            :aria-disabled="isSecondDisabled(s)"
            @click="selectSecond(s)"
          >
            {{ pad(s) }}
          </div>
        </div>

        <!-- AM/PM Column -->
        <div
          v-if="use12Hours"
          ref="ampmColEl"
          class="b-time-picker__column b-time-picker__column--ampm"
          role="listbox"
          aria-label="AM/PM"
        >
          <div
            class="b-time-picker__cell"
            :class="{
              'b-time-picker__cell--selected': pendingAmpm === 'AM',
              'b-time-picker__cell--focused': focusedColumn === 'ampm' && pendingAmpm === 'AM',
            }"
            role="option"
            :aria-selected="pendingAmpm === 'AM'"
            @click="selectAmpm('AM')"
          >
            AM
          </div>
          <div
            class="b-time-picker__cell"
            :class="{
              'b-time-picker__cell--selected': pendingAmpm === 'PM',
              'b-time-picker__cell--focused': focusedColumn === 'ampm' && pendingAmpm === 'PM',
            }"
            role="option"
            :aria-selected="pendingAmpm === 'PM'"
            @click="selectAmpm('PM')"
          >
            PM
          </div>
        </div>
      </div>

      <div v-if="needConfirm || showNow" class="b-time-picker__footer">
        <button
          v-if="showNow"
          class="b-time-picker__now-btn"
          type="button"
          @click="handleNow"
        >
          Now
        </button>
        <button
          v-if="needConfirm"
          class="b-time-picker__ok-btn"
          type="button"
          @click="handleOk"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.b-time-picker {
  --b-time-picker-input-font-size: 14px;
  --b-time-picker-input-font-size-lg: 16px;
  --b-time-picker-input-font-size-sm: 14px;
  --b-time-picker-padding-block: 4px;
  --b-time-picker-padding-block-lg: 7px;
  --b-time-picker-padding-block-sm: 0px;
  --b-time-picker-padding-inline: 11px;
  --b-time-picker-padding-inline-lg: 11px;
  --b-time-picker-padding-inline-sm: 7px;
  --b-time-picker-border-color: #d9d9d9;
  --b-time-picker-hover-border-color: #4096ff;
  --b-time-picker-active-border-color: #1677ff;
  --b-time-picker-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-time-picker-error-active-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-time-picker-warning-active-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-time-picker-bg: #ffffff;
  --b-time-picker-hover-bg: #ffffff;
  --b-time-picker-active-bg: #ffffff;
  --b-time-picker-text-color: rgba(0, 0, 0, 0.88);
  --b-time-picker-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-time-picker-icon-color: rgba(0, 0, 0, 0.25);
  --b-time-picker-clear-color: rgba(0, 0, 0, 0.25);
  --b-time-picker-clear-hover-color: rgba(0, 0, 0, 0.45);
  --b-time-picker-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-time-picker-disabled-color: rgba(0, 0, 0, 0.25);
  --b-time-picker-panel-bg: #ffffff;
  --b-time-picker-panel-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-time-picker-cell-height: 28px;
  --b-time-picker-cell-width: 56px;
  --b-time-picker-cell-hover-bg: rgba(0, 0, 0, 0.04);
  --b-time-picker-cell-selected-bg: #e6f4ff;
  --b-time-picker-cell-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-time-picker-cell-disabled-color: rgba(0, 0, 0, 0.25);
  --b-time-picker-column-height: 224px;
  --b-time-picker-column-width: 56px;
  --b-time-picker-footer-bg: #ffffff;
  --b-time-picker-border-radius: 6px;
  --b-time-picker-panel-border-radius: 8px;
  --b-time-picker-transition-duration: 0.2s;
  --b-time-picker-z-index-popup: 1050;

  position: relative;
  display: inline-flex;
  width: 100%;
  max-width: 200px;
}

/* ──── Input Wrap ──── */
.b-time-picker__input-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--b-time-picker-bg);
  border: 1px solid var(--b-time-picker-border-color);
  border-radius: var(--b-time-picker-border-radius);
  padding: var(--b-time-picker-padding-block) var(--b-time-picker-padding-inline);
  cursor: pointer;
  transition:
    border-color var(--b-time-picker-transition-duration),
    box-shadow var(--b-time-picker-transition-duration),
    background var(--b-time-picker-transition-duration);
}

.b-time-picker__input-wrap:hover {
  border-color: var(--b-time-picker-hover-border-color);
  background: var(--b-time-picker-hover-bg);
}

.b-time-picker--open .b-time-picker__input-wrap {
  border-color: var(--b-time-picker-active-border-color);
  box-shadow: var(--b-time-picker-active-shadow);
  background: var(--b-time-picker-active-bg);
}

/* ──── Size Variants ──── */
.b-time-picker--sm .b-time-picker__input-wrap {
  padding: var(--b-time-picker-padding-block-sm) var(--b-time-picker-padding-inline-sm);
}

.b-time-picker--sm .b-time-picker__input {
  font-size: var(--b-time-picker-input-font-size-sm);
}

.b-time-picker--lg .b-time-picker__input-wrap {
  padding: var(--b-time-picker-padding-block-lg) var(--b-time-picker-padding-inline-lg);
}

.b-time-picker--lg .b-time-picker__input {
  font-size: var(--b-time-picker-input-font-size-lg);
}

/* ──── Variant Styles ──── */
.b-time-picker--filled .b-time-picker__input-wrap {
  background: rgba(0, 0, 0, 0.04);
  border-color: transparent;
}

.b-time-picker--filled .b-time-picker__input-wrap:hover {
  background: rgba(0, 0, 0, 0.06);
}

.b-time-picker--borderless .b-time-picker__input-wrap {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.b-time-picker--underlined .b-time-picker__input-wrap {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--b-time-picker-border-color);
}

.b-time-picker--underlined .b-time-picker__input-wrap:hover {
  border-bottom-color: var(--b-time-picker-hover-border-color);
}

.b-time-picker--underlined.b-time-picker--open .b-time-picker__input-wrap {
  border-bottom-color: var(--b-time-picker-active-border-color);
  box-shadow: none;
}

/* ──── Status ──── */
.b-time-picker--error .b-time-picker__input-wrap {
  border-color: #ff4d4f;
}

.b-time-picker--error.b-time-picker--open .b-time-picker__input-wrap {
  box-shadow: var(--b-time-picker-error-active-shadow);
}

.b-time-picker--warning .b-time-picker__input-wrap {
  border-color: #faad14;
}

.b-time-picker--warning.b-time-picker--open .b-time-picker__input-wrap {
  box-shadow: var(--b-time-picker-warning-active-shadow);
}

/* ──── Disabled ──── */
.b-time-picker--disabled .b-time-picker__input-wrap {
  background: var(--b-time-picker-disabled-bg);
  border-color: var(--b-time-picker-border-color);
  cursor: not-allowed;
  pointer-events: none;
}

.b-time-picker--disabled .b-time-picker__input {
  color: var(--b-time-picker-disabled-color);
  cursor: not-allowed;
}

/* ──── Input ──── */
.b-time-picker__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--b-time-picker-input-font-size);
  color: var(--b-time-picker-text-color);
  line-height: 1.5;
  padding: 0;
  min-width: 0;
}

.b-time-picker__input::placeholder {
  color: var(--b-time-picker-placeholder-color);
}

/* ──── Suffix / Icons ──── */
.b-time-picker__suffix {
  display: flex;
  align-items: center;
  margin-left: 4px;
  flex-shrink: 0;
}

.b-time-picker__icon {
  width: 14px;
  height: 14px;
  color: var(--b-time-picker-icon-color);
}

.b-time-picker__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--b-time-picker-clear-color);
  transition: color var(--b-time-picker-transition-duration);
}

.b-time-picker__clear:hover {
  color: var(--b-time-picker-clear-hover-color);
}

.b-time-picker__clear svg {
  width: 14px;
  height: 14px;
}

.b-time-picker__status-text {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

/* ──── Panel ──── */
.b-time-picker__panel {
  position: absolute;
  position-anchor: var(--b-time-picker-anchor);
  inset: unset;
  top: anchor(bottom);
  left: anchor(left);
  margin: 0;
  margin-top: 4px;
  padding: 0;
  border: none;
  border-radius: var(--b-time-picker-panel-border-radius);
  background: var(--b-time-picker-panel-bg);
  box-shadow: var(--b-time-picker-panel-shadow);
  z-index: var(--b-time-picker-z-index-popup);
  overflow: hidden;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity var(--b-time-picker-transition-duration) ease,
    transform var(--b-time-picker-transition-duration) ease;
}

.b-time-picker__panel:popover-open {
  opacity: 1;
  transform: translateY(0);
}

@starting-style {
  .b-time-picker__panel:popover-open {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* ──── Columns ──── */
.b-time-picker__columns {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.b-time-picker__column {
  width: var(--b-time-picker-column-width);
  height: var(--b-time-picker-column-height);
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #f0f0f0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.b-time-picker__column:last-child {
  border-right: none;
}

/* ──── Cells ──── */
.b-time-picker__cell {
  height: var(--b-time-picker-cell-height);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--b-time-picker-text-color);
  transition: background var(--b-time-picker-transition-duration);
  user-select: none;
}

.b-time-picker__cell:hover {
  background: var(--b-time-picker-cell-hover-bg);
}

.b-time-picker__cell--selected {
  background: var(--b-time-picker-cell-selected-bg);
  font-weight: 600;
}

.b-time-picker__cell--focused {
  outline: 2px solid var(--b-time-picker-active-border-color);
  outline-offset: -2px;
}

.b-time-picker__cell--disabled {
  color: var(--b-time-picker-cell-disabled-color);
  background: var(--b-time-picker-cell-disabled-bg);
  cursor: not-allowed;
}

.b-time-picker__cell--disabled:hover {
  background: var(--b-time-picker-cell-disabled-bg);
}

/* ──── Footer ──── */
.b-time-picker__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  background: var(--b-time-picker-footer-bg);
}

.b-time-picker__now-btn {
  border: none;
  background: none;
  color: var(--b-time-picker-active-border-color);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background var(--b-time-picker-transition-duration);
}

.b-time-picker__now-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.b-time-picker__ok-btn {
  border: none;
  background: var(--b-time-picker-active-border-color);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 12px;
  border-radius: 4px;
  font-weight: 500;
  line-height: 1.5;
  transition:
    background var(--b-time-picker-transition-duration),
    opacity var(--b-time-picker-transition-duration);
}

.b-time-picker__ok-btn:hover {
  opacity: 0.85;
}

/* ──── Placement ──── */
.b-time-picker--bottom-right .b-time-picker__panel {
  left: unset;
  right: anchor(right);
}

.b-time-picker--top-left .b-time-picker__panel {
  top: unset;
  bottom: anchor(top);
  margin-top: 0;
  margin-bottom: 4px;
}

.b-time-picker--top-right .b-time-picker__panel {
  top: unset;
  bottom: anchor(top);
  left: unset;
  right: anchor(right);
  margin-top: 0;
  margin-bottom: 4px;
}

/* ──── Dark Mode ──── */
[data-prefers-color='dark'] .b-time-picker,
[data-theme='dark'] .b-time-picker {
  --b-time-picker-bg: #141414;
  --b-time-picker-hover-bg: #141414;
  --b-time-picker-active-bg: #141414;
  --b-time-picker-border-color: #424242;
  --b-time-picker-hover-border-color: #165dff;
  --b-time-picker-active-border-color: #1668dc;
  --b-time-picker-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-time-picker-text-color: rgba(255, 255, 255, 0.85);
  --b-time-picker-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-time-picker-icon-color: rgba(255, 255, 255, 0.3);
  --b-time-picker-clear-color: rgba(255, 255, 255, 0.3);
  --b-time-picker-clear-hover-color: rgba(255, 255, 255, 0.55);
  --b-time-picker-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-time-picker-disabled-color: rgba(255, 255, 255, 0.25);
  --b-time-picker-panel-bg: #1f1f1f;
  --b-time-picker-panel-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-time-picker-cell-hover-bg: rgba(255, 255, 255, 0.08);
  --b-time-picker-cell-selected-bg: #111a2c;
  --b-time-picker-cell-disabled-bg: rgba(255, 255, 255, 0.04);
  --b-time-picker-cell-disabled-color: rgba(255, 255, 255, 0.25);
  --b-time-picker-footer-bg: #1f1f1f;
  --b-time-picker-error-active-shadow: 0 0 0 2px rgba(220, 56, 72, 0.15);
  --b-time-picker-warning-active-shadow: 0 0 0 2px rgba(217, 146, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-prefers-color]) .b-time-picker {
    --b-time-picker-bg: #141414;
    --b-time-picker-hover-bg: #141414;
    --b-time-picker-active-bg: #141414;
    --b-time-picker-border-color: #424242;
    --b-time-picker-hover-border-color: #165dff;
    --b-time-picker-active-border-color: #1668dc;
    --b-time-picker-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
    --b-time-picker-text-color: rgba(255, 255, 255, 0.85);
    --b-time-picker-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-time-picker-icon-color: rgba(255, 255, 255, 0.3);
    --b-time-picker-clear-color: rgba(255, 255, 255, 0.3);
    --b-time-picker-clear-hover-color: rgba(255, 255, 255, 0.55);
    --b-time-picker-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-time-picker-disabled-color: rgba(255, 255, 255, 0.25);
    --b-time-picker-panel-bg: #1f1f1f;
    --b-time-picker-panel-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 9px 28px 8px rgba(0, 0, 0, 0.2);
    --b-time-picker-cell-hover-bg: rgba(255, 255, 255, 0.08);
    --b-time-picker-cell-selected-bg: #111a2c;
    --b-time-picker-cell-disabled-bg: rgba(255, 255, 255, 0.04);
    --b-time-picker-cell-disabled-color: rgba(255, 255, 255, 0.25);
    --b-time-picker-footer-bg: #1f1f1f;
    --b-time-picker-error-active-shadow: 0 0 0 2px rgba(220, 56, 72, 0.15);
    --b-time-picker-warning-active-shadow: 0 0 0 2px rgba(217, 146, 0, 0.15);
  }
}

/* ──── Reduced Motion ──── */
@media (prefers-reduced-motion: reduce) {
  .b-time-picker,
  .b-time-picker * {
    --b-time-picker-transition-duration: 0ms;
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }

  .b-time-picker__column {
    scroll-behavior: auto;
  }
}
</style>
