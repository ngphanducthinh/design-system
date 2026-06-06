<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, ref, useSlots, watch } from 'vue';
import {
  BInputStatus,
  BInputVariant,
  type BInputCountConfig,
  type BInputFocusOptions,
} from './types.ts';

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const {
  size = BCommonSize.Medium,
  variant = BInputVariant.Outlined,
  type = 'text',
  allowClear = false,
  showCount = false,
  disabled = false,
  readOnly = false,
  placeholder,
  maxLength,
  id,
  count,
  status,
} = defineProps<{
  /** The size of the input. */
  size?: `${BCommonSize}`;
  /** Visual variant of the input. */
  variant?: `${BInputVariant}`;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Validation status. */
  status?: `${BInputStatus}`;
  /** HTML input type (text, password, email, etc.). */
  type?: string;
  /** Maximum number of characters. */
  maxLength?: number;
  /** Placeholder text. */
  placeholder?: string;
  /** HTML id attribute. */
  id?: string;
  /** Show clear button when input has value. */
  allowClear?: boolean;
  /** Display character count. Can be boolean or a formatter function. */
  showCount?: boolean | ((args: { value: string; count: number; maxLength?: number }) => string);
  /** Advanced character counting configuration. */
  count?: BInputCountConfig;
}>();

const emit = defineEmits<{
  /** Fired when input value changes. */
  change: [value: string, event: Event];
  /** Fired when Enter key is pressed. */
  pressEnter: [event: KeyboardEvent];
  /** Fired when clear button is clicked. */
  clear: [];
  /** Fired on input focus. */
  focus: [event: FocusEvent];
  /** Fired on input blur. */
  blur: [event: FocusEvent];
}>();

const model = defineModel<string>({ default: '' });

const { componentUID } = useComponentId();
const inputId = computed(() => id ?? `b-input-${componentUID.value}`);

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const passwordVisible = ref(false);

const hasAddonBefore = computed(() => !!slots.addonBefore);
const hasAddonAfter = computed(() => !!slots.addonAfter);
const hasPrefix = computed(() => !!slots.prefix);
const hasSuffix = computed(() => !!slots.suffix);
const isPasswordType = computed(() => type === 'password');
const showPasswordToggle = computed(() => isPasswordType.value);
const computedType = computed(() => {
  if (isPasswordType.value) {
    return passwordVisible.value ? 'text' : 'password';
  }
  return type;
});

const charCount = computed(() => {
  const val = model.value ?? '';
  if (count?.strategy) return count.strategy(val);
  return val.length;
});

const countMax = computed(() => count?.max ?? maxLength);

const showCountIndicator = computed(() => {
  if (count?.show === false) return false;
  if (count?.show !== undefined) return true;
  return !!showCount;
});

const countText = computed(() => {
  const val = model.value ?? '';
  const currentCount = charCount.value;

  if (typeof count?.show === 'function') {
    return count.show({ value: val, count: currentCount, maxLength: countMax.value });
  }
  if (typeof showCount === 'function') {
    return showCount({ value: val, count: currentCount, maxLength: countMax.value });
  }
  if (countMax.value !== undefined) {
    return `${currentCount} / ${countMax.value}`;
  }
  return `${currentCount}`;
});

const isOverCount = computed(() => {
  if (countMax.value === undefined) return false;
  return charCount.value > countMax.value;
});

const showClearButton = computed(() => {
  return allowClear && !!model.value && !disabled && !readOnly;
});

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  let value = target.value;

  if (count?.exceedFormatter && countMax.value !== undefined) {
    const strategy = count.strategy ?? ((v: string) => v.length);
    if (strategy(value) > countMax.value) {
      value = count.exceedFormatter(value, { max: countMax.value });
      target.value = value;
    }
  }

  model.value = value;
  emit('change', value, e);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
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
  inputRef.value?.focus();
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
  inputRef.value?.focus();
};

const focus = (options?: BInputFocusOptions) => {
  inputRef.value?.focus({ preventScroll: options?.preventScroll });
  if (options?.cursor && inputRef.value) {
    const len = inputRef.value.value.length;
    switch (options.cursor) {
      case 'start':
        inputRef.value.setSelectionRange(0, 0);
        break;
      case 'end':
        inputRef.value.setSelectionRange(len, len);
        break;
      case 'all':
        inputRef.value.setSelectionRange(0, len);
        break;
    }
  }
};

const blur = () => {
  inputRef.value?.blur();
};

watch(model, (val) => {
  if (count?.exceedFormatter && countMax.value !== undefined) {
    const strategy = count.strategy ?? ((v: string) => v.length);
    if (strategy(val) > countMax.value) {
      model.value = count.exceedFormatter(val, { max: countMax.value });
    }
  }
});

defineExpose({ focus, blur });
</script>

<template>
  <span
    class="b-input"
    :class="[
      `b-input--${size}`,
      `b-input--${variant}`,
      {
        'b-input--focused': isFocused,
        'b-input--disabled': disabled,
        'b-input--readonly': readOnly,
        'b-input--error': status === BInputStatus.Error,
        'b-input--warning': status === BInputStatus.Warning,
        'b-input--has-addon-before': hasAddonBefore,
        'b-input--has-addon-after': hasAddonAfter,
        'b-input--over-count': isOverCount,
      },
    ]"
  >
    <span v-if="hasAddonBefore" class="b-input__addon b-input__addon--before">
      <slot name="addonBefore" />
    </span>

    <span class="b-input__wrapper">
      <span v-if="hasPrefix" class="b-input__prefix" aria-hidden="true">
        <slot name="prefix" />
      </span>

      <input
        v-bind="$attrs"
        :id="inputId"
        ref="inputRef"
        :value="model"
        :type="computedType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        :maxlength="maxLength && !count?.exceedFormatter ? maxLength : undefined"
        :aria-invalid="status === BInputStatus.Error ? true : undefined"
        :aria-describedby="showCountIndicator ? `${inputId}-count` : undefined"
        class="b-input__input"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <span v-if="showClearButton" class="b-input__clear-wrapper">
        <button
          type="button"
          class="b-input__clear"
          aria-label="Clear input"
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

      <span v-if="showPasswordToggle" class="b-input__password-toggle-wrapper">
        <button
          type="button"
          class="b-input__password-toggle"
          :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
          :aria-pressed="passwordVisible"
          tabindex="-1"
          @mousedown.prevent="togglePasswordVisibility"
        >
          <svg
            v-if="!passwordVisible"
            viewBox="64 64 896 896"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 730c-114.9 0-208-93.1-208-208s93.1-208 208-208 208 93.1 208 208-93.1 208-208 208zm0-319.8c-61.7 0-111.8 50.1-111.8 111.8S450.3 633.8 512 633.8 623.8 583.7 623.8 522 573.7 410.2 512 410.2z"
            />
          </svg>
          <svg
            v-else
            viewBox="64 64 896 896"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-53.8 0-104.5 9.6-151.7 28.4L212.7 67.2a8.03 8.03 0 00-11.3 0L160 108.5a8.03 8.03 0 000 11.3l740.3 740.3a8.03 8.03 0 0011.3 0l41.3-41.3a8.03 8.03 0 000-11.3l-106.8-106.8c53.1-57.6 94.3-127.4 106.2-153a60.3 60.3 0 000-51.5zM512 730c-114.9 0-208-93.1-208-208 0-40.1 11.4-77.6 31-109.4L297 374.6C270.6 414.1 256 466 256 522c0 141.4 114.6 256 256 256 56 0 107.9-18 150.2-48.5l-38-38C597.6 714.6 556.1 730 512 730zm0-520c114.9 0 208 93.1 208 208 0 40.1-11.4 77.6-31 109.4L727 565.4C753.4 525.9 768 474 768 418c0-141.4-114.6-256-256-256-56 0-107.9 18-150.2 48.5l38 38C426.4 225.4 467.9 210 512 210z"
            />
          </svg>
        </button>
      </span>

      <span v-if="hasSuffix" class="b-input__suffix" aria-hidden="true">
        <slot name="suffix" />
      </span>

      <span
        v-if="showCountIndicator"
        :id="`${inputId}-count`"
        class="b-input__count"
        :class="{ 'b-input__count--over': isOverCount }"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ countText }}
      </span>
    </span>

    <span v-if="hasAddonAfter" class="b-input__addon b-input__addon--after">
      <slot name="addonAfter" />
    </span>
  </span>
</template>

<style scoped>
.b-input {
  --b-input-active-bg: #ffffff;
  --b-input-active-border-color: #1677ff;
  --b-input-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-input-addon-bg: rgba(0, 0, 0, 0.02);
  --b-input-error-active-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-input-hover-bg: #ffffff;
  --b-input-hover-border-color: #4096ff;
  --b-input-font-size: 14px;
  --b-input-font-size-lg: 16px;
  --b-input-font-size-sm: 14px;
  --b-input-padding-block: 4px;
  --b-input-padding-block-lg: 7px;
  --b-input-padding-block-sm: 0px;
  --b-input-padding-inline: 11px;
  --b-input-padding-inline-lg: 11px;
  --b-input-padding-inline-sm: 7px;
  --b-input-warning-active-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-input-border-color: #d9d9d9;
  --b-input-bg: #ffffff;
  --b-input-color: rgba(0, 0, 0, 0.88);
  --b-input-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-input-border-radius: 6px;
  --b-input-clear-color: rgba(0, 0, 0, 0.25);
  --b-input-clear-hover-color: rgba(0, 0, 0, 0.45);
  --b-input-count-color: rgba(0, 0, 0, 0.65);
  --b-input-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-input-disabled-color: rgba(0, 0, 0, 0.25);
  --b-input-error-border-color: #ff4d4f;
  --b-input-error-hover-border-color: #ff7875;
  --b-input-warning-border-color: #faad14;
  --b-input-warning-hover-border-color: #ffc53d;
  --b-input-filled-bg: rgba(0, 0, 0, 0.04);
  --b-input-filled-hover-bg: rgba(0, 0, 0, 0.04);

  display: inline-flex;
  align-items: stretch;
  width: 100%;
  font-size: var(--b-input-font-size);
  color: var(--b-input-color);
  line-height: 1.5714;
}

.b-input--lg {
  font-size: var(--b-input-font-size-lg);
}

.b-input--sm {
  font-size: var(--b-input-font-size-sm);
}

.b-input__wrapper {
  display: inline-flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  position: relative;
  transition: all 0.2s;
}

/* Outlined */
.b-input--outlined .b-input__wrapper {
  background: var(--b-input-bg);
  border: 1px solid var(--b-input-border-color);
  border-radius: var(--b-input-border-radius);
}

.b-input--outlined:not(.b-input--disabled):hover .b-input__wrapper {
  border-color: var(--b-input-hover-border-color);
  background: var(--b-input-hover-bg);
}

.b-input--outlined.b-input--focused .b-input__wrapper {
  border-color: var(--b-input-active-border-color);
  background: var(--b-input-active-bg);
  box-shadow: var(--b-input-active-shadow);
}

/* Filled */
.b-input--filled .b-input__wrapper {
  background: var(--b-input-filled-bg);
  border: 1px solid transparent;
  border-radius: var(--b-input-border-radius);
}

.b-input--filled:not(.b-input--disabled):hover .b-input__wrapper {
  background: var(--b-input-filled-hover-bg);
}

.b-input--filled.b-input--focused .b-input__wrapper {
  background: var(--b-input-active-bg);
  border-color: var(--b-input-active-border-color);
  box-shadow: var(--b-input-active-shadow);
}

/* Borderless */
.b-input--borderless .b-input__wrapper {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--b-input-border-radius);
}

/* Underlined */
.b-input--underlined .b-input__wrapper {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--b-input-border-color);
  border-radius: 0;
}

.b-input--underlined:not(.b-input--disabled):hover .b-input__wrapper {
  border-bottom-color: var(--b-input-hover-border-color);
}

.b-input--underlined.b-input--focused .b-input__wrapper {
  border-bottom-color: var(--b-input-active-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-active-border-color);
}

/* Error */
.b-input--error.b-input--outlined .b-input__wrapper {
  border-color: var(--b-input-error-border-color);
}

.b-input--error.b-input--outlined:not(.b-input--disabled):hover .b-input__wrapper {
  border-color: var(--b-input-error-hover-border-color);
}

.b-input--error.b-input--outlined.b-input--focused .b-input__wrapper,
.b-input--error.b-input--filled.b-input--focused .b-input__wrapper {
  border-color: var(--b-input-error-border-color);
  box-shadow: var(--b-input-error-active-shadow);
}

.b-input--error.b-input--underlined .b-input__wrapper {
  border-bottom-color: var(--b-input-error-border-color);
}

.b-input--error.b-input--underlined.b-input--focused .b-input__wrapper {
  border-bottom-color: var(--b-input-error-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-error-border-color);
}

/* Warning */
.b-input--warning.b-input--outlined .b-input__wrapper {
  border-color: var(--b-input-warning-border-color);
}

.b-input--warning.b-input--outlined:not(.b-input--disabled):hover .b-input__wrapper {
  border-color: var(--b-input-warning-hover-border-color);
}

.b-input--warning.b-input--outlined.b-input--focused .b-input__wrapper,
.b-input--warning.b-input--filled.b-input--focused .b-input__wrapper {
  border-color: var(--b-input-warning-border-color);
  box-shadow: var(--b-input-warning-active-shadow);
}

.b-input--warning.b-input--underlined .b-input__wrapper {
  border-bottom-color: var(--b-input-warning-border-color);
}

.b-input--warning.b-input--underlined.b-input--focused .b-input__wrapper {
  border-bottom-color: var(--b-input-warning-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-warning-border-color);
}

/* Disabled */
.b-input--disabled .b-input__wrapper {
  background: var(--b-input-disabled-bg);
  cursor: not-allowed;
}

.b-input--disabled .b-input__input {
  color: var(--b-input-disabled-color);
  cursor: not-allowed;
}

/* Addon border radius */
.b-input--has-addon-before .b-input__wrapper {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.b-input--has-addon-after .b-input__wrapper {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

/* Input element */
.b-input__input {
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
}

.b-input--md .b-input__input {
  padding: var(--b-input-padding-block) var(--b-input-padding-inline);
}

.b-input--lg .b-input__input {
  padding: var(--b-input-padding-block-lg) var(--b-input-padding-inline-lg);
}

.b-input--sm .b-input__input {
  padding: var(--b-input-padding-block-sm) var(--b-input-padding-inline-sm);
}

.b-input__input::placeholder {
  color: var(--b-input-placeholder-color);
}

/* Prefix & Suffix */
.b-input__prefix,
.b-input__suffix {
  display: inline-flex;
  align-items: center;
  color: var(--b-input-color);
  flex-shrink: 0;
}

.b-input__prefix {
  margin-left: var(--b-input-padding-inline);
}

.b-input__suffix {
  margin-right: var(--b-input-padding-inline);
}

.b-input__prefix ~ .b-input__input {
  padding-left: 4px;
}

/* Clear & password toggle */
.b-input__clear-wrapper,
.b-input__password-toggle-wrapper {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: var(--b-input-padding-inline);
}

.b-input__clear,
.b-input__password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--b-input-clear-color);
  font-size: 14px;
  line-height: 1;
  transition: color 0.2s;
}

.b-input__clear:hover,
.b-input__password-toggle:hover {
  color: var(--b-input-clear-hover-color);
}

/* Count */
.b-input__count {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: var(--b-input-padding-inline);
  color: var(--b-input-count-color);
  font-size: 0.857em;
  white-space: nowrap;
  pointer-events: none;
}

.b-input__count--over {
  color: var(--b-input-error-border-color);
}

/* Addons */
.b-input__addon {
  display: inline-flex;
  align-items: center;
  padding: 0 11px;
  background: var(--b-input-addon-bg);
  border: 1px solid var(--b-input-border-color);
  color: var(--b-input-color);
  font-size: inherit;
  white-space: nowrap;
}

.b-input__addon--before {
  border-right: none;
  border-radius: var(--b-input-border-radius) 0 0 var(--b-input-border-radius);
}

.b-input__addon--after {
  border-left: none;
  border-radius: 0 var(--b-input-border-radius) var(--b-input-border-radius) 0;
}

/* Dark mode — activated via data attribute on ancestor */
[data-prefers-color='dark'] .b-input {
  --b-input-active-bg: #141414;
  --b-input-active-border-color: #1668dc;
  --b-input-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-input-addon-bg: rgba(255, 255, 255, 0.04);
  --b-input-error-active-shadow: 0 0 0 2px rgba(220, 56, 56, 0.1);
  --b-input-hover-bg: #141414;
  --b-input-hover-border-color: #3c89e8;
  --b-input-warning-active-shadow: 0 0 0 2px rgba(209, 163, 0, 0.1);
  --b-input-border-color: #424242;
  --b-input-bg: #141414;
  --b-input-color: rgba(255, 255, 255, 0.88);
  --b-input-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-input-clear-color: rgba(255, 255, 255, 0.25);
  --b-input-clear-hover-color: rgba(255, 255, 255, 0.45);
  --b-input-count-color: rgba(255, 255, 255, 0.65);
  --b-input-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-input-disabled-color: rgba(255, 255, 255, 0.25);
  --b-input-error-border-color: #dc3838;
  --b-input-error-hover-border-color: #e86e6e;
  --b-input-warning-border-color: #d1a300;
  --b-input-warning-hover-border-color: #e8c631;
  --b-input-filled-bg: rgba(255, 255, 255, 0.08);
  --b-input-filled-hover-bg: rgba(255, 255, 255, 0.12);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-input {
    --b-input-active-bg: #141414;
    --b-input-active-border-color: #1668dc;
    --b-input-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
    --b-input-addon-bg: rgba(255, 255, 255, 0.04);
    --b-input-error-active-shadow: 0 0 0 2px rgba(220, 56, 56, 0.1);
    --b-input-hover-bg: #141414;
    --b-input-hover-border-color: #3c89e8;
    --b-input-warning-active-shadow: 0 0 0 2px rgba(209, 163, 0, 0.1);
    --b-input-border-color: #424242;
    --b-input-bg: #141414;
    --b-input-color: rgba(255, 255, 255, 0.88);
    --b-input-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-input-clear-color: rgba(255, 255, 255, 0.25);
    --b-input-clear-hover-color: rgba(255, 255, 255, 0.45);
    --b-input-count-color: rgba(255, 255, 255, 0.65);
    --b-input-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-input-disabled-color: rgba(255, 255, 255, 0.25);
    --b-input-error-border-color: #dc3838;
    --b-input-error-hover-border-color: #e86e6e;
    --b-input-warning-border-color: #d1a300;
    --b-input-warning-hover-border-color: #e8c631;
    --b-input-filled-bg: rgba(255, 255, 255, 0.08);
    --b-input-filled-hover-bg: rgba(255, 255, 255, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-input__wrapper,
  .b-input__clear,
  .b-input__password-toggle {
    transition: none;
  }
}
</style>
