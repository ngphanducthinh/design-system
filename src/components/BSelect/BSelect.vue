<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import {
  BSelectMode,
  BSelectPlacement,
  BSelectStatus,
  BSelectVariant,
  type BSelectFieldNames,
  type BSelectOption,
} from './types.ts';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const {
  options = [],
  size = BCommonSize.Medium,
  variant = BSelectVariant.Outlined,
  defaultActiveFirstOption = true,
  allowClear = false,
  popupMatchSelectWidth = true,
  showSearch = false,
  listHeight = 256,
  loading = false,
  maxTagCount,
  maxCount,
  placement: _placement = BSelectPlacement.BottomLeft,
  filterOption = true,
  notFoundContent = 'No data',
  fieldNames,
  placeholder,
  mode,
  tokenSeparators,
  disabled,
  status,
  open,
} = defineProps<{
  /** Data source options array. */
  options?: BSelectOption[];
  /** Size of the selector. */
  size?: `${BCommonSize}`;
  /** Visual variant. */
  variant?: `${BSelectVariant}`;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Validation status. */
  status?: `${BSelectStatus}`;
  /** Placeholder text. */
  placeholder?: string;
  /** Selection mode: multiple or tags. */
  mode?: `${BSelectMode}`;
  /** Whether to activate the first option by default. */
  defaultActiveFirstOption?: boolean;
  /** Show clear button. */
  allowClear?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Whether to show search input. Automatically true in multiple/tags mode. */
  showSearch?: boolean;
  /** Whether dropdown width matches selector width. */
  popupMatchSelectWidth?: boolean | number;
  /** Max height of popup list in px. */
  listHeight?: number;
  /** Loading state. */
  loading?: boolean;
  /** Max tag count visible (multiple/tags mode). */
  maxTagCount?: number | 'responsive';
  /** Max selected items (multiple/tags mode). */
  maxCount?: number;
  /** Dropdown placement. */
  placement?: `${BSelectPlacement}`;
  /** Content shown when no options match. Set to null to hide. */
  notFoundContent?: string | null;
  /** Customize field names mapping. */
  fieldNames?: BSelectFieldNames;
  /** Filter options by input. true uses default, function for custom. */
  filterOption?: boolean | ((inputValue: string, option: BSelectOption) => boolean);
  /** Separators for tags mode to auto-tokenize. */
  tokenSeparators?: string[];
  /** Whether the selected option label is included in value. */
  labelInValue?: boolean;
}>();

const emit = defineEmits<{
  /** Fired when value changes. */
  change: [value: string | number | (string | number)[], option: BSelectOption | BSelectOption[]];
  /** Fired when an option is selected. */
  select: [value: string | number, option: BSelectOption];
  /** Fired when an option is deselected (multiple/tags). */
  deselect: [value: string | number, option: BSelectOption];
  /** Fired on focus. */
  focus: [event: FocusEvent];
  /** Fired on blur. */
  blur: [event: FocusEvent];
  /** Fired when clear button is clicked. */
  clear: [];
  /** Fired when dropdown opens/closes. */
  openChange: [open: boolean];
  /** Fired when searching (multiple/tags mode). */
  search: [value: string];
  /** Fired on dropdown scroll. */
  popupScroll: [event: Event];
  /** Fired on input keydown. */
  inputKeyDown: [event: KeyboardEvent];
}>();

const model = defineModel<string | number | (string | number)[] | null | undefined>();

const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-select-anchor-${componentUID.value}`);
const listboxId = computed(() => `b-select-listbox-${componentUID.value}`);

const selectorRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const activeIndex = ref(-1);
const searchValue = ref('');

const labelField = computed(() => fieldNames?.label ?? 'label');
const valueField = computed(() => fieldNames?.value ?? 'value');
const optionsField = computed(() => fieldNames?.options ?? 'options');

const isSearchable = computed(() => {
  if (mode === BSelectMode.Multiple || mode === BSelectMode.Tags) return true;
  return showSearch;
});

const getOptionLabel = (opt: BSelectOption): string => {
  const record = opt as unknown as Record<string, unknown>;
  const label = record[labelField.value];
  const value = record[valueField.value];
  return String(label ?? value ?? '');
};

const getOptionValue = (opt: BSelectOption): string | number => {
  const record = opt as unknown as Record<string, unknown>;
  return record[valueField.value] as string | number;
};

const flatOptions = computed((): BSelectOption[] => {
  const result: BSelectOption[] = [];
  for (const opt of options) {
    const record = opt as unknown as Record<string, unknown>;
    const nested = record[optionsField.value] as BSelectOption[] | undefined;
    if (nested && Array.isArray(nested)) {
      for (const child of nested) {
        result.push(child);
      }
    } else {
      result.push(opt);
    }
  }
  return result;
});

const filteredOptions = computed((): BSelectOption[] => {
  if (!searchValue.value || !isSearchable.value) return flatOptions.value;
  if (filterOption === false) return flatOptions.value;
  if (typeof filterOption === 'function') {
    return flatOptions.value.filter((opt) => filterOption(searchValue.value, opt));
  }
  const query = searchValue.value.toLowerCase();
  return flatOptions.value.filter((opt) => {
    return getOptionLabel(opt).toLowerCase().includes(query);
  });
});

const selectedValues = computed((): (string | number)[] => {
  if (model.value == null) return [];
  if (Array.isArray(model.value)) return model.value;
  return [model.value];
});

const selectedOptions = computed((): BSelectOption[] => {
  return selectedValues.value
    .map((v) => flatOptions.value.find((opt) => getOptionValue(opt) === v))
    .filter(Boolean) as BSelectOption[];
});

const displayLabel = computed((): string => {
  if (isMultipleMode.value) return '';
  if (selectedOptions.value.length === 0) return '';
  return getOptionLabel(selectedOptions.value[0]);
});

const isMultipleMode = computed(() => {
  return mode === BSelectMode.Multiple || mode === BSelectMode.Tags;
});

const visibleTags = computed(() => {
  if (maxTagCount == null || maxTagCount === 'responsive') return selectedOptions.value;
  return selectedOptions.value.slice(0, maxTagCount as number);
});

const hiddenTagCount = computed(() => {
  if (maxTagCount == null || maxTagCount === 'responsive') return 0;
  return Math.max(0, selectedOptions.value.length - (maxTagCount as number));
});

const isOptionSelected = (opt: BSelectOption): boolean => {
  return selectedValues.value.includes(getOptionValue(opt));
};

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
  if (nowOpen) {
    if (defaultActiveFirstOption && filteredOptions.value.length > 0) {
      activeIndex.value = 0;
    }
    nextTick(() => {
      if (isSearchable.value) {
        searchInputRef.value?.focus();
      }
    });
  } else {
    activeIndex.value = -1;
    searchValue.value = '';
  }
};

const selectSingleOption = (opt: BSelectOption) => {
  if (opt.disabled) return;
  const val = getOptionValue(opt);
  model.value = val;
  emit('select', val, opt);
  emit('change', val, opt);
  closeMenu();
  nextTick(() => selectorRef.value?.focus());
};

const selectMultipleOption = (opt: BSelectOption) => {
  if (opt.disabled) return;
  const val = getOptionValue(opt);
  const current = selectedValues.value.slice();

  if (current.includes(val)) {
    const next = current.filter((v) => v !== val);
    model.value = next;
    emit('deselect', val, opt);
    emit(
      'change',
      next,
      next.map((v) => flatOptions.value.find((o) => getOptionValue(o) === v)!).filter(Boolean),
    );
  } else {
    if (maxCount != null && current.length >= maxCount) return;
    const next = [...current, val];
    model.value = next;
    emit('select', val, opt);
    emit(
      'change',
      next,
      next.map((v) => flatOptions.value.find((o) => getOptionValue(o) === v)!).filter(Boolean),
    );
  }
  searchValue.value = '';
  nextTick(() => searchInputRef.value?.focus());
};

const selectOption = (opt: BSelectOption) => {
  if (isMultipleMode.value) {
    selectMultipleOption(opt);
  } else {
    selectSingleOption(opt);
  }
};

const removeTag = (val: string | number) => {
  const opt = flatOptions.value.find((o) => getOptionValue(o) === val);
  const next = selectedValues.value.filter((v) => v !== val);
  model.value = next;
  if (opt) emit('deselect', val, opt);
  emit(
    'change',
    next,
    next.map((v) => flatOptions.value.find((o) => getOptionValue(o) === v)!).filter(Boolean),
  );
};

const handleClear = (e: Event) => {
  e.stopPropagation();
  if (isMultipleMode.value) {
    model.value = [];
  } else {
    model.value = undefined;
  }
  searchValue.value = '';
  emit('clear');
  emit(
    'change',
    isMultipleMode.value ? [] : (undefined as unknown as string),
    [] as unknown as BSelectOption,
  );
};

const handleSelectorClick = () => {
  if (disabled) return;
  if (isOpen.value) {
    closeMenu();
  } else {
    openMenu();
  }
};

const handleSelectorFocus = (e: FocusEvent) => {
  emit('focus', e);
};

const handleSelectorBlur = (e: FocusEvent) => {
  const related = e.relatedTarget as HTMLElement | null;
  if (menuRef.value?.contains(related)) return;
  if (selectorRef.value?.contains(related)) return;
  emit('blur', e);
  closeMenu();
};

const handleSearchInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchValue.value = target.value;
  emit('search', target.value);

  if (mode === BSelectMode.Tags && tokenSeparators) {
    const separators = tokenSeparators;
    for (const sep of separators) {
      if (target.value.includes(sep)) {
        const parts = target.value.split(
          new RegExp(
            `[${separators.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}]`,
          ),
        );
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed && !selectedValues.value.includes(trimmed)) {
            const existing = flatOptions.value.find(
              (o) => getOptionValue(o) === trimmed || getOptionLabel(o) === trimmed,
            );
            if (existing) {
              selectMultipleOption(existing);
            } else {
              const current = selectedValues.value.slice();
              const next = [...current, trimmed];
              model.value = next;
              emit('select', trimmed, { value: trimmed, label: trimmed });
              emit(
                'change',
                next,
                next.map(
                  (v) =>
                    flatOptions.value.find((o) => getOptionValue(o) === v) ?? {
                      value: v,
                      label: String(v),
                    },
                ),
              );
            }
          }
        }
        searchValue.value = '';
        break;
      }
    }
  }

  if (!isOpen.value) openMenu();
  activeIndex.value = defaultActiveFirstOption ? 0 : -1;
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
      const opts = filteredOptions.value;
      const nextIdx = activeIndex.value + 1;
      for (let i = 0; i < opts.length; i++) {
        const idx = (nextIdx + i) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
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
      const opts = filteredOptions.value;
      const prevIdx = activeIndex.value - 1;
      for (let i = 0; i < opts.length; i++) {
        const idx = (((prevIdx - i) % opts.length) + opts.length) % opts.length;
        if (!opts[idx].disabled) {
          activeIndex.value = idx;
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
      } else if (!isOpen.value) {
        openMenu();
      }
      break;
    }
    case ' ': {
      if (!isSearchable.value || !searchValue.value) {
        e.preventDefault();
        if (!isOpen.value) {
          openMenu();
        } else if (activeIndex.value >= 0) {
          const opt = filteredOptions.value[activeIndex.value];
          if (opt && !opt.disabled) {
            selectOption(opt);
          }
        }
      }
      break;
    }
    case 'Escape': {
      e.preventDefault();
      closeMenu();
      selectorRef.value?.focus();
      break;
    }
    case 'Backspace': {
      if (isMultipleMode.value && !searchValue.value && selectedValues.value.length > 0) {
        const lastVal = selectedValues.value[selectedValues.value.length - 1];
        removeTag(lastVal);
      }
      break;
    }
    case 'Tab': {
      if (isOpen.value) {
        closeMenu();
      }
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

watch(
  () => open,
  (val) => {
    if (val === true && !isOpen.value) openMenu();
    else if (val === false && isOpen.value) closeMenu();
  },
);

const showClear = computed(() => {
  if (!allowClear || disabled) return false;
  if (isMultipleMode.value) return selectedValues.value.length > 0;
  return model.value != null && model.value !== '';
});

defineExpose({
  focus: () => selectorRef.value?.focus(),
  blur: () => selectorRef.value?.blur(),
});
</script>

<template>
  <div
    class="b-select b:relative b:inline-flex b:w-full"
    :class="{ 'b-select--disabled': disabled }"
  >
    <!-- Selector trigger -->
    <div
      ref="selectorRef"
      v-bind="attrs"
      class="b-select__selector b:box-border b:flex b:w-full b:cursor-pointer b:items-center b:gap-1 b:transition-all b:outline-none"
      :class="[
        {
          'b:min-h-6 b:px-2 b:text-sm': size === BCommonSize.Small,
          'b:min-h-8 b:px-3 b:text-sm': size === BCommonSize.Medium,
          'b:min-h-10 b:px-3 b:text-base': size === BCommonSize.Large,
        },
        {
          'b:rounded-lg b:border-1 b:border-[var(--b-select-border-color)] b:bg-[var(--b-select-selector-bg)] b:hover:not-disabled:border-[var(--b-select-hover-border-color)] b:focus:not-disabled:border-[var(--b-select-active-border-color)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-select-active-outline-color)]':
            variant === BSelectVariant.Outlined,
          'b:rounded-lg b:border-1 b:border-transparent b:bg-[var(--b-select-filled-bg)] b:hover:not-disabled:bg-[var(--b-select-filled-bg)] b:focus:not-disabled:border-[var(--b-select-active-border-color)] b:focus:not-disabled:bg-[var(--b-select-selector-bg)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-select-active-outline-color)]':
            variant === BSelectVariant.Filled,
          'b:rounded-lg b:border-1 b:border-transparent b:bg-transparent':
            variant === BSelectVariant.Borderless,
        },
        {
          'b:border-red-500! b:hover:not-disabled:border-red-400! b:focus:not-disabled:border-red-500! b:focus:not-disabled:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]!':
            status === BSelectStatus.Error,
          'b:border-yellow-500! b:hover:not-disabled:border-yellow-400! b:focus:not-disabled:border-yellow-500! b:focus:not-disabled:shadow-[0_0_0_2px_rgba(255,215,5,0.1)]!':
            status === BSelectStatus.Warning,
        },
        {
          'b:cursor-not-allowed b:opacity-40': disabled,
        },
        {
          'b-select__selector--open': isOpen,
        },
      ]"
      :tabindex="disabled ? -1 : 0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? listboxId : undefined"
      :aria-activedescendant="isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined"
      aria-haspopup="listbox"
      :aria-label="placeholder ?? 'Select'"
      :aria-disabled="disabled ?? false"
      @click="handleSelectorClick"
      @focus="handleSelectorFocus"
      @blur="handleSelectorBlur"
      @keydown="handleKeyDown"
    >
      <!-- Multiple mode: tags -->
      <template v-if="isMultipleMode">
        <span
          v-for="opt in visibleTags"
          :key="getOptionValue(opt)"
          class="b-select__tag b:inline-flex b:max-w-full b:items-center b:gap-0.5 b:rounded b:border-1 b:border-[var(--b-select-multiple-item-border-color)] b:bg-[var(--b-select-multiple-item-bg)] b:leading-none"
          :class="[
            {
              'b:h-4 b:px-1 b:text-xs': size === BCommonSize.Small,
              'b:h-6 b:px-1.5 b:text-xs': size === BCommonSize.Medium,
              'b:h-8 b:px-2 b:text-sm': size === BCommonSize.Large,
            },
          ]"
        >
          <span class="b:truncate">{{ getOptionLabel(opt) }}</span>
          <button
            type="button"
            class="b-select__tag-close b:ml-0.5 b:flex b:h-3.5 b:w-3.5 b:cursor-pointer b:items-center b:justify-center b:rounded-full b:border-none b:bg-transparent b:text-[10px] b:text-zinc-400 b:hover:bg-zinc-200 b:hover:text-zinc-600"
            :aria-label="`Remove ${getOptionLabel(opt)}`"
            tabindex="-1"
            @click.stop="removeTag(getOptionValue(opt))"
            @mousedown.prevent
          >
            <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </span>
        <span
          v-if="hiddenTagCount > 0"
          class="b-select__tag b-select__tag--count b:relative b:z-1 b:inline-flex b:shrink-0 b:items-center b:rounded b:bg-[var(--b-select-multiple-count-bg)] b:px-1.5 b:text-xs b:leading-none b:text-[var(--b-select-multiple-count-color)]"
          :class="[
            {
              'b:h-4': size === BCommonSize.Small,
              'b:h-6': size === BCommonSize.Medium,
              'b:h-8': size === BCommonSize.Large,
            },
          ]"
        >
          +{{ hiddenTagCount }}
        </span>
        <input
          ref="searchInputRef"
          class="b-select__search b:min-w-4 b:flex-1 b:border-none b:bg-transparent b:text-sm b:outline-none b:placeholder:text-[var(--b-select-placeholder-color)]"
          :value="searchValue"
          :placeholder="selectedValues.length === 0 ? placeholder : undefined"
          :disabled="disabled"
          :aria-label="placeholder ?? 'Search options'"
          autocomplete="off"
          @input="handleSearchInput"
          @keydown="handleKeyDown"
          @focus="handleSelectorFocus"
          @blur="handleSelectorBlur"
        />
      </template>

      <!-- Single mode -->
      <template v-else>
        <span
          v-if="displayLabel && !searchValue"
          class="b-select__value b:flex-1 b:truncate b:text-[color:var(--b-select-color)]"
        >
          <slot name="selectedLabel" :option="selectedOptions[0]">
            {{ displayLabel }}
          </slot>
        </span>
        <span
          v-else-if="!searchValue && !displayLabel"
          class="b-select__placeholder b:flex-1 b:truncate b:text-[var(--b-select-placeholder-color)]"
        >
          {{ placeholder }}
        </span>
        <input
          v-if="isSearchable"
          ref="searchInputRef"
          class="b-select__search b:absolute b:inset-0 b:w-full b:border-none b:bg-transparent b:px-3 b:text-sm b:outline-none b:placeholder:text-[var(--b-select-placeholder-color)]"
          :class="{ 'b:opacity-0': !isOpen }"
          :value="searchValue"
          :disabled="disabled"
          :aria-label="placeholder ?? 'Search options'"
          autocomplete="off"
          tabindex="-1"
          @input="handleSearchInput"
          @keydown="handleKeyDown"
        />
      </template>

      <!-- Clear button -->
      <button
        v-if="showClear"
        type="button"
        class="b-select__clear b:z-1 b:flex b:h-4 b:w-4 b:shrink-0 b:cursor-pointer b:items-center b:justify-center b:rounded-full b:border-none b:bg-[var(--b-select-clear-bg)] b:text-xs b:text-zinc-400 b:hover:text-zinc-600"
        aria-label="Clear selection"
        tabindex="-1"
        @click="handleClear"
        @mousedown.prevent
      >
        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>

      <!-- Suffix arrow -->
      <span
        class="b-select__arrow b:ml-auto b:flex b:shrink-0 b:items-center b:text-zinc-400 b:transition-transform b:duration-200"
        :class="{ 'b:rotate-180': isOpen }"
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <!-- Loading spinner -->
      <span
        v-if="loading"
        class="b-select__loading b:ml-1 b:flex b:shrink-0 b:animate-spin b:items-center b:text-zinc-400"
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle
            cx="7"
            cy="7"
            r="5.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-dasharray="24"
            stroke-linecap="round"
          />
        </svg>
      </span>
    </div>

    <!-- Dropdown popup -->
    <div
      ref="menuRef"
      :id="listboxId"
      class="b-select__dropdown b:overflow-auto b:rounded-lg b:bg-[var(--b-select-selector-bg)] b:shadow-lg"
      :class="{ 'b:w-[anchor-size(width)]': popupMatchSelectWidth === true }"
      :style="[
        typeof popupMatchSelectWidth === 'number'
          ? { width: `${popupMatchSelectWidth}px` }
          : undefined,
        { maxHeight: `${listHeight}px` },
      ]"
      popover
      role="listbox"
      :aria-multiselectable="isMultipleMode || undefined"
      :aria-label="placeholder ?? 'Options'"
      @toggle="handleToggle"
      @scroll="handlePopupScroll"
    >
      <!-- Options -->
      <div v-if="filteredOptions.length > 0" class="b:p-1">
        <template v-for="(opt, idx) in filteredOptions" :key="getOptionValue(opt)">
          <div
            :id="`${listboxId}-option-${idx}`"
            class="b-select__option b:cursor-pointer b:rounded-md b:px-[var(--b-select-option-padding-x)] b:py-[var(--b-select-option-padding-y)] b:text-[length:var(--b-select-option-font-size)] b:leading-[var(--b-select-option-line-height)] b:transition-colors"
            :class="[
              {
                'b:bg-[var(--b-select-option-active-bg)]': idx === activeIndex && !opt.disabled,
                'b:bg-[var(--b-select-option-selected-bg)] b:font-[var(--b-select-option-selected-font-weight)] b:text-[color:var(--b-select-option-selected-color)]':
                  isOptionSelected(opt) && idx !== activeIndex,
                'b:bg-[var(--b-select-option-selected-bg)] b:font-[var(--b-select-option-selected-font-weight)]':
                  isOptionSelected(opt) && idx === activeIndex,
                'b:cursor-not-allowed b:opacity-40': opt.disabled,
                'b:hover:bg-[var(--b-select-option-active-bg)]':
                  !opt.disabled && idx !== activeIndex && !isOptionSelected(opt),
              },
            ]"
            :data-active="idx === activeIndex"
            :aria-selected="isOptionSelected(opt)"
            :aria-disabled="opt.disabled ?? false"
            role="option"
            @mousedown.prevent="selectOption(opt)"
            @mouseenter="activeIndex = idx"
          >
            <slot name="option" :option="opt" :index="idx" :selected="isOptionSelected(opt)">
              <span class="b:flex b:items-center b:justify-between">
                <span>{{ getOptionLabel(opt) }}</span>
                <svg
                  v-if="isMultipleMode && isOptionSelected(opt)"
                  class="b:ml-2 b:h-3 b:w-3 b:text-[var(--b-select-active-border-color)]"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </slot>
          </div>
        </template>
      </div>

      <!-- Not found content -->
      <div
        v-else-if="notFoundContent !== null"
        class="b-select__empty b:px-4 b:py-6 b:text-center b:text-sm b:text-zinc-400"
      >
        {{ notFoundContent }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.b-select {
  --b-select-active-border-color: #1677ff;
  --b-select-active-outline-color: rgba(5, 145, 255, 0.1);
  --b-select-hover-border-color: #4096ff;
  --b-select-border-color: #d9d9d9;
  --b-select-color: rgba(0, 0, 0, 0.88);
  --b-select-placeholder-color: #606870;
  --b-select-clear-bg: #ffffff;
  --b-select-selector-bg: #ffffff;
  --b-select-filled-bg: rgba(0, 0, 0, 0.04);
  --b-select-multiple-item-bg: rgba(0, 0, 0, 0.06);
  --b-select-multiple-count-bg: #f0f0f0;
  --b-select-multiple-count-color: #1f1f1f;
  --b-select-multiple-item-border-color: transparent;
  --b-select-multiple-item-border-color-disabled: transparent;
  --b-select-multiple-item-color-disabled: rgba(0, 0, 0, 0.25);
  --b-select-multiple-selector-bg-disabled: rgba(0, 0, 0, 0.04);
  --b-select-option-active-bg: rgba(0, 0, 0, 0.04);
  --b-select-option-font-size: 14px;
  --b-select-option-height: 32px;
  --b-select-option-line-height: 1.5714;
  --b-select-option-padding-x: 12px;
  --b-select-option-padding-y: 5px;
  --b-select-option-selected-bg: #e6f4ff;
  --b-select-option-selected-color: rgba(0, 0, 0, 0.88);
  --b-select-option-selected-font-weight: 600;
  --b-select-z-index-popup: 1050;
}

@media (prefers-color-scheme: dark) {
  .b-select {
    --b-select-active-border-color: #1668dc;
    --b-select-active-outline-color: rgba(22, 104, 220, 0.15);
    --b-select-hover-border-color: #3c89e8;
    --b-select-border-color: #424242;
    --b-select-color: rgba(255, 255, 255, 0.88);
    --b-select-placeholder-color: #9ca3af;
    --b-select-clear-bg: #1f1f1f;
    --b-select-selector-bg: #1f1f1f;
    --b-select-filled-bg: rgba(255, 255, 255, 0.08);
    --b-select-multiple-item-bg: rgba(255, 255, 255, 0.1);
    --b-select-multiple-count-bg: #353535;
    --b-select-multiple-count-color: #e0e0e0;
    --b-select-multiple-item-color-disabled: rgba(255, 255, 255, 0.25);
    --b-select-multiple-selector-bg-disabled: rgba(255, 255, 255, 0.08);
    --b-select-option-active-bg: rgba(255, 255, 255, 0.08);
    --b-select-option-selected-bg: #111a2c;
    --b-select-option-selected-color: rgba(255, 255, 255, 0.88);
  }
}

[data-prefers-color='light'] .b-select {
  --b-select-active-border-color: #1677ff;
  --b-select-active-outline-color: rgba(5, 145, 255, 0.1);
  --b-select-hover-border-color: #4096ff;
  --b-select-border-color: #d9d9d9;
  --b-select-color: rgba(0, 0, 0, 0.88);
  --b-select-placeholder-color: #606870;
  --b-select-clear-bg: #ffffff;
  --b-select-selector-bg: #ffffff;
  --b-select-filled-bg: rgba(0, 0, 0, 0.04);
  --b-select-multiple-item-bg: rgba(0, 0, 0, 0.06);
  --b-select-multiple-count-bg: #f0f0f0;
  --b-select-multiple-count-color: #1f1f1f;
  --b-select-multiple-item-color-disabled: rgba(0, 0, 0, 0.25);
  --b-select-multiple-selector-bg-disabled: rgba(0, 0, 0, 0.04);
  --b-select-option-active-bg: rgba(0, 0, 0, 0.04);
  --b-select-option-selected-bg: #e6f4ff;
  --b-select-option-selected-color: rgba(0, 0, 0, 0.88);
}

[data-prefers-color='dark'] .b-select {
  --b-select-active-border-color: #1668dc;
  --b-select-active-outline-color: rgba(22, 104, 220, 0.15);
  --b-select-hover-border-color: #3c89e8;
  --b-select-border-color: #424242;
  --b-select-color: rgba(255, 255, 255, 0.88);
  --b-select-placeholder-color: #9ca3af;
  --b-select-clear-bg: #1f1f1f;
  --b-select-selector-bg: #1f1f1f;
  --b-select-filled-bg: rgba(255, 255, 255, 0.08);
  --b-select-multiple-item-bg: rgba(255, 255, 255, 0.1);
  --b-select-multiple-item-color-disabled: rgba(255, 255, 255, 0.25);
  --b-select-multiple-selector-bg-disabled: rgba(255, 255, 255, 0.08);
  --b-select-option-active-bg: rgba(255, 255, 255, 0.08);
  --b-select-option-selected-bg: #111a2c;
  --b-select-option-selected-color: rgba(255, 255, 255, 0.88);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-select {
    --b-select-active-border-color: #1668dc;
    --b-select-active-outline-color: rgba(22, 104, 220, 0.15);
    --b-select-hover-border-color: #3c89e8;
    --b-select-border-color: #424242;
    --b-select-color: rgba(255, 255, 255, 0.88);
    --b-select-placeholder-color: #9ca3af;
    --b-select-clear-bg: #1f1f1f;
    --b-select-selector-bg: #1f1f1f;
    --b-select-filled-bg: rgba(255, 255, 255, 0.08);
    --b-select-multiple-item-bg: rgba(255, 255, 255, 0.1);
    --b-select-multiple-item-color-disabled: rgba(255, 255, 255, 0.25);
    --b-select-multiple-selector-bg-disabled: rgba(255, 255, 255, 0.08);
    --b-select-option-active-bg: rgba(255, 255, 255, 0.08);
    --b-select-option-selected-bg: #111a2c;
    --b-select-option-selected-color: rgba(255, 255, 255, 0.88);
  }
}

.b-select__selector {
  anchor-name: v-bind('anchorName');
}

.b-select__dropdown {
  position: absolute;
  margin-top: 4px;
  z-index: var(--b-select-z-index-popup);

  position-anchor: v-bind('anchorName');
  position-try-fallbacks: --b-select-top;
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

@position-try --b-select-top {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
}

@media (prefers-reduced-motion: reduce) {
  .b-select__dropdown {
    transition: none;
  }

  .b-select__arrow {
    transition: none;
  }
}
</style>
