<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, ref } from 'vue';

defineOptions({ inheritAttrs: false });

type DelimiterToken = 'enter' | 'comma' | 'space';
type DelimiterProp = DelimiterToken | RegExp | Array<DelimiterToken>;

const {
  size = BCommonSize.Medium,
  disabled = false,
  delimiter = ['enter', 'comma'] as Array<DelimiterToken>,
  max,
  validate,
  allowDuplicate = false,
  placeholder,
  id,
  inputAriaLabel = 'Add tag',
} = defineProps<{
  /** Placeholder shown in the inner input when empty. */
  placeholder?: string;
  /** Visual size preset (sm | md | lg). @default 'md' */
  size?: `${BCommonSize}`;
  /** Disables the whole control (input and remove buttons). @default false */
  disabled?: boolean;
  /**
   * Which key(s) commit the input as a tag. May be a single token, an array of
   * tokens, or a `RegExp` matched against the input value to detect delimiters
   * inside the value itself (used for paste / typed delimiters).
   * Tokens: 'enter' | 'comma' | 'space'.
   * @default ['enter', 'comma']
   */
  delimiter?: DelimiterProp;
  /** Maximum number of tags. When reached the inner input becomes readonly. */
  max?: number;
  /**
   * Optional validator. Return `true` to accept, `false` to reject silently,
   * or a string to reject and emit it as the `invalid` reason.
   */
  validate?: (value: string) => boolean | string;
  /** Whether duplicate tag values are accepted. @default false */
  allowDuplicate?: boolean;
  /** Optional explicit DOM id for the inner input. */
  id?: string;
  /** ARIA label for the inner input. @default 'Add tag' */
  inputAriaLabel?: string;
}>();

const emit = defineEmits<{
  /** Fired after a tag is successfully added. */
  add: [value: string];
  /** Fired after a tag is removed. */
  remove: [value: string, index: number];
  /** Fired when an attempted tag value is rejected. */
  invalid: [value: string, reason: string];
}>();

const model = defineModel<string[]>({ default: () => [] });

const { componentUID } = useComponentId();
const inputId = computed(() => id ?? `b-input-tags-${componentUID.value}`);

const inputRef = ref<HTMLInputElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const inputValue = ref('');
const isFocused = ref(false);

const tags = computed<string[]>(() => model.value ?? []);

const isMaxReached = computed(() => typeof max === 'number' && tags.value.length >= max);

const delimiterTokens = computed<DelimiterToken[]>(() => {
  if (Array.isArray(delimiter)) return delimiter;
  if (typeof delimiter === 'string') return [delimiter];
  return [];
});

const enterCommits = computed(() => delimiterTokens.value.includes('enter'));
const commaCommits = computed(() => delimiterTokens.value.includes('comma'));
const spaceCommits = computed(() => delimiterTokens.value.includes('space'));

/**
 * Returns a regex that, when matched against the raw input value, splits it
 * into committable chunks. Used so that pasting "a, b, c" commits three tags.
 */
const valueDelimiterRegex = computed<RegExp | null>(() => {
  if (delimiter instanceof RegExp) return delimiter;
  const parts: string[] = [];
  if (commaCommits.value) parts.push(',');
  if (spaceCommits.value) parts.push('\\s');
  if (parts.length === 0) return null;
  return new RegExp(`[${parts.join('')}]+`);
});

function tryCommit(rawValue: string): boolean {
  const value = rawValue.trim();
  if (!value) return false;

  if (isMaxReached.value) {
    emit('invalid', value, 'max-reached');
    return false;
  }

  if (!allowDuplicate && tags.value.includes(value)) {
    emit('invalid', value, 'duplicate');
    return false;
  }

  if (validate) {
    const result = validate(value);
    if (result === false) {
      emit('invalid', value, 'invalid');
      return false;
    }
    if (typeof result === 'string') {
      emit('invalid', value, result);
      return false;
    }
  }

  model.value = [...tags.value, value];
  emit('add', value);
  return true;
}

function commitFromInput(): void {
  const raw = inputValue.value;
  const re = valueDelimiterRegex.value;

  if (re) {
    const parts = raw.split(re);
    let anyAdded = false;
    for (const part of parts) {
      if (tryCommit(part)) anyAdded = true;
      if (isMaxReached.value) break;
    }
    if (anyAdded || parts.every((p) => !p.trim())) {
      inputValue.value = '';
    }
    return;
  }

  if (tryCommit(raw)) {
    inputValue.value = '';
  }
}

function removeTag(index: number): void {
  if (disabled) return;
  const value = tags.value[index];
  if (value === undefined) return;
  model.value = tags.value.filter((_, i) => i !== index);
  emit('remove', value, index);
}

function handleKeydown(e: KeyboardEvent): void {
  if (disabled) return;

  if (e.key === 'Enter') {
    if (enterCommits.value) {
      e.preventDefault();
      commitFromInput();
    }
    return;
  }

  if (e.key === ',' && commaCommits.value) {
    e.preventDefault();
    commitFromInput();
    return;
  }

  if (e.key === ' ' && spaceCommits.value) {
    e.preventDefault();
    commitFromInput();
    return;
  }

  if (e.key === 'Backspace' && inputValue.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1);
  }
}

function handleInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;

  // If a RegExp delimiter was provided, react as the user types.
  if (delimiter instanceof RegExp && delimiter.test(inputValue.value)) {
    commitFromInput();
  }
}

function handleBlur(): void {
  isFocused.value = false;
  if (inputValue.value.trim() !== '') {
    commitFromInput();
  }
}

function handleFocus(): void {
  isFocused.value = true;
}

function handleWrapperMousedown(e: MouseEvent): void {
  // Click anywhere on the wrapper background focuses the input. We must NOT
  // hijack clicks on the remove buttons or the input itself.
  const target = e.target as HTMLElement;
  if (target === wrapperRef.value || target.classList.contains('b-input-tags__tags')) {
    e.preventDefault();
    inputRef.value?.focus();
  }
}

function focus(): void {
  inputRef.value?.focus();
}

function clear(): void {
  model.value = [];
  inputValue.value = '';
}

defineExpose({ focus, clear });
</script>

<template>
  <div
    ref="wrapperRef"
    class="b-input-tags"
    :class="[
      `b-input-tags--${size}`,
      {
        'b-input-tags--focused': isFocused,
        'b-input-tags--disabled': disabled,
        'b-input-tags--max-reached': isMaxReached,
      },
    ]"
    role="group"
    :aria-label="inputAriaLabel"
    :aria-disabled="disabled || undefined"
    @mousedown="handleWrapperMousedown"
  >
    <span
      v-for="(tag, index) in tags"
      :key="`${tag}-${index}`"
      class="b-input-tags__tag"
    >
      <span class="b-input-tags__tag-label">{{ tag }}</span>
      <button
        type="button"
        class="b-input-tags__remove"
        :aria-label="`Remove tag ${tag}`"
        :disabled="disabled"
        tabindex="-1"
        @mousedown.prevent
        @click="removeTag(index)"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </span>

    <input
      :id="inputId"
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="b-input-tags__input"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="isMaxReached"
      :aria-label="inputAriaLabel"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      @input="handleInput"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<style>
.b-input-tags {
  --b-input-tags-bg: #ffffff;
  --b-input-tags-border-color: #d9d9d9;
  --b-input-tags-border-color-focus: #1677ff;
  --b-input-tags-radius: 6px;
  --b-input-tags-padding: 2px 4px;
  --b-input-tags-gap: 4px;
  --b-input-tags-color: rgba(0, 0, 0, 0.88);
  --b-input-tags-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-input-tags-shadow-focus: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-input-tags-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-input-tags-disabled-color: rgba(0, 0, 0, 0.25);

  --b-input-tags-tag-bg: rgba(0, 0, 0, 0.06);
  --b-input-tags-tag-fg: rgba(0, 0, 0, 0.88);
  --b-input-tags-tag-radius: 4px;
  --b-input-tags-tag-padding: 0 6px;
  --b-input-tags-tag-gap: 4px;
  --b-input-tags-tag-remove-color: rgba(0, 0, 0, 0.45);
  --b-input-tags-tag-remove-color-hover: rgba(0, 0, 0, 0.88);

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--b-input-tags-gap);
  width: 100%;
  min-height: 32px;
  padding: var(--b-input-tags-padding);
  background: var(--b-input-tags-bg);
  border: 1px solid var(--b-input-tags-border-color);
  border-radius: var(--b-input-tags-radius);
  color: var(--b-input-tags-color);
  font-size: 14px;
  line-height: 1.5714;
  cursor: text;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.b-input-tags--sm {
  min-height: 24px;
  font-size: 14px;
  --b-input-tags-padding: 0 4px;
}

.b-input-tags--lg {
  min-height: 40px;
  font-size: 16px;
  --b-input-tags-padding: 4px 6px;
}

.b-input-tags:hover:not(.b-input-tags--disabled) {
  border-color: var(--b-input-tags-border-color-focus);
}

.b-input-tags--focused {
  border-color: var(--b-input-tags-border-color-focus);
  box-shadow: var(--b-input-tags-shadow-focus);
}

.b-input-tags--disabled {
  background: var(--b-input-tags-disabled-bg);
  color: var(--b-input-tags-disabled-color);
  cursor: not-allowed;
}

.b-input-tags--disabled .b-input-tags__input {
  cursor: not-allowed;
  color: var(--b-input-tags-disabled-color);
}

.b-input-tags--max-reached .b-input-tags__input {
  cursor: not-allowed;
}

.b-input-tags__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--b-input-tags-tag-gap);
  padding: var(--b-input-tags-tag-padding);
  background: var(--b-input-tags-tag-bg);
  color: var(--b-input-tags-tag-fg);
  border-radius: var(--b-input-tags-tag-radius);
  font-size: 0.92em;
  line-height: 1.4;
  max-width: 100%;
}

.b-input-tags__tag-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.b-input-tags__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--b-input-tags-tag-remove-color);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 2px;
  transition: color 0.2s, background 0.2s;
}

.b-input-tags__remove:hover:not(:disabled) {
  color: var(--b-input-tags-tag-remove-color-hover);
  background: rgba(0, 0, 0, 0.06);
}

.b-input-tags__remove:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.b-input-tags__input {
  flex: 1 1 60px;
  min-width: 60px;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  padding: 2px 4px;
}

.b-input-tags__input::placeholder {
  color: var(--b-input-tags-placeholder-color);
}

[data-prefers-color='dark'] .b-input-tags {
  --b-input-tags-bg: #141414;
  --b-input-tags-border-color: #424242;
  --b-input-tags-border-color-focus: #1668dc;
  --b-input-tags-color: rgba(255, 255, 255, 0.88);
  --b-input-tags-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-input-tags-shadow-focus: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-input-tags-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-input-tags-disabled-color: rgba(255, 255, 255, 0.25);
  --b-input-tags-tag-bg: rgba(255, 255, 255, 0.08);
  --b-input-tags-tag-fg: rgba(255, 255, 255, 0.88);
  --b-input-tags-tag-remove-color: rgba(255, 255, 255, 0.45);
  --b-input-tags-tag-remove-color-hover: rgba(255, 255, 255, 0.88);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-input-tags {
    --b-input-tags-bg: #141414;
    --b-input-tags-border-color: #424242;
    --b-input-tags-border-color-focus: #1668dc;
    --b-input-tags-color: rgba(255, 255, 255, 0.88);
    --b-input-tags-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-input-tags-shadow-focus: 0 0 0 2px rgba(22, 104, 220, 0.15);
    --b-input-tags-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-input-tags-disabled-color: rgba(255, 255, 255, 0.25);
    --b-input-tags-tag-bg: rgba(255, 255, 255, 0.08);
    --b-input-tags-tag-fg: rgba(255, 255, 255, 0.88);
    --b-input-tags-tag-remove-color: rgba(255, 255, 255, 0.45);
    --b-input-tags-tag-remove-color-hover: rgba(255, 255, 255, 0.88);
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-input-tags,
  .b-input-tags__remove {
    transition: none;
  }
}
</style>
