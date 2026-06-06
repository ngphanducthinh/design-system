<script setup lang="ts" generic="T">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';

interface BListboxOption<V> {
  /** Display label for the option. */
  label: string;
  /** Value associated with the option. */
  value: V;
  /** Whether the option is disabled and skipped by keyboard navigation. */
  disabled?: boolean;
  /** Optional group label — adjacent options sharing the same group are wrapped together. */
  group?: string;
}

const props = defineProps<{
  /** Array of selectable options. */
  options?: BListboxOption<T>[];
  /** Whether multiple options can be selected at once. */
  multiple?: boolean;
  /** Disables the entire listbox — no keyboard nav, no selection. */
  disabled?: boolean;
  /** Visual size preset. */
  size?: `${BCommonSize}`;
  /** Property name on each option that holds the value. Defaults to `'value'`. */
  valueKey?: string;
  /** Property name on each option that holds the label. Defaults to `'label'`. */
  labelKey?: string;
  /** Optional id for the root listbox element. Auto-generated if omitted. */
  id?: string;
}>();

const emit = defineEmits<{
  /** Emitted whenever the selection changes. Single value or array depending on `multiple`. */
  change: [value: T | T[]];
}>();

const model = defineModel<T | T[] | null>({ default: null });

// ─── Reactive accessors with defaults ───
const optionList = computed<BListboxOption<T>[]>(() => props.options ?? []);
const isMultiple = computed(() => props.multiple ?? false);
const isDisabled = computed(() => props.disabled ?? false);
const sizeClass = computed(() => props.size ?? BCommonSize.Medium);
const valueKeyName = computed(() => props.valueKey ?? 'value');
const labelKeyName = computed(() => props.labelKey ?? 'label');

const { componentUID } = useComponentId();
const listboxId = computed(() => props.id ?? `b-listbox-${componentUID.value}`);
const optionId = (index: number) => `${listboxId.value}-option-${index}`;

const listboxRef = ref<HTMLUListElement | null>(null);
const activeIndex = ref<number>(-1);

// Type-ahead buffer
const typeAheadBuffer = ref('');
let typeAheadTimer: ReturnType<typeof setTimeout> | null = null;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getOptionValue = (opt: BListboxOption<T>): T => {
  const key = valueKeyName.value;
  const fromKey = (opt as unknown as Record<string, T>)[key];
  return fromKey !== undefined ? fromKey : opt.value;
};

const getOptionLabel = (opt: BListboxOption<T>): string => {
  const key = labelKeyName.value;
  const raw = (opt as unknown as Record<string, unknown>)[key];
  if (typeof raw === 'string' && raw.length > 0) return raw;
  return opt.label;
};

const isOptionSelected = (opt: BListboxOption<T>): boolean => {
  const v = getOptionValue(opt);
  if (isMultiple.value) {
    return Array.isArray(model.value) && model.value.includes(v);
  }
  return model.value === v;
};

const isOptionDisabled = (opt: BListboxOption<T> | undefined): boolean => {
  if (!opt) return true;
  return !!opt.disabled || isDisabled.value;
};

// ─────────────────────────────────────────────
// Grouped rendering structure
// ─────────────────────────────────────────────
interface RenderRow {
  type: 'option';
  option: BListboxOption<T>;
  index: number;
  group?: string;
}
interface RenderGroup {
  type: 'group';
  group: string;
  rows: RenderRow[];
}
type RenderItem = RenderGroup | RenderRow;

const renderItems = computed<RenderItem[]>(() => {
  const result: RenderItem[] = [];
  let currentGroup: RenderGroup | null = null;
  optionList.value.forEach((opt, index) => {
    const row: RenderRow = { type: 'option', option: opt, index, group: opt.group };
    if (opt.group) {
      if (!currentGroup || currentGroup.group !== opt.group) {
        currentGroup = { type: 'group', group: opt.group, rows: [] };
        result.push(currentGroup);
      }
      currentGroup.rows.push(row);
    } else {
      currentGroup = null;
      result.push(row);
    }
  });
  return result;
});

// ─────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────
const selectIndex = (index: number) => {
  const opt = optionList.value[index];
  if (!opt || isOptionDisabled(opt)) return;
  const v = getOptionValue(opt);

  if (isMultiple.value) {
    const current = Array.isArray(model.value) ? [...model.value] : [];
    const i = current.indexOf(v);
    if (i === -1) {
      current.push(v);
    } else {
      current.splice(i, 1);
    }
    model.value = current;
    emit('change', current);
  } else {
    model.value = v;
    emit('change', v);
  }
};

// ─────────────────────────────────────────────
// Keyboard navigation
// ─────────────────────────────────────────────
const findNextEnabled = (from: number, dir: 1 | -1): number => {
  const list = optionList.value;
  if (list.length === 0) return -1;
  let i = from;
  for (let n = 0; n < list.length; n++) {
    i = (i + dir + list.length) % list.length;
    if (!isOptionDisabled(list[i])) return i;
  }
  return -1;
};

const findFirstEnabled = (): number => {
  const list = optionList.value;
  for (let i = 0; i < list.length; i++) {
    if (!isOptionDisabled(list[i])) return i;
  }
  return -1;
};

const findLastEnabled = (): number => {
  const list = optionList.value;
  for (let i = list.length - 1; i >= 0; i--) {
    if (!isOptionDisabled(list[i])) return i;
  }
  return -1;
};

const ensureActiveIndex = () => {
  const list = optionList.value;
  if (activeIndex.value === -1 || isOptionDisabled(list[activeIndex.value])) {
    activeIndex.value = findFirstEnabled();
  }
};

const scrollActiveIntoView = async () => {
  await nextTick();
  if (activeIndex.value < 0) return;
  if (!listboxRef.value) return;
  const escape = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape
    : (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  const el = listboxRef.value.querySelector<HTMLElement>(`#${escape(optionId(activeIndex.value))}`);
  // jsdom and some embedded environments don't implement scrollIntoView — guard so a
  // missing method (or a freak runtime error inside it) never propagates as an unhandled rejection.
  if (el && typeof el.scrollIntoView === 'function') {
    try {
      el.scrollIntoView({ block: 'nearest' });
    } catch {
      /* no-op — non-critical UX nicety */
    }
  }
};

const handleTypeAhead = (char: string) => {
  if (typeAheadTimer) clearTimeout(typeAheadTimer);
  typeAheadBuffer.value += char.toLowerCase();
  typeAheadTimer = setTimeout(() => {
    typeAheadBuffer.value = '';
  }, 500);

  const list = optionList.value;
  const buf = typeAheadBuffer.value;
  // For the first char of a new buffer, search starting AFTER the current active index;
  // for continued buffers, re-evaluate from the active index so the prefix still matches.
  const start = activeIndex.value === -1 ? 0 : activeIndex.value + (buf.length === 1 ? 1 : 0);
  for (let n = 0; n < list.length; n++) {
    const i = (start + n) % list.length;
    const opt = list[i];
    if (isOptionDisabled(opt)) continue;
    const lbl = getOptionLabel(opt).toLowerCase();
    if (lbl.startsWith(buf)) {
      activeIndex.value = i;
      void scrollActiveIntoView();
      return;
    }
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (isDisabled.value) return;
  if (optionList.value.length === 0) return;

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const from = activeIndex.value === -1 ? -1 : activeIndex.value;
      const next = findNextEnabled(from, 1);
      if (next !== -1) activeIndex.value = next;
      void scrollActiveIntoView();
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const from = activeIndex.value === -1 ? 0 : activeIndex.value;
      const next = findNextEnabled(from, -1);
      if (next !== -1) activeIndex.value = next;
      void scrollActiveIntoView();
      break;
    }
    case 'Home': {
      e.preventDefault();
      activeIndex.value = findFirstEnabled();
      void scrollActiveIntoView();
      break;
    }
    case 'End': {
      e.preventDefault();
      activeIndex.value = findLastEnabled();
      void scrollActiveIntoView();
      break;
    }
    case 'Enter':
    case ' ': {
      e.preventDefault();
      ensureActiveIndex();
      if (activeIndex.value !== -1) selectIndex(activeIndex.value);
      break;
    }
    default: {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleTypeAhead(e.key);
      }
    }
  }
};

// ─────────────────────────────────────────────
// Mouse interaction
// ─────────────────────────────────────────────
const handleOptionClick = (index: number) => {
  if (isDisabled.value) return;
  if (isOptionDisabled(optionList.value[index])) return;
  activeIndex.value = index;
  selectIndex(index);
};

const handleOptionMouseEnter = (index: number) => {
  if (isDisabled.value) return;
  if (isOptionDisabled(optionList.value[index])) return;
  activeIndex.value = index;
};

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
const handleFocus = () => {
  if (activeIndex.value === -1) {
    const selectedIdx = optionList.value.findIndex(
      (o) => isOptionSelected(o) && !isOptionDisabled(o),
    );
    activeIndex.value = selectedIdx !== -1 ? selectedIdx : findFirstEnabled();
  }
};

const focus = () => {
  listboxRef.value?.focus();
};

const focusOption = (value: T) => {
  const idx = optionList.value.findIndex((o) => getOptionValue(o) === value);
  if (idx !== -1 && !isOptionDisabled(optionList.value[idx])) {
    activeIndex.value = idx;
    listboxRef.value?.focus();
    void scrollActiveIntoView();
  }
};

defineExpose({ focus, focusOption });

// Reset active index if it becomes invalid after option list changes.
watch(
  () => optionList.value.length,
  (len) => {
    if (activeIndex.value >= len) activeIndex.value = -1;
  },
);

// Computed aria-activedescendant id
const activeDescendantId = computed(() =>
  activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
);

/**
 * `role="listbox"` requires an accessible name. Default to a generic "Options"
 * label; consumers override via fallthrough `aria-label` / `aria-labelledby`.
 */
const attrs = useAttrs();
const fallbackAriaLabel = computed(() => {
  if (attrs['aria-label'] || attrs['aria-labelledby']) return undefined;
  return 'Options';
});
</script>

<template>
  <ul
    :id="listboxId"
    ref="listboxRef"
    role="listbox"
    class="b-listbox"
    :class="[
      `b-listbox--${sizeClass}`,
      {
        'b-listbox--disabled': isDisabled,
        'b-listbox--multiple': isMultiple,
      },
    ]"
    :tabindex="isDisabled ? -1 : 0"
    :aria-label="fallbackAriaLabel"
    :aria-multiselectable="isMultiple || undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-activedescendant="activeDescendantId"
    @keydown="handleKeydown"
    @focus="handleFocus"
  >
    <template v-for="(item, idx) in renderItems" :key="idx">
      <!-- Group wrapper -->
      <li v-if="item.type === 'group'" role="presentation" class="b-listbox__group">
        <span class="b-listbox__group-label" :aria-hidden="true">{{ item.group }}</span>
        <ul role="group" :aria-label="item.group" class="b-listbox__group-list">
          <li
            v-for="row in item.rows"
            :id="optionId(row.index)"
            :key="row.index"
            role="option"
            class="b-listbox__option"
            :class="{
              'b-listbox__option--selected': isOptionSelected(row.option),
              'b-listbox__option--active': activeIndex === row.index,
              'b-listbox__option--disabled': isOptionDisabled(row.option),
            }"
            :aria-selected="isOptionSelected(row.option)"
            :aria-disabled="isOptionDisabled(row.option) || undefined"
            @click="handleOptionClick(row.index)"
            @mouseenter="handleOptionMouseEnter(row.index)"
          >
            {{ getOptionLabel(row.option) }}
          </li>
        </ul>
      </li>

      <!-- Plain option -->
      <li
        v-else
        :id="optionId(item.index)"
        :key="`opt-${item.index}`"
        role="option"
        class="b-listbox__option"
        :class="{
          'b-listbox__option--selected': isOptionSelected(item.option),
          'b-listbox__option--active': activeIndex === item.index,
          'b-listbox__option--disabled': isOptionDisabled(item.option),
        }"
        :aria-selected="isOptionSelected(item.option)"
        :aria-disabled="isOptionDisabled(item.option) || undefined"
        @click="handleOptionClick(item.index)"
        @mouseenter="handleOptionMouseEnter(item.index)"
      >
        {{ getOptionLabel(item.option) }}
      </li>
    </template>
  </ul>
</template>

<style>
.b-listbox {
  /* Component tokens — defined on the component root, never on :root */
  --b-listbox-bg: #ffffff;
  --b-listbox-fg: rgba(0, 0, 0, 0.88);
  --b-listbox-border-color: #d9d9d9;
  --b-listbox-radius: 6px;
  --b-listbox-option-padding-x: 12px;
  --b-listbox-option-padding-y: 6px;
  --b-listbox-option-bg-hover: rgba(0, 0, 0, 0.04);
  --b-listbox-option-bg-active: rgba(0, 0, 0, 0.06);
  --b-listbox-option-bg-selected: oklch(95% 0.04 240);
  --b-listbox-option-fg-selected: oklch(45% 0.18 258);
  --b-listbox-font-size: 14px;
  --b-listbox-group-label-color: rgba(0, 0, 0, 0.65);
  --b-listbox-disabled-color: rgba(0, 0, 0, 0.25);
  --b-listbox-focus-ring: 0 0 0 2px rgba(5, 145, 255, 0.2);
  --b-listbox-transition-duration: 150ms;

  list-style: none;
  margin: 0;
  padding: 4px 0;
  background: var(--b-listbox-bg);
  color: var(--b-listbox-fg);
  border: 1px solid var(--b-listbox-border-color);
  border-radius: var(--b-listbox-radius);
  font-size: var(--b-listbox-font-size);
  outline: none;
  max-height: 320px;
  overflow-y: auto;
  user-select: none;
}

.b-listbox--sm {
  --b-listbox-font-size: 13px;
  --b-listbox-option-padding-x: 10px;
  --b-listbox-option-padding-y: 4px;
}

.b-listbox--lg {
  --b-listbox-font-size: 16px;
  --b-listbox-option-padding-x: 14px;
  --b-listbox-option-padding-y: 8px;
}

.b-listbox:focus-visible {
  box-shadow: var(--b-listbox-focus-ring);
}

.b-listbox--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ── Option ── */
.b-listbox__option {
  padding: var(--b-listbox-option-padding-y) var(--b-listbox-option-padding-x);
  cursor: pointer;
  display: block;
  line-height: 1.5;
  transition:
    background-color var(--b-listbox-transition-duration) ease,
    color var(--b-listbox-transition-duration) ease;
}

.b-listbox__option--active {
  background-color: var(--b-listbox-option-bg-active);
}

.b-listbox__option--selected {
  background-color: var(--b-listbox-option-bg-selected);
  color: var(--b-listbox-option-fg-selected);
  font-weight: 500;
}

.b-listbox__option--disabled {
  cursor: not-allowed;
  color: var(--b-listbox-disabled-color);
  background-color: transparent;
}

.b-listbox__option:not(.b-listbox__option--disabled):hover {
  background-color: var(--b-listbox-option-bg-hover);
}

/* ── Group ── */
.b-listbox__group {
  display: block;
  padding: 0;
}

.b-listbox__group-label {
  display: block;
  padding: 6px var(--b-listbox-option-padding-x) 4px;
  color: var(--b-listbox-group-label-color);
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.b-listbox__group-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-listbox {
  --b-listbox-bg: #141414;
  --b-listbox-fg: rgba(255, 255, 255, 0.88);
  --b-listbox-border-color: #424242;
  --b-listbox-option-bg-hover: rgba(255, 255, 255, 0.08);
  --b-listbox-option-bg-active: rgba(255, 255, 255, 0.12);
  --b-listbox-option-bg-selected: oklch(28% 0.08 258);
  --b-listbox-option-fg-selected: oklch(80% 0.14 258);
  --b-listbox-group-label-color: rgba(255, 255, 255, 0.45);
  --b-listbox-disabled-color: rgba(255, 255, 255, 0.25);
  --b-listbox-focus-ring: 0 0 0 2px rgba(22, 104, 220, 0.3);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-listbox {
    --b-listbox-bg: #141414;
    --b-listbox-fg: rgba(255, 255, 255, 0.88);
    --b-listbox-border-color: #424242;
    --b-listbox-option-bg-hover: rgba(255, 255, 255, 0.08);
    --b-listbox-option-bg-active: rgba(255, 255, 255, 0.12);
    --b-listbox-option-bg-selected: oklch(28% 0.08 258);
    --b-listbox-option-fg-selected: oklch(80% 0.14 258);
    --b-listbox-group-label-color: rgba(255, 255, 255, 0.45);
    --b-listbox-disabled-color: rgba(255, 255, 255, 0.25);
    --b-listbox-focus-ring: 0 0 0 2px rgba(22, 104, 220, 0.3);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-listbox__option {
    transition: none;
  }
}
</style>
