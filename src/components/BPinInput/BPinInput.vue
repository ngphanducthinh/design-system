<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const {
  length = 6,
  mask = false,
  type = 'number',
  size = BCommonSize.Medium,
  disabled = false,
  autoFocus = false,
  id,
  ariaLabel = 'PIN entry',
} = defineProps<{
  /** Number of cells (digits/characters) in the PIN. @default 6 */
  length?: number;
  /** Render the value as bullets (uses `type="password"` on each cell). @default false */
  mask?: boolean;
  /**
   * Allowed character class:
   * - `'number'` — digits 0-9 only (uses `inputmode="numeric"` + `pattern="[0-9]*"`).
   * - `'text'` — any character.
   * - `'alphanumeric'` — letters + digits only.
   * @default 'number'
   */
  type?: 'number' | 'text' | 'alphanumeric';
  /** Size preset applied to each cell. @default 'md' */
  size?: `${BCommonSize}`;
  /** Disable every cell. @default false */
  disabled?: boolean;
  /** Focus the first non-disabled cell on mount. @default false */
  autoFocus?: boolean;
  /** HTML id attribute applied to the wrapping group element. */
  id?: string;
  /** Accessible label for the wrapping `role="group"` element. @default 'PIN entry' */
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  /** Fired once every cell is filled. The argument is the joined string. */
  complete: [value: string];
}>();

const model = defineModel<string>({ default: '' });

const { componentUID } = useComponentId();
const groupId = computed(() => id ?? `b-pin-input-${componentUID.value}`);

// ─────────────────────────────────────────────
// Cell state
// ─────────────────────────────────────────────
const cellRefs = ref<HTMLInputElement[]>([]);

const cells = computed<string[]>(() => {
  const value = model.value ?? '';
  const out: string[] = Array.from({ length });
  for (let i = 0; i < length; i++) {
    out[i] = value[i] ?? '';
  }
  return out;
});

// ─────────────────────────────────────────────
// Filtering by `type`
// ─────────────────────────────────────────────
const filterChar = (ch: string): string => {
  if (!ch) return '';
  if (type === 'number') return /[0-9]/.test(ch) ? ch : '';
  if (type === 'alphanumeric') return /[A-Za-z0-9]/.test(ch) ? ch : '';
  return ch.length === 1 ? ch : '';
};

const filterString = (raw: string): string => {
  if (type === 'number') return (raw.match(/[0-9]/g) ?? []).join('');
  if (type === 'alphanumeric') return (raw.match(/[A-Za-z0-9]/g) ?? []).join('');
  return raw;
};

const inputMode = computed<'numeric' | 'text'>(() => (type === 'number' ? 'numeric' : 'text'));
const cellPattern = computed<string | undefined>(() =>
  type === 'number' ? '[0-9]*' : undefined,
);
const cellType = computed<'text' | 'password'>(() => (mask ? 'password' : 'text'));

// ─────────────────────────────────────────────
// Helpers — write to the model & emit
// ─────────────────────────────────────────────
const updateModel = (next: string[]) => {
  // Trim trailing empties to keep the joined string compact, but preserve interior gaps
  // by replacing them with the empty string (still filled positions render).
  const joined = next.join('');
  if (joined === model.value) return;
  model.value = joined;
  if (joined.length === length && next.every((c) => c.length === 1)) {
    emit('complete', joined);
  }
};

const focusCell = (index: number) => {
  const target = cellRefs.value[index];
  if (target && !target.disabled) {
    target.focus();
    target.select();
  }
};

// ─────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────
const handleInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  const raw = target.value;

  // The user may have typed a multi-char string (autofill, IME). Take the LAST character
  // so the cell always reflects what they just typed.
  const lastChar = raw.length > 0 ? raw[raw.length - 1] : '';
  const ch = filterChar(lastChar);

  // Force the DOM value to match our filtered char, even if Vue re-renders.
  target.value = ch;

  const next = [...cells.value];
  next[index] = ch;
  updateModel(next);

  if (ch && index < length - 1) {
    void nextTick(() => focusCell(index + 1));
  }
};

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  const key = event.key;

  if (key === 'Backspace') {
    const current = cells.value[index];
    if (current) {
      // Filled cell: clear it in place.
      const next = [...cells.value];
      next[index] = '';
      updateModel(next);
      // Don't preventDefault — let the browser's own backspace handling complete on the
      // already-empty input as well; we've already cleared model state.
      event.preventDefault();
    } else if (index > 0) {
      // Empty cell: hop back and clear that one too.
      event.preventDefault();
      const next = [...cells.value];
      next[index - 1] = '';
      updateModel(next);
      void nextTick(() => focusCell(index - 1));
    }
    return;
  }

  if (key === 'ArrowLeft' && index > 0) {
    event.preventDefault();
    focusCell(index - 1);
    return;
  }

  if (key === 'ArrowRight' && index < length - 1) {
    event.preventDefault();
    focusCell(index + 1);
    return;
  }

  if (key === 'Home') {
    event.preventDefault();
    focusCell(0);
    return;
  }

  if (key === 'End') {
    event.preventDefault();
    focusCell(length - 1);
  }
};

const handlePaste = (event: ClipboardEvent, index: number) => {
  event.preventDefault();
  const pasted = event.clipboardData?.getData('text') ?? '';
  const filtered = filterString(pasted);
  if (!filtered) return;

  const next = [...cells.value];
  let writeAt = index;
  for (const ch of filtered) {
    if (writeAt >= length) break;
    next[writeAt] = ch;
    writeAt += 1;
  }
  updateModel(next);

  // Focus the next empty cell, or the last cell if all are filled.
  const focusIndex = Math.min(writeAt, length - 1);
  void nextTick(() => focusCell(focusIndex));
};

const handleFocus = (event: FocusEvent) => {
  // Convenience: select the cell content on focus so typing replaces it.
  (event.target as HTMLInputElement).select();
};

// ─────────────────────────────────────────────
// External model changes — sanitize against `type`
// ─────────────────────────────────────────────
watch(
  () => model.value,
  (val) => {
    const filtered = filterString(val ?? '').slice(0, length);
    if (filtered !== val) {
      model.value = filtered;
    }
  },
  { immediate: true },
);

// ─────────────────────────────────────────────
// autoFocus + exposed API
// ─────────────────────────────────────────────
const focusFirst = () => {
  for (let i = 0; i < length; i++) {
    const el = cellRefs.value[i];
    if (el && !el.disabled) {
      el.focus();
      el.select();
      return;
    }
  }
};

const focusLast = () => {
  for (let i = length - 1; i >= 0; i--) {
    const el = cellRefs.value[i];
    if (el && !el.disabled) {
      el.focus();
      el.select();
      return;
    }
  }
};

const focus = (index?: number) => {
  if (index === undefined) {
    focusFirst();
    return;
  }
  if (index < 0 || index >= length) return;
  focusCell(index);
};

const clear = () => {
  if (model.value !== '') model.value = '';
  void nextTick(() => focusFirst());
};

onMounted(() => {
  if (autoFocus) {
    void nextTick(() => focusFirst());
  }
});

defineExpose({ focus, clear, focusFirst, focusLast });
</script>

<template>
  <div
    :id="groupId"
    class="b-pin-input"
    :class="[
      `b-pin-input--${size}`,
      {
        'b-pin-input--disabled': disabled,
      },
    ]"
    role="group"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
  >
    <input
      v-for="(cellValue, idx) in cells"
      :key="idx"
      :ref="
        (el) => {
          if (el) cellRefs[idx] = el as HTMLInputElement;
        }
      "
      :value="cellValue"
      :type="cellType"
      :inputmode="inputMode"
      :pattern="cellPattern"
      :disabled="disabled"
      :autocomplete="idx === 0 ? 'one-time-code' : 'off'"
      maxlength="1"
      class="b-pin-input__cell"
      :aria-label="
        type === 'number'
          ? `Digit ${idx + 1} of ${length}`
          : `Character ${idx + 1} of ${length}`
      "
      @input="handleInput($event, idx)"
      @keydown="handleKeyDown($event, idx)"
      @paste="handlePaste($event, idx)"
      @focus="handleFocus"
    />
  </div>
</template>

<style>
.b-pin-input {
  /* ── Tokens ── */
  --b-pin-input-cell-size: 2.5rem;
  --b-pin-input-cell-gap: 0.5rem;
  --b-pin-input-cell-bg: #ffffff;
  --b-pin-input-cell-border-color: #d9d9d9;
  --b-pin-input-cell-border-color-focus: #1677ff;
  --b-pin-input-cell-radius: 6px;
  --b-pin-input-cell-font-size: 1.125rem;
  --b-pin-input-cell-fg: rgba(0, 0, 0, 0.88);
  --b-pin-input-cell-shadow-focus: 0 0 0 2px rgba(5, 145, 255, 0.15);
  --b-pin-input-cell-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-pin-input-cell-disabled-fg: rgba(0, 0, 0, 0.25);

  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--b-pin-input-cell-gap);
  font-family: inherit;
}

.b-pin-input--sm {
  --b-pin-input-cell-size: 2rem;
  --b-pin-input-cell-font-size: 0.95rem;
  --b-pin-input-cell-gap: 0.375rem;
}

.b-pin-input--lg {
  --b-pin-input-cell-size: 3rem;
  --b-pin-input-cell-font-size: 1.375rem;
  --b-pin-input-cell-gap: 0.625rem;
}

.b-pin-input__cell {
  width: var(--b-pin-input-cell-size);
  height: var(--b-pin-input-cell-size);
  padding: 0;
  margin: 0;
  text-align: center;
  font-size: var(--b-pin-input-cell-font-size);
  font-family: inherit;
  font-weight: 500;
  color: var(--b-pin-input-cell-fg);
  background: var(--b-pin-input-cell-bg);
  border: 1px solid var(--b-pin-input-cell-border-color);
  border-radius: var(--b-pin-input-cell-radius);
  outline: none;
  caret-color: var(--b-pin-input-cell-border-color-focus);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
  -moz-appearance: textfield;
  appearance: textfield;
}

.b-pin-input__cell::-webkit-outer-spin-button,
.b-pin-input__cell::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.b-pin-input__cell:hover:not(:disabled) {
  border-color: var(--b-pin-input-cell-border-color-focus);
}

.b-pin-input__cell:focus-visible {
  border-color: var(--b-pin-input-cell-border-color-focus);
  box-shadow: var(--b-pin-input-cell-shadow-focus);
}

.b-pin-input--disabled .b-pin-input__cell,
.b-pin-input__cell:disabled {
  background: var(--b-pin-input-cell-disabled-bg);
  color: var(--b-pin-input-cell-disabled-fg);
  cursor: not-allowed;
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-pin-input {
  --b-pin-input-cell-bg: #141414;
  --b-pin-input-cell-border-color: #424242;
  --b-pin-input-cell-border-color-focus: #1668dc;
  --b-pin-input-cell-fg: rgba(255, 255, 255, 0.88);
  --b-pin-input-cell-shadow-focus: 0 0 0 2px rgba(22, 104, 220, 0.18);
  --b-pin-input-cell-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-pin-input-cell-disabled-fg: rgba(255, 255, 255, 0.25);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-pin-input {
    --b-pin-input-cell-bg: #141414;
    --b-pin-input-cell-border-color: #424242;
    --b-pin-input-cell-border-color-focus: #1668dc;
    --b-pin-input-cell-fg: rgba(255, 255, 255, 0.88);
    --b-pin-input-cell-shadow-focus: 0 0 0 2px rgba(22, 104, 220, 0.18);
    --b-pin-input-cell-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-pin-input-cell-disabled-fg: rgba(255, 255, 255, 0.25);
  }
}

@media (prefers-reduced-motion: reduce) {
  .b-pin-input__cell {
    transition: none;
  }
}
</style>
