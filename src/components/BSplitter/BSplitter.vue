<script lang="ts" setup>
/**
 * BSplitter
 * ---------
 * A flex container that lets the user resize the size of its panels by
 * dragging the bars between them.
 *
 * Mirrors the AntD `<Splitter>` API. Children must be `<BSplitterPanel>`
 * components.
 */
import type { CSSProperties, PropType, VNode } from 'vue';
import { Fragment, camelize, computed, defineComponent, h, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from 'vue';
import { useComponentId } from '../../composables/useComponentId';
import BSplitterPanel from './BSplitterPanel.vue';
import {
  BSplitterContextKey,
  type BSplitterCollapsible,
  type BSplitterOrientation,
  type BSplitterPanelCollapsible,
  type BSplitterPanelConfig,
} from './types';

defineOptions({ name: 'BSplitter', inheritAttrs: false });

/**
 * Internal helper component that renders an array of pre-built VNodes inside
 * a panel. Declared inline to keep the SFC self-contained.
 */
const VNodeRenderer = defineComponent({
  name: 'BSplitterVNodeRenderer',
  props: {
    nodes: {
      type: Array as PropType<VNode[] | undefined | null>,
      default: () => [],
    },
  },
  setup(props) {
    return () => (props.nodes && props.nodes.length ? h(Fragment, null, props.nodes) : null);
  },
});

//#region Props / Emits / Slots
const {
  vertical = false,
  orientation,
  lazy = false,
  collapsible: collapsibleConfig,
} = defineProps<{
  /** Convenience boolean for vertical orientation. @default false */
  vertical?: boolean;
  /** Layout orientation. Takes precedence over `vertical` when set. */
  orientation?: BSplitterOrientation;
  /** Whether resize is committed only on release (preview line during drag). @default false */
  lazy?: boolean;
  /** Splitter-level collapsible config (motion + custom icons). */
  collapsible?: BSplitterCollapsible;
}>();

const emit = defineEmits<{
  /** Fires while the user drags. Reports current pixel sizes of every panel. */
  resize: [sizes: number[]];
  /** Fires when the user starts dragging. */
  resizeStart: [sizes: number[]];
  /** Fires when the user releases the dragger. */
  resizeEnd: [sizes: number[]];
  /** Fires when a panel is collapsed/uncollapsed via a collapse button. */
  collapse: [collapsed: boolean[], sizes: number[]];
  /** Fires when the user double-clicks a dragger. Receives the dragger index. */
  draggerDoubleClick: [index: number];
}>();

const slots = useSlots();
const { componentUID } = useComponentId();
//#endregion

//#region Orientation
const resolvedOrientation = computed<BSplitterOrientation>(() =>
  orientation ?? (vertical ? 'vertical' : 'horizontal'),
);
const isVertical = computed(() => resolvedOrientation.value === 'vertical');

provide(BSplitterContextKey, {
  orientation: resolvedOrientation.value,
});
//#endregion

//#region Slot inspection — extract panel configs from default slot
function flattenChildren(children: VNode[]): VNode[] {
  const out: VNode[] = [];
  for (const vn of children) {
    if (vn.type === Fragment && Array.isArray(vn.children)) {
      out.push(...flattenChildren(vn.children as VNode[]));
    } else {
      out.push(vn);
    }
  }
  return out;
}

const panelConfigs = computed<BSplitterPanelConfig[]>(() => {
  const raw = slots.default?.();
  if (!raw) return [];
  const flat = flattenChildren(raw);
  const result: BSplitterPanelConfig[] = [];
  let idx = 0;
  for (const vnode of flat) {
    if (vnode.type !== BSplitterPanel) continue;
    // Normalize prop keys to camelCase — Vue keeps the original (often
    // kebab-case) keys on the raw vnode.props.
    const rawProps = (vnode.props ?? {}) as Record<string, unknown>;
    const props: Record<string, unknown> = {};
    for (const k in rawProps) props[camelize(k)] = rawProps[k];

    const slotChildren = vnode.children as
      | { default?: () => VNode | VNode[] }
      | null
      | undefined;
    const rawDefault = slotChildren?.default?.();
    const content: VNode[] | undefined = rawDefault
      ? Array.isArray(rawDefault)
        ? rawDefault
        : [rawDefault]
      : undefined;

    let collapsible: BSplitterPanelCollapsible | false = false;
    const c = props.collapsible;
    if (c === true || c === '' || c === 'true') {
      collapsible = { start: true, end: true };
    } else if (c && typeof c === 'object') {
      collapsible = c as BSplitterPanelCollapsible;
    }

    const resizableRaw = props.resizable;
    const resizable =
      resizableRaw === undefined
        ? true
        : resizableRaw === false || resizableRaw === 'false'
          ? false
          : true;

    const destroyRaw = props.destroyOnHidden;
    const destroyOnHidden =
      destroyRaw === true || destroyRaw === '' || destroyRaw === 'true';

    result.push({
      index: idx++,
      size: props.size as number | string | undefined,
      defaultSize: props.defaultSize as number | string | undefined,
      min: props.min as number | string | undefined,
      max: props.max as number | string | undefined,
      resizable,
      collapsible,
      destroyOnHidden,
      content,
    });
  }
  return result;
});
//#endregion

//#region Sizing internals
const rootRef = ref<HTMLElement | null>(null);
const containerSize = ref(0);
const DRAGGER_PX = 6; // matches --b-splitter-dragger-size default

/** Pixel sizes for each panel, kept in sync with container size + props. */
const sizesPx = ref<number[]>([]);
/** Per-panel collapsed flag (true → forced size 0). */
const collapsedFlags = ref<boolean[]>([]);
/** Per-panel sizes saved before collapsing (so we can restore). */
const savedSizes = ref<(number | null)[]>([]);
/**
 * Per-panel record of how it was collapsed:
 * - 'start': collapsed via the `<` button on the dragger AFTER the panel
 *   (neighbor that absorbed = panel + 1)
 * - 'end':   collapsed via the `>` button on the dragger BEFORE the panel
 *   (neighbor that absorbed = panel - 1)
 * Used to decide which dragger should expose the restore button.
 */
const collapsedDirection = ref<('start' | 'end' | null)[]>([]);

function parseLength(
  value: number | string | undefined,
  total: number,
  fallback = NaN,
): number {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'number') return value;
  const s = value.trim();
  if (s.endsWith('%')) {
    const pct = parseFloat(s);
    return isFinite(pct) ? (pct / 100) * total : fallback;
  }
  if (s.endsWith('px')) return parseFloat(s);
  const n = parseFloat(s);
  return isFinite(n) ? n : fallback;
}

function availableSize(): number {
  const total = containerSize.value;
  const dividers = Math.max(panelConfigs.value.length - 1, 0) * DRAGGER_PX;
  return Math.max(total - dividers, 0);
}

function computeInitialSizes(): number[] {
  const panels = panelConfigs.value;
  const avail = availableSize();
  if (panels.length === 0 || avail <= 0) return panels.map(() => 0);

  const result: number[] = Array.from({ length: panels.length }, () => NaN);
  let assigned = 0;
  // First pass: explicit `size` and `defaultSize`.
  panels.forEach((p, i) => {
    const v = parseLength(p.size ?? p.defaultSize, avail);
    if (!isNaN(v)) {
      result[i] = v;
      assigned += v;
    }
  });
  // Distribute remainder evenly among the rest.
  const remainingIdx = result.map((v, i) => (isNaN(v) ? i : -1)).filter((i) => i >= 0);
  if (remainingIdx.length > 0) {
    const remainder = Math.max(avail - assigned, 0);
    const each = remainder / remainingIdx.length;
    remainingIdx.forEach((i) => (result[i] = each));
  }
  // Clamp to min/max and re-normalize so they sum to avail.
  return clampAndNormalize(result, avail);
}

function clampAndNormalize(input: number[], avail: number): number[] {
  const panels = panelConfigs.value;
  const out = input.map((v, i) => {
    const min = parseLength(panels[i]?.min, avail, 0);
    const max = parseLength(panels[i]?.max, avail, Infinity);
    return Math.min(Math.max(v, min), max);
  });
  // Normalize to fit avail.
  const sum = out.reduce((a, b) => a + b, 0);
  if (sum === 0 || avail === 0) return out;
  const scale = avail / sum;
  return out.map((v) => v * scale);
}

function syncFromProps() {
  const panels = panelConfigs.value;
  // Ensure collapsedFlags / savedSizes have correct length.
  if (collapsedFlags.value.length !== panels.length) {
    collapsedFlags.value = panels.map(() => false);
    savedSizes.value = panels.map(() => null);
    collapsedDirection.value = panels.map(() => null);
  }
  // Re-derive sizes when container or panel configs change.
  sizesPx.value = computeInitialSizes();
}

/**
 * Inspect controlled `size` props — when provided, reflect them into sizesPx.
 * AntD-style: when `size` is set, it acts as a controlled value.
 */
watch(
  () => panelConfigs.value.map((p) => `${p.size ?? ''}`).join('|'),
  () => {
    if (containerSize.value > 0) syncFromProps();
  },
);

watch(
  () => panelConfigs.value.length,
  () => {
    if (containerSize.value > 0) syncFromProps();
  },
);
//#endregion

//#region ResizeObserver — track container size
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!rootRef.value) return;
  measureContainer();
  syncFromProps();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      const prev = containerSize.value;
      measureContainer();
      // Re-scale sizes proportionally on container resize.
      if (prev > 0 && containerSize.value > 0 && sizesPx.value.length > 0) {
        const ratio = availableSize() / Math.max(prev - DRAGGER_PX * (sizesPx.value.length - 1), 1);
        sizesPx.value = clampAndNormalize(
          sizesPx.value.map((v) => v * ratio),
          availableSize(),
        );
      } else {
        syncFromProps();
      }
    });
    resizeObserver.observe(rootRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  removeDragListeners();
});

function measureContainer() {
  if (!rootRef.value) return;
  containerSize.value = isVertical.value
    ? rootRef.value.clientHeight
    : rootRef.value.clientWidth;
}
//#endregion

//#region Dragging
interface DragState {
  draggerIndex: number;
  startCoord: number;
  startSizes: number[];
  /** In lazy mode, the preview offset (pixels relative to original divider). */
  previewDelta: number;
}
const dragState = ref<DragState | null>(null);
const lazyPreviewDelta = ref<number | null>(null);

function getCoord(e: MouseEvent | TouchEvent): number {
  if ('touches' in e) {
    const t = e.touches[0] ?? e.changedTouches[0];
    return isVertical.value ? t.clientY : t.clientX;
  }
  return isVertical.value ? e.clientY : e.clientX;
}

function onDraggerPointerDown(index: number, e: MouseEvent | TouchEvent) {
  if (!isResizable(index)) return;
  e.preventDefault();
  dragState.value = {
    draggerIndex: index,
    startCoord: getCoord(e),
    startSizes: [...sizesPx.value],
    previewDelta: 0,
  };
  lazyPreviewDelta.value = lazy ? 0 : null;
  emit('resizeStart', [...sizesPx.value]);

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('touchend', onDragEnd);
}

function applyDelta(startSizes: number[], index: number, delta: number): number[] {
  const panels = panelConfigs.value;
  const avail = availableSize();
  const next = [...startSizes];
  const a = index;
  const b = index + 1;

  const aMin = parseLength(panels[a]?.min, avail, 0);
  const aMax = parseLength(panels[a]?.max, avail, Infinity);
  const bMin = parseLength(panels[b]?.min, avail, 0);
  const bMax = parseLength(panels[b]?.max, avail, Infinity);

  let newA = next[a] + delta;
  let newB = next[b] - delta;

  // Clamp so neither side violates its constraints.
  if (newA < aMin) {
    newB -= aMin - newA;
    newA = aMin;
  }
  if (newA > aMax) {
    newB += newA - aMax;
    newA = aMax;
  }
  if (newB < bMin) {
    newA -= bMin - newB;
    newB = bMin;
  }
  if (newB > bMax) {
    newA += newB - bMax;
    newB = bMax;
  }
  // Final clamp on `a` again in case `b` clamping pushed it out.
  newA = Math.min(Math.max(newA, aMin), aMax);
  newB = Math.min(Math.max(newB, bMin), bMax);
  next[a] = newA;
  next[b] = newB;
  return next;
}

function onDragMove(e: MouseEvent | TouchEvent) {
  if (!dragState.value) return;
  if ('touches' in e) e.preventDefault();
  const coord = getCoord(e);
  const delta = coord - dragState.value.startCoord;

  if (lazy) {
    // Update preview indicator only.
    lazyPreviewDelta.value = delta;
    return;
  }
  const next = applyDelta(dragState.value.startSizes, dragState.value.draggerIndex, delta);
  sizesPx.value = next;
  emit('resize', [...next]);
}

function onDragEnd(e: MouseEvent | TouchEvent) {
  if (!dragState.value) return;
  const coord = 'changedTouches' in e ? getCoord(e) : getCoord(e);
  const delta = coord - dragState.value.startCoord;

  if (lazy) {
    const next = applyDelta(dragState.value.startSizes, dragState.value.draggerIndex, delta);
    sizesPx.value = next;
    emit('resize', [...next]);
  }
  emit('resizeEnd', [...sizesPx.value]);
  dragState.value = null;
  lazyPreviewDelta.value = null;
  removeDragListeners();
}

function removeDragListeners() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  document.removeEventListener('touchmove', onDragMove);
  document.removeEventListener('touchend', onDragEnd);
}

function isResizable(draggerIndex: number): boolean {
  const a = panelConfigs.value[draggerIndex];
  const b = panelConfigs.value[draggerIndex + 1];
  return !!(a?.resizable && b?.resizable);
}

function onDraggerDoubleClick(i: number) {
  emit('draggerDoubleClick', i);
}
//#endregion

//#region Keyboard
const KEY_STEP = 10;

function onDraggerKeyDown(index: number, e: KeyboardEvent) {
  if (!isResizable(index)) return;
  let delta = 0;
  switch (e.key) {
    case 'ArrowLeft':
      delta = isVertical.value ? 0 : -KEY_STEP;
      break;
    case 'ArrowRight':
      delta = isVertical.value ? 0 : KEY_STEP;
      break;
    case 'ArrowUp':
      delta = isVertical.value ? -KEY_STEP : 0;
      break;
    case 'ArrowDown':
      delta = isVertical.value ? KEY_STEP : 0;
      break;
    case 'Home': {
      // collapse the panel before the dragger to its minimum.
      const avail = availableSize();
      const a = panelConfigs.value[index];
      delta = -(sizesPx.value[index] - parseLength(a?.min, avail, 0));
      break;
    }
    case 'End': {
      const avail = availableSize();
      const b = panelConfigs.value[index + 1];
      delta = sizesPx.value[index + 1] - parseLength(b?.min, avail, 0);
      break;
    }
    case 'Enter':
    case ' ':
      // Toggle: collapse the smaller adjacent panel toward the larger one.
      e.preventDefault();
      toggleCollapseAtDragger(index);
      return;
    default:
      return;
  }
  if (delta === 0) return;
  e.preventDefault();
  emit('resizeStart', [...sizesPx.value]);
  const next = applyDelta(sizesPx.value, index, delta);
  sizesPx.value = next;
  emit('resize', [...next]);
  emit('resizeEnd', [...next]);
}
//#endregion

//#region Collapse / Expand
function toggleCollapseAtDragger(index: number) {
  // Default keyboard behaviour: collapse the start side if it has more room than 0.
  const a = panelConfigs.value[index];
  const b = panelConfigs.value[index + 1];
  if (a?.collapsible) collapsePanel(index, 'start');
  else if (b?.collapsible) collapsePanel(index + 1, 'end');
}

/**
 * Collapse a panel toward the previous (`'start'`) or next (`'end'`) panel.
 * If already collapsed, restore the saved size.
 */
function collapsePanel(panelIndex: number, direction: 'start' | 'end') {
  const panel = panelConfigs.value[panelIndex];
  if (!panel) return;
  const avail = availableSize();
  const sizes = [...sizesPx.value];

  // The neighbor that absorbs / returns the collapsed panel's space.
  // - direction='start': panel collapses toward start ⇒ space goes to panelIndex + 1
  // - direction='end':   panel collapses toward end   ⇒ space goes to panelIndex - 1
  const neighbor = direction === 'start' ? panelIndex + 1 : panelIndex - 1;

  if (collapsedFlags.value[panelIndex]) {
    // Restore: take saved size back from the same neighbor that absorbed it.
    const saved = savedSizes.value[panelIndex] ?? avail / panelConfigs.value.length;
    if (neighbor >= 0 && neighbor < sizes.length) {
      const give = Math.min(saved, sizes[neighbor]);
      sizes[panelIndex] = give;
      sizes[neighbor] -= give;
    } else {
      sizes[panelIndex] = saved;
    }
    collapsedFlags.value = collapsedFlags.value.map((v, i) => (i === panelIndex ? false : v));
    savedSizes.value = savedSizes.value.map((v, i) => (i === panelIndex ? null : v));
    collapsedDirection.value = collapsedDirection.value.map((v, i) =>
      i === panelIndex ? null : v,
    );
  } else {
    // Collapse: dump current size into the neighbor.
    savedSizes.value = savedSizes.value.map((v, i) =>
      i === panelIndex ? sizes[panelIndex] : v,
    );
    if (neighbor >= 0 && neighbor < sizes.length) {
      sizes[neighbor] += sizes[panelIndex];
    }
    sizes[panelIndex] = 0;
    collapsedFlags.value = collapsedFlags.value.map((v, i) => (i === panelIndex ? true : v));
    collapsedDirection.value = collapsedDirection.value.map((v, i) =>
      i === panelIndex ? direction : v,
    );
  }
  sizesPx.value = sizes;
  emit('resize', [...sizes]);
  emit('resizeEnd', [...sizes]);
  emit('collapse', [...collapsedFlags.value], [...sizes]);
}

/**
 * Helpers for the two collapse buttons rendered on each dragger between
 * panel `i` (prev) and panel `i + 1` (next). Mirrors AntD's logic:
 * the START (`<`) button can either collapse prev or expand a previously-
 * collapsed next; the END (`>`) button is symmetric.
 */
function startBtnPanelCfg(i: number) {
  return panelConfigs.value[i]?.collapsible
    ? (panelConfigs.value[i].collapsible as BSplitterPanelCollapsible)
    : null;
}
function endBtnPanelCfg(i: number) {
  return panelConfigs.value[i + 1]?.collapsible
    ? (panelConfigs.value[i + 1].collapsible as BSplitterPanelCollapsible)
    : null;
}
function canShowStartBtn(i: number): boolean {
  const sizes = sizesPx.value;
  const prevSize = sizes[i] ?? 0;
  const nextSize = sizes[i + 1] ?? 0;
  // Mode A — collapse prev (panel i).
  const prevCfg = startBtnPanelCfg(i);
  const collapsePrev = !!prevCfg?.start && prevSize > 0 && nextSize > 0;
  // Mode B — restore next (panel i + 1) if it was collapsed via THIS dragger.
  const restoreNext =
    !!collapsedFlags.value[i + 1] &&
    collapsedDirection.value[i + 1] === 'end' &&
    prevSize > 0;
  return collapsePrev || restoreNext;
}
function canShowEndBtn(i: number): boolean {
  const sizes = sizesPx.value;
  const prevSize = sizes[i] ?? 0;
  const nextSize = sizes[i + 1] ?? 0;
  // Mode A — collapse next (panel i + 1).
  const nextCfg = endBtnPanelCfg(i);
  const collapseNext = !!nextCfg?.end && nextSize > 0 && prevSize > 0;
  // Mode B — restore prev (panel i) if it was collapsed via THIS dragger.
  const restorePrev =
    !!collapsedFlags.value[i] &&
    collapsedDirection.value[i] === 'start' &&
    nextSize > 0;
  return collapseNext || restorePrev;
}
function onClickStartBtn(i: number) {
  if (
    collapsedFlags.value[i + 1] &&
    collapsedDirection.value[i + 1] === 'end'
  ) {
    // Restore next, taking space back from prev.
    collapsePanel(i + 1, 'end');
  } else {
    collapsePanel(i, 'start');
  }
}
function onClickEndBtn(i: number) {
  if (collapsedFlags.value[i] && collapsedDirection.value[i] === 'start') {
    // Restore prev, taking space back from next.
    collapsePanel(i, 'start');
  } else {
    collapsePanel(i + 1, 'end');
  }
}
function startBtnAriaLabel(i: number): string {
  if (
    collapsedFlags.value[i + 1] &&
    collapsedDirection.value[i + 1] === 'end'
  ) {
    return `Expand panel ${i + 2}`;
  }
  return `Collapse panel ${i + 1}`;
}
function endBtnAriaLabel(i: number): string {
  if (collapsedFlags.value[i] && collapsedDirection.value[i] === 'start') {
    return `Expand panel ${i + 1}`;
  }
  return `Collapse panel ${i + 2}`;
}
//#endregion

//#region Style helpers
const motion = computed(() => collapsibleConfig?.motion !== false);

function panelStyle(i: number): CSSProperties {
  const sz = sizesPx.value[i] ?? 0;
  const sizeStr = `${sz}px`;
  return isVertical.value
    ? { height: sizeStr, flex: `0 0 ${sizeStr}` }
    : { width: sizeStr, flex: `0 0 ${sizeStr}` };
}

function draggerAriaValueNow(i: number): number {
  const avail = availableSize();
  if (avail === 0) return 0;
  const accumulated = sizesPx.value.slice(0, i + 1).reduce((a, b) => a + b, 0);
  return Math.round((accumulated / avail) * 100);
}

const lazyIndicatorStyle = computed<CSSProperties | undefined>(() => {
  if (!lazy || !dragState.value || lazyPreviewDelta.value === null) return undefined;
  const idx = dragState.value.draggerIndex;
  const before = dragState.value.startSizes.slice(0, idx + 1).reduce((a, b) => a + b, 0);
  const offset = before + idx * DRAGGER_PX + lazyPreviewDelta.value;
  return isVertical.value ? { top: `${offset}px` } : { left: `${offset}px` };
});
//#endregion

//#region Expose
function getSizes(): number[] {
  return [...sizesPx.value];
}
function setSizes(next: number[]) {
  if (next.length !== sizesPx.value.length) return;
  sizesPx.value = clampAndNormalize(next, availableSize());
  emit('resize', [...sizesPx.value]);
}
defineExpose({ getSizes, setSizes });
//#endregion

//#region Render-time per-panel render helper
/**
 * Returns the panel's slot content as VNodes, honoring `destroyOnHidden`.
 */
function panelContent(panel: BSplitterPanelConfig, i: number): VNode[] | null {
  const collapsed = (sizesPx.value[i] ?? 0) <= 0;
  if (panel.destroyOnHidden && collapsed) return null;
  return panel.content ?? null;
}
//#endregion
</script>

<template>
  <div
    ref="rootRef"
    class="b-splitter"
    :class="{
      'b-splitter--horizontal': !isVertical,
      'b-splitter--vertical': isVertical,
      'b-splitter--lazy': lazy,
      'b-splitter--motion': motion,
      'b-splitter--dragging': dragState !== null,
    }"
    :data-orientation="resolvedOrientation"
  >
    <template v-for="(panel, i) in panelConfigs" :key="`panel-${componentUID}-${i}`">
      <div
        :id="`b-splitter-${componentUID}-panel-${i}`"
        class="b-splitter__panel"
        :class="{ 'b-splitter__panel--collapsed': (sizesPx[i] ?? 0) <= 0 }"
        :style="panelStyle(i)"
        role="group"
      >
        <component :is="VNodeRenderer" :nodes="panelContent(panel, i)" />
      </div>

      <!-- Divider wrapper holds the dragger + collapse buttons as siblings
           so we don't nest interactive controls (a11y: nested-interactive). -->
      <div
        v-if="i < panelConfigs.length - 1"
        class="b-splitter__divider"
        :class="{ 'b-splitter__divider--disabled': !isResizable(i) }"
      >
        <div
          class="b-splitter__dragger"
          :class="{
            'b-splitter__dragger--disabled': !isResizable(i),
            'b-splitter__dragger--active': dragState && dragState.draggerIndex === i,
          }"
          role="separator"
          :tabindex="isResizable(i) ? 0 : -1"
          :aria-orientation="isVertical ? 'horizontal' : 'vertical'"
          :aria-controls="`b-splitter-${componentUID}-panel-${i} b-splitter-${componentUID}-panel-${i + 1}`"
          :aria-valuenow="draggerAriaValueNow(i)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-disabled="!isResizable(i) || undefined"
          :aria-label="`Resize panel ${i + 1}`"
          @mousedown="onDraggerPointerDown(i, $event)"
          @touchstart="onDraggerPointerDown(i, $event)"
          @keydown="onDraggerKeyDown(i, $event)"
          @dblclick="onDraggerDoubleClick(i)"
        >
          <span aria-hidden="true" class="b-splitter__handle">
            <slot name="draggerIcon" />
          </span>
        </div>

        <!--
          Collapse "start" button (LEFT half of dragger). Two modes:
          - Collapse prev (panel i)        when prev is visible.
          - Restore next  (panel i + 1)    when next was collapsed via the `>`
                                           button on THIS dragger.
        -->
        <button
          v-if="canShowStartBtn(i)"
          type="button"
          class="b-splitter__collapse-btn b-splitter__collapse-btn--start"
          :aria-label="startBtnAriaLabel(i)"
          :aria-expanded="
            collapsedFlags[i + 1] && collapsedDirection[i + 1] === 'end'
              ? false
              : true
          "
          @mousedown.stop
          @touchstart.stop
          @click.stop="onClickStartBtn(i)"
        >
          <slot name="collapseIconStart">
            <svg
              aria-hidden="true"
              class="b-splitter__chevron b-splitter__chevron--start"
              viewBox="0 0 8 8"
              width="8"
              height="8"
            >
              <polyline
                points="5,1 2,4 5,7"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </button>

        <!--
          Collapse "end" button (RIGHT half of dragger). Two modes:
          - Collapse next (panel i + 1)    when next is visible.
          - Restore prev  (panel i)        when prev was collapsed via the `<`
                                           button on THIS dragger.
        -->
        <button
          v-if="canShowEndBtn(i)"
          type="button"
          class="b-splitter__collapse-btn b-splitter__collapse-btn--end"
          :aria-label="endBtnAriaLabel(i)"
          :aria-expanded="
            collapsedFlags[i] && collapsedDirection[i] === 'start'
              ? false
              : true
          "
          @mousedown.stop
          @touchstart.stop
          @click.stop="onClickEndBtn(i)"
        >
          <slot name="collapseIconEnd">
            <svg
              aria-hidden="true"
              class="b-splitter__chevron b-splitter__chevron--end"
              viewBox="0 0 8 8"
              width="8"
              height="8"
            >
              <polyline
                points="3,1 6,4 3,7"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </button>
      </div>
    </template>

    <!-- Lazy preview indicator -->
    <div
      v-if="lazy && dragState && lazyPreviewDelta !== null"
      class="b-splitter__lazy-indicator"
      :style="lazyIndicatorStyle"
      aria-hidden="true"
    />
  </div>
</template>

<style>
.b-splitter {
  /* Component design tokens (AntD parity) */
  --b-splitter-split-bar-size: 2px;
  --b-splitter-dragger-size: 6px;
  --b-splitter-dragger-draggable-size: 20px;
  --b-splitter-bg: oklch(94% 0 0); /* colorFill */
  --b-splitter-bg-hover: oklch(85% 0 0); /* colorFillSecondary */
  --b-splitter-bg-active: oklch(60% 0.18 264); /* colorPrimary */
  --b-splitter-text-color: oklch(40% 0 0);
  --b-splitter-color-bg-elevated: #fff;
  --b-splitter-collapse-bar-bg: oklch(94% 0 0);
  --b-splitter-collapse-bar-bg-hover: oklch(60% 0.18 264);
  --b-splitter-collapse-icon-color: oklch(60% 0 0);
  --b-splitter-collapse-icon-color-hover: #fff;
  --b-splitter-motion-duration: 0.2s;
  --b-splitter-z-index-base: 1;

  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.b-splitter--horizontal {
  flex-direction: row;
}
.b-splitter--vertical {
  flex-direction: column;
}

/* Panel */
.b-splitter__panel {
  position: relative;
  overflow: auto;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
}
.b-splitter--motion .b-splitter__panel {
  transition:
    width var(--b-splitter-motion-duration) ease,
    height var(--b-splitter-motion-duration) ease,
    flex-basis var(--b-splitter-motion-duration) ease;
}
.b-splitter--dragging .b-splitter__panel {
  transition: none;
}
.b-splitter__panel--collapsed {
  overflow: hidden;
}

/* Divider — non-interactive wrapper holding the dragger + collapse buttons.
   It is the flex item that occupies the dragger size; the dragger and the
   collapse buttons sit inside as siblings (avoids nested-interactive a11y
   violation). */
.b-splitter__divider {
  position: relative;
  flex: 0 0 var(--b-splitter-dragger-size);
  align-self: stretch;
  box-sizing: border-box;
  z-index: var(--b-splitter-z-index-base);
}
.b-splitter--horizontal .b-splitter__divider {
  width: var(--b-splitter-dragger-size);
  height: 100%;
}
.b-splitter--vertical .b-splitter__divider {
  width: 100%;
  height: var(--b-splitter-dragger-size);
}

/* Dragger — fills the divider and is the focusable separator. */
.b-splitter__dragger {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  outline: none;
  box-sizing: border-box;
  user-select: none;
  touch-action: none;
}
.b-splitter--horizontal .b-splitter__dragger {
  cursor: col-resize;
}
.b-splitter--vertical .b-splitter__dragger {
  cursor: row-resize;
}
.b-splitter__dragger--disabled {
  cursor: default;
}

/* Visible bar via ::before — sits in centre of dragger */
.b-splitter__dragger::before {
  content: '';
  position: absolute;
  background: var(--b-splitter-bg);
  border-radius: 2px;
  transition: background var(--b-splitter-motion-duration) ease;
}
.b-splitter--horizontal .b-splitter__dragger::before {
  top: 0;
  bottom: 0;
  left: calc(50% - var(--b-splitter-split-bar-size) / 2);
  width: var(--b-splitter-split-bar-size);
}
.b-splitter--vertical .b-splitter__dragger::before {
  left: 0;
  right: 0;
  top: calc(50% - var(--b-splitter-split-bar-size) / 2);
  height: var(--b-splitter-split-bar-size);
}
.b-splitter__dragger:not(.b-splitter__dragger--disabled):hover::before,
.b-splitter__dragger:focus-visible::before,
.b-splitter__dragger--active::before {
  background: var(--b-splitter-bg-active);
}

/* Visible draggable indicator (grip) — `splitBarDraggableSize` long, slightly
   thicker than the split bar to give the user a clear hit-target hint. */
.b-splitter__dragger::after {
  content: '';
  position: absolute;
  background: var(--b-splitter-bg);
  border-radius: 2px;
  pointer-events: none;
  transition: background var(--b-splitter-motion-duration) ease;
}
.b-splitter--horizontal .b-splitter__dragger::after {
  width: 4px;
  height: var(--b-splitter-dragger-draggable-size);
  top: calc(50% - var(--b-splitter-dragger-draggable-size) / 2);
  left: calc(50% - 2px);
}
.b-splitter--vertical .b-splitter__dragger::after {
  width: var(--b-splitter-dragger-draggable-size);
  height: 4px;
  left: calc(50% - var(--b-splitter-dragger-draggable-size) / 2);
  top: calc(50% - 2px);
}
.b-splitter__dragger--disabled::after {
  display: none;
}
.b-splitter__dragger:not(.b-splitter__dragger--disabled):hover::after,
.b-splitter__dragger:focus-visible::after,
.b-splitter__dragger--active::after {
  background: var(--b-splitter-bg-active);
}

.b-splitter__dragger:focus-visible {
  outline: 2px solid var(--b-splitter-bg-active);
  outline-offset: -2px;
}

/* Drag handle (decorative) */
.b-splitter__handle {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Collapse button */
.b-splitter__collapse-btn {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 2px;
  background: var(--b-splitter-collapse-bar-bg);
  color: var(--b-splitter-collapse-icon-color);
  cursor: pointer;
  transition:
    background var(--b-splitter-motion-duration) ease,
    color var(--b-splitter-motion-duration) ease;
  z-index: calc(var(--b-splitter-z-index-base) + 1);
}
.b-splitter__collapse-btn:hover,
.b-splitter__collapse-btn:focus-visible {
  background: var(--b-splitter-collapse-bar-bg-hover);
  color: var(--b-splitter-collapse-icon-color-hover);
}
.b-splitter__collapse-btn:focus-visible {
  outline: 2px solid var(--b-splitter-bg-active);
  outline-offset: 1px;
}
.b-splitter--horizontal .b-splitter__collapse-btn--start,
.b-splitter--horizontal .b-splitter__collapse-btn--end {
  top: 50%;
  transform: translateY(-50%);
}
.b-splitter--horizontal .b-splitter__collapse-btn--start {
  right: calc(50% + 2px);
}
.b-splitter--horizontal .b-splitter__collapse-btn--end {
  left: calc(50% + 2px);
}
.b-splitter--vertical .b-splitter__collapse-btn {
  width: 18px;
  height: 14px;
}
.b-splitter--vertical .b-splitter__collapse-btn--start,
.b-splitter--vertical .b-splitter__collapse-btn--end {
  left: 50%;
  transform: translateX(-50%);
}
.b-splitter--vertical .b-splitter__collapse-btn--start {
  bottom: calc(50% + 2px);
}
.b-splitter--vertical .b-splitter__collapse-btn--end {
  top: calc(50% + 2px);
}

/* Chevron icon (SVG) */
.b-splitter__chevron {
  display: block;
  width: 8px;
  height: 8px;
}
.b-splitter--vertical .b-splitter__chevron--start {
  transform: rotate(90deg);
}
.b-splitter--vertical .b-splitter__chevron--end {
  transform: rotate(-90deg);
}

/* Lazy preview indicator */
.b-splitter__lazy-indicator {
  position: absolute;
  background: var(--b-splitter-bg-active);
  pointer-events: none;
  z-index: calc(var(--b-splitter-z-index-base) + 2);
}
.b-splitter--horizontal .b-splitter__lazy-indicator {
  top: 0;
  bottom: 0;
  width: var(--b-splitter-split-bar-size);
}
.b-splitter--vertical .b-splitter__lazy-indicator {
  left: 0;
  right: 0;
  height: var(--b-splitter-split-bar-size);
}

/* Dark mode — reassign tokens, no new vars */
[data-prefers-color='dark'] .b-splitter {
  --b-splitter-bg: oklch(30% 0 0);
  --b-splitter-bg-hover: oklch(40% 0 0);
  --b-splitter-bg-active: oklch(70% 0.18 264);
  --b-splitter-text-color: oklch(85% 0 0);
  --b-splitter-color-bg-elevated: oklch(20% 0 0);
  --b-splitter-collapse-bar-bg: oklch(30% 0 0);
  --b-splitter-collapse-bar-bg-hover: oklch(70% 0.18 264);
  --b-splitter-collapse-icon-color: oklch(70% 0 0);
  --b-splitter-collapse-icon-color-hover: oklch(15% 0 0);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-splitter {
    --b-splitter-bg: oklch(30% 0 0);
    --b-splitter-bg-hover: oklch(40% 0 0);
    --b-splitter-bg-active: oklch(70% 0.18 264);
    --b-splitter-text-color: oklch(85% 0 0);
    --b-splitter-color-bg-elevated: oklch(20% 0 0);
    --b-splitter-collapse-bar-bg: oklch(30% 0 0);
    --b-splitter-collapse-bar-bg-hover: oklch(70% 0.18 264);
    --b-splitter-collapse-icon-color: oklch(70% 0 0);
    --b-splitter-collapse-icon-color-hover: oklch(15% 0 0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-splitter__panel,
  .b-splitter__dragger::before,
  .b-splitter__collapse-btn {
    transition: none !important;
  }
}
</style>
