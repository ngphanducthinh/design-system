<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import {
  BTreeSelectPlacement,
  BTreeSelectStatus,
  BTreeSelectVariant,
  type BTreeSelectChangeExtra,
  type BTreeSelectExpandAction,
  type BTreeSelectFieldNames,
  type BTreeSelectFlatNode,
  type BTreeSelectLabeledValue,
  type BTreeSelectModelValue,
  type BTreeSelectNode,
  type BTreeSelectShowSearchConfig,
  type BTreeSelectValue,
} from './types.ts';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

const {
  treeData = [],
  fieldNames,
  multiple = false,
  treeCheckable = false,
  treeCheckStrictly = false,
  labelInValue = false,
  size = BCommonSize.Medium,
  variant = BTreeSelectVariant.Outlined,
  placeholder,
  disabled = false,
  status,
  defaultOpen = false,
  showSearch = false,
  treeDefaultExpandAll = false,
  treeDefaultExpandedKeys = [],
  treeExpandedKeys: treeExpandedKeysProp,
  treeExpandAction = false,
  treeIcon = false,
  treeLine = false,
  loadData,
  placement: _placement = BTreeSelectPlacement.BottomLeft,
  popupMatchSelectWidth = true,
  listHeight = 256,
  maxTagCount,
  maxTagPlaceholder,
  maxCount,
  allowClear = false,
  notFoundContent = 'Not Found',
  filterTreeNode = true,
  treeNodeFilterProp = 'title',
  treeNodeLabelProp,
} = defineProps<{
  /** Hierarchical data of the tree. */
  treeData?: BTreeSelectNode[];
  /** Replace default field names. */
  fieldNames?: BTreeSelectFieldNames;
  /** Allow multiple selection (without checkboxes). */
  multiple?: boolean;
  /** Show checkboxes — implies multiple. */
  treeCheckable?: boolean;
  /** Whether checkable parent/child are independent. */
  treeCheckStrictly?: boolean;
  /** Embed label in value (returns `{ value, label }`). */
  labelInValue?: boolean;
  /** Selector size. */
  size?: `${BCommonSize}`;
  /** Visual variant. */
  variant?: `${BTreeSelectVariant}`;
  /** Placeholder text when nothing selected. */
  placeholder?: string;
  /** Disable the component. */
  disabled?: boolean;
  /** Validation status. */
  status?: `${BTreeSelectStatus}`;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Show search input — `true` or a config object. */
  showSearch?: boolean | BTreeSelectShowSearchConfig;
  /** Expand all nodes on mount. */
  treeDefaultExpandAll?: boolean;
  /** Default expanded keys (uncontrolled). */
  treeDefaultExpandedKeys?: BTreeSelectValue[];
  /** Controlled expanded keys. */
  treeExpandedKeys?: BTreeSelectValue[];
  /** When to expand on click — `click | doubleClick | false`. */
  treeExpandAction?: BTreeSelectExpandAction;
  /** Show node icons. */
  treeIcon?: boolean;
  /** Show connector lines between nodes. */
  treeLine?: boolean;
  /** Async-load child nodes. */
  loadData?: (node: BTreeSelectNode) => Promise<void>;
  /** Dropdown placement. */
  placement?: `${BTreeSelectPlacement}`;
  /** Match popup width to selector. */
  popupMatchSelectWidth?: boolean | number;
  /** Max popup list height in px. */
  listHeight?: number;
  /** Max tags to show before collapsing into +N. */
  maxTagCount?: number | 'responsive';
  /** Custom +N tag content (function or string). */
  maxTagPlaceholder?: string | ((omitted: BTreeSelectLabeledValue[]) => string);
  /** Maximum selectable nodes. */
  maxCount?: number;
  /** Show a clear button when there is a value. */
  allowClear?: boolean;
  /** Content when search yields no results. */
  notFoundContent?: string;
  /** Filter behavior — `true` uses default, `false` disables, function for custom. */
  filterTreeNode?: boolean | ((input: string, node: BTreeSelectNode) => boolean);
  /** Property of the node used for default filtering. */
  treeNodeFilterProp?: string;
  /** Property used as the displayed label (defaults to fieldNames.label). */
  treeNodeLabelProp?: string;
}>();

const emit = defineEmits<{
  /** Fires when selection value changes. */
  change: [
    value: BTreeSelectValue | BTreeSelectValue[] | BTreeSelectLabeledValue | BTreeSelectLabeledValue[] | undefined,
    label: string | string[],
    extra: BTreeSelectChangeExtra,
  ];
  /** Fires when a node is selected (single/multiple modes). */
  select: [value: BTreeSelectValue, node: BTreeSelectNode];
  /** Fires when a node is deselected (multiple/treeCheckable modes). */
  deselect: [value: BTreeSelectValue, node: BTreeSelectNode];
  /** Fires when a node is checked/unchecked (treeCheckable mode). */
  treeCheck: [keys: BTreeSelectValue[], info: { checked: boolean; node: BTreeSelectNode }];
  /** Fires when popup visibility changes. */
  openChange: [open: boolean];
  /** Fires when the popup scrolls. */
  popupScroll: [event: Event];
  /** Fires when expanded keys change. */
  treeExpand: [expandedKeys: BTreeSelectValue[]];
  /** Fires when search input changes. */
  search: [value: string];
  /** Fires when clear is pressed. */
  clear: [];
  /** Fires on selector focus. */
  focus: [event: FocusEvent];
  /** Fires on selector blur. */
  blur: [event: FocusEvent];
}>();

const model = defineModel<BTreeSelectModelValue>();
const openModel = defineModel<boolean>('open', { default: false });
if (defaultOpen && !openModel.value) openModel.value = defaultOpen;

defineSlots<{
  /** Suffix icon (replaces default arrow). */
  suffixIcon?(): unknown;
  /** Custom switcher icon. */
  switcherIcon?(props: { node: BTreeSelectNode; expanded: boolean }): unknown;
  /** Custom node title renderer. */
  title?(props: { node: BTreeSelectNode }): unknown;
  /** Custom tag renderer (multiple/treeCheckable). */
  tagRender?(props: { value: BTreeSelectValue; label: string; closable: boolean; onClose: () => void }): unknown;
  /** Custom not-found content. */
  notFoundContent?(): unknown;
  /** Custom node icon. */
  treeIcon?(props: { node: BTreeSelectNode }): unknown;
}>();

// ─── Field name resolution ────────────────────────────────────────────────────
const labelField = computed(() => fieldNames?.label ?? 'title');
const valueField = computed(() => fieldNames?.value ?? 'value');
const childrenField = computed(() => fieldNames?.children ?? 'children');
const displayLabelField = computed(() => treeNodeLabelProp ?? labelField.value);

function getLabel(n: BTreeSelectNode): string {
  return String((n as Record<string, unknown>)[labelField.value] ?? '');
}
function getDisplayLabel(n: BTreeSelectNode): string {
  const v = (n as Record<string, unknown>)[displayLabelField.value];
  return v == null ? getLabel(n) : String(v);
}
function getValue(n: BTreeSelectNode): BTreeSelectValue {
  return (n as Record<string, unknown>)[valueField.value] as BTreeSelectValue;
}
function getKey(n: BTreeSelectNode): BTreeSelectValue {
  return (n.key as BTreeSelectValue) ?? getValue(n);
}
function getChildren(n: BTreeSelectNode): BTreeSelectNode[] | undefined {
  return (n as Record<string, unknown>)[childrenField.value] as BTreeSelectNode[] | undefined;
}

// ─── Identity / IDs ───────────────────────────────────────────────────────────
const { componentUID } = useComponentId();
const anchorName = computed(() => `--b-tree-select-anchor-${componentUID.value}`);
const treeId = computed(() => `b-tree-select-tree-${componentUID.value}`);

// ─── Refs ─────────────────────────────────────────────────────────────────────
const selectorRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);
const treeRef = ref<HTMLElement | null>(null);

// ─── State ────────────────────────────────────────────────────────────────────
const isOpen = computed(() => !!openModel.value);

const searchValue = ref('');

const internalExpanded = ref<Set<BTreeSelectValue>>(new Set());
const isControlledExpanded = computed(() => treeExpandedKeysProp !== undefined);
const activeExpanded = computed<Set<BTreeSelectValue>>(() => {
  if (isControlledExpanded.value) return new Set(treeExpandedKeysProp);
  return internalExpanded.value;
});

const focusedKey = ref<BTreeSelectValue | null>(null);
const loadingKeys = ref<Set<BTreeSelectValue>>(new Set());
const loadedKeys = ref<Set<BTreeSelectValue>>(new Set());

// ─── Mode helpers ────────────────────────────────────────────────────────────
const isMultiple = computed(() => multiple || treeCheckable);

// ─── Tree traversal ───────────────────────────────────────────────────────────
function flatten(
  nodes: BTreeSelectNode[],
  depth = 0,
  parents: BTreeSelectValue[] = [],
  parentVisible = true,
): BTreeSelectFlatNode[] {
  const out: BTreeSelectFlatNode[] = [];
  for (const node of nodes) {
    const value = getValue(node);
    const key = getKey(node);
    const expanded = activeExpanded.value.has(key);
    out.push({ key, value, data: node, depth, visible: parentVisible, parents });
    const children = getChildren(node);
    if (children?.length) {
      out.push(...flatten(children, depth + 1, [...parents, value], parentVisible && expanded));
    }
  }
  return out;
}

const flatNodes = computed(() => flatten(treeData));
const nodeByValue = computed(() => {
  const map = new Map<BTreeSelectValue, BTreeSelectNode>();
  for (const f of flatNodes.value) map.set(f.value, f.data);
  return map;
});

// ─── Search filtering ─────────────────────────────────────────────────────────
const searchEnabled = computed(() => !!showSearch);

function nodeMatches(node: BTreeSelectNode, query: string): boolean {
  if (!query) return true;
  if (typeof filterTreeNode === 'function') return filterTreeNode(query, node);
  if (filterTreeNode === false) return true;
  const cfg = typeof showSearch === 'object' && showSearch !== null ? showSearch : null;
  if (cfg?.filter) return cfg.filter(query, node);
  const prop = treeNodeFilterProp ?? 'title';
  const value = (node as Record<string, unknown>)[prop];
  return String(value ?? '')
    .toLowerCase()
    .includes(query.toLowerCase());
}

const visibleFlatNodes = computed(() => {
  const q = searchValue.value.trim();
  if (!q) return flatNodes.value.filter((n) => n.visible);

  // Show ancestors of any matching node
  const keepValues = new Set<BTreeSelectValue>();
  for (const f of flatNodes.value) {
    if (nodeMatches(f.data, q)) {
      keepValues.add(f.value);
      f.parents.forEach((p) => keepValues.add(p));
    }
  }
  return flatNodes.value
    .filter((f) => keepValues.has(f.value))
    .map((f) => ({ ...f, visible: true }));
});

// ─── Value / model helpers ────────────────────────────────────────────────────
function toRawValue(v: BTreeSelectValue | BTreeSelectLabeledValue): BTreeSelectValue {
  if (typeof v === 'object' && v !== null && 'value' in v) return v.value;
  return v;
}

const selectedValues = computed<BTreeSelectValue[]>(() => {
  const m = model.value;
  if (m == null) return [];
  if (Array.isArray(m)) return m.map(toRawValue);
  return [toRawValue(m as BTreeSelectValue | BTreeSelectLabeledValue)];
});

const selectedSet = computed(() => new Set(selectedValues.value));

// In treeCheckable mode w/o strict, derive half-checked state from selectedValues
const halfCheckedSet = computed<Set<BTreeSelectValue>>(() => {
  if (!treeCheckable || treeCheckStrictly) return new Set();
  const half = new Set<BTreeSelectValue>();
  function walk(nodes: BTreeSelectNode[]): { all: boolean; some: boolean } {
    let all = true;
    let some = false;
    for (const n of nodes) {
      const v = getValue(n);
      const children = getChildren(n);
      if (children?.length) {
        const sub = walk(children);
        if (sub.all) {
          some = true;
        } else if (sub.some) {
          half.add(v);
          all = false;
          some = true;
        } else {
          if (!selectedSet.value.has(v)) all = false;
          else some = true;
        }
      } else {
        if (!selectedSet.value.has(v)) all = false;
        else some = true;
      }
    }
    return { all, some };
  }
  walk(treeData);
  return half;
});

// ─── Display tags / single label ──────────────────────────────────────────────
const displayTags = computed<BTreeSelectLabeledValue[]>(() => {
  return selectedValues.value.map((v) => {
    const node = nodeByValue.value.get(v);
    const fromModel = Array.isArray(model.value)
      ? (model.value.find(
          (m) => typeof m === 'object' && m !== null && 'value' in m && (m as BTreeSelectLabeledValue).value === v,
        ) as BTreeSelectLabeledValue | undefined)
      : typeof model.value === 'object' && model.value !== null && 'value' in (model.value as object) &&
        (model.value as BTreeSelectLabeledValue).value === v
        ? (model.value as BTreeSelectLabeledValue)
        : undefined;
    const label = node ? getDisplayLabel(node) : (fromModel?.label ?? String(v));
    return { value: v, label };
  });
});

const singleLabel = computed(() => displayTags.value[0]?.label ?? '');

const visibleTags = computed(() => {
  if (maxTagCount == null || maxTagCount === 'responsive') return displayTags.value;
  return displayTags.value.slice(0, maxTagCount as number);
});

const omittedTags = computed(() => {
  if (maxTagCount == null || maxTagCount === 'responsive') return [] as BTreeSelectLabeledValue[];
  return displayTags.value.slice(maxTagCount as number);
});

const omittedPlaceholder = computed(() => {
  const omitted = omittedTags.value;
  if (omitted.length === 0) return '';
  if (typeof maxTagPlaceholder === 'function') return maxTagPlaceholder(omitted);
  if (typeof maxTagPlaceholder === 'string') return maxTagPlaceholder;
  return `+ ${omitted.length} ...`;
});

// ─── Initialise expanded ──────────────────────────────────────────────────────
function collectAllExpandableKeys(nodes: BTreeSelectNode[]): BTreeSelectValue[] {
  const out: BTreeSelectValue[] = [];
  for (const n of nodes) {
    const ch = getChildren(n);
    if (ch?.length) {
      out.push(getKey(n));
      out.push(...collectAllExpandableKeys(ch));
    }
  }
  return out;
}

if (!isControlledExpanded.value) {
  if (treeDefaultExpandAll) {
    internalExpanded.value = new Set(collectAllExpandableKeys(treeData));
  } else if (treeDefaultExpandedKeys.length) {
    internalExpanded.value = new Set(treeDefaultExpandedKeys);
  }
}

// ─── Open/close ───────────────────────────────────────────────────────────────
let previouslyFocusedElement: HTMLElement | null = null;

function setOpen(val: boolean) {
  if (openModel.value !== val) openModel.value = val;
  emit('openChange', val);
}

function openMenu() {
  if (disabled || isOpen.value) return;
  previouslyFocusedElement = document.activeElement as HTMLElement | null;
  setOpen(true);
}

function closeMenu() {
  if (!isOpen.value) return;
  setOpen(false);
  searchValue.value = '';
  // Return focus to selector
  nextTick(() => {
    if (previouslyFocusedElement?.isConnected) {
      previouslyFocusedElement.focus();
    } else {
      selectorRef.value?.focus();
    }
  });
}

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => {
      popoverRef.value?.showPopover?.();
      if (searchEnabled.value) searchInputRef.value?.focus();
      // Initial focused node
      if (!focusedKey.value && visibleFlatNodes.value[0]) {
        focusedKey.value = visibleFlatNodes.value[0].key;
      }
    });
  } else {
    popoverRef.value?.hidePopover?.();
  }
});

// ─── Toggle expand ────────────────────────────────────────────────────────────
async function toggleExpand(node: BTreeSelectNode) {
  const k = getKey(node);
  if (node.disabled) return;

  const expanding = !activeExpanded.value.has(k);

  // Async load
  if (expanding && loadData && !loadedKeys.value.has(k) && !loadingKeys.value.has(k)) {
    loadingKeys.value.add(k);
    try {
      await loadData(node);
      loadedKeys.value.add(k);
    } finally {
      loadingKeys.value.delete(k);
    }
  }

  let next: Set<BTreeSelectValue>;
  if (isControlledExpanded.value) {
    next = new Set(treeExpandedKeysProp);
  } else {
    next = new Set(internalExpanded.value);
  }
  if (expanding) next.add(k);
  else next.delete(k);

  if (!isControlledExpanded.value) internalExpanded.value = next;
  emit('treeExpand', [...next]);
}

// ─── Selection / check ────────────────────────────────────────────────────────
function emitChange(
  values: BTreeSelectValue[],
  triggerNode: BTreeSelectNode,
  extra: Partial<BTreeSelectChangeExtra> = {},
) {
  const labels = values.map((v) => {
    const n = nodeByValue.value.get(v);
    return n ? getDisplayLabel(n) : String(v);
  });

  // Build emit value
  let emitValue: BTreeSelectValue | BTreeSelectValue[] | BTreeSelectLabeledValue | BTreeSelectLabeledValue[] | undefined;
  if (isMultiple.value) {
    emitValue = labelInValue
      ? values.map((v, i) => ({ value: v, label: labels[i] }))
      : [...values];
  } else {
    if (values.length === 0) {
      emitValue = labelInValue ? undefined : undefined;
    } else {
      emitValue = labelInValue ? { value: values[0], label: labels[0] } : values[0];
    }
  }

  model.value = emitValue;
  emit('change', emitValue, isMultiple.value ? labels : (labels[0] ?? ''), {
    triggerValue: getValue(triggerNode),
    triggerNode,
    ...extra,
  });
}

function selectNode(node: BTreeSelectNode) {
  if (node.disabled || node.selectable === false) return;
  const v = getValue(node);

  if (treeCheckable) {
    handleCheck(node);
    return;
  }

  if (isMultiple.value) {
    const cur = selectedValues.value.slice();
    const idx = cur.indexOf(v);
    if (idx >= 0) {
      cur.splice(idx, 1);
      emit('deselect', v, node);
      emitChange(cur, node, { selected: false });
    } else {
      if (maxCount != null && cur.length >= maxCount) return;
      cur.push(v);
      emit('select', v, node);
      emitChange(cur, node, { selected: true });
    }
  } else {
    if (selectedValues.value[0] === v) {
      // Already selected: just close
      closeMenu();
      return;
    }
    emit('select', v, node);
    emitChange([v], node, { selected: true });
    closeMenu();
  }
}

function handleCheck(node: BTreeSelectNode) {
  if (node.disabled || node.disableCheckbox) return;
  const v = getValue(node);
  const cur = new Set(selectedValues.value);
  const isCurrentlyChecked = cur.has(v);

  if (treeCheckStrictly) {
    if (isCurrentlyChecked) {
      cur.delete(v);
      emit('deselect', v, node);
    } else {
      if (maxCount != null && cur.size >= maxCount) return;
      cur.add(v);
      emit('select', v, node);
    }
  } else {
    // cascade
    if (isCurrentlyChecked) {
      cur.delete(v);
      function uncheck(nodes: BTreeSelectNode[]) {
        for (const n of nodes) {
          cur.delete(getValue(n));
          const ch = getChildren(n);
          if (ch?.length) uncheck(ch);
        }
      }
      const ch = getChildren(node);
      if (ch?.length) uncheck(ch);
      emit('deselect', v, node);
    } else {
      if (maxCount != null && cur.size >= maxCount) return;
      cur.add(v);
      function check(nodes: BTreeSelectNode[]) {
        for (const n of nodes) {
          if (!n.disabled && !n.disableCheckbox) cur.add(getValue(n));
          const ch = getChildren(n);
          if (ch?.length) check(ch);
        }
      }
      const ch = getChildren(node);
      if (ch?.length) check(ch);
      emit('select', v, node);
    }
    // Recompute parent state by removing parents that aren't fully selected
    function syncParents(nodes: BTreeSelectNode[]): { all: boolean; some: boolean } {
      let all = true;
      let some = false;
      for (const n of nodes) {
        const value = getValue(n);
        const children = getChildren(n);
        if (children?.length) {
          const sub = syncParents(children);
          if (sub.all) {
            cur.add(value);
            some = true;
          } else if (sub.some) {
            cur.delete(value);
            all = false;
            some = true;
          } else {
            cur.delete(value);
            if (!cur.has(value)) all = false;
          }
        } else {
          if (!cur.has(value)) all = false;
          else some = true;
        }
      }
      return { all, some };
    }
    syncParents(treeData);
  }

  emit('treeCheck', [...cur], { checked: !isCurrentlyChecked, node });
  emitChange([...cur], node, { checked: !isCurrentlyChecked });
}

function removeTag(value: BTreeSelectValue, e?: Event) {
  e?.stopPropagation();
  const node = nodeByValue.value.get(value);
  if (treeCheckable && node) {
    handleCheck(node);
    return;
  }
  const next = selectedValues.value.filter((v) => v !== value);
  if (node) emit('deselect', value, node);
  emitChange(next, node ?? ({ [valueField.value]: value } as BTreeSelectNode), { selected: false });
}

function handleClear(e: Event) {
  e.stopPropagation();
  const dummy = { [valueField.value]: '' } as BTreeSelectNode;
  if (isMultiple.value) {
    model.value = [];
  } else {
    model.value = undefined;
  }
  searchValue.value = '';
  emit('clear');
  emit('change', model.value, isMultiple.value ? [] : '', {
    triggerNode: dummy,
    triggerValue: undefined,
  });
}

// ─── Click outside ────────────────────────────────────────────────────────────
function onSelectorClick() {
  if (disabled) return;
  if (isOpen.value) closeMenu();
  else openMenu();
}

function onSelectorBlur(e: FocusEvent) {
  const related = e.relatedTarget as HTMLElement | null;
  if (popoverRef.value?.contains(related)) return;
  if (selectorRef.value?.contains(related)) return;
  emit('blur', e);
}

function onSelectorFocus(e: FocusEvent) {
  emit('focus', e);
}

function onSearchInput(e: Event) {
  const t = e.target as HTMLInputElement;
  searchValue.value = t.value;
  emit('search', t.value);
  if (!isOpen.value) openMenu();
  // Focus first visible node when searching
  nextTick(() => {
    focusedKey.value = visibleFlatNodes.value[0]?.key ?? null;
  });
}

function onPopupScroll(e: Event) {
  emit('popupScroll', e);
}

// ─── Keyboard handling ────────────────────────────────────────────────────────
function focusVisibleNode(key: BTreeSelectValue) {
  focusedKey.value = key;
  nextTick(() => {
    const safe = String(key).replace(/["\\]/g, '\\$&');
    const el = treeRef.value?.querySelector<HTMLElement>(
      `[data-node-key="${safe}"]`,
    );
    el?.focus();
    el?.scrollIntoView?.({ block: 'nearest' });
  });
}

function onSelectorKeyDown(e: KeyboardEvent) {
  if (disabled) return;
  switch (e.key) {
    case 'Enter':
    case ' ':
      if (!searchEnabled.value || !isOpen.value) {
        e.preventDefault();
        if (isOpen.value) closeMenu();
        else openMenu();
      }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!isOpen.value) openMenu();
      nextTick(() => {
        const first = visibleFlatNodes.value[0];
        if (first) focusVisibleNode(first.key);
      });
      break;
    case 'Escape':
      if (isOpen.value) {
        e.preventDefault();
        closeMenu();
      }
      break;
    case 'Backspace':
      if (isMultiple.value && !searchValue.value && selectedValues.value.length > 0) {
        const last = selectedValues.value[selectedValues.value.length - 1];
        removeTag(last);
      }
      break;
    case 'Tab':
      if (isOpen.value) closeMenu();
      break;
  }
}

function onTreeKeyDown(e: KeyboardEvent) {
  const visible = visibleFlatNodes.value;
  if (!visible.length) return;
  const idx = visible.findIndex((n) => n.key === focusedKey.value);
  const cur = visible[idx];

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const next = visible[idx + 1] ?? visible[0];
      focusVisibleNode(next.key);
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const prev = visible[idx - 1] ?? visible[visible.length - 1];
      focusVisibleNode(prev.key);
      break;
    }
    case 'ArrowRight': {
      e.preventDefault();
      if (!cur) break;
      if (hasChildren(cur.data) && !activeExpanded.value.has(cur.key)) toggleExpand(cur.data);
      break;
    }
    case 'ArrowLeft': {
      e.preventDefault();
      if (!cur) break;
      if (activeExpanded.value.has(cur.key)) toggleExpand(cur.data);
      break;
    }
    case 'Enter':
    case ' ': {
      e.preventDefault();
      if (cur) selectNode(cur.data);
      break;
    }
    case 'Escape':
      e.preventDefault();
      closeMenu();
      break;
    case 'Home': {
      e.preventDefault();
      if (visible[0]) focusVisibleNode(visible[0].key);
      break;
    }
    case 'End': {
      e.preventDefault();
      const last = visible[visible.length - 1];
      if (last) focusVisibleNode(last.key);
      break;
    }
    case 'Tab': {
      closeMenu();
      break;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hasChildren(node: BTreeSelectNode): boolean {
  const ch = getChildren(node);
  return !!ch?.length || (!!loadData && !node.isLeaf);
}

function isExpanded(key: BTreeSelectValue) {
  return activeExpanded.value.has(key);
}

function isLoading(key: BTreeSelectValue) {
  return loadingKeys.value.has(key);
}

function nodeIsSelectable(node: BTreeSelectNode) {
  if (treeCheckable) return node.checkable !== false && !node.disabled && !node.disableCheckbox;
  return node.selectable !== false && !node.disabled;
}

// ─── Public API ───────────────────────────────────────────────────────────────
defineExpose({
  focus: () => selectorRef.value?.focus(),
  blur: () => selectorRef.value?.blur(),
});

// ─── Computed UI helpers ──────────────────────────────────────────────────────
const showClear = computed(() => {
  if (!allowClear || disabled) return false;
  return selectedValues.value.length > 0;
});

const sizeClass = computed(() => `b-tree-select--${size}`);
const variantClass = computed(() => `b-tree-select--${variant}`);
const statusClass = computed(() => (status ? `b-tree-select--${status}` : ''));

const expandTrigger = computed(() => treeExpandAction);

function onNodeRowClick(node: BTreeSelectNode, event: MouseEvent) {
  if (expandTrigger.value === 'click' && hasChildren(node) && nodeIsSelectable(node)) {
    toggleExpand(node);
  }
  selectNode(node);
  void event;
}

function onNodeRowDblClick(node: BTreeSelectNode) {
  if (expandTrigger.value === 'doubleClick' && hasChildren(node)) {
    toggleExpand(node);
  }
}
</script>

<template>
  <div
    class="b-tree-select b:relative b:inline-flex b:w-full"
    :class="[sizeClass, variantClass, statusClass, { 'b-tree-select--disabled': disabled, 'b-tree-select--multiple': isMultiple, 'b-tree-select--open': isOpen }]"
  >
    <!-- ─── Selector trigger ───────────────────────────────────────── -->
    <div
      ref="selectorRef"
      v-bind="attrs"
      class="b-tree-select__selector b:box-border b:flex b:w-full b:cursor-pointer b:items-center b:gap-1 b:transition-all b:outline-none"
      :class="[
        {
          'b:min-h-6 b:px-2 b:text-sm': size === BCommonSize.Small,
          'b:min-h-8 b:px-3 b:text-sm': size === BCommonSize.Medium,
          'b:min-h-10 b:px-3 b:text-base': size === BCommonSize.Large,
        },
        {
          'b:rounded-lg b:border-1 b:border-[var(--b-tree-select-border-color)] b:bg-[var(--b-tree-select-bg)] b:hover:not-disabled:border-[var(--b-tree-select-hover-border-color)] b:focus:not-disabled:border-[var(--b-tree-select-active-border-color)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-tree-select-active-outline-color)]':
            variant === BTreeSelectVariant.Outlined,
          'b:rounded-lg b:border-1 b:border-transparent b:bg-[var(--b-tree-select-filled-bg)] b:focus:not-disabled:border-[var(--b-tree-select-active-border-color)] b:focus:not-disabled:bg-[var(--b-tree-select-bg)] b:focus:not-disabled:shadow-[0_0_0_2px_var(--b-tree-select-active-outline-color)]':
            variant === BTreeSelectVariant.Filled,
          'b:rounded-lg b:border-1 b:border-transparent b:bg-transparent':
            variant === BTreeSelectVariant.Borderless,
          'b:rounded-none b:border-0 b:border-b-1 b:border-[var(--b-tree-select-border-color)] b:bg-transparent':
            variant === BTreeSelectVariant.Underlined,
        },
        {
          'b:border-red-500! b:hover:not-disabled:border-red-400! b:focus:not-disabled:border-red-500! b:focus:not-disabled:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]!':
            status === BTreeSelectStatus.Error,
          'b:border-yellow-500! b:hover:not-disabled:border-yellow-400! b:focus:not-disabled:border-yellow-500! b:focus:not-disabled:shadow-[0_0_0_2px_rgba(255,215,5,0.1)]!':
            status === BTreeSelectStatus.Warning,
        },
        {
          'b:cursor-not-allowed b:opacity-40': disabled,
        },
      ]"
      :tabindex="disabled ? -1 : 0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? treeId : undefined"
      aria-haspopup="tree"
      :aria-label="placeholder ?? 'Tree select'"
      :aria-disabled="disabled || undefined"
      @click="onSelectorClick"
      @keydown="onSelectorKeyDown"
      @focus="onSelectorFocus"
      @blur="onSelectorBlur"
    >
      <!-- ─── Multiple/checkable mode: tags ─── -->
      <template v-if="isMultiple">
        <span
          v-for="tag in visibleTags"
          :key="String(tag.value)"
          class="b-tree-select__tag b:inline-flex b:max-w-full b:items-center b:gap-0.5 b:rounded b:border-1 b:border-[var(--b-tree-select-tag-border-color)] b:bg-[var(--b-tree-select-tag-bg)] b:leading-none"
          :class="[
            {
              'b:h-4 b:px-1 b:text-xs': size === BCommonSize.Small,
              'b:h-6 b:px-1.5 b:text-xs': size === BCommonSize.Medium,
              'b:h-8 b:px-2 b:text-sm': size === BCommonSize.Large,
            },
          ]"
        >
          <slot
            name="tagRender"
            :value="tag.value"
            :label="tag.label"
            :closable="!disabled"
            :on-close="() => removeTag(tag.value)"
          >
            <span class="b:truncate">{{ tag.label }}</span>
            <button
              v-if="!disabled"
              type="button"
              class="b-tree-select__tag-close b:ml-0.5 b:flex b:h-3.5 b:w-3.5 b:cursor-pointer b:items-center b:justify-center b:rounded-full b:border-none b:bg-transparent b:text-[10px] b:text-zinc-400 b:hover:bg-zinc-200 b:hover:text-zinc-600"
              :aria-label="`Remove ${tag.label}`"
              tabindex="-1"
              @click.stop="removeTag(tag.value)"
              @mousedown.prevent
            >
              <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </button>
          </slot>
        </span>
        <span
          v-if="omittedTags.length > 0"
          class="b-tree-select__tag b-tree-select__tag--count b:relative b:z-1 b:inline-flex b:shrink-0 b:items-center b:rounded b:bg-[var(--b-tree-select-multiple-count-bg)] b:px-1.5 b:text-xs b:leading-none b:text-[var(--b-tree-select-multiple-count-color)]"
          :class="[
            {
              'b:h-4': size === BCommonSize.Small,
              'b:h-6': size === BCommonSize.Medium,
              'b:h-8': size === BCommonSize.Large,
            },
          ]"
        >
          {{ omittedPlaceholder }}
        </span>
        <input
          v-if="searchEnabled"
          ref="searchInputRef"
          class="b-tree-select__search b:min-w-4 b:flex-1 b:border-none b:bg-transparent b:text-sm b:outline-none b:placeholder:text-[var(--b-tree-select-placeholder-color)]"
          :value="searchValue"
          :placeholder="selectedValues.length === 0 ? placeholder : undefined"
          :disabled="disabled"
          aria-autocomplete="list"
          :aria-label="placeholder ?? 'Search'"
          autocomplete="off"
          @input="onSearchInput"
        />
        <span
          v-else-if="selectedValues.length === 0"
          class="b-tree-select__placeholder b:flex-1 b:truncate b:text-[var(--b-tree-select-placeholder-color)]"
        >
          {{ placeholder }}
        </span>
      </template>

      <!-- ─── Single mode ─── -->
      <template v-else>
        <span
          v-if="singleLabel && !searchValue"
          class="b-tree-select__value b:flex-1 b:truncate b:text-[color:var(--b-tree-select-color)]"
        >
          {{ singleLabel }}
        </span>
        <span
          v-else-if="!singleLabel && !searchValue"
          class="b-tree-select__placeholder b:flex-1 b:truncate b:text-[var(--b-tree-select-placeholder-color)]"
        >
          {{ placeholder }}
        </span>
        <input
          v-if="searchEnabled"
          ref="searchInputRef"
          class="b-tree-select__search b:absolute b:inset-0 b:w-full b:border-none b:bg-transparent b:px-3 b:text-sm b:outline-none b:placeholder:text-[var(--b-tree-select-placeholder-color)]"
          :class="{ 'b:opacity-0': !isOpen }"
          :value="searchValue"
          :disabled="disabled"
          autocomplete="off"
          tabindex="-1"
          aria-autocomplete="list"
          :aria-label="placeholder ?? 'Search'"
          @input="onSearchInput"
        />
      </template>

      <!-- Clear button -->
      <button
        v-if="showClear"
        type="button"
        class="b-tree-select__clear b:z-1 b:flex b:h-4 b:w-4 b:shrink-0 b:cursor-pointer b:items-center b:justify-center b:rounded-full b:border-none b:bg-[var(--b-tree-select-bg)] b:text-xs b:text-zinc-400 b:hover:text-zinc-600"
        aria-label="Clear selection"
        tabindex="-1"
        @click="handleClear"
        @mousedown.prevent
      >
        <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Suffix arrow -->
      <span
        class="b-tree-select__arrow b:ml-auto b:flex b:shrink-0 b:items-center b:text-zinc-400 b:transition-transform b:duration-200"
        :class="{ 'b:rotate-180': isOpen }"
        aria-hidden="true"
      >
        <slot name="suffixIcon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </slot>
      </span>
    </div>

    <!-- ─── Popup ─── -->
    <div
      :id="treeId"
      ref="popoverRef"
      class="b-tree-select__dropdown"
      :class="{ 'b-tree-select__dropdown--match-width': popupMatchSelectWidth === true }"
      :style="[
        typeof popupMatchSelectWidth === 'number'
          ? { width: `${popupMatchSelectWidth}px` }
          : undefined,
        { maxHeight: `${listHeight}px` },
      ]"
      popover
      role="dialog"
      aria-modal="false"
      :aria-label="placeholder ?? 'Tree options'"
      @scroll="onPopupScroll"
      @keydown="onTreeKeyDown"
    >
      <div
        ref="treeRef"
        class="b-tree-select__tree"
        :class="{ 'b-tree-select__tree--show-line': treeLine }"
        role="tree"
        :aria-multiselectable="isMultiple || undefined"
      >
        <template v-if="visibleFlatNodes.length > 0">
          <div
            v-for="flat in visibleFlatNodes"
            :key="String(flat.key)"
            :data-node-key="String(flat.key)"
            class="b-tree-select__node"
            :class="{
              'b-tree-select__node--selected': !treeCheckable && selectedSet.has(flat.value),
              'b-tree-select__node--disabled': flat.data.disabled,
              'b-tree-select__node--focused': focusedKey === flat.key,
              'b-tree-select__node--expanded': isExpanded(flat.key),
            }"
            role="treeitem"
            :aria-expanded="hasChildren(flat.data) ? isExpanded(flat.key) : undefined"
            :aria-selected="!treeCheckable && selectedSet.has(flat.value)"
            :aria-checked="treeCheckable
              ? halfCheckedSet.has(flat.value)
                ? 'mixed'
                : selectedSet.has(flat.value)
              : undefined"
            :aria-disabled="flat.data.disabled || undefined"
            :aria-level="flat.depth + 1"
            :tabindex="focusedKey === flat.key ? 0 : -1"
            :style="{ '--b-tree-select-node-indent': `${flat.depth * 24}px` }"
            @click.stop="onNodeRowClick(flat.data, $event)"
            @dblclick.stop="onNodeRowDblClick(flat.data)"
          >
            <!-- Indent -->
            <span class="b-tree-select__indent" aria-hidden="true" />

            <!-- Switcher -->
            <span
              v-if="hasChildren(flat.data)"
              class="b-tree-select__switcher"
              :class="{
                'b-tree-select__switcher--expanded': isExpanded(flat.key),
                'b-tree-select__switcher--loading': isLoading(flat.key),
              }"
              aria-hidden="true"
              @click.stop="toggleExpand(flat.data)"
            >
              <slot
                v-if="!isLoading(flat.key)"
                name="switcherIcon"
                :node="flat.data"
                :expanded="isExpanded(flat.key)"
              >
                <svg
                  class="b-tree-select__switcher-icon"
                  viewBox="0 0 8 8"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M2 1.5L6 4L2 6.5z" />
                </svg>
              </slot>
              <svg
                v-if="isLoading(flat.key)"
                class="b-tree-select__switcher-icon b-tree-select__switcher-icon--spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="42"
                  stroke-dashoffset="14"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span v-else class="b-tree-select__switcher b-tree-select__switcher--leaf" aria-hidden="true" />

            <!-- Checkbox (treeCheckable mode) -->
            <span
              v-if="treeCheckable && flat.data.checkable !== false"
              class="b-tree-select__checkbox"
              :class="{
                'b-tree-select__checkbox--checked': selectedSet.has(flat.value),
                'b-tree-select__checkbox--indeterminate': halfCheckedSet.has(flat.value),
                'b-tree-select__checkbox--disabled': flat.data.disabled || flat.data.disableCheckbox,
              }"
              role="checkbox"
              :aria-checked="halfCheckedSet.has(flat.value) ? 'mixed' : selectedSet.has(flat.value)"
              :aria-disabled="flat.data.disabled || flat.data.disableCheckbox || undefined"
              tabindex="-1"
              @click.stop="handleCheck(flat.data)"
            >
              <span class="b-tree-select__checkbox-inner" aria-hidden="true" />
            </span>

            <!-- Icon -->
            <span v-if="treeIcon || $slots.treeIcon" class="b-tree-select__icon" aria-hidden="true">
              <slot name="treeIcon" :node="flat.data" />
            </span>

            <!-- Title -->
            <span class="b-tree-select__title">
              <slot name="title" :node="flat.data">
                {{ getDisplayLabel(flat.data) }}
              </slot>
            </span>
          </div>
        </template>

        <!-- Empty -->
        <div v-else class="b-tree-select__empty">
          <slot name="notFoundContent">{{ notFoundContent }}</slot>
        </div>
      </div>
    </div>

    <!-- a11y live region: announces selection count -->
    <span class="b-tree-select__sr-only" role="status" aria-live="polite">
      <template v-if="isMultiple">{{ selectedValues.length }} selected</template>
      <template v-else-if="singleLabel">{{ singleLabel }} selected</template>
    </span>
  </div>
</template>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────────────────────── */
.b-tree-select {
  /* AntD: indentSize */
  --b-tree-select-indent-size: 24px;
  /* AntD: nodeHoverBg */
  --b-tree-select-node-hover-bg: rgba(0, 0, 0, 0.04);
  /* AntD: nodeHoverColor */
  --b-tree-select-node-hover-color: rgba(0, 0, 0, 0.88);
  /* AntD: nodeSelectedBg */
  --b-tree-select-node-selected-bg: #e6f4ff;
  /* AntD: nodeSelectedColor */
  --b-tree-select-node-selected-color: rgba(0, 0, 0, 0.88);
  /* AntD: switcherSize */
  --b-tree-select-switcher-size: 16px;
  /* AntD: titleHeight */
  --b-tree-select-title-height: 24px;

  /* Selector tokens */
  --b-tree-select-bg: #ffffff;
  --b-tree-select-color: rgba(0, 0, 0, 0.88);
  --b-tree-select-placeholder-color: #606870;
  --b-tree-select-border-color: #d9d9d9;
  --b-tree-select-hover-border-color: #4096ff;
  --b-tree-select-active-border-color: #1677ff;
  --b-tree-select-active-outline-color: rgba(5, 145, 255, 0.1);
  --b-tree-select-filled-bg: rgba(0, 0, 0, 0.04);

  /* Tag tokens */
  --b-tree-select-tag-bg: rgba(0, 0, 0, 0.06);
  --b-tree-select-tag-border-color: transparent;
  --b-tree-select-multiple-count-bg: #f0f0f0;
  --b-tree-select-multiple-count-color: #1f1f1f;

  /* Checkbox tokens */
  --b-tree-select-checkbox-size: 16px;
  --b-tree-select-checkbox-border: #d9d9d9;
  --b-tree-select-checkbox-bg: #ffffff;
  --b-tree-select-checkbox-checked-bg: #1677ff;

  /* Popup tokens */
  --b-tree-select-popup-bg: #ffffff;
  --b-tree-select-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-tree-select-popup-border-radius: 8px;
  --b-tree-select-z-index-popup: 1050;
  --b-tree-select-line-color: #d9d9d9;

  /* Motion */
  --b-tree-select-transition-duration: 200ms;
}

/* ─── Dark mode ─────────────────────────────────────────────────────────────── */
[data-prefers-color='dark'] .b-tree-select {
  --b-tree-select-node-hover-bg: rgba(255, 255, 255, 0.08);
  --b-tree-select-node-hover-color: rgba(255, 255, 255, 0.88);
  --b-tree-select-node-selected-bg: #111a2c;
  --b-tree-select-node-selected-color: rgba(255, 255, 255, 0.88);
  --b-tree-select-bg: #1f1f1f;
  --b-tree-select-color: rgba(255, 255, 255, 0.88);
  --b-tree-select-placeholder-color: #9ca3af;
  --b-tree-select-border-color: #424242;
  --b-tree-select-hover-border-color: #4096ff;
  --b-tree-select-active-border-color: #1668dc;
  --b-tree-select-active-outline-color: rgba(22, 104, 220, 0.15);
  --b-tree-select-filled-bg: rgba(255, 255, 255, 0.08);
  --b-tree-select-tag-bg: rgba(255, 255, 255, 0.1);
  --b-tree-select-multiple-count-bg: #353535;
  --b-tree-select-multiple-count-color: #e0e0e0;
  --b-tree-select-checkbox-border: #424242;
  --b-tree-select-checkbox-bg: #1f1f1f;
  --b-tree-select-popup-bg: #1f1f1f;
  --b-tree-select-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.24),
    0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-tree-select-line-color: #424242;
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-tree-select {
    --b-tree-select-node-hover-bg: rgba(255, 255, 255, 0.08);
    --b-tree-select-node-hover-color: rgba(255, 255, 255, 0.88);
    --b-tree-select-node-selected-bg: #111a2c;
    --b-tree-select-node-selected-color: rgba(255, 255, 255, 0.88);
    --b-tree-select-bg: #1f1f1f;
    --b-tree-select-color: rgba(255, 255, 255, 0.88);
    --b-tree-select-placeholder-color: #9ca3af;
    --b-tree-select-border-color: #424242;
    --b-tree-select-active-border-color: #1668dc;
    --b-tree-select-active-outline-color: rgba(22, 104, 220, 0.15);
    --b-tree-select-filled-bg: rgba(255, 255, 255, 0.08);
    --b-tree-select-tag-bg: rgba(255, 255, 255, 0.1);
    --b-tree-select-multiple-count-bg: #353535;
    --b-tree-select-multiple-count-color: #e0e0e0;
    --b-tree-select-checkbox-border: #424242;
    --b-tree-select-checkbox-bg: #1f1f1f;
    --b-tree-select-popup-bg: #1f1f1f;
    --b-tree-select-line-color: #424242;
  }
}

/* ─── Selector anchor ───────────────────────────────────────────────────────── */
.b-tree-select__selector {
  anchor-name: v-bind('anchorName');
}

/* ─── Dropdown ──────────────────────────────────────────────────────────────── */
.b-tree-select__dropdown {
  position: absolute;
  margin: 0;
  padding: 4px;
  border: none;
  background: var(--b-tree-select-popup-bg);
  border-radius: var(--b-tree-select-popup-border-radius);
  box-shadow: var(--b-tree-select-popup-shadow);
  overflow: auto;
  z-index: var(--b-tree-select-z-index-popup);

  position-anchor: v-bind('anchorName');
  position-try-fallbacks: --b-tree-select-top;
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 4px;

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

.b-tree-select__tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  outline: none;
}

.b-tree-select__dropdown--match-width {
  width: anchor-size(width);
}

@position-try --b-tree-select-top {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
  margin-top: 0;
  margin-bottom: 4px;
}

.b-tree-select__node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--b-tree-select-title-height);
  padding-inline-start: calc(8px + var(--b-tree-select-node-indent, 0px));
  padding-inline-end: 12px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  outline: none;
  color: inherit;
  transition:
    background-color var(--b-tree-select-transition-duration) ease,
    color var(--b-tree-select-transition-duration) ease;
}

.b-tree-select__node:hover {
  background-color: var(--b-tree-select-node-hover-bg);
  color: var(--b-tree-select-node-hover-color);
}

.b-tree-select__node--selected {
  background-color: var(--b-tree-select-node-selected-bg);
  color: var(--b-tree-select-node-selected-color);
  font-weight: 600;
}

.b-tree-select__node--selected:hover {
  background-color: var(--b-tree-select-node-selected-bg);
}

.b-tree-select__node--focused,
.b-tree-select__node:focus-visible {
  background-color: var(--b-tree-select-node-hover-bg);
  outline: none;
}

.b-tree-select__node--disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.b-tree-select__node--disabled:hover {
  background-color: transparent;
}

/* Indent placeholder */
.b-tree-select__indent {
  display: inline-block;
  flex-shrink: 0;
}

/* Switcher */
.b-tree-select__switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--b-tree-select-switcher-size);
  height: var(--b-tree-select-switcher-size);
  color: rgba(0, 0, 0, 0.45);
}

.b-tree-select__switcher--leaf {
  pointer-events: none;
  visibility: hidden;
}

.b-tree-select__switcher-icon {
  width: 10px;
  height: 10px;
  transition: transform var(--b-tree-select-transition-duration) ease;
}

.b-tree-select__switcher--expanded .b-tree-select__switcher-icon:not(.b-tree-select__switcher-icon--spin) {
  transform: rotate(90deg);
}

@keyframes b-tree-select-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.b-tree-select__switcher-icon--spin {
  animation: b-tree-select-spin 700ms linear infinite;
}

/* Checkbox */
.b-tree-select__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  line-height: 1;
}

.b-tree-select__checkbox-inner {
  display: inline-block;
  width: var(--b-tree-select-checkbox-size);
  height: var(--b-tree-select-checkbox-size);
  border: 1.5px solid var(--b-tree-select-checkbox-border);
  border-radius: 3px;
  background-color: var(--b-tree-select-checkbox-bg);
  position: relative;
  transition:
    border-color var(--b-tree-select-transition-duration) ease,
    background-color var(--b-tree-select-transition-duration) ease;
}

.b-tree-select__checkbox--checked .b-tree-select__checkbox-inner {
  border-color: var(--b-tree-select-checkbox-checked-bg);
  background-color: var(--b-tree-select-checkbox-checked-bg);
}

.b-tree-select__checkbox--checked .b-tree-select__checkbox-inner::after {
  content: '';
  position: absolute;
  inset-inline-start: 4px;
  top: 1px;
  width: 5px;
  height: 8px;
  border: 2px solid #fff;
  border-top: none;
  border-inline-start: none;
  transform: rotate(45deg);
}

.b-tree-select__checkbox--indeterminate .b-tree-select__checkbox-inner {
  border-color: var(--b-tree-select-checkbox-checked-bg);
  background-color: var(--b-tree-select-checkbox-checked-bg);
}

.b-tree-select__checkbox--indeterminate .b-tree-select__checkbox-inner::after {
  content: '';
  position: absolute;
  inset-inline-start: 2px;
  top: 50%;
  width: calc(100% - 4px);
  height: 2px;
  background-color: #fff;
  transform: translateY(-50%);
}

.b-tree-select__checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Icon */
.b-tree-select__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* Title */
.b-tree-select__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Show line */
.b-tree-select__tree--show-line .b-tree-select__node:not(:last-child)::before {
  content: '';
  position: absolute;
  inset-inline-start: calc(var(--b-tree-select-node-indent, 0px) + var(--b-tree-select-switcher-size) / 2);
  top: var(--b-tree-select-title-height);
  width: 1px;
  height: var(--b-tree-select-title-height);
  background-color: var(--b-tree-select-line-color);
  pointer-events: none;
}

/* Empty content */
.b-tree-select__empty {
  padding: 16px;
  text-align: center;
  color: var(--b-tree-select-placeholder-color);
  font-size: 14px;
}

/* SR only */
.b-tree-select__sr-only {
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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-tree-select,
  .b-tree-select__dropdown,
  .b-tree-select__node,
  .b-tree-select__switcher-icon,
  .b-tree-select__arrow {
    transition-duration: 0ms;
  }

  .b-tree-select__switcher-icon--spin {
    animation: none;
  }
}
</style>
