<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type {
  BTreeNodeKey,
  BTreeNodeData,
  BTreeFieldNames,
  BTreeCheckedKeys,
  BTreeDropInfo,
  BTreeDragInfo,
  BTreeSelectInfo,
  BTreeCheckInfo,
  BTreeExpandInfo,
  BTreeFlatNode,
  BTreeScrollToOptions,
} from './types';

// ─── Props ────────────────────────────────────────────────────────────────────

const {
  treeData = [],
  fieldNames = {},
  checkable = false,
  checkStrictly = false,
  checkedKeys: checkedKeysProp = undefined,
  defaultCheckedKeys = [],
  selectedKeys: selectedKeysProp = undefined,
  defaultSelectedKeys = [],
  expandedKeys: expandedKeysProp = undefined,
  defaultExpandedKeys = [],
  defaultExpandAll = false,
  defaultExpandParent = true,
  autoExpandParent = false,
  multiple = false,
  selectable = true,
  disabled = false,
  showIcon = false,
  showLine = false,
  blockNode = false,
  draggable = false,
  loadData = undefined,
  loadedKeys: loadedKeysProp = undefined,
  filterTreeNode = undefined,
  height = undefined,
  virtual = false,
  directory = false,
  expandAction = 'click',
} = defineProps<{
  /** Tree node data array */
  treeData?: BTreeNodeData[];
  /** Custom field name mappings (key/title/children) */
  fieldNames?: BTreeFieldNames;
  /** Whether to show checkboxes */
  checkable?: boolean;
  /** Check parent/child independently */
  checkStrictly?: boolean;
  /** Controlled checked node keys */
  checkedKeys?: BTreeNodeKey[] | BTreeCheckedKeys;
  /** Default checked node keys (uncontrolled) */
  defaultCheckedKeys?: BTreeNodeKey[];
  /** Controlled selected node keys */
  selectedKeys?: BTreeNodeKey[];
  /** Default selected node keys (uncontrolled) */
  defaultSelectedKeys?: BTreeNodeKey[];
  /** Controlled expanded node keys */
  expandedKeys?: BTreeNodeKey[];
  /** Default expanded node keys (uncontrolled) */
  defaultExpandedKeys?: BTreeNodeKey[];
  /** Expand all nodes on mount */
  defaultExpandAll?: boolean;
  /** Auto expand parent of defaultExpandedKeys nodes */
  defaultExpandParent?: boolean;
  /** Auto expand parent when expandedKeys changes */
  autoExpandParent?: boolean;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow node selection */
  selectable?: boolean;
  /** Disable entire tree */
  disabled?: boolean;
  /** Show node icons */
  showIcon?: boolean;
  /** Show connector lines */
  showLine?: boolean;
  /** Node takes full row width */
  blockNode?: boolean;
  /** Enable drag-and-drop */
  draggable?: boolean;
  /** Async load children */
  loadData?: (node: BTreeNodeData) => Promise<void>;
  /** Controlled loaded node keys */
  loadedKeys?: BTreeNodeKey[];
  /** Predicate to highlight nodes */
  filterTreeNode?: (node: BTreeNodeData) => boolean;
  /** Fixed height for virtual scroll (px) */
  height?: number;
  /** Enable virtual scroll (requires height) */
  virtual?: boolean;
  /** Enable DirectoryTree mode */
  directory?: boolean;
  /** DirectoryTree: expansion trigger (click | doubleClick | false) */
  expandAction?: 'click' | 'doubleClick' | false;
}>();

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  /** Fires when check state changes */
  check: [keys: BTreeNodeKey[] | BTreeCheckedKeys, info: BTreeCheckInfo];
  /** Fires when expand state changes */
  expand: [keys: BTreeNodeKey[], info: BTreeExpandInfo];
  /** Fires when selection changes */
  select: [keys: BTreeNodeKey[], info: BTreeSelectInfo];
  /** Fires when async load finishes */
  load: [keys: BTreeNodeKey[], info: { event: Event; node: BTreeNodeData }];
  /** Fires on right-click */
  rightClick: [info: { event: MouseEvent; node: BTreeNodeData }];
  /** Fires on drag start */
  dragStart: [info: BTreeDragInfo];
  /** Fires when dragged over a node */
  dragEnter: [info: { event: DragEvent; node: BTreeNodeData; expandedKeys: BTreeNodeKey[] }];
  /** Fires while dragging over a node */
  dragOver: [info: BTreeDragInfo];
  /** Fires when leaving a node during drag */
  dragLeave: [info: BTreeDragInfo];
  /** Fires when drag ends */
  dragEnd: [info: BTreeDragInfo];
  /** Fires on drop */
  drop: [info: BTreeDropInfo];
  /** Fires on double-click */
  dblclick: [event: MouseEvent, node: BTreeNodeData];
  /** v-model:checkedKeys */
  'update:checkedKeys': [keys: BTreeNodeKey[] | BTreeCheckedKeys];
  /** v-model:selectedKeys */
  'update:selectedKeys': [keys: BTreeNodeKey[]];
  /** v-model:expandedKeys */
  'update:expandedKeys': [keys: BTreeNodeKey[]];
  /** v-model:loadedKeys */
  'update:loadedKeys': [keys: BTreeNodeKey[]];
}>();

// ─── Slots ────────────────────────────────────────────────────────────────────

defineSlots<{
  /** Default icon for all nodes */
  icon(props: { node: BTreeNodeData }): unknown;
  /** Custom switcher icon */
  switcherIcon(props: { node: BTreeNodeData; expanded: boolean }): unknown;
  /** Custom title renderer */
  title(props: { node: BTreeNodeData }): unknown;
}>();

// ─── Resolved field names ─────────────────────────────────────────────────────

const fKey = computed(() => fieldNames.key ?? 'key');
const fTitle = computed(() => fieldNames.title ?? 'title');
const fChildren = computed(() => fieldNames.children ?? 'children');

function nodeKey(n: BTreeNodeData): BTreeNodeKey {
  return n[fKey.value] as BTreeNodeKey;
}
function nodeTitle(n: BTreeNodeData): string {
  return (n[fTitle.value] as string) ?? '';
}
function nodeChildren(n: BTreeNodeData): BTreeNodeData[] | undefined {
  return n[fChildren.value] as BTreeNodeData[] | undefined;
}

// ─── Internal state ───────────────────────────────────────────────────────────

const internalExpanded = ref<Set<BTreeNodeKey>>(new Set());
const internalSelected = ref<Set<BTreeNodeKey>>(new Set());
const internalChecked = ref<Set<BTreeNodeKey>>(new Set());
const internalHalfChecked = ref<Set<BTreeNodeKey>>(new Set());
const internalLoaded = ref<Set<BTreeNodeKey>>(new Set());
const loadingKeys = ref<Set<BTreeNodeKey>>(new Set());
const dragNodeKey = ref<BTreeNodeKey | null>(null);

// Controlled getters
const isControlledExpanded = computed(() => expandedKeysProp !== undefined);
const isControlledSelected = computed(() => selectedKeysProp !== undefined);
const isControlledChecked = computed(() => checkedKeysProp !== undefined);
const isControlledLoaded = computed(() => loadedKeysProp !== undefined);

const activeExpanded = computed<Set<BTreeNodeKey>>(() => {
  if (isControlledExpanded.value) return new Set(expandedKeysProp);
  return internalExpanded.value;
});

const activeSelected = computed<Set<BTreeNodeKey>>(() => {
  if (isControlledSelected.value) return new Set(selectedKeysProp);
  return internalSelected.value;
});

const activeChecked = computed<Set<BTreeNodeKey>>(() => {
  if (isControlledChecked.value) {
    const raw = checkedKeysProp as BTreeNodeKey[] | { checked: BTreeNodeKey[]; halfChecked: BTreeNodeKey[] };
    if (Array.isArray(raw)) return new Set(raw);
    return new Set(raw.checked);
  }
  return internalChecked.value;
});

const activeHalfChecked = computed<Set<BTreeNodeKey>>(() => {
  if (isControlledChecked.value) {
    const raw = checkedKeysProp as BTreeNodeKey[] | { checked: BTreeNodeKey[]; halfChecked: BTreeNodeKey[] };
    if (!Array.isArray(raw) && 'halfChecked' in raw) return new Set(raw.halfChecked);
  }
  return internalHalfChecked.value;
});

const activeLoaded = computed<Set<BTreeNodeKey>>(() => {
  if (isControlledLoaded.value) return new Set(loadedKeysProp);
  return internalLoaded.value;
});

// ─── Flatten tree ─────────────────────────────────────────────────────────────

function flattenTree(
  nodes: BTreeNodeData[],
  depth = 0,
  parentVisible = true,
): BTreeFlatNode[] {
  const result: BTreeFlatNode[] = [];
  for (const node of nodes) {
    const key = nodeKey(node);
    const isExpanded = activeExpanded.value.has(key);
    const visible = parentVisible;
    result.push({ key, data: node, depth, visible });
    const children = nodeChildren(node);
    if (children?.length) {
      result.push(...flattenTree(children, depth + 1, visible && isExpanded));
    }
  }
  return result;
}

const flatNodes = computed(() => flattenTree(treeData));
const visibleNodes = computed(() => flatNodes.value.filter((n) => n.visible));

// ─── Mount: apply defaults ────────────────────────────────────────────────────

function collectAllKeys(nodes: BTreeNodeData[]): BTreeNodeKey[] {
  const keys: BTreeNodeKey[] = [];
  for (const n of nodes) {
    keys.push(nodeKey(n));
    const children = nodeChildren(n);
    if (children?.length) keys.push(...collectAllKeys(children));
  }
  return keys;
}

function collectParentKeys(
  nodes: BTreeNodeData[],
  targetKeys: Set<BTreeNodeKey>,
): BTreeNodeKey[] {
  const parents: BTreeNodeKey[] = [];
  function walk(nodes: BTreeNodeData[]) {
    for (const n of nodes) {
      const children = nodeChildren(n);
      if (children?.length) {
        const hasDescendant = children.some(
          (c) => targetKeys.has(nodeKey(c)) || walk([c]) !== undefined,
        );
        if (hasDescendant) parents.push(nodeKey(n));
        walk(children);
      }
    }
  }
  walk(nodes);
  return parents;
}

// Initialise uncontrolled state once
if (!isControlledExpanded.value) {
  if (defaultExpandAll) {
    internalExpanded.value = new Set(collectAllKeys(treeData).filter((k) => {
      const flat = flatNodes.value.find((n) => n.key === k);
      return flat ? !!nodeChildren(flat.data)?.length : false;
    }));
  } else if (defaultExpandedKeys.length) {
    const init = new Set<BTreeNodeKey>(defaultExpandedKeys);
    if (defaultExpandParent) {
      collectParentKeys(treeData, init).forEach((k) => init.add(k));
    }
    internalExpanded.value = init;
  }
}
if (!isControlledSelected.value && defaultSelectedKeys.length) {
  internalSelected.value = new Set(defaultSelectedKeys);
}
if (!isControlledChecked.value && defaultCheckedKeys.length) {
  internalChecked.value = new Set(defaultCheckedKeys);
  if (!checkStrictly) propagateChecks(internalChecked.value);
}

// Auto-expand parents when controlled expandedKeys change
watch(
  () => expandedKeysProp,
  (keys) => {
    if (!autoExpandParent || !keys) return;
    const set = new Set(keys);
    collectParentKeys(treeData, set).forEach((k) => set.add(k));
    emit('update:expandedKeys', [...set]);
  },
);

// ─── Checkbox propagation ─────────────────────────────────────────────────────

function propagateChecks(checked: Set<BTreeNodeKey>) {
  // Bottom-up: compute half-checked from actual checked leaves
  const half = new Set<BTreeNodeKey>();
  function walk(nodes: BTreeNodeData[]): { all: boolean; some: boolean } {
    let allChecked = true;
    let someChecked = false;
    for (const n of nodes) {
      const key = nodeKey(n);
      const children = nodeChildren(n);
      if (children?.length) {
        const sub = walk(children);
        if (sub.all) {
          checked.add(key);
          someChecked = true;
        } else if (sub.some) {
          checked.delete(key);
          half.add(key);
          allChecked = false;
          someChecked = true;
        } else {
          if (!checked.has(key)) allChecked = false;
          else someChecked = true;
        }
      } else {
        if (!checked.has(key)) allChecked = false;
        else someChecked = true;
      }
    }
    return { all: allChecked, some: someChecked };
  }
  walk(treeData);
  internalHalfChecked.value = half;
}

// ─── Node helpers ─────────────────────────────────────────────────────────────

function hasChildren(node: BTreeNodeData): boolean {
  const ch = nodeChildren(node);
  return !!ch?.length || (!!loadData && !node.isLeaf);
}

function isExpanded(key: BTreeNodeKey): boolean {
  return activeExpanded.value.has(key);
}
function isSelected(key: BTreeNodeKey): boolean {
  return activeSelected.value.has(key);
}
function isChecked(key: BTreeNodeKey): boolean {
  return activeChecked.value.has(key);
}
function isHalfChecked(key: BTreeNodeKey): boolean {
  return activeHalfChecked.value.has(key);
}
function isLoading(key: BTreeNodeKey): boolean {
  return loadingKeys.value.has(key);
}
function isLoaded(key: BTreeNodeKey): boolean {
  return activeLoaded.value.has(key);
}
function isFiltered(node: BTreeNodeData): boolean {
  return filterTreeNode ? filterTreeNode(node) : false;
}

// ─── Expand / collapse ────────────────────────────────────────────────────────

async function toggleExpand(node: BTreeNodeData, event?: MouseEvent | KeyboardEvent) {
  const key = nodeKey(node);
  if (node.disabled || disabled) return;

  const expanding = !isExpanded(key);

  // Async load
  if (expanding && loadData && !isLoaded(key) && !isLoading(key)) {
    loadingKeys.value.add(key);
    try {
      await loadData(node);
      if (!isControlledLoaded.value) internalLoaded.value.add(key);
      emit('update:loadedKeys', [...activeLoaded.value, key]);
    } finally {
      loadingKeys.value.delete(key);
    }
  }

  let nextSet: Set<BTreeNodeKey>;
  if (isControlledExpanded.value) {
    nextSet = new Set(expandedKeysProp);
  } else {
    nextSet = new Set(internalExpanded.value);
  }

  if (expanding) nextSet.add(key);
  else nextSet.delete(key);

  if (!isControlledExpanded.value) internalExpanded.value = nextSet;
  emit('update:expandedKeys', [...nextSet]);

  const info: BTreeExpandInfo = { expanded: expanding, node, event };
  emit('expand', [...nextSet], info);
}

// ─── Select ───────────────────────────────────────────────────────────────────

function handleSelect(node: BTreeNodeData, event: MouseEvent | KeyboardEvent) {
  if (!selectable || node.selectable === false || node.disabled || disabled) return;
  const key = nodeKey(node);

  let nextSet: Set<BTreeNodeKey>;
  if (isControlledSelected.value) {
    nextSet = new Set(selectedKeysProp);
  } else {
    nextSet = new Set(internalSelected.value);
  }

  if (nextSet.has(key)) {
    nextSet.delete(key);
  } else {
    if (!multiple) nextSet.clear();
    nextSet.add(key);
  }

  if (!isControlledSelected.value) internalSelected.value = nextSet;
  emit('update:selectedKeys', [...nextSet]);

  const info: BTreeSelectInfo = {
    event,
    selected: nextSet.has(key),
    node,
    selectedNodes: flatNodes.value
      .filter((n) => nextSet.has(n.key))
      .map((n) => n.data),
    nativeEvent: event,
  };
  emit('select', [...nextSet], info);
}

// ─── Check ────────────────────────────────────────────────────────────────────

function handleCheck(node: BTreeNodeData, event: MouseEvent | KeyboardEvent) {
  if (!checkable || node.disableCheckbox || node.disabled || disabled) return;
  const key = nodeKey(node);

  let nextChecked: Set<BTreeNodeKey>;
  if (isControlledChecked.value) {
    const raw = checkedKeysProp as BTreeNodeKey[] | { checked: BTreeNodeKey[]; halfChecked: BTreeNodeKey[] };
    nextChecked = new Set(Array.isArray(raw) ? raw : raw.checked);
  } else {
    nextChecked = new Set(internalChecked.value);
  }

  if (nextChecked.has(key)) {
    nextChecked.delete(key);
    // Uncheck all descendants
    if (!checkStrictly) {
      function uncheckDesc(nodes: BTreeNodeData[]) {
        for (const n of nodes) {
          nextChecked.delete(nodeKey(n));
          const ch = nodeChildren(n);
          if (ch?.length) uncheckDesc(ch);
        }
      }
      const children = nodeChildren(node);
      if (children?.length) uncheckDesc(children);
    }
  } else {
    nextChecked.add(key);
    // Check all descendants
    if (!checkStrictly) {
      function checkDesc(nodes: BTreeNodeData[]) {
        for (const n of nodes) {
          if (!n.disableCheckbox && !n.disabled) nextChecked.add(nodeKey(n));
          const ch = nodeChildren(n);
          if (ch?.length) checkDesc(ch);
        }
      }
      const children = nodeChildren(node);
      if (children?.length) checkDesc(children);
    }
  }

  if (!checkStrictly && !isControlledChecked.value) {
    propagateChecks(nextChecked);
  }

  const checkedNodes = flatNodes.value
    .filter((n) => nextChecked.has(n.key))
    .map((n) => n.data);

  const info: BTreeCheckInfo = {
    event,
    node,
    checked: nextChecked.has(key),
    checkedNodes,
    checkedNodesPositions: checkedNodes.map((n) => ({ node: n, pos: '0' })),
    halfCheckedKeys: [...activeHalfChecked.value],
    nativeEvent: event,
  };

  if (!isControlledChecked.value) internalChecked.value = nextChecked;

  const emitValue: BTreeNodeKey[] | BTreeCheckedKeys = checkStrictly
    ? { checked: [...nextChecked], halfChecked: [...activeHalfChecked.value] }
    : [...nextChecked];

  emit('update:checkedKeys', emitValue);
  emit('check', emitValue, info);
}

// ─── Drag & Drop ──────────────────────────────────────────────────────────────

function handleDragStart(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  dragNodeKey.value = nodeKey(node);
  event.dataTransfer?.setData('text/plain', String(nodeKey(node)));
  emit('dragStart', { event, node });
}

function handleDragEnter(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  event.preventDefault();
  emit('dragEnter', { event, node, expandedKeys: [...activeExpanded.value] });
}

function handleDragOver(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  event.preventDefault();
  emit('dragOver', { event, node });
}

function handleDragLeave(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  emit('dragLeave', { event, node });
}

function handleDragEnd(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  dragNodeKey.value = null;
  emit('dragEnd', { event, node });
}

function handleDrop(event: DragEvent, node: BTreeNodeData) {
  if (!draggable) return;
  event.preventDefault();
  const dragFlat = flatNodes.value.find((n) => n.key === dragNodeKey.value);
  if (!dragFlat) return;

  const dropPos = node;
  emit('drop', {
    event,
    node,
    dragNode: dragFlat.data,
    dragNodesKeys: [dragFlat.key],
    dropPosition: 0,
    dropToGap: false,
  });
  dragNodeKey.value = null;
}

// ─── Keyboard navigation ──────────────────────────────────────────────────────

const treeRef = ref<HTMLElement | null>(null);

function getFocusableItems(): HTMLElement[] {
  if (!treeRef.value) return [];
  return Array.from(
    treeRef.value.querySelectorAll<HTMLElement>('[role="treeitem"][tabindex="0"],[role="treeitem"][tabindex="-1"]'),
  ).filter((el) => !el.closest('[aria-hidden="true"]'));
}

const focusedNodeKey = ref<BTreeNodeKey | null>(
  visibleNodes.value[0]?.key ?? null,
);

function handleTreeKeydown(event: KeyboardEvent) {
  const visible = visibleNodes.value;
  if (!visible.length) return;

  const currentIdx = visible.findIndex((n) => n.key === focusedNodeKey.value);
  const current = visible[currentIdx];

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      const next = visible[currentIdx + 1];
      if (next) {
        focusedNodeKey.value = next.key;
        nextTick(() => focusNode(next.key));
      }
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      const prev = visible[currentIdx - 1];
      if (prev) {
        focusedNodeKey.value = prev.key;
        nextTick(() => focusNode(prev.key));
      }
      break;
    }
    case 'ArrowRight': {
      event.preventDefault();
      if (!current) break;
      if (hasChildren(current.data) && !isExpanded(current.key)) {
        toggleExpand(current.data, event);
      } else if (isExpanded(current.key)) {
        const firstChild = visible[currentIdx + 1];
        if (firstChild?.depth > current.depth) {
          focusedNodeKey.value = firstChild.key;
          nextTick(() => focusNode(firstChild.key));
        }
      }
      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      if (!current) break;
      if (isExpanded(current.key)) {
        toggleExpand(current.data, event);
      } else if (current.depth > 0) {
        // Move to parent
        for (let i = currentIdx - 1; i >= 0; i--) {
          if (visible[i].depth < current.depth) {
            focusedNodeKey.value = visible[i].key;
            nextTick(() => focusNode(visible[i].key));
            break;
          }
        }
      }
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (!current) break;
      if (checkable) {
        handleCheck(current.data, event);
      } else if (selectable) {
        handleSelect(current.data, event);
      }
      break;
    }
    case 'Home': {
      event.preventDefault();
      if (visible[0]) {
        focusedNodeKey.value = visible[0].key;
        nextTick(() => focusNode(visible[0].key));
      }
      break;
    }
    case 'End': {
      event.preventDefault();
      const last = visible[visible.length - 1];
      if (last) {
        focusedNodeKey.value = last.key;
        nextTick(() => focusNode(last.key));
      }
      break;
    }
  }
}

function focusNode(key: BTreeNodeKey) {
  const el = treeRef.value?.querySelector<HTMLElement>(`[data-node-key="${String(key).replace(/["\\]/g, '\\$&')}"]`);
  el?.focus();
}

// ─── Directory-mode: click/dblclick expand ────────────────────────────────────

function handleNodeClick(node: BTreeNodeData, event: MouseEvent) {
  if (directory && expandAction === 'click' && hasChildren(node)) {
    toggleExpand(node, event);
  }
  handleSelect(node, event);
}

function handleNodeDblClick(node: BTreeNodeData, event: MouseEvent) {
  if (directory && expandAction === 'doubleClick' && hasChildren(node)) {
    toggleExpand(node, event);
  }
  emit('dblclick', event, node);
}

// ─── Scroll to ────────────────────────────────────────────────────────────────

function scrollTo(opts: BTreeScrollToOptions) {
  nextTick(() => {
    const el = treeRef.value?.querySelector<HTMLElement>(
      `[data-node-key="${String(opts.key).replace(/["\\]/g, '\\$&')}"]`,
    );
    el?.scrollIntoView?.({ block: opts.align ?? 'nearest' });
  });
}

defineExpose({ scrollTo });

// ─── Right click ─────────────────────────────────────────────────────────────

function handleRightClick(event: MouseEvent, node: BTreeNodeData) {
  event.preventDefault();
  emit('rightClick', { event, node });
}
</script>

<template>
  <div
    ref="treeRef"
    class="b-tree"
    :class="{
      'b-tree--checkable': checkable,
      'b-tree--show-line': showLine,
      'b-tree--block-node': blockNode,
      'b-tree--directory': directory,
      'b-tree--disabled': disabled,
    }"
    role="tree"
    :aria-multiselectable="multiple || undefined"
    :style="height ? { height: `${height}px`, overflowY: 'auto' } : undefined"
    @keydown="handleTreeKeydown"
  >
    <template v-for="flatNode in visibleNodes" :key="flatNode.key">
      <div
        :data-node-key="String(flatNode.key)"
        class="b-tree__node"
        :class="{
          'b-tree__node--selected': isSelected(flatNode.key),
          'b-tree__node--checked': isChecked(flatNode.key),
          'b-tree__node--half-checked': isHalfChecked(flatNode.key),
          'b-tree__node--expanded': isExpanded(flatNode.key),
          'b-tree__node--disabled': flatNode.data.disabled || disabled,
          'b-tree__node--leaf': !hasChildren(flatNode.data),
          'b-tree__node--loading': isLoading(flatNode.key),
          'b-tree__node--dragging': draggable && dragNodeKey === flatNode.key,
          'b-tree__node--filtered': isFiltered(flatNode.data),
          'b-tree__node--block': blockNode,
        }"
        role="treeitem"
        :aria-expanded="hasChildren(flatNode.data) ? isExpanded(flatNode.key) : undefined"
        :aria-selected="selectable ? isSelected(flatNode.key) : undefined"
        :aria-checked="checkable ? isChecked(flatNode.key) : undefined"
        :aria-disabled="flatNode.data.disabled || disabled || undefined"
        :aria-level="flatNode.depth + 1"
        :tabindex="flatNode.key === focusedNodeKey ? 0 : -1"
        :style="{ '--b-tree-node-indent': `${flatNode.depth * 24}px` }"
        :draggable="draggable ? 'true' : undefined"
        @click.stop="handleNodeClick(flatNode.data, $event)"
        @dblclick.stop="handleNodeDblClick(flatNode.data, $event)"
        @contextmenu.stop="handleRightClick($event, flatNode.data)"
        @dragstart="handleDragStart($event, flatNode.data)"
        @dragenter="handleDragEnter($event, flatNode.data)"
        @dragover="handleDragOver($event, flatNode.data)"
        @dragleave="handleDragLeave($event, flatNode.data)"
        @dragend="handleDragEnd($event, flatNode.data)"
        @drop="handleDrop($event, flatNode.data)"
      >
        <!-- Drag handle (visible on row hover when draggable) -->
        <span
          v-if="draggable"
          class="b-tree__drag-handle"
          aria-hidden="true"
        >
          <!-- HolderOutlined: 2×3 dot grid -->
          <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="3.5" r="1.25" />
            <circle cx="5" cy="8"   r="1.25" />
            <circle cx="5" cy="12.5" r="1.25" />
            <circle cx="11" cy="3.5" r="1.25" />
            <circle cx="11" cy="8"   r="1.25" />
            <circle cx="11" cy="12.5" r="1.25" />
          </svg>
        </span>

        <!-- Indent spacer -->
        <span class="b-tree__indent" aria-hidden="true" />

        <!-- Switcher (expand/collapse) -->
        <span
          v-if="hasChildren(flatNode.data) || showLine"
          class="b-tree__switcher"
          :class="{
            'b-tree__switcher--expanded': isExpanded(flatNode.key),
            'b-tree__switcher--loading': isLoading(flatNode.key),
          }"
          aria-hidden="true"
          @click.stop="toggleExpand(flatNode.data, $event)"
        >
          <slot
            v-if="!isLoading(flatNode.key)"
            name="switcherIcon"
            :node="flatNode.data"
            :expanded="isExpanded(flatNode.key)"
          >
            <!-- Default chevron SVG -->
            <svg
              class="b-tree__switcher-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </slot>
          <!-- Loading spinner -->
          <svg
            v-if="isLoading(flatNode.key)"
            class="b-tree__switcher-icon b-tree__switcher-icon--spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" stroke-dasharray="42" stroke-dashoffset="14" stroke-linecap="round" />
          </svg>
        </span>
        <!-- Leaf placeholder -->
        <span
          v-else-if="showLine"
          class="b-tree__switcher b-tree__switcher--leaf"
          aria-hidden="true"
        />

        <!-- Checkbox -->
        <span
          v-if="checkable && flatNode.data.checkable !== false"
          class="b-tree__checkbox"
          :class="{
            'b-tree__checkbox--checked': isChecked(flatNode.key),
            'b-tree__checkbox--indeterminate': isHalfChecked(flatNode.key),
            'b-tree__checkbox--disabled': flatNode.data.disableCheckbox || flatNode.data.disabled || disabled,
          }"
          role="checkbox"
          :aria-label="nodeTitle(flatNode.data)"
          :aria-checked="isHalfChecked(flatNode.key) ? 'mixed' : isChecked(flatNode.key)"
          :aria-disabled="flatNode.data.disableCheckbox || flatNode.data.disabled || disabled || undefined"
          tabindex="-1"
          @click.stop="handleCheck(flatNode.data, $event)"
          @keydown.enter.prevent="handleCheck(flatNode.data, $event)"
          @keydown.space.prevent="handleCheck(flatNode.data, $event)"
        >
          <span class="b-tree__checkbox-inner" aria-hidden="true" />
        </span>

        <!-- Icon -->
        <span
          v-if="showIcon || flatNode.data.icon || $slots.icon"
          class="b-tree__icon"
          aria-hidden="true"
        >
          <slot name="icon" :node="flatNode.data">
            <span v-if="flatNode.data.icon">{{ flatNode.data.icon }}</span>
          </slot>
        </span>

        <!-- Title -->
        <span
          class="b-tree__title"
          :class="{ 'b-tree__title--filtered': isFiltered(flatNode.data) }"
        >
          <slot name="title" :node="flatNode.data">
            {{ nodeTitle(flatNode.data) }}
          </slot>
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ─── Root ──────────────────────────────────────────────────────────────────── */
.b-tree {
  /* Layout */
  --b-tree-indent-size: 24px;
  --b-tree-node-height: 24px;
  --b-tree-switcher-size: 24px;
  --b-tree-checkbox-size: 16px;
  --b-tree-icon-size: 14px;
  --b-tree-gap: 4px;
  --b-tree-border-radius: 6px;
  --b-tree-font-size: 14px;

  /* Colors – light mode */
  --b-tree-node-hover-bg: oklch(95% 0.003 264);
  --b-tree-node-hover-color: oklch(20% 0.014 264);
  --b-tree-node-selected-bg: oklch(94% 0.08 254);
  --b-tree-node-selected-color: oklch(20% 0.014 264);
  --b-tree-node-disabled-color: oklch(70% 0.005 264);
  --b-tree-switcher-color: oklch(55% 0.008 264);
  --b-tree-checkbox-border: oklch(75% 0.008 264);
  --b-tree-checkbox-bg: oklch(100% 0 0);
  --b-tree-checkbox-checked-bg: oklch(55% 0.22 260);
  --b-tree-checkbox-checked-border: oklch(55% 0.22 260);
  --b-tree-checkbox-indeterminate-bg: oklch(55% 0.22 260);
  --b-tree-line-color: oklch(88% 0.006 264);
  --b-tree-title-color: oklch(20% 0.014 264);
  --b-tree-title-filtered-color: oklch(55% 0.22 260);
  --b-tree-directory-selected-bg: oklch(55% 0.22 260);
  --b-tree-directory-selected-color: oklch(100% 0 0);

  /* Motion */
  --b-tree-transition-duration: 200ms;
  --b-tree-spin-duration: 700ms;

  display: block;
  font-size: var(--b-tree-font-size);
  line-height: var(--b-tree-node-height);
  color: var(--b-tree-title-color);
  outline: none;
}

/* ─── Dark mode ─────────────────────────────────────────────────────────────── */
[data-prefers-color='dark'] .b-tree {
  --b-tree-node-hover-bg: oklch(28% 0.012 264);
  --b-tree-node-hover-color: oklch(92% 0.006 264);
  --b-tree-node-selected-bg: oklch(30% 0.06 254);
  --b-tree-node-selected-color: oklch(92% 0.006 264);
  --b-tree-node-disabled-color: oklch(45% 0.005 264);
  --b-tree-switcher-color: oklch(65% 0.008 264);
  --b-tree-checkbox-border: oklch(45% 0.008 264);
  --b-tree-checkbox-bg: oklch(22% 0.012 264);
  --b-tree-checkbox-checked-bg: oklch(55% 0.22 260);
  --b-tree-checkbox-checked-border: oklch(55% 0.22 260);
  --b-tree-checkbox-indeterminate-bg: oklch(55% 0.22 260);
  --b-tree-line-color: oklch(35% 0.008 264);
  --b-tree-title-color: oklch(92% 0.006 264);
  --b-tree-title-filtered-color: oklch(65% 0.22 260);
  --b-tree-directory-selected-bg: oklch(45% 0.22 260);
  --b-tree-directory-selected-color: oklch(100% 0 0);
}

/* ─── Node ───────────────────────────────────────────────────────────────────── */
.b-tree__node {
  display: flex;
  align-items: center;
  gap: var(--b-tree-gap);
  height: var(--b-tree-node-height);
  padding-inline-start: var(--b-tree-node-indent);
  border-radius: var(--b-tree-border-radius);
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--b-tree-transition-duration) ease,
    color var(--b-tree-transition-duration) ease;
  user-select: none;
  position: relative;
}

.b-tree__node:hover {
  background-color: var(--b-tree-node-hover-bg);
  color: var(--b-tree-node-hover-color);
}

.b-tree__node:focus-visible {
  outline: 2px solid var(--b-tree-checkbox-checked-bg);
  outline-offset: -1px;
}

.b-tree__node--selected {
  background-color: var(--b-tree-node-selected-bg);
  color: var(--b-tree-node-selected-color);
  font-weight: 500;
}

.b-tree__node--selected:hover {
  background-color: var(--b-tree-node-selected-bg);
}

.b-tree__node--disabled {
  cursor: not-allowed;
  color: var(--b-tree-node-disabled-color);
}

.b-tree__node--disabled:hover {
  background-color: transparent;
}

.b-tree__node--block {
  padding-inline-end: 8px;
}

/* ─── Directory mode selected ───────────────────────────────────────────────── */
.b-tree--directory .b-tree__node--selected {
  background-color: var(--b-tree-directory-selected-bg);
  color: var(--b-tree-directory-selected-color);
}

.b-tree--directory .b-tree__node--selected:hover {
  background-color: var(--b-tree-directory-selected-bg);
}

/* ─── Indent ─────────────────────────────────────────────────────────────────── */
.b-tree__indent {
  display: inline-block;
  flex-shrink: 0;
}

/* ─── Switcher ───────────────────────────────────────────────────────────────── */
.b-tree__switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--b-tree-switcher-size);
  height: var(--b-tree-switcher-size);
  color: var(--b-tree-switcher-color);
  transition: color var(--b-tree-transition-duration) ease;
}

.b-tree__switcher:hover {
  color: var(--b-tree-checkbox-checked-bg);
}

.b-tree__switcher--leaf {
  pointer-events: none;
}

.b-tree__switcher-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  transition: transform var(--b-tree-transition-duration) ease;
}

.b-tree__switcher--expanded .b-tree__switcher-icon:not(.b-tree__switcher-icon--spin) {
  transform: rotate(90deg);
}

/* Loading spinner */
@keyframes b-tree-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.b-tree__switcher-icon--spin {
  animation: b-tree-spin var(--b-tree-spin-duration) linear infinite;
}

/* ─── Show lines ─────────────────────────────────────────────────────────────── */
.b-tree--show-line .b-tree__node:not(:last-child)::before {
  content: '';
  position: absolute;
  inset-inline-start: calc(var(--b-tree-node-indent) + var(--b-tree-switcher-size) / 2);
  top: var(--b-tree-node-height);
  width: 1px;
  height: var(--b-tree-node-height);
  background-color: var(--b-tree-line-color);
  pointer-events: none;
}

/* ─── Checkbox ───────────────────────────────────────────────────────────────── */
.b-tree__checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  line-height: 1;
}

.b-tree__checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.b-tree__checkbox-inner {
  display: inline-block;
  width: var(--b-tree-checkbox-size);
  height: var(--b-tree-checkbox-size);
  border: 1.5px solid var(--b-tree-checkbox-border);
  border-radius: 3px;
  background-color: var(--b-tree-checkbox-bg);
  position: relative;
  transition:
    border-color var(--b-tree-transition-duration) ease,
    background-color var(--b-tree-transition-duration) ease;
}

/* Checked tick */
.b-tree__checkbox--checked .b-tree__checkbox-inner {
  border-color: var(--b-tree-checkbox-checked-border);
  background-color: var(--b-tree-checkbox-checked-bg);
}

.b-tree__checkbox--checked .b-tree__checkbox-inner::after {
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

/* Indeterminate dash */
.b-tree__checkbox--indeterminate .b-tree__checkbox-inner {
  border-color: var(--b-tree-checkbox-indeterminate-bg);
  background-color: var(--b-tree-checkbox-indeterminate-bg);
}

.b-tree__checkbox--indeterminate .b-tree__checkbox-inner::after {
  content: '';
  position: absolute;
  inset-inline-start: 2px;
  top: 50%;
  width: calc(100% - 4px);
  height: 2px;
  background-color: #fff;
  transform: translateY(-50%);
}

/* ─── Icon ───────────────────────────────────────────────────────────────────── */
.b-tree__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--b-tree-icon-size);
}

/* ─── Title ──────────────────────────────────────────────────────────────────── */
.b-tree__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
}

.b-tree__title--filtered {
  color: var(--b-tree-title-filtered-color);
  font-weight: 500;
}

/* ─── Drag handle ─────────────────────────────────────────────────────────── */
.b-tree__drag-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: var(--b-tree-node-height);
  color: var(--b-tree-switcher-color);
  cursor: grab;
}

.b-tree__drag-handle svg {
  width: 12px;
  height: 12px;
  display: block;
}

.b-tree__drag-handle:active {
  cursor: grabbing;
}

/* ─── Dragging node ──────────────────────────────────────────────────────────── */
.b-tree__node--dragging {
  opacity: 0.5;
}

/* ─── Reduced motion ─────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-tree {
    --b-tree-transition-duration: 0ms;
    --b-tree-spin-duration: 0ms;
  }

  .b-tree__switcher-icon {
    transition: none;
  }
}
</style>
