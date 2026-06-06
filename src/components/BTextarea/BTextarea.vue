<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { BInputStatus, BInputVariant } from '@/components/BInput/types.ts';
import { computed, nextTick, onMounted, ref, useSlots, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const {
  size = BCommonSize.Medium,
  variant = BInputVariant.Outlined,
  disabled = false,
  readOnly = false,
  placeholder,
  maxLength,
  id,
  status,
  allowClear = false,
  showCount = false,
  rows = 3,
  autosize = false,
} = defineProps<{
  /** The size of the textarea — `sm` | `md` | `lg`. Default `md`. */
  size?: `${BCommonSize}`;
  /** Visual variant — `outlined` | `filled` | `borderless` | `underlined`. Default `outlined`. */
  variant?: `${BInputVariant}`;
  /** Whether the textarea is disabled. Default `false`. */
  disabled?: boolean;
  /** Whether the textarea is read-only. Default `false`. */
  readOnly?: boolean;
  /** Validation status — `error` | `warning`. */
  status?: `${BInputStatus}`;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Maximum number of characters allowed. */
  maxLength?: number;
  /** HTML id attribute. Auto-generated when omitted. */
  id?: string;
  /** Show clear button when textarea has value. Default `false`. */
  allowClear?: boolean;
  /** Display character count. `boolean` toggles a default formatter, or pass a function for custom output. Default `false`. */
  showCount?: boolean | ((args: { value: string; count: number; maxLength?: number }) => string);
  /** Minimum height in rows (CSS `rows` attribute). Default `3`. */
  rows?: number;
  /**
   * Auto-grow the textarea to fit its content.
   * - `true` uses CSS `field-sizing: content` (no JS).
   * - `{ minRows, maxRows }` uses a JS-clamped fallback for exact row bounds.
   * Default `false`.
   */
  autosize?: boolean | { minRows: number; maxRows: number };
}>();

const emit = defineEmits<{
  /** Fired when the textarea value changes. */
  change: [value: string, event: Event];
  /** Fired when Enter key is pressed (without Shift). */
  pressEnter: [event: KeyboardEvent];
  /** Fired when the clear button is clicked. */
  clear: [];
  /** Fired when the textarea gains focus. */
  focus: [event: FocusEvent];
  /** Fired when the textarea loses focus. */
  blur: [event: FocusEvent];
}>();

const model = defineModel<string>({ default: '' });

const { componentUID } = useComponentId();
const textareaId = computed(() => id ?? `b-textarea-${componentUID.value}`);

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isFocused = ref(false);

const hasPrefix = computed(() => !!slots.prefix);
const hasSuffix = computed(() => !!slots.suffix);

// ── autosize handling ────────────────────────────────────────────────────────
const isCssAutosize = computed(() => autosize === true);
const isJsAutosize = computed(
  () => typeof autosize === 'object' && autosize !== null,
);
const autosizeBounds = computed(() => {
  if (typeof autosize === 'object' && autosize !== null) {
    return { minRows: autosize.minRows, maxRows: autosize.maxRows };
  }
  return null;
});

const adjustHeight = () => {
  if (!isJsAutosize.value) return;
  const el = textareaRef.value;
  if (!el) return;
  const bounds = autosizeBounds.value;
  if (!bounds) return;
  const styles = window.getComputedStyle(el);
  const lineHeight = parseFloat(styles.lineHeight) || 20;
  const paddingTop = parseFloat(styles.paddingTop) || 0;
  const paddingBottom = parseFloat(styles.paddingBottom) || 0;
  const borderTop = parseFloat(styles.borderTopWidth) || 0;
  const borderBottom = parseFloat(styles.borderBottomWidth) || 0;
  const verticalSpacing = paddingTop + paddingBottom + borderTop + borderBottom;
  const minHeight = lineHeight * bounds.minRows + verticalSpacing;
  const maxHeight = lineHeight * bounds.maxRows + verticalSpacing;
  el.style.height = 'auto';
  const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
};

// ── character count ──────────────────────────────────────────────────────────
const charCount = computed(() => (model.value ?? '').length);

const showCountIndicator = computed(() => !!showCount);

const countText = computed(() => {
  const val = model.value ?? '';
  const count = charCount.value;
  if (typeof showCount === 'function') {
    return showCount({ value: val, count, maxLength });
  }
  if (maxLength !== undefined) {
    return `${count} / ${maxLength}`;
  }
  return `${count}`;
});

const isOverCount = computed(() => {
  if (maxLength === undefined) return false;
  return charCount.value > maxLength;
});

const showClearButton = computed(() => {
  return allowClear && !!model.value && !disabled && !readOnly;
});

// ── handlers ─────────────────────────────────────────────────────────────────
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  const value = target.value;
  model.value = value;
  emit('change', value, e);
  if (isJsAutosize.value) {
    void nextTick(adjustHeight);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    emit('pressEnter', e);
  }
};

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true;
  emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false;
  emit('blur', e);
};

const handleClear = () => {
  model.value = '';
  emit('clear');
  emit('change', '', new Event('change'));
  textareaRef.value?.focus();
  if (isJsAutosize.value) {
    void nextTick(adjustHeight);
  }
};

// ── exposed methods ──────────────────────────────────────────────────────────
const focus = () => {
  textareaRef.value?.focus();
};

const blur = () => {
  textareaRef.value?.blur();
};

const select = () => {
  textareaRef.value?.select();
};

defineExpose({ focus, blur, select });

// ── side-effects ─────────────────────────────────────────────────────────────
onMounted(() => {
  if (isJsAutosize.value) {
    adjustHeight();
  }
});

watch(
  () => model.value,
  () => {
    if (isJsAutosize.value) {
      void nextTick(adjustHeight);
    }
  },
);
</script>

<template>
  <span
    class="b-textarea"
    :class="[
      `b-textarea--${size}`,
      `b-textarea--${variant}`,
      {
        'b-textarea--focused': isFocused,
        'b-textarea--disabled': disabled,
        'b-textarea--readonly': readOnly,
        'b-textarea--error': status === BInputStatus.Error,
        'b-textarea--warning': status === BInputStatus.Warning,
        'b-textarea--autosize': isCssAutosize,
        'b-textarea--over-count': isOverCount,
      },
    ]"
  >
    <span class="b-textarea__wrapper">
      <span v-if="hasPrefix" class="b-textarea__prefix" aria-hidden="true">
        <slot name="prefix" />
      </span>

      <textarea
        v-bind="$attrs"
        :id="textareaId"
        ref="textareaRef"
        :value="model"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        :rows="rows"
        :maxlength="maxLength"
        :aria-invalid="status === BInputStatus.Error ? true : undefined"
        :aria-describedby="showCountIndicator ? `${textareaId}-count` : undefined"
        class="b-textarea__textarea"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <span v-if="showClearButton" class="b-textarea__clear-wrapper">
        <button
          type="button"
          class="b-textarea__clear"
          aria-label="Clear textarea"
          tabindex="-1"
          @mousedown.prevent="handleClear"
        >
          <svg
            viewBox="64 64 896 896"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"
            />
          </svg>
        </button>
      </span>

      <span v-if="hasSuffix" class="b-textarea__suffix" aria-hidden="true">
        <slot name="suffix" />
      </span>

      <span
        v-if="showCountIndicator"
        :id="`${textareaId}-count`"
        class="b-textarea__count"
        :class="{ 'b-textarea__count--over': isOverCount }"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ countText }}
      </span>
    </span>
  </span>
</template>

<style>
.b-textarea {
  --b-textarea-bg: #ffffff;
  --b-textarea-fg: rgba(0, 0, 0, 0.88);
  --b-textarea-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-textarea-border-color: #d9d9d9;
  --b-textarea-border-color-hover: #4096ff;
  --b-textarea-border-color-focus: #1677ff;
  --b-textarea-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-textarea-radius: 6px;
  --b-textarea-padding-x: 11px;
  --b-textarea-padding-y: 4px;
  --b-textarea-padding-x-lg: 11px;
  --b-textarea-padding-y-lg: 7px;
  --b-textarea-padding-x-sm: 7px;
  --b-textarea-padding-y-sm: 0px;
  --b-textarea-font-size: 14px;
  --b-textarea-font-size-lg: 16px;
  --b-textarea-font-size-sm: 14px;
  --b-textarea-line-height: 1.5714;
  --b-textarea-min-rows: 3;
  --b-textarea-max-rows: 8;
  --b-textarea-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-textarea-disabled-fg: rgba(0, 0, 0, 0.25);
  --b-textarea-clear-color: rgba(0, 0, 0, 0.25);
  --b-textarea-clear-hover-color: rgba(0, 0, 0, 0.45);
  --b-textarea-count-color: rgba(0, 0, 0, 0.65);
  --b-textarea-error-border-color: #ff4d4f;
  --b-textarea-error-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-textarea-warning-border-color: #faad14;
  --b-textarea-warning-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-textarea-filled-bg: rgba(0, 0, 0, 0.04);
  --b-textarea-filled-hover-bg: rgba(0, 0, 0, 0.04);

  display: inline-flex;
  width: 100%;
  font-size: var(--b-textarea-font-size);
  color: var(--b-textarea-fg);
  line-height: var(--b-textarea-line-height);
}

.b-textarea--lg {
  font-size: var(--b-textarea-font-size-lg);
}

.b-textarea--sm {
  font-size: var(--b-textarea-font-size-sm);
}

.b-textarea__wrapper {
  display: inline-flex;
  align-items: stretch;
  flex: 1;
  min-width: 0;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
}

/* Variants */
.b-textarea--outlined .b-textarea__wrapper {
  background: var(--b-textarea-bg);
  border: 1px solid var(--b-textarea-border-color);
  border-radius: var(--b-textarea-radius);
}

.b-textarea--outlined:not(.b-textarea--disabled):hover .b-textarea__wrapper {
  border-color: var(--b-textarea-border-color-hover);
}

.b-textarea--outlined.b-textarea--focused .b-textarea__wrapper {
  border-color: var(--b-textarea-border-color-focus);
  box-shadow: var(--b-textarea-active-shadow);
}

.b-textarea--filled .b-textarea__wrapper {
  background: var(--b-textarea-filled-bg);
  border: 1px solid transparent;
  border-radius: var(--b-textarea-radius);
}

.b-textarea--filled:not(.b-textarea--disabled):hover .b-textarea__wrapper {
  background: var(--b-textarea-filled-hover-bg);
}

.b-textarea--filled.b-textarea--focused .b-textarea__wrapper {
  background: var(--b-textarea-bg);
  border-color: var(--b-textarea-border-color-focus);
  box-shadow: var(--b-textarea-active-shadow);
}

.b-textarea--borderless .b-textarea__wrapper {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--b-textarea-radius);
}

.b-textarea--underlined .b-textarea__wrapper {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--b-textarea-border-color);
  border-radius: 0;
}

.b-textarea--underlined:not(.b-textarea--disabled):hover .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-border-color-hover);
}

.b-textarea--underlined.b-textarea--focused .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-border-color-focus);
  box-shadow: 0 1px 0 0 var(--b-textarea-border-color-focus);
}

/* Status */
.b-textarea--error.b-textarea--outlined .b-textarea__wrapper,
.b-textarea--error.b-textarea--filled .b-textarea__wrapper {
  border-color: var(--b-textarea-error-border-color);
}

.b-textarea--error.b-textarea--outlined.b-textarea--focused .b-textarea__wrapper,
.b-textarea--error.b-textarea--filled.b-textarea--focused .b-textarea__wrapper {
  border-color: var(--b-textarea-error-border-color);
  box-shadow: var(--b-textarea-error-shadow);
}

.b-textarea--error.b-textarea--underlined .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-error-border-color);
}

.b-textarea--error.b-textarea--underlined.b-textarea--focused .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-error-border-color);
  box-shadow: 0 1px 0 0 var(--b-textarea-error-border-color);
}

.b-textarea--warning.b-textarea--outlined .b-textarea__wrapper,
.b-textarea--warning.b-textarea--filled .b-textarea__wrapper {
  border-color: var(--b-textarea-warning-border-color);
}

.b-textarea--warning.b-textarea--outlined.b-textarea--focused .b-textarea__wrapper,
.b-textarea--warning.b-textarea--filled.b-textarea--focused .b-textarea__wrapper {
  border-color: var(--b-textarea-warning-border-color);
  box-shadow: var(--b-textarea-warning-shadow);
}

.b-textarea--warning.b-textarea--underlined .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-warning-border-color);
}

.b-textarea--warning.b-textarea--underlined.b-textarea--focused .b-textarea__wrapper {
  border-bottom-color: var(--b-textarea-warning-border-color);
  box-shadow: 0 1px 0 0 var(--b-textarea-warning-border-color);
}

/* Disabled */
.b-textarea--disabled .b-textarea__wrapper {
  background: var(--b-textarea-disabled-bg);
  cursor: not-allowed;
}

.b-textarea--disabled .b-textarea__textarea {
  color: var(--b-textarea-disabled-fg);
  cursor: not-allowed;
}

/* Textarea element */
.b-textarea__textarea {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  resize: vertical;
  /* Calc applied via padding rules below per size; zero default. */
}

.b-textarea--md .b-textarea__textarea {
  padding: var(--b-textarea-padding-y) var(--b-textarea-padding-x);
}

.b-textarea--lg .b-textarea__textarea {
  padding: var(--b-textarea-padding-y-lg) var(--b-textarea-padding-x-lg);
}

.b-textarea--sm .b-textarea__textarea {
  padding: var(--b-textarea-padding-y-sm) var(--b-textarea-padding-x-sm);
}

.b-textarea__textarea::placeholder {
  color: var(--b-textarea-placeholder-color);
}

/* CSS-only autosize: field-sizing: content with min/max-block-size in line-units. */
.b-textarea--autosize .b-textarea__textarea {
  field-sizing: content;
  min-block-size: calc(
    var(--b-textarea-line-height) * var(--b-textarea-min-rows) * 1em
  );
  max-block-size: calc(
    var(--b-textarea-line-height) * var(--b-textarea-max-rows) * 1em
  );
  resize: none;
}

/* Prefix & Suffix */
.b-textarea__prefix,
.b-textarea__suffix {
  display: inline-flex;
  align-items: flex-start;
  padding-top: var(--b-textarea-padding-y);
  color: var(--b-textarea-fg);
  flex-shrink: 0;
}

.b-textarea__prefix {
  margin-left: var(--b-textarea-padding-x);
}

.b-textarea__suffix {
  margin-right: var(--b-textarea-padding-x);
}

.b-textarea__prefix ~ .b-textarea__textarea {
  padding-left: 4px;
}

/* Clear button */
.b-textarea__clear-wrapper {
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
  margin-top: var(--b-textarea-padding-y);
  margin-right: var(--b-textarea-padding-x);
}

.b-textarea__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--b-textarea-clear-color);
  font-size: 14px;
  line-height: 1;
  transition: color 0.2s;
}

.b-textarea__clear:hover {
  color: var(--b-textarea-clear-hover-color);
}

/* Count indicator — pinned bottom-right of the wrapper */
.b-textarea__count {
  position: absolute;
  right: 8px;
  bottom: 4px;
  color: var(--b-textarea-count-color);
  font-size: 0.857em;
  white-space: nowrap;
  pointer-events: none;
}

.b-textarea__count--over {
  color: var(--b-textarea-error-border-color);
}

/* Dark mode — data attribute on ancestor */
[data-prefers-color='dark'] .b-textarea {
  --b-textarea-bg: #141414;
  --b-textarea-fg: rgba(255, 255, 255, 0.88);
  --b-textarea-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-textarea-border-color: #424242;
  --b-textarea-border-color-hover: #3c89e8;
  --b-textarea-border-color-focus: #1668dc;
  --b-textarea-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-textarea-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-textarea-disabled-fg: rgba(255, 255, 255, 0.25);
  --b-textarea-clear-color: rgba(255, 255, 255, 0.25);
  --b-textarea-clear-hover-color: rgba(255, 255, 255, 0.45);
  --b-textarea-count-color: rgba(255, 255, 255, 0.65);
  --b-textarea-error-border-color: #dc3838;
  --b-textarea-error-shadow: 0 0 0 2px rgba(220, 56, 56, 0.1);
  --b-textarea-warning-border-color: #d1a300;
  --b-textarea-warning-shadow: 0 0 0 2px rgba(209, 163, 0, 0.1);
  --b-textarea-filled-bg: rgba(255, 255, 255, 0.08);
  --b-textarea-filled-hover-bg: rgba(255, 255, 255, 0.12);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-textarea {
    --b-textarea-bg: #141414;
    --b-textarea-fg: rgba(255, 255, 255, 0.88);
    --b-textarea-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-textarea-border-color: #424242;
    --b-textarea-border-color-hover: #3c89e8;
    --b-textarea-border-color-focus: #1668dc;
    --b-textarea-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
    --b-textarea-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-textarea-disabled-fg: rgba(255, 255, 255, 0.25);
    --b-textarea-clear-color: rgba(255, 255, 255, 0.25);
    --b-textarea-clear-hover-color: rgba(255, 255, 255, 0.45);
    --b-textarea-count-color: rgba(255, 255, 255, 0.65);
    --b-textarea-error-border-color: #dc3838;
    --b-textarea-error-shadow: 0 0 0 2px rgba(220, 56, 56, 0.1);
    --b-textarea-warning-border-color: #d1a300;
    --b-textarea-warning-shadow: 0 0 0 2px rgba(209, 163, 0, 0.1);
    --b-textarea-filled-bg: rgba(255, 255, 255, 0.08);
    --b-textarea-filled-hover-bg: rgba(255, 255, 255, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-textarea__wrapper,
  .b-textarea__clear {
    transition: none;
  }
}
</style>
