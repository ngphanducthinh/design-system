<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useComponentId } from '@/composables/useComponentId';
import BModal from '@/components/BModal/BModal.vue';

import type {
  BCalendarCellSlotScope,
  BCalendarEvent,
  BCalendarEventDetailsSlotScope,
  BCalendarHeaderSlotScope,
  BCalendarMode,
  BCalendarSelectInfo,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  modelValue,
  defaultValue,
  mode,
  defaultMode = 'month',
  fullscreen = true,
  showWeek = false,
  validRange,
  locale,
  disabledDate,
  ariaLabel = 'Calendar',
  events,
  showEventDetails = true,
  maxEventsVisible = 3,
} = defineProps<{
  /**
   * Controlled selected date. Pair with `v-model` for two-way binding.
   * AntD: `value`.
   */
  modelValue?: Date | null;
  /**
   * Initial selected date when uncontrolled.
   * AntD: `defaultValue`.
   */
  defaultValue?: Date;
  /**
   * Controlled panel mode (month / year). When omitted, the component
   * manages its own mode starting from `defaultMode`.
   * AntD: `mode`.
   */
  mode?: BCalendarMode;
  /**
   * Initial panel mode when uncontrolled.
   * @default 'month'
   */
  defaultMode?: BCalendarMode;
  /**
   * Full-screen layout when `true`, mini layout when `false`.
   * AntD: `fullscreen`.
   * @default true
   */
  fullscreen?: boolean;
  /**
   * Show a week-number column in month mode.
   * AntD: `showWeek`.
   * @default false
   */
  showWeek?: boolean;
  /**
   * Inclusive [start, end] range outside which dates are disabled.
   * AntD: `validRange`.
   */
  validRange?: [Date, Date];
  /**
   * BCP 47 locale tag for weekday / month labels (e.g. `'en-US'`, `'vi-VN'`).
   * AntD: `locale` (object). We accept a locale string and use Intl.
   */
  locale?: string;
  /**
   * Predicate to disable specific dates.
   * AntD: `disabledDate`.
   */
  disabledDate?: (date: Date) => boolean;
  /** Accessible label for the calendar root region. */
  ariaLabel?: string;
  /**
   * Returns events for a given date. When provided, event titles are auto-rendered
   * inside each day cell (unless the `dateCell` slot replaces them).
   */
  events?: (date: Date) => BCalendarEvent[];
  /**
   * Open a details modal when clicking a date that has events.
   * Set `false` to keep clicks selection-only.
   * @default true
   */
  showEventDetails?: boolean;
  /**
   * Maximum number of events shown inline per day cell. Extra events collapse
   * into a "+N more" indicator (full list is still available in the modal).
   * @default 3
   */
  maxEventsVisible?: number;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Two-way binding for the selected date. */
  'update:modelValue': [date: Date];
  /** Two-way binding for the panel mode. */
  'update:mode': [mode: BCalendarMode];
  /** Fires when the selected date changes. AntD: `onChange`. */
  change: [date: Date];
  /** Fires on date / month / year selection. AntD: `onSelect`. */
  select: [date: Date, info: BCalendarSelectInfo];
  /** Fires when panel value or mode changes. AntD: `onPanelChange`. */
  panelChange: [date: Date, mode: BCalendarMode];
}>();

// ─────────────────────────────────────────────
// Slots (parity with AntD render props)
// ─────────────────────────────────────────────
defineSlots<{
  /** Custom header. AntD: `headerRender`. */
  header?(scope: BCalendarHeaderSlotScope): unknown;
  /** Inject extra content into a date cell. AntD: `cellRender` (date). */
  dateCell?(scope: BCalendarCellSlotScope): unknown;
  /** Inject extra content into a month cell. AntD: `cellRender` (month). */
  monthCell?(scope: BCalendarCellSlotScope): unknown;
  /** Replace the entire date cell. AntD: `fullCellRender` / `dateFullCellRender`. */
  dateFullCell?(scope: BCalendarCellSlotScope): unknown;
  /** Replace the entire month cell. AntD: `fullCellRender` / `monthFullCellRender`. */
  monthFullCell?(scope: BCalendarCellSlotScope): unknown;
  /** Replace the contents of the event-details modal. */
  eventDetails?(scope: BCalendarEventDetailsSlotScope): unknown;
}>();

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const ROOT_ID = `b-calendar-${componentUID.value}`;

const internalValue = ref<Date | null>(defaultValue ?? null);
const internalMode = ref<BCalendarMode>(defaultMode);
// The currently displayed panel anchor. Always a real Date (today as fallback).
const panelDate = ref<Date>(stripTime(defaultValue ?? modelValue ?? new Date()));

const isControlledValue = computed(() => modelValue !== undefined);
const isControlledMode = computed(() => mode !== undefined);

const selectedDate = computed<Date | null>(() =>
  isControlledValue.value ? (modelValue ?? null) : internalValue.value,
);

const activeMode = computed<BCalendarMode>(() =>
  isControlledMode.value ? (mode as BCalendarMode) : internalMode.value,
);

watch(
  () => modelValue,
  (val) => {
    if (val) panelDate.value = stripTime(val);
  },
);

// ─────────────────────────────────────────────
// Locale helpers
// ─────────────────────────────────────────────
const resolvedLocale = computed(() => {
  const tag =
    locale ??
    (typeof navigator !== 'undefined' ? navigator.language : undefined) ??
    'en-US';
  try {
    Intl.DateTimeFormat(tag);
    return tag;
  } catch {
    return 'en-US';
  }
});

const weekdayLabels = computed(() => {
  const loc = resolvedLocale.value;
  // Sunday-start: 2024-01-07 is a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + i).toLocaleDateString(loc, { weekday: 'short' }),
  );
});

const monthLabels = computed(() => {
  const loc = resolvedLocale.value;
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(loc, { month: fullscreen ? 'long' : 'short' }),
  );
});

const monthLabelsShort = computed(() => {
  const loc = resolvedLocale.value;
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2024, i, 1).toLocaleDateString(loc, { month: 'short' }),
  );
});

const todayLabel = computed(() => {
  try {
    const rtf = new Intl.RelativeTimeFormat(resolvedLocale.value, { numeric: 'auto' });
    const v = rtf.formatToParts(0, 'day').find((p) => p.type === 'literal')?.value;
    if (v && v.trim()) return v.trim().charAt(0).toUpperCase() + v.trim().slice(1);
  } catch {
    /* no-op */
  }
  return 'Today';
});

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────
function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getWeekNumber(d: Date): number {
  const c = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  c.setUTCDate(c.getUTCDate() + 4 - (c.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(c.getUTCFullYear(), 0, 1));
  return Math.ceil(((c.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isOutOfValidRange(d: Date): boolean {
  if (!validRange) return false;
  const start = stripTime(validRange[0]);
  const end = stripTime(validRange[1]);
  const t = stripTime(d);
  return t < start || t > end;
}

function isDateDisabled(d: Date): boolean {
  if (isOutOfValidRange(d)) return true;
  if (disabledDate) return disabledDate(d);
  return false;
}

function isMonthDisabled(year: number, month: number): boolean {
  // Month is disabled only when no day in it falls inside the valid range.
  if (!validRange) return false;
  const startMonth = new Date(validRange[0].getFullYear(), validRange[0].getMonth(), 1);
  const endMonth = new Date(validRange[1].getFullYear(), validRange[1].getMonth(), 1);
  const m = new Date(year, month, 1);
  return m < startMonth || m > endMonth;
}

// ─────────────────────────────────────────────
// Grid generation
// ─────────────────────────────────────────────
const today = computed(() => stripTime(new Date()));

interface DateCell {
  date: Date;
  outside: boolean;
}

const monthGrid = computed<DateCell[]>(() => {
  const year = panelDate.value.getFullYear();
  const month = panelDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0..6 (Sunday-start)
  const cells: DateCell[] = [];

  // Leading days from previous month.
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), outside: true });
  }
  // Current month.
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), outside: false });
  }
  // Trailing days to fill 6 weeks (42 cells).
  let trailing = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, trailing++), outside: true });
  }
  return cells;
});

const monthRows = computed(() => {
  const rows: DateCell[][] = [];
  const cells = monthGrid.value;
  for (let i = 0; i < 6; i++) rows.push(cells.slice(i * 7, i * 7 + 7));
  return rows;
});

const yearGrid = computed(() => {
  const year = panelDate.value.getFullYear();
  return Array.from({ length: 12 }, (_, i) => ({
    date: new Date(year, i, 1),
    month: i,
    year,
  }));
});

const headerYearOptions = computed(() => {
  const center = panelDate.value.getFullYear();
  const min = validRange ? validRange[0].getFullYear() : center - 10;
  const max = validRange ? validRange[1].getFullYear() : center + 10;
  const out: number[] = [];
  for (let y = min; y <= max; y++) out.push(y);
  return out;
});

const headerMonthOptions = computed(() =>
  monthLabels.value.map((label, idx) => ({
    label,
    value: idx,
    disabled: isMonthDisabled(panelDate.value.getFullYear(), idx),
  })),
);

const panelYear = computed(() => panelDate.value.getFullYear());
const panelMonth = computed(() => panelDate.value.getMonth());

// ─────────────────────────────────────────────
// Events feature
// ─────────────────────────────────────────────
function getEventsForDate(date: Date): BCalendarEvent[] {
  if (!events) return [];
  try {
    return events(date) ?? [];
  } catch {
    return [];
  }
}

const eventModalOpen = ref(false);
const modalDate = ref<Date | null>(null);
const modalEvents = computed<BCalendarEvent[]>(() =>
  modalDate.value ? getEventsForDate(modalDate.value) : [],
);

function closeEventModal() {
  eventModalOpen.value = false;
}

const modalDateLabel = computed(() => {
  if (!modalDate.value) return '';
  try {
    return modalDate.value.toLocaleDateString(resolvedLocale.value, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return formatISODate(modalDate.value);
  }
});

// ─────────────────────────────────────────────
// Behavior
// ─────────────────────────────────────────────
function setSelected(date: Date) {
  if (!isControlledValue.value) {
    internalValue.value = date;
  }
  emit('update:modelValue', date);
  emit('change', date);
}

function setMode(next: BCalendarMode) {
  if (!isControlledMode.value) {
    internalMode.value = next;
  }
  emit('update:mode', next);
  emit('panelChange', panelDate.value, next);
}

function setPanelDate(date: Date) {
  panelDate.value = stripTime(date);
  emit('panelChange', panelDate.value, activeMode.value);
}

function selectDate(date: Date) {
  if (isDateDisabled(date)) return;
  panelDate.value = stripTime(date);
  setSelected(stripTime(date));
  emit('select', stripTime(date), { source: 'date' });
  if (showEventDetails && events) {
    const list = getEventsForDate(date);
    if (list.length > 0) {
      modalDate.value = stripTime(date);
      eventModalOpen.value = true;
    }
  }
}

function selectMonth(year: number, month: number) {
  if (isMonthDisabled(year, month)) return;
  const date = new Date(year, month, 1);
  panelDate.value = date;
  if (activeMode.value === 'year') {
    // Drill down: go to month view, no actual selection yet.
    setMode('month');
    emit('select', date, { source: 'month' });
  } else {
    setSelected(date);
    emit('select', date, { source: 'month' });
  }
}

function onYearSelectChange(e: Event) {
  const y = Number((e.target as HTMLSelectElement).value);
  if (Number.isNaN(y)) return;
  const next = new Date(y, panelDate.value.getMonth(), 1);
  panelDate.value = next;
  emit('select', next, { source: 'year' });
  emit('panelChange', next, activeMode.value);
}

function onMonthSelectChange(e: Event) {
  const m = Number((e.target as HTMLSelectElement).value);
  if (Number.isNaN(m)) return;
  const next = new Date(panelDate.value.getFullYear(), m, 1);
  panelDate.value = next;
  emit('panelChange', next, activeMode.value);
}

function onModeChange(e: Event) {
  setMode((e.target as HTMLInputElement).value as BCalendarMode);
}

function selectToday() {
  const t = stripTime(new Date());
  panelDate.value = t;
  setSelected(t);
  emit('select', t, { source: 'date' });
}

// ─────────────────────────────────────────────
// Keyboard navigation (month grid)
// ─────────────────────────────────────────────
const focusedDate = ref<Date | null>(null);
const gridRef = ref<HTMLElement | null>(null);

function onCellKeydown(e: KeyboardEvent, cell: DateCell) {
  let delta = 0;
  switch (e.key) {
    case 'ArrowLeft':
      delta = -1;
      break;
    case 'ArrowRight':
      delta = 1;
      break;
    case 'ArrowUp':
      delta = -7;
      break;
    case 'ArrowDown':
      delta = 7;
      break;
    case 'PageUp':
      delta = e.shiftKey ? -365 : -30;
      break;
    case 'PageDown':
      delta = e.shiftKey ? 365 : 30;
      break;
    case 'Home':
      e.preventDefault();
      moveFocusTo(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
      return;
    case 'End': {
      e.preventDefault();
      const eom = new Date(cell.date.getFullYear(), cell.date.getMonth() + 1, 0);
      moveFocusTo(eom);
      return;
    }
    case 'Enter':
    case ' ':
      e.preventDefault();
      selectDate(cell.date);
      return;
    default:
      return;
  }
  e.preventDefault();
  const next = new Date(cell.date);
  next.setDate(next.getDate() + delta);
  moveFocusTo(next);
}

function moveFocusTo(date: Date) {
  if (!isSameMonth(date, panelDate.value)) {
    panelDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
    emit('panelChange', panelDate.value, activeMode.value);
  }
  focusedDate.value = stripTime(date);
  // Wait one tick so the rendered cell with new tabindex=0 can be focused.
  queueMicrotask(() => {
    const sel = `[data-b-calendar-date="${formatISODate(date)}"]`;
    const el = gridRef.value?.querySelector<HTMLElement>(sel);
    el?.focus();
  });
}

function formatISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isCellFocusable(cell: DateCell): boolean {
  // Roving tabindex anchor: focusedDate || selectedDate || today (clamped to current panel).
  const anchor = focusedDate.value ?? selectedDate.value ?? today.value;
  if (isSameMonth(anchor, panelDate.value)) {
    return isSameDay(cell.date, anchor) && !cell.outside;
  }
  // Anchor is in another month: pick first non-outside day of the panel.
  const firstOfMonth = new Date(panelDate.value.getFullYear(), panelDate.value.getMonth(), 1);
  return isSameDay(cell.date, firstOfMonth) && !cell.outside;
}

// ─────────────────────────────────────────────
// Header scope (for custom slot)
// ─────────────────────────────────────────────
const headerScope = computed<BCalendarHeaderSlotScope>(() => ({
  value: panelDate.value,
  mode: activeMode.value,
  onTypeChange: setMode,
  onChange: setPanelDate,
}));

// ─────────────────────────────────────────────
// Cell scope helper
// ─────────────────────────────────────────────
function dateCellScope(cell: DateCell): BCalendarCellSlotScope {
  return {
    date: cell.date,
    selected: !!selectedDate.value && isSameDay(cell.date, selectedDate.value),
    today: isSameDay(cell.date, today.value),
    outside: cell.outside,
    disabled: isDateDisabled(cell.date),
  };
}

function monthCellScope(year: number, month: number): BCalendarCellSlotScope {
  const date = new Date(year, month, 1);
  return {
    date,
    selected:
      !!selectedDate.value &&
      selectedDate.value.getFullYear() === year &&
      selectedDate.value.getMonth() === month,
    today: today.value.getFullYear() === year && today.value.getMonth() === month,
    outside: false,
    disabled: isMonthDisabled(year, month),
  };
}

// ─────────────────────────────────────────────
// Expose
// ─────────────────────────────────────────────
defineExpose({
  /** Programmatically select a date. */
  select: (d: Date) => selectDate(d),
  /** Programmatically change the panel mode. */
  setMode,
  /** Move the panel to a specific date without selecting. */
  goTo: setPanelDate,
});
</script>

<template>
  <section
    :id="ROOT_ID"
    class="b-calendar"
    :class="{
      'b-calendar--fullscreen': fullscreen,
      'b-calendar--mini': !fullscreen,
      'b-calendar--mode-month': activeMode === 'month',
      'b-calendar--mode-year': activeMode === 'year',
      'b-calendar--show-week': showWeek,
    }"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- ── Header ── -->
    <header v-if="$slots.header" class="b-calendar__header">
      <slot name="header" v-bind="headerScope" />
    </header>
    <header v-else class="b-calendar__header">
      <div class="b-calendar__header-controls">
        <label class="b-calendar__sr-only" :for="`${ROOT_ID}-year`">Year</label>
        <span class="b-calendar__select-wrapper">
          <select
            :id="`${ROOT_ID}-year`"
            class="b-calendar__select b-calendar__select--year"
            :value="panelYear"
            aria-label="Select year"
            @change="onYearSelectChange"
          >
            <option v-for="y in headerYearOptions" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </span>

        <template v-if="activeMode === 'month'">
          <label class="b-calendar__sr-only" :for="`${ROOT_ID}-month`">Month</label>
          <span class="b-calendar__select-wrapper">
            <select
              :id="`${ROOT_ID}-month`"
              class="b-calendar__select b-calendar__select--month"
              :value="panelMonth"
              aria-label="Select month"
              @change="onMonthSelectChange"
            >
              <option
                v-for="opt in headerMonthOptions"
                :key="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </option>
            </select>
          </span>
        </template>

        <div
          class="b-calendar__mode-switch"
          role="radiogroup"
          aria-label="Calendar mode"
        >
          <label
            class="b-calendar__mode-option"
            :class="{ 'b-calendar__mode-option--active': activeMode === 'month' }"
          >
            <input
              type="radio"
              :name="`${ROOT_ID}-mode`"
              value="month"
              :checked="activeMode === 'month'"
              class="b-calendar__sr-only"
              @change="onModeChange"
            />
            <span>Month</span>
          </label>
          <label
            class="b-calendar__mode-option"
            :class="{ 'b-calendar__mode-option--active': activeMode === 'year' }"
          >
            <input
              type="radio"
              :name="`${ROOT_ID}-mode`"
              value="year"
              :checked="activeMode === 'year'"
              class="b-calendar__sr-only"
              @change="onModeChange"
            />
            <span>Year</span>
          </label>
        </div>
      </div>
      <button
        type="button"
        class="b-calendar__today-btn"
        @click="selectToday"
      >
        {{ todayLabel }}
      </button>
    </header>

    <!-- ── Body ── -->
    <div class="b-calendar__body">
      <!-- Month grid -->
      <table
        v-if="activeMode === 'month'"
        ref="gridRef"
        class="b-calendar__table"
        role="grid"
        :aria-label="`${ariaLabel} dates`"
      >
        <thead>
          <tr role="row">
            <th
              v-if="showWeek"
              class="b-calendar__weekday b-calendar__weekday--week"
              scope="col"
              aria-label="Week"
            >
              #
            </th>
            <th
              v-for="day in weekdayLabels"
              :key="day"
              class="b-calendar__weekday"
              scope="col"
              :aria-label="day"
            >
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in monthRows" :key="ri" role="row">
            <td
              v-if="showWeek"
              class="b-calendar__week-number"
              role="rowheader"
            >
              {{ getWeekNumber(row[0].date) }}
            </td>
            <td
              v-for="cell in row"
              :key="formatISODate(cell.date)"
              class="b-calendar__cell"
              :class="{
                'b-calendar__cell--outside': cell.outside,
                'b-calendar__cell--today': isSameDay(cell.date, today),
                'b-calendar__cell--selected': dateCellScope(cell).selected,
                'b-calendar__cell--disabled': isDateDisabled(cell.date),
              }"
              role="gridcell"
              :aria-selected="dateCellScope(cell).selected || undefined"
              :aria-disabled="isDateDisabled(cell.date) || undefined"
              :aria-current="isSameDay(cell.date, today) ? 'date' : undefined"
              :data-b-calendar-date="formatISODate(cell.date)"
              :tabindex="isCellFocusable(cell) ? 0 : -1"
              @click="!isDateDisabled(cell.date) && selectDate(cell.date)"
              @keydown="onCellKeydown($event, cell)"
            >
              <slot
                v-if="$slots.dateFullCell"
                name="dateFullCell"
                v-bind="dateCellScope(cell)"
              />
              <div v-else class="b-calendar__date">
                <div class="b-calendar__date-value">{{ cell.date.getDate() }}</div>
                <div class="b-calendar__date-content">
                  <slot
                    v-if="$slots.dateCell"
                    name="dateCell"
                    v-bind="dateCellScope(cell)"
                  />
                  <template v-else-if="events && getEventsForDate(cell.date).length > 0">
                    <ul class="b-calendar__events">
                      <li
                        v-for="(ev, idx) in getEventsForDate(cell.date).slice(0, maxEventsVisible)"
                        :key="idx"
                        class="b-calendar__event"
                        :class="`b-calendar__event--${ev.type ?? 'default'}`"
                        :title="ev.title"
                      >
                        <span class="b-calendar__event-dot" aria-hidden="true" />
                        <span class="b-calendar__event-title">{{ ev.title }}</span>
                      </li>
                    </ul>
                    <div
                      v-if="getEventsForDate(cell.date).length > maxEventsVisible"
                      class="b-calendar__events-more"
                    >
                      +{{ getEventsForDate(cell.date).length - maxEventsVisible }} more
                    </div>
                  </template>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Year grid -->
      <table
        v-else
        class="b-calendar__table b-calendar__table--year"
        role="grid"
        :aria-label="`${ariaLabel} months`"
      >
        <tbody>
          <tr v-for="rowIdx in 4" :key="rowIdx" role="row">
            <td
              v-for="m in yearGrid.slice((rowIdx - 1) * 3, rowIdx * 3)"
              :key="m.month"
              class="b-calendar__cell b-calendar__cell--month"
              :class="{
                'b-calendar__cell--selected': monthCellScope(m.year, m.month).selected,
                'b-calendar__cell--today': monthCellScope(m.year, m.month).today,
                'b-calendar__cell--disabled': isMonthDisabled(m.year, m.month),
              }"
              role="gridcell"
              :aria-selected="monthCellScope(m.year, m.month).selected || undefined"
              :aria-disabled="isMonthDisabled(m.year, m.month) || undefined"
              :tabindex="
                monthCellScope(m.year, m.month).selected ||
                (!selectedDate && m.month === today.getMonth() && m.year === today.getFullYear())
                  ? 0
                  : -1
              "
              @click="!isMonthDisabled(m.year, m.month) && selectMonth(m.year, m.month)"
              @keydown.enter.prevent="selectMonth(m.year, m.month)"
              @keydown.space.prevent="selectMonth(m.year, m.month)"
            >
              <slot
                v-if="$slots.monthFullCell"
                name="monthFullCell"
                v-bind="monthCellScope(m.year, m.month)"
              />
              <div v-else class="b-calendar__month">
                <div class="b-calendar__month-value">{{ monthLabelsShort[m.month] }}</div>
                <div class="b-calendar__month-content">
                  <slot name="monthCell" v-bind="monthCellScope(m.year, m.month)" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Live region for screen readers ── -->
    <div class="b-calendar__sr-only" aria-live="polite" aria-atomic="true">
      {{ activeMode === 'month' ? monthLabels[panelMonth] : '' }} {{ panelYear }}
    </div>

    <!-- ── Event details modal ── -->
    <BModal
      v-if="showEventDetails && events"
      v-model="eventModalOpen"
      class="b-calendar__modal"
    >
      <slot
        v-if="$slots.eventDetails && modalDate"
        name="eventDetails"
        :date="modalDate"
        :events="modalEvents"
        :close="closeEventModal"
      />
      <div v-else-if="modalDate" class="b-calendar__modal-body">
        <header class="b-calendar__modal-header">
          <h3 class="b-calendar__modal-title">{{ modalDateLabel }}</h3>
          <button
            type="button"
            class="b-calendar__modal-close"
            aria-label="Close"
            @click="closeEventModal"
          >
            ×
          </button>
        </header>
        <ul v-if="modalEvents.length > 0" class="b-calendar__modal-events">
          <li
            v-for="(ev, idx) in modalEvents"
            :key="idx"
            class="b-calendar__modal-event"
            :class="`b-calendar__modal-event--${ev.type ?? 'default'}`"
          >
            <span class="b-calendar__event-dot" aria-hidden="true" />
            <div class="b-calendar__modal-event-text">
              <div class="b-calendar__modal-event-title">{{ ev.title }}</div>
              <div
                v-if="ev.description"
                class="b-calendar__modal-event-description"
              >
                {{ ev.description }}
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="b-calendar__modal-empty">No events.</p>
      </div>
    </BModal>
  </section>
</template>

<style>
/* ─────────────────────────────────────────────
   BCalendar - tokens scoped to .b-calendar
   ───────────────────────────────────────────── */
.b-calendar {
  /* ── AntD-aligned tokens ── */
  --b-calendar-full-bg: oklch(100% 0 0);
  --b-calendar-full-panel-bg: oklch(100% 0 0);
  --b-calendar-item-active-bg: oklch(95% 0.04 250);
  --b-calendar-mini-content-height: 256px;
  --b-calendar-month-control-width: 70px;
  --b-calendar-year-control-width: 80px;

  /* ── Local extras ── */
  --b-calendar-text-color: oklch(20% 0.005 260 / 88%);
  --b-calendar-text-color-secondary: oklch(45% 0.005 260);
  --b-calendar-text-color-disabled: oklch(50% 0.005 260);
  --b-calendar-border-color: oklch(85% 0.005 260);
  --b-calendar-border-radius: 8px;
  --b-calendar-cell-radius: 4px;
  --b-calendar-primary-color: oklch(54.6% 0.245 262.881);
  --b-calendar-primary-color-text: oklch(100% 0 0);
  --b-calendar-cell-hover-bg: oklch(95% 0.005 260);
  --b-calendar-cell-disabled-bg: oklch(96% 0.002 260);
  --b-calendar-padding: 16px;
  --b-calendar-font-size: 14px;
  --b-calendar-motion-duration: 200ms;
  --b-calendar-focus-ring: 0 0 0 2px oklch(54.6% 0.245 262.881 / 35%);

  /* ── Event tokens (WCAG-friendly defaults) ── */
  --b-calendar-event-color-default: oklch(45% 0.005 260);
  --b-calendar-event-color-success: oklch(48% 0.16 145);
  --b-calendar-event-color-info: oklch(50% 0.18 250);
  --b-calendar-event-color-warning: oklch(58% 0.16 75);
  --b-calendar-event-color-error: oklch(48% 0.21 25);

  position: relative;
  display: block;
  box-sizing: border-box;
  width: 100%;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--b-calendar-font-size);
  color: var(--b-calendar-text-color);
  background: var(--b-calendar-full-bg);
  border-radius: var(--b-calendar-border-radius);
}

.b-calendar--fullscreen {
  padding: var(--b-calendar-padding);
}

.b-calendar--mini {
  padding: 8px;
  border: 1px solid var(--b-calendar-border-color);
}

/* ── Header ── */
.b-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 0 12px;
  flex-wrap: wrap;
}

.b-calendar__header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.b-calendar__select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.b-calendar__select-wrapper::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  width: 8px;
  height: 8px;
  border: solid var(--b-calendar-text-color-secondary);
  border-width: 0 1.5px 1.5px 0;
  transform: translateY(-75%) rotate(45deg);
  pointer-events: none;
}

.b-calendar__select {
  appearance: none;
  -webkit-appearance: none;
  height: 28px;
  padding: 0 24px 0 11px;
  border: 1px solid var(--b-calendar-border-color);
  border-radius: var(--b-calendar-cell-radius);
  background-color: var(--b-calendar-full-bg);
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    border-color var(--b-calendar-motion-duration),
    background-color var(--b-calendar-motion-duration);
}

.b-calendar__select--year {
  min-width: var(--b-calendar-year-control-width);
}

.b-calendar__select--month {
  min-width: var(--b-calendar-month-control-width);
}

.b-calendar__select:hover {
  border-color: var(--b-calendar-primary-color);
}

.b-calendar__select:focus-visible {
  outline: none;
  border-color: var(--b-calendar-primary-color);
  box-shadow: var(--b-calendar-focus-ring);
}

.b-calendar__mode-switch {
  display: inline-flex;
  gap: 4px;
}

.b-calendar__mode-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid var(--b-calendar-border-color);
  border-radius: var(--b-calendar-cell-radius);
  background: transparent;
  cursor: pointer;
  transition:
    border-color var(--b-calendar-motion-duration),
    color var(--b-calendar-motion-duration);
}

.b-calendar__mode-option:hover {
  color: var(--b-calendar-primary-color);
  border-color: var(--b-calendar-primary-color);
}

.b-calendar__mode-option--active {
  border-color: var(--b-calendar-primary-color);
  color: var(--b-calendar-primary-color);
}

.b-calendar__mode-option:has(input:focus-visible) {
  box-shadow: var(--b-calendar-focus-ring);
}

.b-calendar__today-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--b-calendar-border-color);
  border-radius: var(--b-calendar-cell-radius);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    background var(--b-calendar-motion-duration),
    color var(--b-calendar-motion-duration);
}

.b-calendar__today-btn:hover {
  color: var(--b-calendar-primary-color);
  border-color: var(--b-calendar-primary-color);
}

.b-calendar__today-btn:focus-visible {
  outline: none;
  border-color: var(--b-calendar-primary-color);
  box-shadow: var(--b-calendar-focus-ring);
}

/* ── Body / table ── */
.b-calendar__body {
  background: var(--b-calendar-full-panel-bg);
}

.b-calendar--mini .b-calendar__body {
  min-height: var(--b-calendar-mini-content-height);
}

.b-calendar__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.b-calendar__weekday {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--b-calendar-text-color-secondary);
  text-align: right;
}

.b-calendar--mini .b-calendar__weekday {
  text-align: center;
  padding: 8px 0;
}

.b-calendar__weekday--week {
  width: 32px;
  text-align: center;
}

.b-calendar__week-number {
  width: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--b-calendar-text-color-disabled);
  vertical-align: top;
  padding-top: 8px;
}

.b-calendar__cell {
  padding: 0;
  vertical-align: top;
  cursor: pointer;
}

.b-calendar--mini .b-calendar__cell {
  text-align: center;
  padding: 0;
}

.b-calendar__cell:focus-visible {
  outline: none;
}

.b-calendar__cell:focus-visible .b-calendar__date,
.b-calendar__cell:focus-visible .b-calendar__month {
  box-shadow: var(--b-calendar-focus-ring);
  border-radius: var(--b-calendar-cell-radius);
}

.b-calendar__cell--outside .b-calendar__date-value {
  color: var(--b-calendar-text-color-disabled);
}

.b-calendar__cell--today .b-calendar__date,
.b-calendar__cell--today .b-calendar__month {
  border-top-color: var(--b-calendar-primary-color);
}

.b-calendar__cell--selected .b-calendar__date,
.b-calendar__cell--selected .b-calendar__month {
  border-top-color: var(--b-calendar-primary-color);
  background: var(--b-calendar-item-active-bg);
}

.b-calendar__cell--selected .b-calendar__date-value,
.b-calendar__cell--selected .b-calendar__month-value {
  color: var(--b-calendar-primary-color);
  font-weight: 600;
}

.b-calendar__cell--disabled {
  cursor: not-allowed;
}

.b-calendar__cell--disabled .b-calendar__date,
.b-calendar__cell--disabled .b-calendar__month {
  background: var(--b-calendar-cell-disabled-bg);
}

.b-calendar__cell--disabled .b-calendar__date-value,
.b-calendar__cell--disabled .b-calendar__month-value {
  color: var(--b-calendar-text-color-disabled);
}

.b-calendar__date {
  height: 116px;
  margin: 0 4px;
  padding: 4px 8px 0;
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--b-calendar-border-color);
  overflow: hidden;
  transition:
    border-color var(--b-calendar-motion-duration),
    background var(--b-calendar-motion-duration);
}

.b-calendar__cell:hover:not(.b-calendar__cell--disabled) .b-calendar__date,
.b-calendar__cell:hover:not(.b-calendar__cell--disabled) .b-calendar__month {
  background: var(--b-calendar-cell-hover-bg);
}

.b-calendar--mini .b-calendar__date {
  min-height: 24px;
  height: auto;
  margin: 0;
  padding: 4px 0;
  border-top: none;
  align-items: center;
  overflow: visible;
}

.b-calendar__date-value {
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 2px;
}

.b-calendar--mini .b-calendar__date-value {
  text-align: center;
}

.b-calendar__date-content {
  flex: 1;
  font-size: 12px;
  color: var(--b-calendar-text-color-secondary);
  overflow: hidden;
  min-height: 0;
}

.b-calendar--mini .b-calendar__date-content {
  display: none;
}

/* ── Year (month-grid) view ── */
.b-calendar__table--year .b-calendar__cell--month {
  padding: 0;
  text-align: left;
}

.b-calendar__month {
  min-height: 116px;
  margin: 0 4px;
  padding: 4px 8px 0;
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--b-calendar-border-color);
  transition:
    border-color var(--b-calendar-motion-duration),
    background var(--b-calendar-motion-duration);
}

.b-calendar--mini .b-calendar__month {
  min-height: 36px;
  margin: 0;
  padding: 8px 0;
  border-top: none;
  align-items: center;
}

.b-calendar__month-value {
  text-align: right;
  font-size: 14px;
  font-weight: 500;
}

.b-calendar--mini .b-calendar__month-value {
  text-align: center;
}

.b-calendar__month-content {
  flex: 1;
  font-size: 12px;
  color: var(--b-calendar-text-color-secondary);
}

.b-calendar--mini .b-calendar__month-content {
  display: none;
}

/* ── Visually hidden helper ── */
.b-calendar__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Events inside day cells ── */
.b-calendar__events {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.b-calendar__event {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px 4px;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 3px;
  color: var(--b-calendar-text-color);
  background: oklch(95% 0.005 260);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-calendar__event-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--b-event-color, var(--b-calendar-event-color-default));
}

.b-calendar__event--default {
  --b-event-color: var(--b-calendar-event-color-default);
}

.b-calendar__event--success {
  --b-event-color: var(--b-calendar-event-color-success);
}

.b-calendar__event--info {
  --b-event-color: var(--b-calendar-event-color-info);
}

.b-calendar__event--warning {
  --b-event-color: var(--b-calendar-event-color-warning);
}

.b-calendar__event--error {
  --b-event-color: var(--b-calendar-event-color-error);
}

.b-calendar__event-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-calendar__events-more {
  margin-top: 2px;
  padding: 0 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--b-calendar-text-color-secondary);
}

/* ── Event details modal ── */
.b-calendar__modal-body {
  min-width: 320px;
  max-width: 480px;
  color: var(--b-calendar-text-color);
}

.b-calendar__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.b-calendar__modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.b-calendar__modal-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--b-calendar-cell-radius);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  transition: background var(--b-calendar-motion-duration);
}

.b-calendar__modal-close:hover {
  background: var(--b-calendar-cell-hover-bg);
}

.b-calendar__modal-close:focus-visible {
  outline: none;
  box-shadow: var(--b-calendar-focus-ring);
}

.b-calendar__modal-events {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.b-calendar__modal-event {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--b-calendar-cell-radius);
  background: oklch(97% 0.003 260);
}

.b-calendar__modal-event--default {
  --b-event-color: var(--b-calendar-event-color-default);
}

.b-calendar__modal-event--success {
  --b-event-color: var(--b-calendar-event-color-success);
}

.b-calendar__modal-event--info {
  --b-event-color: var(--b-calendar-event-color-info);
}

.b-calendar__modal-event--warning {
  --b-event-color: var(--b-calendar-event-color-warning);
}

.b-calendar__modal-event--error {
  --b-event-color: var(--b-calendar-event-color-error);
}

.b-calendar__modal-event .b-calendar__event-dot {
  width: 10px;
  height: 10px;
  margin-top: 6px;
}

.b-calendar__modal-event-text {
  flex: 1;
  min-width: 0;
}

.b-calendar__modal-event-title {
  font-weight: 600;
  color: var(--b-event-color, inherit);
}

.b-calendar__modal-event-description {
  margin-top: 2px;
  color: var(--b-calendar-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.b-calendar__modal-empty {
  margin: 0;
  color: var(--b-calendar-text-color-secondary);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-calendar {
  --b-calendar-full-bg: oklch(20% 0.005 260);
  --b-calendar-full-panel-bg: oklch(20% 0.005 260);
  --b-calendar-item-active-bg: oklch(35% 0.06 262);
  --b-calendar-text-color: oklch(95% 0 0 / 88%);
  --b-calendar-text-color-secondary: oklch(95% 0 0 / 65%);
  --b-calendar-text-color-disabled: oklch(95% 0 0 / 50%);
  --b-calendar-border-color: oklch(35% 0.005 260);
  --b-calendar-cell-hover-bg: oklch(28% 0.005 260);
  --b-calendar-cell-disabled-bg: oklch(24% 0.005 260);
  --b-calendar-primary-color: oklch(58% 0.22 262);
  --b-calendar-event-color-default: oklch(75% 0.005 260);
  --b-calendar-event-color-success: oklch(72% 0.18 145);
  --b-calendar-event-color-info: oklch(72% 0.18 250);
  --b-calendar-event-color-warning: oklch(80% 0.16 75);
  --b-calendar-event-color-error: oklch(70% 0.21 25);
}

[data-prefers-color='dark'] .b-calendar__event {
  background: oklch(28% 0.005 260);
}

[data-prefers-color='dark'] .b-calendar__modal-event {
  background: oklch(25% 0.005 260);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-calendar {
    --b-calendar-full-bg: oklch(20% 0.005 260);
    --b-calendar-full-panel-bg: oklch(20% 0.005 260);
    --b-calendar-item-active-bg: oklch(35% 0.06 262);
    --b-calendar-text-color: oklch(95% 0 0 / 88%);
    --b-calendar-text-color-secondary: oklch(95% 0 0 / 45%);
    --b-calendar-text-color-disabled: oklch(95% 0 0 / 25%);
    --b-calendar-border-color: oklch(35% 0.005 260);
    --b-calendar-cell-hover-bg: oklch(28% 0.005 260);
    --b-calendar-cell-disabled-bg: oklch(24% 0.005 260);
    --b-calendar-primary-color: oklch(58% 0.22 262);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-calendar,
  .b-calendar__select,
  .b-calendar__cell,
  .b-calendar__mode-option,
  .b-calendar__today-btn {
    transition: none !important;
  }
}
</style>
