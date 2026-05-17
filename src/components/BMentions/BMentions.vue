<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';

import { BMentionsStatus, BMentionsVariant, type BMentionsOption } from './types.ts';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const {
  options = [],
  size = BCommonSize.Medium,
  variant = BMentionsVariant.Outlined,
  prefix = '@',
  split = ' ',
  autoSize = false,
  allowClear = false,
  filterOption = true,
  notFoundContent = 'Not Found',
  placeholder,
  rows = 3,
} = defineProps<{
  /** Data source for mention suggestions. */
  options?: BMentionsOption[];
  /** Size of the textarea. */
  size?: `${BCommonSize}`;
  /** Visual variant. */
  variant?: `${BMentionsVariant}`;
  /** Popup positioning relative to cursor. */
  placement?: 'top' | 'bottom';
  /** Trigger character(s) for mention lookup. */
  prefix?: string | string[];
  /** Delimiter character(s) inserted before/after mention. */
  split?: string;
  /** Auto-resize the textarea height. Can be boolean or { minRows, maxRows }. */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** Show clear button when there is content. */
  allowClear?: boolean;
  /** Filter options by search text. `true` for default filter, function for custom. */
  filterOption?: boolean | ((search: string, option: BMentionsOption) => boolean);
  /** Content shown when no results match. Set to `null` to hide dropdown when empty. */
  notFoundContent?: string | null;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Whether the textarea is read-only. */
  readOnly?: boolean;
  /** Validation status. */
  status?: `${BMentionsStatus}`;
  /** Placeholder text. */
  placeholder?: string;
  /** Number of visible text lines (when autoSize is false). */
  rows?: number;
}>();

const emit = defineEmits<{
  /** Fired when the input value changes. */
  change: [value: string];
  /** Fired when an option is selected. */
  select: [option: BMentionsOption, prefix: string];
  /** Fired when a prefix character is typed and search begins. */
  search: [text: string, prefix: string];
  /** Fired when input gains focus. */
  focus: [event: FocusEvent];
  /** Fired when input loses focus. */
  blur: [event: FocusEvent];
  /** Fired when the clear button is clicked. */
  clear: [];
  /** Fired on textarea resize (when autoSize is active). */
  resize: [size: { width: number; height: number }];
  /** Fired during popup scroll. */
  popupScroll: [event: Event];
}>();

const model = defineModel<string>({ default: '' });

const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-mentions-anchor-${componentUID.value}`);
const listboxId = computed(() => `b-mentions-listbox-${componentUID.value}`);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isFocused = ref(false);
const isOpen = ref(false);
const activeIndex = ref(-1);
const measuring = ref(false);
const measurePrefix = ref('');
const measureText = ref('');
const measureStart = ref(0);

const prefixes = computed(() => (Array.isArray(prefix) ? prefix : [prefix]));

const filteredOptions = computed(() => {
  const search = measureText.value.toLowerCase();
  if (!filterOption) return options;
  if (typeof filterOption === 'function') {
    return options.filter((opt) => filterOption(search, opt));
  }
  if (!search) return options;
  return options.filter((opt) => {
    const text = (opt.label ?? opt.value).toLowerCase();
    return text.includes(search);
  });
});

const showDropdown = computed(() => {
  if (!measuring.value) return false;
  if (filteredOptions.value.length === 0 && notFoundContent === null) return false;
  return isOpen.value;
});

const getOptionLabel = (opt: BMentionsOption) => opt.label ?? opt.value;

function openMenu() {
  if (isOpen.value) return;
  menuRef.value?.showPopover();
}

function closeMenu() {
  if (!isOpen.value) return;
  menuRef.value?.hidePopover();
}

function handleToggle({ newState }: ToggleEvent) {
  const nowOpen = newState === 'open';
  isOpen.value = nowOpen;
  if (nowOpen && filteredOptions.value.length > 0) {
    activeIndex.value = 0;
  } else if (!nowOpen) {
    activeIndex.value = -1;
    measuring.value = false;
  }
}

function getLastMeasureIndex(
  text: string,
  cursorPos: number,
): { start: number; prefix: string } | null {
  for (const p of prefixes.value) {
    const beforeCursor = text.slice(0, cursorPos);
    const lastPrefixIdx = beforeCursor.lastIndexOf(p);
    if (lastPrefixIdx < 0) continue;
    const afterPrefix = beforeCursor.slice(lastPrefixIdx + p.length);
    if (/\s/.test(afterPrefix)) continue;
    if (
      lastPrefixIdx === 0 ||
      text[lastPrefixIdx - 1] === split ||
      /\s/.test(text[lastPrefixIdx - 1])
    ) {
      return { start: lastPrefixIdx, prefix: p };
    }
  }
  return null;
}

function startMeasure(text: string, cursorPos: number) {
  const measure = getLastMeasureIndex(text, cursorPos);
  if (measure) {
    measuring.value = true;
    measurePrefix.value = measure.prefix;
    measureStart.value = measure.start;
    measureText.value = text.slice(measure.start + measure.prefix.length, cursorPos);
    emit('search', measureText.value, measure.prefix);
    nextTick(() => openMenu());
  } else {
    stopMeasure();
  }
}

function stopMeasure() {
  closeMenu();
  measuring.value = false;
  measureText.value = '';
  measurePrefix.value = '';
  measureStart.value = 0;
}

function selectOption(opt: BMentionsOption) {
  if (opt.disabled) return;

  const textarea = textareaRef.value;
  if (!textarea) return;

  const value = model.value ?? '';
  const cursorPos = textarea.selectionStart;
  const beforeMention = value.slice(0, measureStart.value);
  const afterMention = value.slice(cursorPos);

  const mentionValue = `${measurePrefix.value}${opt.value}`;
  const needsTrailingSplit = afterMention && !afterMention.startsWith(split) && split;
  const newValue = `${beforeMention}${mentionValue}${needsTrailingSplit ? split : ''}${afterMention}`;

  model.value = newValue;
  emit('change', newValue);
  emit('select', opt, measurePrefix.value);

  stopMeasure();

  const newCursorPos =
    beforeMention.length + mentionValue.length + (needsTrailingSplit ? split.length : 0);
  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
}

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  const value = target.value;
  model.value = value;
  emit('change', value);

  const cursorPos = target.selectionStart;
  startMeasure(value, cursorPos);
  adjustHeight();
}

function handleFocus(e: FocusEvent) {
  isFocused.value = true;
  emit('focus', e);
}

function handleBlur(e: FocusEvent) {
  const related = e.relatedTarget as HTMLElement | null;
  if (menuRef.value?.contains(related)) return;
  isFocused.value = false;
  emit('blur', e);
  stopMeasure();
}

function handleKeyDown(e: KeyboardEvent) {
  if (!showDropdown.value) return;

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const opts = filteredOptions.value;
      if (opts.length === 0) return;
      const next = activeIndex.value + 1;
      for (let i = 0; i < opts.length; i++) {
        const idx = (next + i) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
          break;
        }
      }
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const opts = filteredOptions.value;
      if (opts.length === 0) return;
      const prev = activeIndex.value - 1;
      for (let i = 0; i < opts.length; i++) {
        const idx = (((prev - i) % opts.length) + opts.length) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
          break;
        }
      }
      break;
    }
    case 'Enter': {
      e.preventDefault();
      if (activeIndex.value >= 0) {
        const opt = filteredOptions.value[activeIndex.value];
        if (opt && !opt.disabled) {
          selectOption(opt);
        }
      }
      break;
    }
    case 'Escape': {
      e.preventDefault();
      stopMeasure();
      break;
    }
  }
}

function handleClear() {
  model.value = '';
  emit('change', '');
  emit('clear');
  stopMeasure();
  textareaRef.value?.focus();
}

function handlePopupScroll(e: Event) {
  emit('popupScroll', e);
}

function adjustHeight() {
  if (!autoSize || !textareaRef.value) return;
  const textarea = textareaRef.value;
  textarea.style.height = 'auto';

  const config = typeof autoSize === 'object' ? autoSize : {};
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;

  let newHeight = textarea.scrollHeight;
  if (config.minRows) {
    newHeight = Math.max(newHeight, config.minRows * lineHeight);
  }
  if (config.maxRows) {
    newHeight = Math.min(newHeight, config.maxRows * lineHeight);
  }

  textarea.style.height = `${newHeight}px`;
  emit('resize', { width: textarea.offsetWidth, height: newHeight });
}

const scrollActiveIntoView = () => {
  nextTick(() => {
    const active = menuRef.value?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  });
};

watch(activeIndex, scrollActiveIntoView);

watch(model, (val) => {
  if (textareaRef.value && textareaRef.value.value !== val) {
    textareaRef.value.value = val ?? '';
  }
});

defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
});
</script>

<template>
  <div
    class="b-mentions"
    :class="[
      `b-mentions--${size}`,
      `b-mentions--${variant}`,
      {
        'b-mentions--focused': isFocused,
        'b-mentions--disabled': disabled,
        'b-mentions--error': status === BMentionsStatus.Error,
        'b-mentions--warning': status === BMentionsStatus.Warning,
        'b-mentions--has-clear': allowClear,
      },
    ]"
    role="combobox"
    :aria-label="placeholder || 'Mentions input'"
    :aria-expanded="showDropdown"
    :aria-haspopup="'listbox'"
    :aria-controls="showDropdown ? listboxId : undefined"
  >
    <textarea
      ref="textareaRef"
      v-bind="attrs"
      :value="model"
      class="b-mentions__textarea"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readOnly"
      :rows="autoSize ? undefined : rows"
      :aria-label="placeholder || 'Mentions input'"
      autocomplete="off"
      :aria-activedescendant="activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined"
      aria-autocomplete="list"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    />

    <button
      v-if="allowClear && model && !disabled"
      type="button"
      class="b-mentions__clear"
      aria-label="Clear input"
      tabindex="-1"
      @mousedown.prevent="handleClear"
    ></button>

    <div
      v-if="measuring || isOpen"
      ref="menuRef"
      :id="listboxId"
      class="b-mentions__dropdown"
      popover="manual"
      role="listbox"
      :aria-label="`Mention suggestions for ${measurePrefix}`"
      @toggle="handleToggle"
      @scroll="handlePopupScroll"
    >
      <ul v-if="filteredOptions.length > 0" class="b-mentions__options">
        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :id="`${listboxId}-option-${idx}`"
          class="b-mentions__option"
          :class="{
            'b-mentions__option--active': idx === activeIndex && !opt.disabled,
            'b-mentions__option--disabled': opt.disabled,
          }"
          :data-active="idx === activeIndex"
          :aria-selected="idx === activeIndex"
          :aria-disabled="opt.disabled ?? false"
          role="option"
          @mousedown.prevent="selectOption(opt)"
          @mouseenter="activeIndex = idx"
        >
          <slot name="option" :option="opt" :index="idx">
            {{ getOptionLabel(opt) }}
          </slot>
        </li>
      </ul>
      <div v-else-if="notFoundContent" class="b-mentions__not-found">
        <slot name="notFoundContent">
          {{ notFoundContent }}
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.b-mentions {
  --b-mentions-active-bg: #ffffff;
  --b-mentions-active-border-color: #1677ff;
  --b-mentions-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-mentions-hover-bg: #ffffff;
  --b-mentions-hover-border-color: #4096ff;
  --b-mentions-border-color: #d9d9d9;
  --b-mentions-bg: #ffffff;
  --b-mentions-color: rgba(0, 0, 0, 0.88);
  --b-mentions-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-mentions-font-size: 14px;
  --b-mentions-font-size-lg: 16px;
  --b-mentions-font-size-sm: 14px;
  --b-mentions-padding-block: 4px;
  --b-mentions-padding-block-lg: 7px;
  --b-mentions-padding-block-sm: 0px;
  --b-mentions-padding-inline: 11px;
  --b-mentions-padding-inline-lg: 11px;
  --b-mentions-padding-inline-sm: 7px;
  --b-mentions-border-radius: 6px;
  --b-mentions-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-mentions-disabled-color: rgba(0, 0, 0, 0.25);
  --b-mentions-error-border-color: #ff4d4f;
  --b-mentions-error-hover-border-color: #ff7875;
  --b-mentions-error-active-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-mentions-warning-border-color: #faad14;
  --b-mentions-warning-hover-border-color: #ffc53d;
  --b-mentions-warning-active-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-mentions-dropdown-bg: #ffffff;
  --b-mentions-dropdown-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-mentions-dropdown-height: 250px;
  --b-mentions-option-active-bg: rgba(0, 0, 0, 0.04);
  --b-mentions-option-selected-bg: #e6f4ff;
  --b-mentions-option-font-size: 14px;
  --b-mentions-option-padding-x: 12px;
  --b-mentions-option-padding-y: 5px;
  --b-mentions-clear-color: rgba(0, 0, 0, 0.25);
  --b-mentions-clear-hover-color: rgba(0, 0, 0, 0.45);
  --b-mentions-z-index-popup: 1050;

  display: flex;
  width: 100%;
}

.b-mentions--has-clear {
  position: relative;
}

/* ── Textarea ── */
.b-mentions__textarea {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5714;
  color: var(--b-mentions-color);
  background-color: var(--b-mentions-bg);
  border: 1px solid var(--b-mentions-border-color);
  border-radius: var(--b-mentions-border-radius);
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;
  anchor-name: v-bind('anchorName');
}

.b-mentions__textarea::placeholder {
  color: var(--b-mentions-placeholder-color);
}

/* ── Sizes ── */
.b-mentions--sm .b-mentions__textarea {
  padding: var(--b-mentions-padding-block-sm) var(--b-mentions-padding-inline-sm);
  font-size: var(--b-mentions-font-size-sm);
}

.b-mentions--md .b-mentions__textarea {
  padding: var(--b-mentions-padding-block) var(--b-mentions-padding-inline);
  font-size: var(--b-mentions-font-size);
}

.b-mentions--lg .b-mentions__textarea {
  padding: var(--b-mentions-padding-block-lg) var(--b-mentions-padding-inline-lg);
  font-size: var(--b-mentions-font-size-lg);
}

/* ── Variants ── */
.b-mentions--outlined .b-mentions__textarea {
  border-color: var(--b-mentions-border-color);
}

.b-mentions--filled .b-mentions__textarea {
  border-color: transparent;
  background-color: var(--b-mentions-disabled-bg);
}

.b-mentions--borderless .b-mentions__textarea {
  border-color: transparent;
  background-color: transparent;
  box-shadow: none;
}

/* ── States ── */
.b-mentions--focused:not(.b-mentions--disabled) .b-mentions__textarea {
  border-color: var(--b-mentions-active-border-color);
  box-shadow: var(--b-mentions-active-shadow);
  background-color: var(--b-mentions-active-bg);
}

.b-mentions:not(.b-mentions--focused):not(.b-mentions--disabled):hover .b-mentions__textarea {
  border-color: var(--b-mentions-hover-border-color);
  background-color: var(--b-mentions-hover-bg);
}

.b-mentions--borderless.b-mentions--focused .b-mentions__textarea {
  box-shadow: none;
}

/* ── Disabled ── */
.b-mentions--disabled .b-mentions__textarea {
  cursor: not-allowed;
  background-color: var(--b-mentions-disabled-bg);
  color: var(--b-mentions-disabled-color);
}

/* ── Error status ── */
.b-mentions--error .b-mentions__textarea {
  border-color: var(--b-mentions-error-border-color);
}

.b-mentions--error:not(.b-mentions--disabled):hover .b-mentions__textarea {
  border-color: var(--b-mentions-error-hover-border-color);
}

.b-mentions--error.b-mentions--focused .b-mentions__textarea {
  border-color: var(--b-mentions-error-border-color);
  box-shadow: var(--b-mentions-error-active-shadow);
}

/* ── Warning status ── */
.b-mentions--warning .b-mentions__textarea {
  border-color: var(--b-mentions-warning-border-color);
}

.b-mentions--warning:not(.b-mentions--disabled):hover .b-mentions__textarea {
  border-color: var(--b-mentions-warning-hover-border-color);
}

.b-mentions--warning.b-mentions--focused .b-mentions__textarea {
  border-color: var(--b-mentions-warning-border-color);
  box-shadow: var(--b-mentions-warning-active-shadow);
}

/* ── Clear button ── */
.b-mentions__clear {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--b-mentions-clear-color);
  font-size: 10px;
  cursor: pointer;
  transition: color 0.2s;
}

.b-mentions__clear::after {
  content: '\2715';
}

.b-mentions__clear:hover {
  color: var(--b-mentions-clear-hover-color);
}

/* ── Dropdown ── */
.b-mentions__dropdown {
  margin: 0;
  padding: 4px;
  border: none;
  border-radius: var(--b-mentions-border-radius);
  background: var(--b-mentions-dropdown-bg);
  box-shadow: var(--b-mentions-dropdown-shadow);
  max-height: var(--b-mentions-dropdown-height);
  overflow-y: auto;
  z-index: var(--b-mentions-z-index-popup);

  position: absolute;
  position-anchor: v-bind('anchorName');
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
  width: anchor-size(width);
  position-try-fallbacks: --b-mentions-top;

  opacity: 0;
  transition:
    display 0.2s allow-discrete,
    opacity 0.2s;
}

.b-mentions__dropdown:popover-open {
  opacity: 1;

  @starting-style {
    opacity: 0;
  }
}

@position-try --b-mentions-top {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
}

/* ── Options list ── */
.b-mentions__options {
  margin: 0;
  padding: 0;
  list-style: none;
}

.b-mentions__option {
  padding: var(--b-mentions-option-padding-y) var(--b-mentions-option-padding-x);
  font-size: var(--b-mentions-option-font-size);
  line-height: 1.5714;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.b-mentions__option--active {
  background: var(--b-mentions-option-active-bg);
}

.b-mentions__option:hover:not(.b-mentions__option--disabled) {
  background: var(--b-mentions-option-active-bg);
}

.b-mentions__option--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* ── Not found ── */
.b-mentions__not-found {
  padding: var(--b-mentions-option-padding-y) var(--b-mentions-option-padding-x);
  font-size: var(--b-mentions-option-font-size);
  color: var(--b-mentions-disabled-color);
  text-align: center;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-mentions {
  --b-mentions-active-bg: #1f1f1f;
  --b-mentions-active-border-color: #1668dc;
  --b-mentions-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-mentions-hover-bg: #1f1f1f;
  --b-mentions-hover-border-color: #3c89e8;
  --b-mentions-border-color: #424242;
  --b-mentions-bg: #1f1f1f;
  --b-mentions-color: rgba(255, 255, 255, 0.88);
  --b-mentions-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-mentions-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-mentions-disabled-color: rgba(255, 255, 255, 0.25);
  --b-mentions-dropdown-bg: #2a2a2a;
  --b-mentions-dropdown-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-mentions-option-active-bg: rgba(255, 255, 255, 0.08);
  --b-mentions-option-selected-bg: #111a2c;
  --b-mentions-clear-color: rgba(255, 255, 255, 0.25);
  --b-mentions-clear-hover-color: rgba(255, 255, 255, 0.45);
  --b-mentions-error-border-color: #d32029;
  --b-mentions-error-hover-border-color: #e84749;
  --b-mentions-error-active-shadow: 0 0 0 2px rgba(211, 32, 41, 0.1);
  --b-mentions-warning-border-color: #d89614;
  --b-mentions-warning-hover-border-color: #e8b339;
  --b-mentions-warning-active-shadow: 0 0 0 2px rgba(216, 150, 20, 0.1);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-mentions {
    --b-mentions-active-bg: #1f1f1f;
    --b-mentions-active-border-color: #1668dc;
    --b-mentions-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
    --b-mentions-hover-bg: #1f1f1f;
    --b-mentions-hover-border-color: #3c89e8;
    --b-mentions-border-color: #424242;
    --b-mentions-bg: #1f1f1f;
    --b-mentions-color: rgba(255, 255, 255, 0.88);
    --b-mentions-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-mentions-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-mentions-disabled-color: rgba(255, 255, 255, 0.25);
    --b-mentions-dropdown-bg: #2a2a2a;
    --b-mentions-dropdown-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
      0 9px 28px 8px rgba(0, 0, 0, 0.2);
    --b-mentions-option-active-bg: rgba(255, 255, 255, 0.08);
    --b-mentions-option-selected-bg: #111a2c;
    --b-mentions-clear-color: rgba(255, 255, 255, 0.25);
    --b-mentions-clear-hover-color: rgba(255, 255, 255, 0.45);
    --b-mentions-error-border-color: #d32029;
    --b-mentions-error-hover-border-color: #e84749;
    --b-mentions-error-active-shadow: 0 0 0 2px rgba(211, 32, 41, 0.1);
    --b-mentions-warning-border-color: #d89614;
    --b-mentions-warning-hover-border-color: #e8b339;
    --b-mentions-warning-active-shadow: 0 0 0 2px rgba(216, 150, 20, 0.1);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-mentions__textarea,
  .b-mentions__dropdown,
  .b-mentions__option,
  .b-mentions__clear {
    transition: none;
  }
}
</style>
