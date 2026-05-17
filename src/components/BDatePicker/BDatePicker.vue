<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, ref, watch } from 'vue';

import {
  BDatePickerPlacement,
  BDatePickerSize,
  BDatePickerStatus,
  BDatePickerType,
  BDatePickerVariant,
  type BDatePickerDisabledDateInfo,
  type BDatePickerPreset,
} from './types';

const {
  picker = BDatePickerType.Date,
  size = BDatePickerSize.Medium,
  variant = BDatePickerVariant.Outlined,
  placeholder,
  disabled = false,
  inputReadOnly = false,
  allowClear = true,
  showNow = true,
  showWeek = false,
  format,
  locale,
  placement = BDatePickerPlacement.BottomLeft,
  status,
  presets,
  disabledDate,
  minDate,
  maxDate,
  defaultOpen = false,
  defaultValue,
  defaultPickerValue,
  open,
} = defineProps<{
  /** Picker type: date, week, month, quarter, year */
  picker?: `${BDatePickerType}`;
  /** Size of the input */
  size?: `${BDatePickerSize}`;
  /** Visual variant */
  variant?: `${BDatePickerVariant}`;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Make input read-only */
  inputReadOnly?: boolean;
  /** Show clear button */
  allowClear?: boolean;
  /** Show "Today" / "Now" button */
  showNow?: boolean;
  /** Show week number column (date picker) */
  showWeek?: boolean;
  /** Date format string (e.g. 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM-DD-YYYY') */
  format?: string;
  /** BCP 47 locale tag for formatting and calendar labels (e.g. 'en-US', 'vi-VN', 'de-DE') */
  locale?: string;
  /** Popup placement */
  placement?: `${BDatePickerPlacement}`;
  /** Validation status */
  status?: `${BDatePickerStatus}`;
  /** Preset quick-select values */
  presets?: BDatePickerPreset[];
  /** Function to determine if a date is disabled */
  disabledDate?: (current: Date, info: BDatePickerDisabledDateInfo) => boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Default open state */
  defaultOpen?: boolean;
  /** Default value (uncontrolled) */
  defaultValue?: Date;
  /** Default panel date */
  defaultPickerValue?: Date;
  /** Controlled open state */
  open?: boolean;
}>();

const model = defineModel<Date | null>({ default: undefined });

const emit = defineEmits<{
  change: [date: Date | null, dateString: string];
  openChange: [open: boolean];
  panelChange: [date: Date, mode: string];
  ok: [];
}>();

defineExpose({
  focus: () => inputEl.value?.focus(),
  blur: () => inputEl.value?.blur(),
});

const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-date-picker-${componentUID.value}`);

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const inputEl = ref<HTMLInputElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const isOpen = ref(defaultOpen);
const internalValue = ref<Date | null>(defaultValue ?? null);
const panelDate = ref<Date>(defaultPickerValue ?? defaultValue ?? new Date());
const panelMode = ref<string>(picker);
const hoveredDate = ref<Date | null>(null);

const selectedDate = computed({
  get: () => model.value ?? internalValue.value,
  set: (val) => {
    internalValue.value = val;
    model.value = val;
  },
});

const isPanelOpen = ref(open !== undefined ? !!open : defaultOpen);

// ─────────────────────────────────────────────
// Formatting & Locale
// ─────────────────────────────────────────────
const resolvedLocale = computed(() => {
  const tag = locale || navigator?.language || 'en-US';
  try {
    Intl.DateTimeFormat(tag);
    return tag;
  } catch {
    return 'en-US';
  }
});

const defaultFormats: Record<string, string> = {
  date: 'YYYY-MM-DD',
  week: 'YYYY-[W]wo',
  month: 'YYYY-MM',
  quarter: 'YYYY-[Q]Q',
  year: 'YYYY',
};

const activeFormat = computed(() => format ?? defaultFormats[picker] ?? 'YYYY-MM-DD');

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

function getWeekNumber(d: Date): number {
  const copy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  copy.setUTCDate(copy.getUTCDate() + 4 - (copy.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  let fmt = activeFormat.value;

  // Escape sequences: text inside [] is literal
  const DELIM = '￰';
  const literals: string[] = [];
  fmt = fmt.replace(/\[([^\]]*)\]/g, (_, text) => {
    literals.push(text);
    return `${DELIM}${literals.length - 1}${DELIM}`;
  });

  // Token replacement (longest tokens first to avoid partial matches)
  fmt = fmt.replace('YYYY', String(y));
  fmt = fmt.replace('YY', String(y).slice(-2));
  fmt = fmt.replace('MM', pad(m));
  fmt = fmt.replace('M', String(m));
  fmt = fmt.replace('DD', pad(d));
  fmt = fmt.replace('D', String(d));
  fmt = fmt.replace('wo', String(getWeekNumber(date)));
  fmt = fmt.replace('Q', String(Math.ceil(m / 3)));

  // Restore literals
  fmt = fmt.replace(new RegExp(`${DELIM}(\\d+)${DELIM}`, 'g'), (_, idx) => literals[Number(idx)]);

  return fmt;
}

function parseInput(value: string): Date | null {
  if (!value) return null;

  // Try parsing based on current format pattern
  const fmt = activeFormat.value;
  const parsed = parseByFormat(value, fmt);
  if (parsed) return parsed;

  // Fallback: ISO format
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback: native Date parsing
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function parseByFormat(value: string, fmt: string): Date | null {
  let regex = fmt.replace(/\[([^\]]*)\]/g, (_, text) => escapeRegex(text));
  const groups: { token: string; pos: number }[] = [];

  const tokenMap: [string, string][] = [
    ['YYYY', '(\\d{4})'],
    ['YY', '(\\d{2})'],
    ['MM', '(\\d{2})'],
    ['M', '(\\d{1,2})'],
    ['DD', '(\\d{2})'],
    ['D', '(\\d{1,2})'],
  ];

  for (const [token, pattern] of tokenMap) {
    const idx = regex.indexOf(token);
    if (idx !== -1) {
      regex = regex.replace(token, pattern);
      groups.push({ token, pos: idx });
    }
  }

  groups.sort((a, b) => a.pos - b.pos);

  regex = regex.replace('wo', '\\d{1,2}');
  regex = regex.replace('Q', '\\d');

  try {
    const match = value.match(new RegExp(`^${regex}$`));
    if (!match) return null;

    let year = new Date().getFullYear();
    let month = 1;
    let day = 1;

    groups.forEach(({ token }, i) => {
      const val = Number(match[i + 1]);
      switch (token) {
        case 'YYYY':
          year = val;
          break;
        case 'YY':
          year = 2000 + val;
          break;
        case 'MM':
        case 'M':
          month = val;
          break;
        case 'DD':
        case 'D':
          day = val;
          break;
      }
    });

    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return null;
    return date;
  } catch {
    return null;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const displayValue = computed(() => formatDate(selectedDate.value));

// ─────────────────────────────────────────────
// Locale-aware calendar labels
// ─────────────────────────────────────────────
const weekdayLabels = computed(() => {
  const loc = resolvedLocale.value;
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    // Jan 7, 2024 is a Sunday — offset by i to get Sun..Sat
    const day = new Date(2024, 0, 7 + i);
    labels.push(day.toLocaleDateString(loc, { weekday: 'short' }).slice(0, 2));
  }
  return labels;
});

const monthLabels = computed(() => {
  const loc = resolvedLocale.value;
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(loc, { month: 'short' }),
  );
});

const todayLabel = computed(() => {
  const loc = resolvedLocale.value;
  // Use Intl to get localized "Today" - fallback to English
  try {
    const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'auto' });
    const parts = rtf.formatToParts(0, 'day');
    const value = parts.find((p) => p.type === 'literal')?.value;
    if (value && value.trim()) return value.trim().charAt(0).toUpperCase() + value.trim().slice(1);
  } catch {
    /* fallback */
  }
  return 'Today';
});

// ─────────────────────────────────────────────
// Calendar data generation
// ─────────────────────────────────────────────
const calendarDates = computed(() => {
  const year = panelDate.value.getFullYear();
  const month = panelDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const dates: { date: Date; current: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    dates.push({ date: new Date(year, month, -i), current: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push({ date: new Date(year, month, i), current: true });
  }
  const remaining = 42 - dates.length;
  for (let i = 1; i <= remaining; i++) {
    dates.push({ date: new Date(year, month + 1, i), current: false });
  }
  return dates;
});

const calendarMonths = computed(() => {
  return monthLabels.value.map((label, idx) => ({
    label,
    month: idx,
    year: panelDate.value.getFullYear(),
  }));
});

const calendarYears = computed(() => {
  const year = panelDate.value.getFullYear();
  const decadeStart = Math.floor(year / 10) * 10;
  const years: { year: number; current: boolean }[] = [];
  for (let i = decadeStart - 1; i <= decadeStart + 10; i++) {
    years.push({ year: i, current: i >= decadeStart && i < decadeStart + 10 });
  }
  return years;
});

const calendarQuarters = computed(() => {
  const year = panelDate.value.getFullYear();
  return [1, 2, 3, 4].map((q) => ({ quarter: q, year, label: `Q${q}` }));
});

const panelHeading = computed(() => {
  const y = panelDate.value.getFullYear();
  const m = panelDate.value.getMonth();
  if (panelMode.value === 'date' || panelMode.value === 'week') {
    return `${monthLabels.value[m]} ${y}`;
  }
  if (panelMode.value === 'month' || panelMode.value === 'quarter') {
    return `${y}`;
  }
  if (panelMode.value === 'year') {
    const decadeStart = Math.floor(y / 10) * 10;
    return `${decadeStart} - ${decadeStart + 9}`;
  }
  return `${y}`;
});

// ─────────────────────────────────────────────
// Date checks
// ─────────────────────────────────────────────
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isSelected(d: Date): boolean {
  return selectedDate.value ? isSameDay(d, selectedDate.value) : false;
}

function isDateDisabled(d: Date): boolean {
  if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()))
    return true;
  if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()))
    return true;
  if (disabledDate) return disabledDate(d, { type: picker as `${BDatePickerType}` });
  return false;
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
  inputEl.value?.focus();
}

function closePanel() {
  isOpen.value = false;
  isPanelOpen.value = false;
  emit('openChange', false);
  panelEl.value?.hidePopover?.();
  inputEl.value?.focus();
}

function togglePanel() {
  if (isPanelOpen.value) {
    closePanel();
  } else {
    openPanel();
  }
}

function handlePopoverToggle(e: Event) {
  const toggleEvent = e as ToggleEvent;
  const nowOpen = toggleEvent.newState === 'open';
  isOpen.value = nowOpen;
  isPanelOpen.value = nowOpen;
  if (!nowOpen) {
    emit('openChange', false);
  }
}

// ─────────────────────────────────────────────
// Selection handlers
// ─────────────────────────────────────────────
function selectDate(d: Date) {
  if (isDateDisabled(d)) return;
  selectedDate.value = d;
  panelDate.value = new Date(d);
  emit('change', d, formatDate(d));
  closePanel();
}

function selectMonth(month: number) {
  if (picker === BDatePickerType.Month) {
    const d = new Date(panelDate.value.getFullYear(), month, 1);
    selectedDate.value = d;
    emit('change', d, formatDate(d));
    closePanel();
  } else {
    panelDate.value = new Date(panelDate.value.getFullYear(), month, 1);
    panelMode.value = 'date';
    emit('panelChange', panelDate.value, 'date');
  }
}

function selectYear(year: number) {
  if (picker === BDatePickerType.Year) {
    const d = new Date(year, 0, 1);
    selectedDate.value = d;
    emit('change', d, formatDate(d));
    closePanel();
  } else {
    panelDate.value = new Date(year, panelDate.value.getMonth(), 1);
    panelMode.value = picker === BDatePickerType.Month ? 'month' : 'date';
    emit('panelChange', panelDate.value, panelMode.value);
  }
}

function selectQuarter(quarter: number) {
  const d = new Date(panelDate.value.getFullYear(), (quarter - 1) * 3, 1);
  selectedDate.value = d;
  emit('change', d, formatDate(d));
  closePanel();
}

function selectToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectDate(today);
}

function selectPreset(preset: BDatePickerPreset) {
  const val = typeof preset.value === 'function' ? preset.value() : preset.value;
  selectDate(val);
}

function clearValue(e: Event) {
  e.stopPropagation();
  selectedDate.value = null;
  emit('change', null, '');
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
function prevMonth() {
  panelDate.value = new Date(panelDate.value.getFullYear(), panelDate.value.getMonth() - 1, 1);
}

function nextMonth() {
  panelDate.value = new Date(panelDate.value.getFullYear(), panelDate.value.getMonth() + 1, 1);
}

function prevYear() {
  panelDate.value = new Date(panelDate.value.getFullYear() - 1, panelDate.value.getMonth(), 1);
}

function nextYear() {
  panelDate.value = new Date(panelDate.value.getFullYear() + 1, panelDate.value.getMonth(), 1);
}

function prevDecade() {
  panelDate.value = new Date(panelDate.value.getFullYear() - 10, panelDate.value.getMonth(), 1);
}

function nextDecade() {
  panelDate.value = new Date(panelDate.value.getFullYear() + 10, panelDate.value.getMonth(), 1);
}

function switchPanelMode(mode: string) {
  panelMode.value = mode;
  emit('panelChange', panelDate.value, mode);
}

// ─────────────────────────────────────────────
// Input handling
// ─────────────────────────────────────────────
const inputText = ref('');

function handleInputChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  inputText.value = value;
}

function handleInputBlur() {
  if (inputText.value) {
    const parsed = parseInput(inputText.value);
    if (parsed && !isDateDisabled(parsed)) {
      selectedDate.value = parsed;
      panelDate.value = new Date(parsed);
      emit('change', parsed, formatDate(parsed));
    }
  }
  inputText.value = '';
}

function handleInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (!isPanelOpen.value) {
      openPanel();
    } else {
      handleInputBlur();
      closePanel();
    }
  } else if (e.key === 'Escape') {
    closePanel();
  } else if (e.key === 'ArrowDown' && !isPanelOpen.value) {
    openPanel();
  }
}

// ─────────────────────────────────────────────
// Keyboard navigation in panel
// ─────────────────────────────────────────────
function handlePanelKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closePanel();
    return;
  }

  if (panelMode.value === 'date' || panelMode.value === 'week') {
    handleDateKeydown(e);
  } else if (panelMode.value === 'month') {
    handleMonthKeydown(e);
  } else if (panelMode.value === 'year') {
    handleYearKeydown(e);
  }
}

function handleDateKeydown(e: KeyboardEvent) {
  const pd = new Date(panelDate.value);
  let moved = false;

  switch (e.key) {
    case 'ArrowLeft':
      pd.setDate(pd.getDate() - 1);
      moved = true;
      break;
    case 'ArrowRight':
      pd.setDate(pd.getDate() + 1);
      moved = true;
      break;
    case 'ArrowUp':
      pd.setDate(pd.getDate() - 7);
      moved = true;
      break;
    case 'ArrowDown':
      pd.setDate(pd.getDate() + 7);
      moved = true;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      selectDate(panelDate.value);
      return;
    case 'PageUp':
      if (e.shiftKey) {
        prevYear();
      } else {
        prevMonth();
      }
      e.preventDefault();
      return;
    case 'PageDown':
      if (e.shiftKey) {
        nextYear();
      } else {
        nextMonth();
      }
      e.preventDefault();
      return;
  }

  if (moved) {
    e.preventDefault();
    panelDate.value = pd;
  }
}

function handleMonthKeydown(e: KeyboardEvent) {
  const currentMonth = panelDate.value.getMonth();
  let newMonth = currentMonth;

  switch (e.key) {
    case 'ArrowLeft':
      newMonth = currentMonth - 1;
      break;
    case 'ArrowRight':
      newMonth = currentMonth + 1;
      break;
    case 'ArrowUp':
      newMonth = currentMonth - 3;
      break;
    case 'ArrowDown':
      newMonth = currentMonth + 3;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      selectMonth(currentMonth);
      return;
    default:
      return;
  }

  e.preventDefault();
  if (newMonth < 0) {
    panelDate.value = new Date(panelDate.value.getFullYear() - 1, 12 + newMonth, 1);
  } else if (newMonth > 11) {
    panelDate.value = new Date(panelDate.value.getFullYear() + 1, newMonth - 12, 1);
  } else {
    panelDate.value = new Date(panelDate.value.getFullYear(), newMonth, 1);
  }
}

function handleYearKeydown(e: KeyboardEvent) {
  const currentYear = panelDate.value.getFullYear();
  let newYear = currentYear;

  switch (e.key) {
    case 'ArrowLeft':
      newYear = currentYear - 1;
      break;
    case 'ArrowRight':
      newYear = currentYear + 1;
      break;
    case 'ArrowUp':
      newYear = currentYear - 3;
      break;
    case 'ArrowDown':
      newYear = currentYear + 3;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      selectYear(currentYear);
      return;
    default:
      return;
  }

  e.preventDefault();
  panelDate.value = new Date(newYear, panelDate.value.getMonth(), 1);
}

// ─────────────────────────────────────────────
// Computed panel mode checks
// ─────────────────────────────────────────────
const showDateGrid = computed(() => panelMode.value === 'date' || panelMode.value === 'week');
const showMonthGrid = computed(() => panelMode.value === 'month');
const showYearGrid = computed(() => panelMode.value === 'year');
const showQuarterGrid = computed(() => panelMode.value === 'quarter');

// ─────────────────────────────────────────────
// Placeholder
// ─────────────────────────────────────────────
const effectivePlaceholder = computed(() => {
  if (placeholder) return placeholder;
  const map: Record<string, string> = {
    date: 'Select date',
    week: 'Select week',
    month: 'Select month',
    quarter: 'Select quarter',
    year: 'Select year',
  };
  return map[picker] ?? 'Select date';
});

// ─────────────────────────────────────────────
// Watch for controlled open
// ─────────────────────────────────────────────
watch(
  () => open,
  (val) => {
    if (val !== undefined) {
      isPanelOpen.value = val;
      isOpen.value = val;
      if (val) {
        panelEl.value?.showPopover?.();
      } else {
        panelEl.value?.hidePopover?.();
      }
    }
  },
);

watch(isPanelOpen, (val) => {
  if (val) {
    panelMode.value = picker;
    if (selectedDate.value) {
      panelDate.value = new Date(selectedDate.value);
    }
  }
});
</script>

<template>
  <div
    class="b-date-picker"
    :class="[
      `b-date-picker--${size}`,
      `b-date-picker--${variant}`,
      {
        'b-date-picker--disabled': disabled,
        'b-date-picker--focused': isPanelOpen,
        'b-date-picker--clearable': allowClear && !!selectedDate && !disabled,
        'b-date-picker--error': status === BDatePickerStatus.Error,
        'b-date-picker--warning': status === BDatePickerStatus.Warning,
      },
    ]"
  >
    <!-- Input trigger -->
    <div class="b-date-picker__input-wrap" @click="togglePanel">
      <input
        ref="inputEl"
        class="b-date-picker__input"
        type="text"
        :value="inputText || displayValue"
        :placeholder="effectivePlaceholder"
        :disabled="disabled"
        :readonly="inputReadOnly"
        :aria-expanded="isPanelOpen"
        aria-haspopup="dialog"
        :aria-controls="isPanelOpen ? `b-date-picker-panel-${componentUID}` : undefined"
        role="combobox"
        autocomplete="off"
        @input="handleInputChange"
        @blur="handleInputBlur"
        @keydown="handleInputKeydown"
      />

      <!-- Clear button -->
      <button
        v-if="allowClear && selectedDate && !disabled"
        class="b-date-picker__clear"
        type="button"
        aria-label="Clear date"
        tabindex="-1"
        @click="clearValue"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path
            d="M8 1a7 7 0 110 14A7 7 0 018 1zm2.828 4.172a.5.5 0 00-.707 0L8 7.293 5.879 5.172a.5.5 0 10-.707.707L7.293 8l-2.121 2.121a.5.5 0 10.707.707L8 8.707l2.121 2.121a.5.5 0 10.707-.707L8.707 8l2.121-2.121a.5.5 0 000-.707z"
          />
        </svg>
      </button>

      <!-- Suffix icon -->
      <span class="b-date-picker__suffix" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M4.5 1a.5.5 0 01.5.5V2h6v-.5a.5.5 0 011 0V2h1.5A1.5 1.5 0 0115 3.5v10a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 011 13.5v-10A1.5 1.5 0 012.5 2H4v-.5a.5.5 0 01.5-.5zM14 6H2v7.5a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V6zm-1.5-3H12v.5a.5.5 0 01-1 0V3H5v.5a.5.5 0 01-1 0V3H2.5a.5.5 0 00-.5.5V5h12V3.5a.5.5 0 00-.5-.5z"
          />
        </svg>
      </span>
    </div>

    <!-- Panel (Popover API) -->
    <div
      :id="`b-date-picker-panel-${componentUID}`"
      ref="panelEl"
      class="b-date-picker__panel"
      popover
      role="dialog"
      :aria-label="`${picker} picker`"
      :aria-modal="true"
      @toggle="handlePopoverToggle"
      @keydown="handlePanelKeydown"
    >
      <div class="b-date-picker__panel-inner">
        <!-- Presets sidebar -->
        <div v-if="presets && presets.length" class="b-date-picker__presets">
          <button
            v-for="preset in presets"
            :key="preset.label"
            class="b-date-picker__preset-btn"
            type="button"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>

        <div class="b-date-picker__panel-main">
          <!-- Header -->
          <div class="b-date-picker__header">
            <button
              v-if="showDateGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Previous year"
              @click="prevYear"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M9.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L4.707 8l4.647-4.646z"
                />
                <path
                  d="M12.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L7.707 8l4.647-4.646z"
                />
              </svg>
            </button>
            <button
              v-if="showYearGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Previous decade"
              @click="prevDecade"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M9.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L4.707 8l4.647-4.646z"
                />
                <path
                  d="M12.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L7.707 8l4.647-4.646z"
                />
              </svg>
            </button>
            <button
              v-if="showDateGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Previous month"
              @click="prevMonth"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M10.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L5.707 8l4.647-4.646z"
                />
              </svg>
            </button>
            <button
              v-if="showMonthGrid || showQuarterGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Previous year"
              @click="prevYear"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M10.354 3.354a.5.5 0 00-.708-.708l-5 5a.5.5 0 000 .708l5 5a.5.5 0 00.708-.708L5.707 8l4.647-4.646z"
                />
              </svg>
            </button>

            <!-- Heading -->
            <button
              class="b-date-picker__heading"
              type="button"
              :aria-label="`Current view: ${panelHeading}`"
              @click="
                switchPanelMode(
                  panelMode === 'date' || panelMode === 'week'
                    ? 'month'
                    : panelMode === 'month' || panelMode === 'quarter'
                      ? 'year'
                      : 'year',
                )
              "
            >
              {{ panelHeading }}
            </button>

            <button
              v-if="showDateGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Next month"
              @click="nextMonth"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M5.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L10.293 8 5.646 3.354z"
                />
              </svg>
            </button>
            <button
              v-if="showMonthGrid || showQuarterGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Next year"
              @click="nextYear"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M5.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L10.293 8 5.646 3.354z"
                />
              </svg>
            </button>
            <button
              v-if="showDateGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Next year"
              @click="nextYear"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M5.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L10.293 8 5.646 3.354z"
                />
                <path
                  d="M2.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L7.293 8 2.646 3.354z"
                />
              </svg>
            </button>
            <button
              v-if="showYearGrid"
              class="b-date-picker__nav-btn"
              type="button"
              aria-label="Next decade"
              @click="nextDecade"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path
                  d="M5.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L10.293 8 5.646 3.354z"
                />
                <path
                  d="M2.646 3.354a.5.5 0 01.708-.708l5 5a.5.5 0 010 .708l-5 5a.5.5 0 01-.708-.708L7.293 8 2.646 3.354z"
                />
              </svg>
            </button>
          </div>

          <!-- Date grid -->
          <div v-if="showDateGrid" class="b-date-picker__body" role="grid" aria-label="Calendar">
            <div class="b-date-picker__weekdays" role="row">
              <div
                v-if="showWeek"
                class="b-date-picker__weekday b-date-picker__week-number-header"
                role="columnheader"
                aria-label="Week"
              >
                #
              </div>
              <div
                v-for="day in weekdayLabels"
                :key="day"
                class="b-date-picker__weekday"
                role="columnheader"
                :aria-label="day"
              >
                {{ day }}
              </div>
            </div>

            <div v-for="(row, rowIdx) in 6" :key="rowIdx" class="b-date-picker__row" role="row">
              <div v-if="showWeek" class="b-date-picker__cell b-date-picker__week-number">
                {{ getWeekNumber(calendarDates[rowIdx * 7].date) }}
              </div>
              <button
                v-for="(cell, colIdx) in calendarDates.slice(rowIdx * 7, rowIdx * 7 + 7)"
                :key="colIdx"
                class="b-date-picker__cell"
                :class="{
                  'b-date-picker__cell--other': !cell.current,
                  'b-date-picker__cell--today': isToday(cell.date),
                  'b-date-picker__cell--selected': isSelected(cell.date),
                  'b-date-picker__cell--disabled': isDateDisabled(cell.date),
                  'b-date-picker__cell--hovered': hoveredDate && isSameDay(cell.date, hoveredDate),
                }"
                type="button"
                :aria-label="`${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`"
                :aria-selected="isSelected(cell.date)"
                :aria-disabled="isDateDisabled(cell.date)"
                :disabled="isDateDisabled(cell.date)"
                :tabindex="isSameDay(cell.date, panelDate) ? 0 : -1"
                @click="selectDate(cell.date)"
                @mouseenter="hoveredDate = cell.date"
                @mouseleave="hoveredDate = null"
              >
                {{ cell.date.getDate() }}
              </button>
            </div>
          </div>

          <!-- Month grid -->
          <div
            v-if="showMonthGrid"
            class="b-date-picker__body b-date-picker__grid-3x4"
            role="grid"
            aria-label="Month selection"
          >
            <button
              v-for="item in calendarMonths"
              :key="item.month"
              class="b-date-picker__cell b-date-picker__cell--large"
              :class="{
                'b-date-picker__cell--selected':
                  selectedDate &&
                  selectedDate.getFullYear() === item.year &&
                  selectedDate.getMonth() === item.month,
                'b-date-picker__cell--current':
                  new Date().getMonth() === item.month && new Date().getFullYear() === item.year,
              }"
              type="button"
              :aria-label="item.label"
              :aria-selected="
                selectedDate?.getMonth() === item.month && selectedDate?.getFullYear() === item.year
              "
              @click="selectMonth(item.month)"
            >
              {{ item.label }}
            </button>
          </div>

          <!-- Year grid -->
          <div
            v-if="showYearGrid"
            class="b-date-picker__body b-date-picker__grid-3x4"
            role="grid"
            aria-label="Year selection"
          >
            <button
              v-for="item in calendarYears"
              :key="item.year"
              class="b-date-picker__cell b-date-picker__cell--large"
              :class="{
                'b-date-picker__cell--other': !item.current,
                'b-date-picker__cell--selected':
                  selectedDate && selectedDate.getFullYear() === item.year,
                'b-date-picker__cell--current': new Date().getFullYear() === item.year,
              }"
              type="button"
              :aria-label="String(item.year)"
              :aria-selected="selectedDate?.getFullYear() === item.year"
              @click="selectYear(item.year)"
            >
              {{ item.year }}
            </button>
          </div>

          <!-- Quarter grid -->
          <div
            v-if="showQuarterGrid"
            class="b-date-picker__body b-date-picker__grid-2x2"
            role="grid"
            aria-label="Quarter selection"
          >
            <button
              v-for="item in calendarQuarters"
              :key="item.quarter"
              class="b-date-picker__cell b-date-picker__cell--large"
              :class="{
                'b-date-picker__cell--selected':
                  selectedDate &&
                  Math.ceil((selectedDate.getMonth() + 1) / 3) === item.quarter &&
                  selectedDate.getFullYear() === item.year,
              }"
              type="button"
              :aria-label="`Quarter ${item.quarter}`"
              @click="selectQuarter(item.quarter)"
            >
              {{ item.label }}
            </button>
          </div>

          <!-- Footer -->
          <div
            v-if="showNow && (panelMode === 'date' || panelMode === 'week')"
            class="b-date-picker__footer"
          >
            <button class="b-date-picker__today-btn" type="button" @click="selectToday">
              {{ todayLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.b-date-picker {
  --b-date-picker-active-bg: #ffffff;
  --b-date-picker-active-border-color: #1677ff;
  --b-date-picker-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-date-picker-hover-bg: #ffffff;
  --b-date-picker-hover-border-color: #4096ff;
  --b-date-picker-cell-active-with-range-bg: #e6f4ff;
  --b-date-picker-cell-bg-disabled: rgba(0, 0, 0, 0.04);
  --b-date-picker-cell-height: 24px;
  --b-date-picker-cell-width: 36px;
  --b-date-picker-cell-hover-bg: rgba(0, 0, 0, 0.04);
  --b-date-picker-cell-hover-with-range-bg: #c8dfff;
  --b-date-picker-cell-range-border-color: #82b4f9;
  --b-date-picker-error-active-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-date-picker-warning-active-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-date-picker-input-font-size: 14px;
  --b-date-picker-input-font-size-lg: 16px;
  --b-date-picker-input-font-size-sm: 12px;
  --b-date-picker-padding-block: 4px;
  --b-date-picker-padding-block-lg: 7px;
  --b-date-picker-padding-block-sm: 0px;
  --b-date-picker-padding-inline: 11px;
  --b-date-picker-padding-inline-lg: 11px;
  --b-date-picker-padding-inline-sm: 7px;
  --b-date-picker-presets-width: 120px;
  --b-date-picker-presets-max-width: 200px;
  --b-date-picker-text-height: 40px;
  --b-date-picker-without-time-cell-height: 66px;
  --b-date-picker-z-index-popup: 1050;
  --b-date-picker-bg: #ffffff;
  --b-date-picker-border-color: #d9d9d9;
  --b-date-picker-border-radius: 6px;
  --b-date-picker-text-color: rgba(0, 0, 0, 0.88);
  --b-date-picker-text-color-secondary: rgba(0, 0, 0, 0.45);
  --b-date-picker-text-color-disabled: rgba(0, 0, 0, 0.25);
  --b-date-picker-panel-bg: #ffffff;
  --b-date-picker-panel-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-date-picker-selected-bg: #1677ff;
  --b-date-picker-selected-color: #ffffff;
  --b-date-picker-today-border-color: #1677ff;
  --b-date-picker-transition-duration: 200ms;

  position: relative;
  display: inline-flex;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--b-date-picker-input-font-size);
  color: var(--b-date-picker-text-color);
}

.b-date-picker--sm .b-date-picker__input-wrap {
  height: 24px;
  padding: var(--b-date-picker-padding-block-sm) var(--b-date-picker-padding-inline-sm);
  font-size: var(--b-date-picker-input-font-size-sm);
}
.b-date-picker--md .b-date-picker__input-wrap {
  height: 32px;
  padding: var(--b-date-picker-padding-block) var(--b-date-picker-padding-inline);
  font-size: var(--b-date-picker-input-font-size);
}
.b-date-picker--lg .b-date-picker__input-wrap {
  height: 40px;
  padding: var(--b-date-picker-padding-block-lg) var(--b-date-picker-padding-inline-lg);
  font-size: var(--b-date-picker-input-font-size-lg);
}

.b-date-picker__input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 120px;
  background: var(--b-date-picker-bg);
  border: 1px solid var(--b-date-picker-border-color);
  border-radius: var(--b-date-picker-border-radius);
  cursor: pointer;
  transition:
    border-color var(--b-date-picker-transition-duration),
    box-shadow var(--b-date-picker-transition-duration);
  anchor-name: v-bind('anchorName');
}

.b-date-picker__input-wrap:hover:not(.b-date-picker--disabled .b-date-picker__input-wrap) {
  border-color: var(--b-date-picker-hover-border-color);
  background: var(--b-date-picker-hover-bg);
}

.b-date-picker--focused .b-date-picker__input-wrap {
  border-color: var(--b-date-picker-active-border-color);
  box-shadow: var(--b-date-picker-active-shadow);
  background: var(--b-date-picker-active-bg);
}

.b-date-picker--filled .b-date-picker__input-wrap {
  background: rgba(0, 0, 0, 0.04);
  border-color: transparent;
}
.b-date-picker--filled.b-date-picker--focused .b-date-picker__input-wrap {
  background: var(--b-date-picker-active-bg);
  border-color: var(--b-date-picker-active-border-color);
}

.b-date-picker--borderless .b-date-picker__input-wrap {
  border-color: transparent;
  box-shadow: none;
}
.b-date-picker--borderless.b-date-picker--focused .b-date-picker__input-wrap {
  box-shadow: none;
}

.b-date-picker--underlined .b-date-picker__input-wrap {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--b-date-picker-border-color);
}
.b-date-picker--underlined.b-date-picker--focused .b-date-picker__input-wrap {
  border-bottom-color: var(--b-date-picker-active-border-color);
  box-shadow: none;
}

.b-date-picker--error .b-date-picker__input-wrap {
  border-color: #ff4d4f;
}
.b-date-picker--error.b-date-picker--focused .b-date-picker__input-wrap {
  box-shadow: var(--b-date-picker-error-active-shadow);
}
.b-date-picker--warning .b-date-picker__input-wrap {
  border-color: #faad14;
}
.b-date-picker--warning.b-date-picker--focused .b-date-picker__input-wrap {
  box-shadow: var(--b-date-picker-warning-active-shadow);
}

.b-date-picker--disabled .b-date-picker__input-wrap {
  background: rgba(0, 0, 0, 0.04);
  cursor: not-allowed;
  opacity: 0.6;
}

.b-date-picker__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: inherit;
  min-width: 0;
}
.b-date-picker__input::placeholder {
  color: var(--b-date-picker-text-color-secondary);
}

.b-date-picker__suffix {
  display: flex;
  align-items: center;
  color: var(--b-date-picker-text-color-secondary);
  flex-shrink: 0;
}
.b-date-picker__suffix svg {
  width: 14px;
  height: 14px;
}

.b-date-picker__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--b-date-picker-text-color-secondary);
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity var(--b-date-picker-transition-duration);
}
.b-date-picker__clear svg {
  width: 14px;
  height: 14px;
}
.b-date-picker--clearable:hover .b-date-picker__clear {
  opacity: 1;
}
.b-date-picker--clearable:hover .b-date-picker__suffix {
  opacity: 0;
}
.b-date-picker--clearable:not(:hover) .b-date-picker__suffix {
  opacity: 1;
}

.b-date-picker__panel {
  position: absolute;
  margin: 0;
  border: none;
  padding: 0;
  background: transparent;
  overflow: visible;
  z-index: var(--b-date-picker-z-index-popup);

  position-anchor: v-bind('anchorName');
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 4px;

  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity var(--b-date-picker-transition-duration),
    transform var(--b-date-picker-transition-duration),
    display var(--b-date-picker-transition-duration);
  transition-behavior: allow-discrete;
}

.b-date-picker__panel:popover-open {
  opacity: 1;
  transform: translateY(0);

  @starting-style {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.b-date-picker__panel-inner {
  display: flex;
  background: var(--b-date-picker-panel-bg);
  border-radius: var(--b-date-picker-border-radius);
  box-shadow: var(--b-date-picker-panel-shadow);
}

.b-date-picker__presets {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  min-width: var(--b-date-picker-presets-width);
  max-width: var(--b-date-picker-presets-max-width);
}
.b-date-picker__preset-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--b-date-picker-text-color);
  white-space: nowrap;
  transition: background var(--b-date-picker-transition-duration);
}
.b-date-picker__preset-btn:hover {
  background: var(--b-date-picker-cell-hover-bg);
}

.b-date-picker__panel-main {
  padding: 8px;
  min-width: 280px;
}

.b-date-picker__header {
  display: flex;
  align-items: center;
  padding: 0 4px 8px;
}
.b-date-picker__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: var(--b-date-picker-text-color-secondary);
  transition:
    color var(--b-date-picker-transition-duration),
    background var(--b-date-picker-transition-duration);
}
.b-date-picker__nav-btn:hover {
  color: var(--b-date-picker-text-color);
  background: var(--b-date-picker-cell-hover-bg);
}
.b-date-picker__nav-btn svg {
  width: 12px;
  height: 12px;
}
.b-date-picker__heading {
  flex: 1;
  text-align: center;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  color: var(--b-date-picker-text-color);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background var(--b-date-picker-transition-duration);
}
.b-date-picker__heading:hover {
  background: var(--b-date-picker-cell-hover-bg);
}

.b-date-picker__body {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 4px;
}

.b-date-picker__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}
.b-date-picker__weekdays:has(.b-date-picker__week-number-header) {
  grid-template-columns: 32px repeat(7, 1fr);
}
.b-date-picker__weekday {
  padding: 4px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--b-date-picker-text-color-secondary);
}
.b-date-picker__week-number-header {
  color: var(--b-date-picker-text-color-disabled);
}

.b-date-picker__row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.b-date-picker__row:has(.b-date-picker__week-number) {
  grid-template-columns: 32px repeat(7, 1fr);
}
.b-date-picker__week-number {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--b-date-picker-text-color-disabled);
}

.b-date-picker__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--b-date-picker-cell-width);
  height: var(--b-date-picker-cell-height);
  margin: 2px auto;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  color: var(--b-date-picker-text-color);
  transition:
    background var(--b-date-picker-transition-duration),
    color var(--b-date-picker-transition-duration);
}
.b-date-picker__cell:hover:not(:disabled) {
  background: var(--b-date-picker-cell-hover-bg);
}
.b-date-picker__cell--other {
  color: var(--b-date-picker-text-color-disabled);
}
.b-date-picker__cell--today {
  border: 1px solid var(--b-date-picker-today-border-color);
}
.b-date-picker__cell--selected {
  background: var(--b-date-picker-selected-bg) !important;
  color: var(--b-date-picker-selected-color) !important;
}
.b-date-picker__cell--disabled {
  color: var(--b-date-picker-text-color-disabled);
  background: var(--b-date-picker-cell-bg-disabled);
  cursor: not-allowed;
}
.b-date-picker__cell--current {
  border: 1px solid var(--b-date-picker-today-border-color);
}
.b-date-picker__cell--large {
  width: auto;
  height: var(--b-date-picker-without-time-cell-height);
  padding: 8px 12px;
}

.b-date-picker__grid-3x4 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.b-date-picker__grid-2x2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.b-date-picker__footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin-top: 4px;
}
.b-date-picker__today-btn {
  border: none;
  background: transparent;
  color: var(--b-date-picker-active-border-color);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background var(--b-date-picker-transition-duration);
}
.b-date-picker__today-btn:hover {
  background: var(--b-date-picker-cell-hover-bg);
}

[data-prefers-color='dark'] .b-date-picker,
[data-theme='dark'] .b-date-picker {
  --b-date-picker-bg: #141414;
  --b-date-picker-panel-bg: #1f1f1f;
  --b-date-picker-border-color: #424242;
  --b-date-picker-text-color: rgba(255, 255, 255, 0.88);
  --b-date-picker-text-color-secondary: rgba(255, 255, 255, 0.45);
  --b-date-picker-text-color-disabled: rgba(255, 255, 255, 0.25);
  --b-date-picker-hover-border-color: #3c89e8;
  --b-date-picker-active-border-color: #1668dc;
  --b-date-picker-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-date-picker-cell-hover-bg: rgba(255, 255, 255, 0.08);
  --b-date-picker-cell-bg-disabled: rgba(255, 255, 255, 0.08);
  --b-date-picker-selected-bg: #1668dc;
  --b-date-picker-today-border-color: #1668dc;
  --b-date-picker-panel-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-date-picker-hover-bg: #141414;
  --b-date-picker-active-bg: #141414;
}

@media (prefers-reduced-motion: reduce) {
  .b-date-picker,
  .b-date-picker__panel,
  .b-date-picker__cell,
  .b-date-picker__input-wrap,
  .b-date-picker__clear,
  .b-date-picker__nav-btn,
  .b-date-picker__heading,
  .b-date-picker__preset-btn,
  .b-date-picker__today-btn {
    transition-duration: 0ms !important;
  }
}
</style>
