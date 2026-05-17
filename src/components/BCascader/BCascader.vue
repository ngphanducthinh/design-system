<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type {
  BCascaderFieldNames,
  BCascaderOption,
  BCascaderShowSearchConfig,
  BCascaderValueType,
} from './types.ts';
import {
  BCascaderExpandTrigger,
  BCascaderPlacement,
  BCascaderSize,
  BCascaderStatus,
} from './types.ts';

const {
  options = [],
  placeholder = 'Please select',
  disabled = false,
  allowClear = true,
  expandTrigger = BCascaderExpandTrigger.Click,
  placement = BCascaderPlacement.BottomLeft,
  size = BCascaderSize.Medium,
  changeOnSelect = false,
  showSearch = false,
  multiple = false,
  maxTagCount,
  fieldNames,
  notFoundContent = 'No data',
  status,
  open = undefined,
} = defineProps<{
  /** The cascade option data. */
  options?: BCascaderOption[];
  /** Input placeholder text. */
  placeholder?: string;
  /** Whether the cascader is disabled. */
  disabled?: boolean;
  /** Whether to show clear button. */
  allowClear?: boolean;
  /** Expand behavior: click or hover. */
  expandTrigger?: `${BCascaderExpandTrigger}`;
  /** Popup placement. */
  placement?: `${BCascaderPlacement}`;
  /** Size of the input. */
  size?: `${BCascaderSize}`;
  /** Fire change on each level selection, not just leaf. */
  changeOnSelect?: boolean;
  /** Enable search mode. Boolean or config object. */
  showSearch?: boolean | BCascaderShowSearchConfig;
  /** Whether to support multiple selection. */
  multiple?: boolean;
  /** Max tag count in multiple mode. */
  maxTagCount?: number;
  /** Custom field name mapping. */
  fieldNames?: BCascaderFieldNames;
  /** Content shown when no match found. */
  notFoundContent?: string;
  /** Validation status. */
  status?: `${BCascaderStatus}`;
  /** Controlled open state. */
  open?: boolean;
}>();

const model = defineModel<BCascaderValueType | BCascaderValueType[]>();

const emit = defineEmits<{
  /** Fired when selection changes. */
  (
    e: 'change',
    value: BCascaderValueType | BCascaderValueType[],
    selectedOptions: BCascaderOption[][],
  ): void;
  /** Fired when popup visibility changes. */
  (e: 'openChange', open: boolean): void;
  /** Fired when search input changes. */
  (e: 'search', value: string): void;
}>();

defineSlots<{
  /** Custom display render for selected value. */
  displayRender?(props: { labels: string[]; selectedOptions: BCascaderOption[] }): unknown;
  /** Custom suffix icon. */
  suffixIcon?(): unknown;
  /** Custom expand icon for menus. */
  expandIcon?(): unknown;
  /** Custom not-found content. */
  notFoundContent?(): unknown;
}>();

// ─────────────────────────────────────────────
// Field name resolution
// ─────────────────────────────────────────────
const labelField = computed(() => fieldNames?.label ?? 'label');
const valueField = computed(() => fieldNames?.value ?? 'value');
const childrenField = computed(() => fieldNames?.children ?? 'children');

function getLabel(option: BCascaderOption): string {
  return (option as unknown as Record<string, unknown>)[labelField.value] as string;
}

function getValue(option: BCascaderOption): string | number {
  return (option as unknown as Record<string, unknown>)[valueField.value] as string | number;
}

function getChildren(option: BCascaderOption): BCascaderOption[] | undefined {
  return (option as unknown as Record<string, unknown>)[childrenField.value] as
    | BCascaderOption[]
    | undefined;
}

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const popupId = computed(() => `b-cascader-popup-${componentUID.value}`);

const popoverRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);

const internalOpen = ref(false);
const isOpen = computed(() => (open !== undefined ? open : internalOpen.value));

const searchValue = ref('');
const activeColumns = ref<BCascaderOption[][]>([options]);
const selectedPath = ref<BCascaderOption[]>([]);
const focusedIndices = ref<number[]>([]);

// Multiple mode selections
const multipleSelections = ref<BCascaderValueType[]>([]);

// ─────────────────────────────────────────────
// Visibility control
// ─────────────────────────────────────────────
let previouslyFocusedElement: HTMLElement | null = null;

function setOpen(val: boolean) {
  if (open !== undefined) {
    // controlled mode - just emit
  } else {
    internalOpen.value = val;
  }
  emit('openChange', val);
}

function doOpen() {
  if (disabled) return;
  previouslyFocusedElement = document.activeElement as HTMLElement | null;
  setOpen(true);
}

function doClose() {
  setOpen(false);
  if (previouslyFocusedElement) {
    nextTick(() => previouslyFocusedElement?.focus());
  }
}

function toggleOpen() {
  if (disabled) return;
  if (isOpen.value) {
    doClose();
  } else {
    doOpen();
  }
}

// ─────────────────────────────────────────────
// Option resolution
// ─────────────────────────────────────────────
function findOptionPath(
  value: BCascaderValueType,
  opts: BCascaderOption[] = options,
): BCascaderOption[] {
  for (const opt of opts) {
    if (getValue(opt) === value[0]) {
      if (value.length === 1) return [opt];
      const children = getChildren(opt);
      if (children) {
        const childPath = findOptionPath(value.slice(1), children);
        if (childPath.length > 0) return [opt, ...childPath];
      }
      return [opt];
    }
  }
  return [];
}

function initFromModel() {
  if (!model.value) {
    selectedPath.value = [];
    multipleSelections.value = [];
    return;
  }

  if (multiple) {
    const values = model.value as BCascaderValueType[];
    multipleSelections.value = values;
  } else {
    const value = model.value as BCascaderValueType;
    if (value.length > 0) {
      selectedPath.value = findOptionPath(value);
      rebuildColumns(selectedPath.value);
    }
  }
}

function rebuildColumns(path: BCascaderOption[]) {
  const cols: BCascaderOption[][] = [options];
  for (const opt of path) {
    const children = getChildren(opt);
    if (children && children.length > 0) {
      cols.push(children);
    }
  }
  activeColumns.value = cols;
}

// ─────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────
function selectOption(option: BCascaderOption, columnIndex: number) {
  if (option.disabled) return;

  const newPath = selectedPath.value.slice(0, columnIndex);
  newPath.push(option);
  selectedPath.value = newPath;

  const children = getChildren(option);
  const isLeaf = option.isLeaf !== undefined ? option.isLeaf : !children || children.length === 0;

  // Rebuild columns
  const cols = activeColumns.value.slice(0, columnIndex + 1);
  if (children && children.length > 0) {
    cols.push(children);
  }
  activeColumns.value = cols;

  // Update focused indices
  focusedIndices.value = newPath.map((opt, i) => {
    const col = activeColumns.value[i];
    return col ? col.findIndex((o) => getValue(o) === getValue(opt)) : 0;
  });

  if (isLeaf || changeOnSelect) {
    const pathValues = newPath.map((o) => getValue(o)) as BCascaderValueType;

    if (multiple) {
      const exists = multipleSelections.value.findIndex(
        (v) => JSON.stringify(v) === JSON.stringify(pathValues),
      );
      if (exists >= 0) {
        multipleSelections.value.splice(exists, 1);
      } else {
        multipleSelections.value.push(pathValues);
      }
      model.value = [...multipleSelections.value];
      emit(
        'change',
        model.value,
        multipleSelections.value.map((v) => findOptionPath(v)),
      );
    } else {
      model.value = pathValues;
      emit('change', pathValues, [newPath]);
      if (isLeaf) {
        doClose();
      }
    }
  }
}

function expandOnHover(option: BCascaderOption, columnIndex: number) {
  if (option.disabled) return;
  if (expandTrigger !== BCascaderExpandTrigger.Hover) return;

  const children = getChildren(option);
  if (!children || children.length === 0) return;

  const newPath = selectedPath.value.slice(0, columnIndex);
  newPath.push(option);
  selectedPath.value = newPath;

  const cols = activeColumns.value.slice(0, columnIndex + 1);
  cols.push(children);
  activeColumns.value = cols;
}

// ─────────────────────────────────────────────
// Display value
// ─────────────────────────────────────────────
const displayLabels = computed<string[]>(() => {
  if (multiple) return [];
  if (!model.value || (model.value as BCascaderValueType).length === 0) return [];
  const path = findOptionPath(model.value as BCascaderValueType);
  return path.map((o) => getLabel(o));
});

const displayText = computed(() => displayLabels.value.join(' / '));

const multipleTags = computed(() => {
  if (!multiple) return [];
  return multipleSelections.value.map((val) => {
    const path = findOptionPath(val);
    return {
      value: val,
      label: path.map((o) => getLabel(o)).join(' / '),
    };
  });
});

const visibleTags = computed(() => {
  if (maxTagCount === undefined) return multipleTags.value;
  return multipleTags.value.slice(0, maxTagCount);
});

const hiddenTagCount = computed(() => {
  if (maxTagCount === undefined) return 0;
  return Math.max(0, multipleTags.value.length - maxTagCount);
});

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────
const searchEnabled = computed(() => !!showSearch);

function getAllPaths(
  opts: BCascaderOption[] = options,
  currentPath: BCascaderOption[] = [],
): BCascaderOption[][] {
  const result: BCascaderOption[][] = [];
  for (const opt of opts) {
    const path = [...currentPath, opt];
    const children = getChildren(opt);
    if (children && children.length > 0) {
      result.push(...getAllPaths(children, path));
    } else {
      result.push(path);
    }
  }
  return result;
}

const filteredPaths = computed(() => {
  if (!searchValue.value) return [];

  const allPaths = getAllPaths();
  const config = typeof showSearch === 'object' ? showSearch : {};
  const filterFn =
    config.filter ??
    ((input: string, path: BCascaderOption[]) =>
      path.some((opt) => getLabel(opt).toLowerCase().includes(input.toLowerCase())));

  let results = allPaths.filter((path) => filterFn(searchValue.value, path));
  const limit = config.limit ?? 50;
  results = results.slice(0, limit);
  return results;
});

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  searchValue.value = target.value;
  emit('search', searchValue.value);
  if (!isOpen.value) doOpen();
}

function selectSearchResult(path: BCascaderOption[]) {
  const pathValues = path.map((o) => getValue(o)) as BCascaderValueType;

  if (multiple) {
    const exists = multipleSelections.value.findIndex(
      (v) => JSON.stringify(v) === JSON.stringify(pathValues),
    );
    if (exists >= 0) {
      multipleSelections.value.splice(exists, 1);
    } else {
      multipleSelections.value.push(pathValues);
    }
    model.value = [...multipleSelections.value];
    emit(
      'change',
      model.value,
      multipleSelections.value.map((v) => findOptionPath(v)),
    );
  } else {
    selectedPath.value = path;
    model.value = pathValues;
    emit('change', pathValues, [path]);
    searchValue.value = '';
    doClose();
  }
}

// ─────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────
function onClear(event: Event) {
  event.stopPropagation();
  selectedPath.value = [];
  activeColumns.value = [options];
  focusedIndices.value = [];
  searchValue.value = '';

  if (multiple) {
    multipleSelections.value = [];
    model.value = [];
    emit('change', [], []);
  } else {
    model.value = [];
    emit('change', [], []);
  }
}

function removeTag(val: BCascaderValueType, event: Event) {
  event.stopPropagation();
  const idx = multipleSelections.value.findIndex((v) => JSON.stringify(v) === JSON.stringify(val));
  if (idx >= 0) {
    multipleSelections.value.splice(idx, 1);
    model.value = [...multipleSelections.value];
    emit(
      'change',
      model.value,
      multipleSelections.value.map((v) => findOptionPath(v)),
    );
  }
}

// ─────────────────────────────────────────────
// Keyboard navigation
// ─────────────────────────────────────────────
function onTriggerKeydown(event: KeyboardEvent) {
  if (disabled) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
      if (!searchEnabled.value || event.key === 'Enter') {
        event.preventDefault();
        toggleOpen();
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value) doOpen();
      nextTick(() => focusFirstOption());
      break;
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault();
        doClose();
      }
      break;
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  const col = activeColumns.value.length - 1;
  const currentIdx = focusedIndices.value[col] ?? 0;
  const items = activeColumns.value[col] ?? [];

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const next = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
      focusedIndices.value = [...focusedIndices.value.slice(0, col), next];
      focusOptionAt(col, next);
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prev = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
      focusedIndices.value = [...focusedIndices.value.slice(0, col), prev];
      focusOptionAt(col, prev);
      break;
    }
    case 'ArrowRight': {
      event.preventDefault();
      const option = items[currentIdx];
      if (option) {
        const children = getChildren(option);
        if (children && children.length > 0) {
          selectOption(option, col);
          nextTick(() => {
            focusedIndices.value = [...focusedIndices.value, 0];
            focusOptionAt(col + 1, 0);
          });
        }
      }
      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      if (col > 0) {
        activeColumns.value = activeColumns.value.slice(0, col);
        selectedPath.value = selectedPath.value.slice(0, col - 1);
        focusedIndices.value = focusedIndices.value.slice(0, col);
        nextTick(() => focusOptionAt(col - 1, focusedIndices.value[col - 1] ?? 0));
      }
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const option = items[currentIdx];
      if (option) selectOption(option, col);
      break;
    }
    case 'Escape':
      event.preventDefault();
      doClose();
      break;
    case 'Home':
      event.preventDefault();
      focusedIndices.value = [...focusedIndices.value.slice(0, col), 0];
      focusOptionAt(col, 0);
      break;
    case 'End':
      event.preventDefault();
      focusedIndices.value = [...focusedIndices.value.slice(0, col), items.length - 1];
      focusOptionAt(col, items.length - 1);
      break;
  }
}

function focusFirstOption() {
  focusedIndices.value = [0];
  focusOptionAt(0, 0);
}

function focusOptionAt(col: number, idx: number) {
  nextTick(() => {
    const menuEl = popoverRef.value?.querySelectorAll('.b-cascader__menu')[col];
    if (!menuEl) return;
    const items = menuEl.querySelectorAll<HTMLElement>(
      '.b-cascader__option:not([aria-disabled="true"])',
    );
    items[idx]?.focus();
  });
}

// ─────────────────────────────────────────────
// Click outside
// ─────────────────────────────────────────────
function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (triggerRef.value?.contains(target)) return;
  if (popoverRef.value?.contains(target)) return;
  doClose();
}

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onMounted(() => {
  initFromModel();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick, true);
});

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => document.addEventListener('click', onDocumentClick, true));
  } else {
    document.removeEventListener('click', onDocumentClick, true);
    searchValue.value = '';
  }
});

watch(
  () => open,
  (val) => {
    if (val === undefined) return;
    if (val) doOpen();
    else doClose();
  },
);

watch(model, () => {
  initFromModel();
});

// ─────────────────────────────────────────────
// Computed styles
// ─────────────────────────────────────────────
const placementClass = computed(() => {
  const map: Record<string, string> = {
    [BCascaderPlacement.BottomLeft]: 'bottom-left',
    [BCascaderPlacement.BottomRight]: 'bottom-right',
    [BCascaderPlacement.TopLeft]: 'top-left',
    [BCascaderPlacement.TopRight]: 'top-right',
  };
  return map[placement] ?? 'bottom-left';
});

const sizeClass = computed(() => `b-cascader--${size}`);

const statusClass = computed(() => (status ? `b-cascader--${status}` : ''));

const hasValue = computed(() => {
  if (multiple) return multipleSelections.value.length > 0;
  return model.value && (model.value as BCascaderValueType).length > 0;
});

const isSearching = computed(() => searchEnabled.value && searchValue.value.length > 0);

// ─────────────────────────────────────────────
// Check helpers for multiple mode
// ─────────────────────────────────────────────
function isOptionSelected(option: BCascaderOption, columnIndex: number): boolean {
  if (!multiple) {
    return (
      selectedPath.value[columnIndex] !== undefined &&
      getValue(selectedPath.value[columnIndex]) === getValue(option)
    );
  }
  // In multiple mode, check if any selection passes through this option at this column
  return multipleSelections.value.some((val) => val[columnIndex] === getValue(option));
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur() });
</script>

<template>
  <div
    ref="triggerRef"
    :class="[
      'b-cascader',
      sizeClass,
      statusClass,
      {
        'b-cascader--open': isOpen,
        'b-cascader--disabled': disabled,
        'b-cascader--multiple': multiple,
        'b-cascader--focused': isOpen,
      },
    ]"
    @click="toggleOpen"
    @keydown="onTriggerKeydown"
  >
    <!-- Multiple tags -->
    <div v-if="multiple" class="b-cascader__selections">
      <span v-for="tag in visibleTags" :key="JSON.stringify(tag.value)" class="b-cascader__tag">
        <span class="b-cascader__tag-text">{{ tag.label }}</span>
        <span
          class="b-cascader__tag-remove"
          role="button"
          aria-label="Remove"
          @click="removeTag(tag.value, $event)"
        ></span>
      </span>
      <span v-if="hiddenTagCount > 0" class="b-cascader__tag b-cascader__tag--count">
        + {{ hiddenTagCount }}
      </span>

      <!-- Search input in multiple mode -->
      <input
        v-if="searchEnabled"
        ref="inputRef"
        class="b-cascader__search-input"
        type="text"
        :value="searchValue"
        :placeholder="!hasValue ? placeholder : ''"
        :disabled="disabled"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="isOpen ? popupId : undefined"
        @input="onSearchInput"
        @click.stop
      />
      <span v-if="!hasValue && !searchEnabled" class="b-cascader__placeholder">{{
        placeholder
      }}</span>
    </div>

    <!-- Single mode -->
    <template v-else>
      <input
        v-if="searchEnabled"
        ref="inputRef"
        :class="['b-cascader__input', { 'b-cascader__input--active': isOpen }]"
        type="text"
        :value="isOpen ? searchValue : displayText"
        :placeholder="hasValue ? displayText : placeholder"
        :disabled="disabled"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="isOpen ? popupId : undefined"
        @input="onSearchInput"
        @click.stop
      />
      <span
        v-else
        class="b-cascader__value-display"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-label="hasValue ? displayText : placeholder"
        :aria-disabled="disabled || undefined"
        :aria-controls="isOpen ? popupId : undefined"
      >
        <slot
          name="displayRender"
          v-if="hasValue"
          :labels="displayLabels"
          :selected-options="selectedPath"
        >
          {{ displayText }}
        </slot>
        <span v-if="!hasValue" class="b-cascader__placeholder">{{ placeholder }}</span>
      </span>
    </template>

    <!-- Clear button -->
    <span
      v-if="allowClear && hasValue && !disabled"
      class="b-cascader__clear"
      role="button"
      aria-label="Clear"
      @click="onClear"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path
          d="M8 1a7 7 0 110 14A7 7 0 018 1zm2.828 4.172a.5.5 0 00-.707 0L8 7.293 5.879 5.172a.5.5 0 10-.707.707L7.293 8l-2.121 2.121a.5.5 0 00.707.707L8 8.707l2.121 2.121a.5.5 0 00.707-.707L8.707 8l2.121-2.121a.5.5 0 000-.707z"
        />
      </svg>
    </span>

    <!-- Suffix icon -->
    <span class="b-cascader__suffix" aria-hidden="true">
      <slot name="suffixIcon">
        <svg
          class="b-cascader__arrow"
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="currentColor"
        >
          <path
            d="M4.427 5.427a.75.75 0 011.06-.073L8 7.585l2.513-2.231a.75.75 0 01.987 1.132l-3 2.666a.75.75 0 01-.987 0l-3-2.666a.75.75 0 01-.086-1.06z"
          />
        </svg>
      </slot>
    </span>

    <!-- Dropdown popup -->
    <div
      :id="popupId"
      ref="popoverRef"
      :class="['b-cascader__popup', placementClass, { 'b-cascader__popup--open': isOpen }]"
      role="dialog"
      aria-modal="false"
      aria-label="Cascader options"
      @click.stop
      @keydown="onMenuKeydown"
    >
      <!-- Search results -->
      <div v-if="isSearching" class="b-cascader__search-panel" role="listbox">
        <template v-if="filteredPaths.length > 0">
          <div
            v-for="(path, idx) in filteredPaths"
            :key="idx"
            class="b-cascader__search-item"
            role="option"
            tabindex="0"
            :aria-selected="false"
            @click="selectSearchResult(path)"
            @keydown.enter.prevent="selectSearchResult(path)"
          >
            <span v-for="(opt, i) in path" :key="getValue(opt)">
              <span>{{ getLabel(opt) }}</span>
              <span v-if="i < path.length - 1" class="b-cascader__search-separator"> / </span>
            </span>
          </div>
        </template>
        <div v-else class="b-cascader__empty">
          <slot name="notFoundContent">{{ notFoundContent }}</slot>
        </div>
      </div>

      <!-- Cascading menus -->
      <div v-else class="b-cascader__menus">
        <ul
          v-for="(column, colIdx) in activeColumns"
          :key="colIdx"
          class="b-cascader__menu"
          role="listbox"
          :aria-label="`Level ${colIdx + 1}`"
        >
          <li
            v-for="option in column"
            :key="getValue(option)"
            :class="[
              'b-cascader__option',
              {
                'b-cascader__option--selected': isOptionSelected(option, colIdx),
                'b-cascader__option--disabled': option.disabled,
                'b-cascader__option--expanded':
                  selectedPath[colIdx] && getValue(selectedPath[colIdx]) === getValue(option),
              },
            ]"
            role="option"
            :tabindex="option.disabled ? -1 : 0"
            :aria-selected="isOptionSelected(option, colIdx)"
            :aria-disabled="option.disabled || undefined"
            @click.stop="selectOption(option, colIdx)"
            @mouseenter="expandOnHover(option, colIdx)"
            @keydown.enter.prevent="selectOption(option, colIdx)"
          >
            <span v-if="multiple" class="b-cascader__checkbox" aria-hidden="true">
              <span
                :class="[
                  'b-cascader__checkbox-inner',
                  { 'b-cascader__checkbox-inner--checked': isOptionSelected(option, colIdx) },
                ]"
              />
            </span>
            <span class="b-cascader__option-label">{{ getLabel(option) }}</span>
            <span
              v-if="getChildren(option) && getChildren(option)!.length > 0"
              class="b-cascader__option-expand"
              aria-hidden="true"
            >
              <slot name="expandIcon">
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                  <path
                    d="M6.427 4.427a.75.75 0 011.146.96l-.073.087L5.768 8l1.732 2.527a.75.75 0 01-.96 1.146l-.087-.073-2.25-3.28a.75.75 0 01-.007-.98l.08-.093 2.25-2.82zm3 0a.75.75 0 011.146.96l-.073.087L8.768 8l1.732 2.527a.75.75 0 01-.96 1.146l-.087-.073-2.25-3.28a.75.75 0 01-.007-.98l.08-.093 2.25-2.82z"
                    transform="rotate(180 8 8)"
                  />
                </svg>
              </slot>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (Design Tokens)
   ──────────────────────────────────────────── */
.b-cascader {
  --b-cascader-control-width: 184px;
  --b-cascader-control-item-width: 111px;
  --b-cascader-dropdown-height: 180px;
  --b-cascader-menu-padding: 4px;
  --b-cascader-option-padding: 5px 12px;
  --b-cascader-option-selected-bg: #e6f4ff;
  --b-cascader-option-selected-color: rgba(0, 0, 0, 0.88);
  --b-cascader-option-selected-font-weight: 600;

  --b-cascader-bg: #fff;
  --b-cascader-color: rgba(0, 0, 0, 0.88);
  --b-cascader-border-color: #d9d9d9;
  --b-cascader-border-radius: 6px;
  --b-cascader-font-size: 14px;
  --b-cascader-line-height: 1.5714;
  --b-cascader-height: 32px;
  --b-cascader-padding-x: 11px;
  --b-cascader-placeholder-color: rgba(0, 0, 0, 0.55);
  --b-cascader-hover-border-color: #4096ff;
  --b-cascader-focus-border-color: #1677ff;
  --b-cascader-focus-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-cascader-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-cascader-disabled-color: rgba(0, 0, 0, 0.25);
  --b-cascader-clear-color: rgba(0, 0, 0, 0.25);
  --b-cascader-clear-hover-color: rgba(0, 0, 0, 0.45);
  --b-cascader-arrow-color: rgba(0, 0, 0, 0.25);
  --b-cascader-popup-bg: #fff;
  --b-cascader-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-cascader-popup-border-radius: 8px;
  --b-cascader-popup-z-index: 1050;
  --b-cascader-option-hover-bg: rgba(0, 0, 0, 0.04);
  --b-cascader-option-active-bg: rgba(0, 0, 0, 0.06);
  --b-cascader-option-disabled-color: rgba(0, 0, 0, 0.25);
  --b-cascader-option-border-radius: 4px;
  --b-cascader-tag-bg: rgba(0, 0, 0, 0.06);
  --b-cascader-tag-color: rgba(0, 0, 0, 0.88);
  --b-cascader-tag-border-radius: 4px;
  --b-cascader-transition-duration: 200ms;
  --b-cascader-error-border-color: #ff4d4f;
  --b-cascader-error-focus-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-cascader-warning-border-color: #faad14;
  --b-cascader-warning-focus-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-cascader-menu-border-color: rgba(5, 5, 5, 0.06);
  --b-cascader-checkbox-size: 16px;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-cascader,
[data-theme='dark'] .b-cascader {
  --b-cascader-bg: #1f1f1f;
  --b-cascader-color: rgba(255, 255, 255, 0.85);
  --b-cascader-border-color: #424242;
  --b-cascader-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-cascader-hover-border-color: #4096ff;
  --b-cascader-focus-border-color: #1677ff;
  --b-cascader-focus-shadow: 0 0 0 2px rgba(5, 145, 255, 0.15);
  --b-cascader-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-cascader-disabled-color: rgba(255, 255, 255, 0.25);
  --b-cascader-clear-color: rgba(255, 255, 255, 0.25);
  --b-cascader-clear-hover-color: rgba(255, 255, 255, 0.45);
  --b-cascader-arrow-color: rgba(255, 255, 255, 0.25);
  --b-cascader-popup-bg: #1f1f1f;
  --b-cascader-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-cascader-option-selected-bg: rgba(22, 119, 255, 0.15);
  --b-cascader-option-selected-color: rgba(255, 255, 255, 0.85);
  --b-cascader-option-hover-bg: rgba(255, 255, 255, 0.08);
  --b-cascader-option-active-bg: rgba(255, 255, 255, 0.12);
  --b-cascader-option-disabled-color: rgba(255, 255, 255, 0.25);
  --b-cascader-tag-bg: rgba(255, 255, 255, 0.1);
  --b-cascader-tag-color: rgba(255, 255, 255, 0.85);
  --b-cascader-menu-border-color: rgba(253, 253, 253, 0.12);
}

@media (prefers-color-scheme: dark) {
  [data-theme='dark'] .b-cascader {
    --b-cascader-bg: #1f1f1f;
    --b-cascader-color: rgba(255, 255, 255, 0.85);
    --b-cascader-border-color: #424242;
    --b-cascader-placeholder-color: rgba(255, 255, 255, 0.25);
    --b-cascader-hover-border-color: #4096ff;
    --b-cascader-focus-border-color: #1677ff;
    --b-cascader-focus-shadow: 0 0 0 2px rgba(5, 145, 255, 0.15);
    --b-cascader-disabled-bg: rgba(255, 255, 255, 0.08);
    --b-cascader-disabled-color: rgba(255, 255, 255, 0.25);
    --b-cascader-clear-color: rgba(255, 255, 255, 0.25);
    --b-cascader-clear-hover-color: rgba(255, 255, 255, 0.45);
    --b-cascader-arrow-color: rgba(255, 255, 255, 0.25);
    --b-cascader-popup-bg: #1f1f1f;
    --b-cascader-popup-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
      0 9px 28px 8px rgba(0, 0, 0, 0.2);
    --b-cascader-option-selected-bg: rgba(22, 119, 255, 0.15);
    --b-cascader-option-selected-color: rgba(255, 255, 255, 0.85);
    --b-cascader-option-hover-bg: rgba(255, 255, 255, 0.08);
    --b-cascader-option-active-bg: rgba(255, 255, 255, 0.12);
    --b-cascader-option-disabled-color: rgba(255, 255, 255, 0.25);
    --b-cascader-tag-bg: rgba(255, 255, 255, 0.1);
    --b-cascader-tag-color: rgba(255, 255, 255, 0.85);
    --b-cascader-menu-border-color: rgba(253, 253, 253, 0.12);
  }
}

/* ─────────────────────────────────────────────
   Main trigger container
   ───────────────────────────────────────────── */
.b-cascader {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: var(--b-cascader-control-width);
  height: var(--b-cascader-height);
  padding: 0 var(--b-cascader-padding-x);
  background: var(--b-cascader-bg);
  color: var(--b-cascader-color);
  font-size: var(--b-cascader-font-size);
  line-height: var(--b-cascader-line-height);
  border: 1px solid var(--b-cascader-border-color);
  border-radius: var(--b-cascader-border-radius);
  cursor: pointer;
  user-select: none;
  transition:
    border-color var(--b-cascader-transition-duration),
    box-shadow var(--b-cascader-transition-duration);
  box-sizing: border-box;

  &:hover:not(.b-cascader--disabled) {
    border-color: var(--b-cascader-hover-border-color);
  }

  &:hover:not(.b-cascader--disabled) .b-cascader__clear {
    opacity: 1;
  }
}

.b-cascader--focused:not(.b-cascader--disabled) {
  border-color: var(--b-cascader-focus-border-color);
  box-shadow: var(--b-cascader-focus-shadow);
}

.b-cascader--disabled {
  background: var(--b-cascader-disabled-bg);
  color: var(--b-cascader-disabled-color);
  cursor: not-allowed;
}

/* ── Sizes ── */
.b-cascader--sm {
  --b-cascader-height: 24px;
  --b-cascader-font-size: 12px;
  --b-cascader-padding-x: 7px;
}

.b-cascader--lg {
  --b-cascader-height: 40px;
  --b-cascader-font-size: 16px;
  --b-cascader-padding-x: 15px;
}

/* ── Status ── */
.b-cascader--error {
  --b-cascader-border-color: var(--b-cascader-error-border-color);
  --b-cascader-hover-border-color: var(--b-cascader-error-border-color);
  --b-cascader-focus-border-color: var(--b-cascader-error-border-color);
  --b-cascader-focus-shadow: var(--b-cascader-error-focus-shadow);
}

.b-cascader--warning {
  --b-cascader-border-color: var(--b-cascader-warning-border-color);
  --b-cascader-hover-border-color: var(--b-cascader-warning-border-color);
  --b-cascader-focus-border-color: var(--b-cascader-warning-border-color);
  --b-cascader-focus-shadow: var(--b-cascader-warning-focus-shadow);
}

/* ── Multiple ── */
.b-cascader--multiple {
  height: auto;
  min-height: var(--b-cascader-height);
  flex-wrap: wrap;
  padding: 1px var(--b-cascader-padding-x) 1px 4px;
  gap: 4px;
}

/* ─────────────────────────────────────────────
   Selections (multiple mode)
   ───────────────────────────────────────────── */
.b-cascader__selections {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.b-cascader__tag {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 0 4px 0 8px;
  background: var(--b-cascader-tag-bg);
  color: var(--b-cascader-tag-color);
  border-radius: var(--b-cascader-tag-border-radius);
  font-size: 12px;
  line-height: 22px;
  height: 22px;
}

.b-cascader__tag--count {
  padding: 0 8px;
}

.b-cascader__tag-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.b-cascader__tag-remove {
  margin-left: 2px;
  width: 14px;
  height: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: opacity 150ms;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 1.5px;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 1px;
    transition: background 150ms;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }

  &:hover::before,
  &:hover::after {
    background: rgba(0, 0, 0, 0.88);
  }
}

/* ─────────────────────────────────────────────
   Input / Display
   ───────────────────────────────────────────── */
.b-cascader__input,
.b-cascader__search-input {
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  line-height: inherit;
  flex: 1;
  min-width: 40px;
  width: 100%;
  cursor: pointer;
  padding: 0;

  &::placeholder {
    color: var(--b-cascader-placeholder-color);
  }
}

.b-cascader__search-input {
  max-width: 100%;
  cursor: text;
}

.b-cascader__input--active {
  cursor: text;
}

.b-cascader__value-display {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
}

.b-cascader__placeholder {
  color: var(--b-cascader-placeholder-color);
}

/* ─────────────────────────────────────────────
   Clear button
   ───────────────────────────────────────────── */
.b-cascader__clear {
  display: inline-flex;
  align-items: center;
  color: var(--b-cascader-clear-color);
  cursor: pointer;
  opacity: 0;
  transition:
    opacity 150ms,
    color 150ms;
  margin-left: 4px;
  flex-shrink: 0;

  &:hover {
    color: var(--b-cascader-clear-hover-color);
  }
}

/* ─────────────────────────────────────────────
   Suffix / Arrow icon
   ───────────────────────────────────────────── */
.b-cascader__suffix {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: var(--b-cascader-arrow-color);
  flex-shrink: 0;
}

.b-cascader__arrow {
  transition: transform var(--b-cascader-transition-duration);
}

.b-cascader--open .b-cascader__arrow {
  transform: rotate(180deg);
}

/* ─────────────────────────────────────────────
   Popup
   ───────────────────────────────────────────── */
.b-cascader__popup {
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: hidden;
  z-index: var(--b-cascader-popup-z-index);
  box-sizing: border-box;
  pointer-events: none;
  opacity: 0;
  height: 0;

  transition: opacity var(--b-cascader-transition-duration);
}

.b-cascader__popup--open {
  overflow: visible;
  pointer-events: auto;
  opacity: 1;
  height: auto;
}

/* ── Placements ── */
.b-cascader__popup.bottom-left {
  top: 100%;
  left: 0;
  margin-top: 4px;
}
.b-cascader__popup.bottom-right {
  top: 100%;
  right: 0;
  margin-top: 4px;
}
.b-cascader__popup.top-left {
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
}
.b-cascader__popup.top-right {
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
}

/* ─────────────────────────────────────────────
   Cascading menus container
   ───────────────────────────────────────────── */
.b-cascader__menus {
  display: flex;
  background: var(--b-cascader-popup-bg);
  border-radius: var(--b-cascader-popup-border-radius);
  box-shadow: var(--b-cascader-popup-shadow);
  overflow: hidden;
}

.b-cascader__menu {
  list-style: none;
  margin: 0;
  padding: var(--b-cascader-menu-padding);
  min-width: var(--b-cascader-control-item-width);
  max-height: var(--b-cascader-dropdown-height);
  overflow: auto;
  border-right: 1px solid var(--b-cascader-menu-border-color);

  &:last-child {
    border-right: none;
  }
}

/* ─────────────────────────────────────────────
   Option items
   ───────────────────────────────────────────── */
.b-cascader__option {
  display: flex;
  align-items: center;
  padding: var(--b-cascader-option-padding);
  border-radius: var(--b-cascader-option-border-radius);
  cursor: pointer;
  outline: none;
  transition: background-color 150ms;
  user-select: none;
  gap: 8px;

  &:hover,
  &:focus-visible {
    background: var(--b-cascader-option-hover-bg);
  }

  &:active {
    background: var(--b-cascader-option-active-bg);
  }

  &--selected {
    background: var(--b-cascader-option-selected-bg);
    color: var(--b-cascader-option-selected-color);
    font-weight: var(--b-cascader-option-selected-font-weight);
  }

  &--disabled {
    color: var(--b-cascader-option-disabled-color);
    cursor: not-allowed;
    pointer-events: none;
  }

  &--expanded {
    background: var(--b-cascader-option-hover-bg);
  }
}

.b-cascader__option-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-cascader__option-expand {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.45;
}

/* ─────────────────────────────────────────────
   Checkbox (multiple mode)
   ───────────────────────────────────────────── */
.b-cascader__checkbox {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.b-cascader__checkbox-inner {
  width: var(--b-cascader-checkbox-size);
  height: var(--b-cascader-checkbox-size);
  border: 1px solid var(--b-cascader-border-color);
  border-radius: 3px;
  position: relative;
  transition: all 150ms;
}

.b-cascader__checkbox-inner--checked {
  background: #1677ff;
  border-color: #1677ff;

  &::after {
    content: '';
    position: absolute;
    top: 45%;
    left: 50%;
    width: 5px;
    height: 9px;
    border: 2px solid #fff;
    border-top: 0;
    border-left: 0;
    transform: translate(-50%, -50%) rotate(45deg);
  }
}

/* ─────────────────────────────────────────────
   Search panel
   ───────────────────────────────────────────── */
.b-cascader__search-panel {
  background: var(--b-cascader-popup-bg);
  border-radius: var(--b-cascader-popup-border-radius);
  box-shadow: var(--b-cascader-popup-shadow);
  max-height: var(--b-cascader-dropdown-height);
  overflow: auto;
  padding: var(--b-cascader-menu-padding);
  min-width: var(--b-cascader-control-width);
}

.b-cascader__search-item {
  padding: var(--b-cascader-option-padding);
  border-radius: var(--b-cascader-option-border-radius);
  cursor: pointer;
  outline: none;
  transition: background-color 150ms;

  &:hover,
  &:focus-visible {
    background: var(--b-cascader-option-hover-bg);
  }
}

.b-cascader__search-separator {
  opacity: 0.45;
}

.b-cascader__empty {
  padding: 16px;
  text-align: center;
  color: var(--b-cascader-placeholder-color);
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-cascader,
  .b-cascader__popup,
  .b-cascader__arrow,
  .b-cascader__option,
  .b-cascader__clear {
    transition-duration: 0ms;
  }
}
</style>
