<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, ref, watch, nextTick, useAttrs } from 'vue';
import {
  BAutoCompleteStatus,
  BAutoCompleteVariant,
  type BAutoCompleteOption,
} from './types.ts';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const {
  options = [],
  size = BCommonSize.Medium,
  variant = BAutoCompleteVariant.Outlined,
  defaultActiveFirstOption = true,
  backfill = false,
  allowClear = false,
  popupMatchSelectWidth = true,
  placeholder,
  filterOption = true,
} = defineProps<{
  /** Data source for autocomplete suggestions. */
  options?: BAutoCompleteOption[];
  /** Size of the input. */
  size?: `${BCommonSize}`;
  /** Visual variant. */
  variant?: `${BAutoCompleteVariant}`;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Validation status. */
  status?: `${BAutoCompleteStatus}`;
  /** Placeholder text. */
  placeholder?: string;
  /** Whether to highlight the first option automatically. */
  defaultActiveFirstOption?: boolean;
  /** Whether to backfill input with the currently highlighted option value. */
  backfill?: boolean;
  /** Show clear button. */
  allowClear?: boolean;
  /** Controlled open state for dropdown. */
  open?: boolean;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Content shown when no results match. Set to `null` to hide dropdown when empty. */
  notFoundContent?: string | null;
  /** Whether the dropdown width matches the input width. */
  popupMatchSelectWidth?: boolean | number;
  /** Filter options by input value. `true` uses default filter, function for custom. */
  filterOption?: boolean | ((inputValue: string, option: BAutoCompleteOption) => boolean);
}>();

const emit = defineEmits<{
  /** Fired when the selected value or input text changes. */
  change: [value: string];
  /** Fired when an option is selected from the dropdown. */
  select: [value: string, option: BAutoCompleteOption];
  /** Fired when searching (input text changes). */
  search: [value: string];
  /** Fired when dropdown visibility changes. */
  openChange: [open: boolean];
  /** Fired on input focus. */
  focus: [event: FocusEvent];
  /** Fired on input blur. */
  blur: [event: FocusEvent];
  /** Fired when the clear button is clicked. */
  clear: [];
  /** Fired on input keydown. */
  inputKeyDown: [event: KeyboardEvent];
  /** Fired on dropdown scroll. */
  popupScroll: [event: Event];
}>();

const model = defineModel<string>({ default: '' });

const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-auto-complete-anchor-${componentUID.value}`);

const inputRef = ref<HTMLInputElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const activeIndex = ref(-1);
const inputValue = ref(model.value ?? '');

const filteredOptions = computed(() => {
  if (!filterOption) return options;
  if (typeof filterOption === 'function') {
    return options.filter((opt) => filterOption(inputValue.value, opt));
  }
  const query = inputValue.value.toLowerCase();
  if (!query) return options;
  return options.filter((opt) => {
    const text = (opt.label ?? opt.value).toLowerCase();
    return text.includes(query);
  });
});

const showDropdown = computed(() => {
  if (filteredOptions.value.length === 0) return false;
  return isOpen.value;
});

const getOptionLabel = (opt: BAutoCompleteOption) => opt.label ?? opt.value;

const openMenu = () => {
  if (isOpen.value) return;
  menuRef.value?.showPopover();
};

const closeMenu = () => {
  if (!isOpen.value) return;
  menuRef.value?.hidePopover();
};

const handleToggle = ({ newState }: ToggleEvent) => {
  const nowOpen = newState === 'open';
  isOpen.value = nowOpen;
  emit('openChange', nowOpen);
  if (nowOpen && defaultActiveFirstOption && filteredOptions.value.length > 0) {
    activeIndex.value = 0;
  } else if (!nowOpen) {
    activeIndex.value = -1;
  }
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;
  model.value = target.value;
  emit('change', target.value);
  emit('search', target.value);
  activeIndex.value = defaultActiveFirstOption ? 0 : -1;
  openMenu();
};

const selectOption = (opt: BAutoCompleteOption) => {
  if (opt.disabled) return;
  inputValue.value = opt.value;
  model.value = opt.value;
  emit('select', opt.value, opt);
  emit('change', opt.value);
  closeMenu();
  inputRef.value?.focus();
};

const handleClear = () => {
  inputValue.value = '';
  model.value = '';
  emit('change', '');
  emit('clear');
  inputRef.value?.focus();
};

const handleFocus = (e: FocusEvent) => {
  emit('focus', e);
  openMenu();
};

const handleBlur = (e: FocusEvent) => {
  const related = e.relatedTarget as HTMLElement | null;
  if (menuRef.value?.contains(related)) return;
  emit('blur', e);
  closeMenu();
};

const handleKeyDown = (e: KeyboardEvent) => {
  emit('inputKeyDown', e);

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      const nextIdx = activeIndex.value + 1;
      const opts = filteredOptions.value;
      for (let i = 0; i < opts.length; i++) {
        const idx = (nextIdx + i) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
          if (backfill) {
            inputValue.value = opts[idx].value;
          }
          break;
        }
      }
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      if (!isOpen.value) {
        openMenu();
        return;
      }
      const prevIdx = activeIndex.value - 1;
      const opts = filteredOptions.value;
      for (let i = 0; i < opts.length; i++) {
        const idx = ((prevIdx - i) % opts.length + opts.length) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
          if (backfill) {
            inputValue.value = opts[idx].value;
          }
          break;
        }
      }
      break;
    }
    case 'Enter': {
      e.preventDefault();
      if (isOpen.value && activeIndex.value >= 0) {
        const opt = filteredOptions.value[activeIndex.value];
        if (opt && !opt.disabled) {
          selectOption(opt);
        }
      }
      break;
    }
    case 'Escape': {
      e.preventDefault();
      closeMenu();
      break;
    }
  }
};

const handlePopupScroll = (e: Event) => {
  emit('popupScroll', e);
};

const scrollActiveIntoView = () => {
  nextTick(() => {
    const active = menuRef.value?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  });
};

watch(activeIndex, scrollActiveIntoView);

watch(model, (val) => {
  if (val !== inputValue.value) {
    inputValue.value = val ?? '';
  }
});

watch(
  () => filteredOptions.value,
  (opts) => {
    if (opts.length === 0) {
      closeMenu();
    }
  },
);

const listboxId = computed(() => `b-auto-complete-listbox-${componentUID.value}`);

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<template>
  <div
    class="b-auto-complete b:relative b:inline-flex b:w-full b:items-center"
    :class="{ 'b-auto-complete--disabled': disabled }"
  >
    <input
      ref="inputRef"
      v-bind="attrs"
      :value="inputValue"
      class="b-auto-complete__input b:box-border b:w-full b:outline-none b:transition-all b:placeholder:text-zinc-300"
      :class="[
        {
          'b:h-6 b:px-2 b:text-sm': size === BCommonSize.Small,
          'b:h-8 b:px-3 b:text-sm': size === BCommonSize.Medium,
          'b:h-10 b:px-3 b:text-base': size === BCommonSize.Large,
        },
        {
          'b:rounded-lg b:border-1 b:border-[var(--b-auto-complete-border-color)] b:hover:not-disabled:border-[var(--b-auto-complete-hover-border-color)] b:focus:not-disabled:border-[var(--b-auto-complete-active-border-color)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-auto-complete-active-outline-color)]':
            variant === BAutoCompleteVariant.Outlined,
          'b:rounded-lg b:border-1 b:border-transparent b:bg-[var(--b-auto-complete-selector-bg)] b:focus:not-disabled:border-[var(--b-auto-complete-active-border-color)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-auto-complete-active-outline-color)]':
            variant === BAutoCompleteVariant.Filled,
          'b:border-none b:bg-transparent':
            variant === BAutoCompleteVariant.Borderless,
        },
        {
          'b:border-red-500! b:hover:not-disabled:border-red-400!': status === BAutoCompleteStatus.Error,
          'b:border-yellow-500! b:hover:not-disabled:border-yellow-400!': status === BAutoCompleteStatus.Warning,
        },
        {
          'b:cursor-not-allowed b:opacity-40': disabled,
        },
      ]"
      :placeholder="placeholder"
      :disabled="disabled"
      role="combobox"
      autocomplete="off"
      :aria-expanded="showDropdown"
      :aria-controls="showDropdown ? listboxId : undefined"
      :aria-activedescendant="activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeyDown"
    />

    <button
      v-if="allowClear && inputValue && !disabled"
      type="button"
      class="b-auto-complete__clear b:absolute b:right-2 b:flex b:h-4 b:w-4 b:cursor-pointer b:items-center b:justify-center b:rounded-full b:border-none b:bg-[var(--b-auto-complete-clear-bg)] b:text-xs b:text-zinc-400 b:hover:text-zinc-600"
      aria-label="Clear input"
      tabindex="-1"
      @mousedown.prevent="handleClear"
    >
      &#x2715;
    </button>

    <div
      ref="menuRef"
      :id="listboxId"
      class="b-auto-complete__dropdown b:overflow-auto b:rounded-lg b:bg-white b:shadow-lg"
      :class="{ 'b:w-[anchor-size(width)]': popupMatchSelectWidth === true }"
      :style="typeof popupMatchSelectWidth === 'number' ? { width: `${popupMatchSelectWidth}px` } : undefined"
      popover
      role="listbox"
      @toggle="handleToggle"
      @scroll="handlePopupScroll"
    >
      <ul class="b:m-0 b:list-none b:p-1">
        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :id="`${listboxId}-option-${idx}`"
          class="b-auto-complete__option b:cursor-pointer b:rounded-md b:px-[var(--b-auto-complete-option-padding-x)] b:py-[var(--b-auto-complete-option-padding-y)] b:text-[length:var(--b-auto-complete-option-font-size)] b:leading-[var(--b-auto-complete-option-line-height)] b:transition-colors"
          :class="[
            {
              'b:bg-[var(--b-auto-complete-option-active-bg)]': idx === activeIndex && !opt.disabled,
              'b:bg-[var(--b-auto-complete-option-selected-bg)] b:font-[var(--b-auto-complete-option-selected-font-weight)] b:text-[color:var(--b-auto-complete-option-selected-color)]':
                opt.value === model && idx !== activeIndex,
              'b:cursor-not-allowed b:opacity-40': opt.disabled,
              'b:hover:not-disabled:bg-[var(--b-auto-complete-option-active-bg)]': !opt.disabled && idx !== activeIndex,
            },
          ]"
          :data-active="idx === activeIndex"
          :aria-selected="opt.value === model"
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
    </div>
  </div>
</template>

<style scoped>
.b-auto-complete {
  --b-auto-complete-active-border-color: #1677ff;
  --b-auto-complete-active-outline-color: rgba(5, 145, 255, 0.1);
  --b-auto-complete-hover-border-color: #4096ff;
  --b-auto-complete-border-color: #d9d9d9;
  --b-auto-complete-clear-bg: #ffffff;
  --b-auto-complete-selector-bg: rgba(0, 0, 0, 0.04);
  --b-auto-complete-option-active-bg: rgba(0, 0, 0, 0.04);
  --b-auto-complete-option-font-size: 14px;
  --b-auto-complete-option-height: 32px;
  --b-auto-complete-option-line-height: 1.5714;
  --b-auto-complete-option-padding-x: 12px;
  --b-auto-complete-option-padding-y: 5px;
  --b-auto-complete-option-selected-bg: #e6f4ff;
  --b-auto-complete-option-selected-color: rgba(0, 0, 0, 0.88);
  --b-auto-complete-option-selected-font-weight: 600;
  --b-auto-complete-z-index-popup: 1050;
}

@media (prefers-color-scheme: dark) {
  .b-auto-complete {
    --b-auto-complete-active-border-color: #1668dc;
    --b-auto-complete-active-outline-color: rgba(22, 104, 220, 0.15);
    --b-auto-complete-hover-border-color: #3c89e8;
    --b-auto-complete-border-color: #424242;
    --b-auto-complete-clear-bg: #1f1f1f;
    --b-auto-complete-selector-bg: rgba(255, 255, 255, 0.08);
    --b-auto-complete-option-active-bg: rgba(255, 255, 255, 0.08);
    --b-auto-complete-option-selected-bg: #111a2c;
    --b-auto-complete-option-selected-color: rgba(255, 255, 255, 0.88);
  }
}

[data-prefers-color='dark'] .b-auto-complete {
  --b-auto-complete-active-border-color: #1668dc;
  --b-auto-complete-active-outline-color: rgba(22, 104, 220, 0.15);
  --b-auto-complete-hover-border-color: #3c89e8;
  --b-auto-complete-border-color: #424242;
  --b-auto-complete-clear-bg: #1f1f1f;
  --b-auto-complete-selector-bg: rgba(255, 255, 255, 0.08);
  --b-auto-complete-option-active-bg: rgba(255, 255, 255, 0.08);
  --b-auto-complete-option-selected-bg: #111a2c;
  --b-auto-complete-option-selected-color: rgba(255, 255, 255, 0.88);
}

.b-auto-complete__input {
  anchor-name: v-bind('anchorName');
}

.b-auto-complete__dropdown {
  position: absolute;
  margin-top: 4px;
  z-index: var(--b-auto-complete-z-index-popup);
  max-height: 256px;

  position-anchor: v-bind('anchorName');
  position-try-fallbacks: --b-ac-top;
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);

  transition:
    display 0.2s,
    opacity 0.2s;
  transition-behavior: allow-discrete;
  opacity: 0;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

@position-try --b-ac-top {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
}

@media (prefers-reduced-motion: reduce) {
  .b-auto-complete__dropdown {
    transition: none;
  }
}
</style>
