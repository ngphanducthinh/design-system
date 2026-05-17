<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type BImageTransformAction =
  | 'flipX'
  | 'flipY'
  | 'rotateLeft'
  | 'rotateRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'reset'
  | 'wheel'
  | 'dragStart'
  | 'dragEnd';

export interface BImageTransform {
  scale: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
  x: number;
  y: number;
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Image source URL. */
    src?: string;
    /** Alt text for the image. */
    alt?: string;
    /** Image width (px or CSS value). */
    width?: string | number;
    /** Image height (px or CSS value). */
    height?: string | number;
    /** Fallback source when loading fails. */
    fallback?: string;
    /**
     * Show loading placeholder. Set to `true` for built-in shimmer,
     * or use the `placeholder` slot for custom content.
     */
    placeholder?: boolean;
    /**
     * Low-resolution source for progressive loading.
     * Shown blurred while the full image loads.
     */
    placeholderSrc?: string;
    /** Enable image preview on click. */
    preview?: boolean;
    /** Show the hover mask overlay over the image. Set `false` to hide the mask entirely while keeping preview on click. */
    mask?: boolean;
    /** Custom source for preview (defaults to `src`). */
    previewSrc?: string;
    /** Controlled preview visibility (v-model:previewVisible). */
    previewVisible?: boolean;
    /** Zoom scale step for preview controls. */
    scaleStep?: number;
    /** Min zoom scale. */
    minScale?: number;
    /** Max zoom scale. */
    maxScale?: number;
    /** Allow dragging/panning the image inside the preview. */
    movable?: boolean;
    /** Native `loading` attribute - `'lazy'` for below-the-fold images. */
    loading?: 'lazy' | 'eager';
    /** CORS setting for the image. */
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
    /** Decoding hint for the browser. */
    decoding?: 'async' | 'auto' | 'sync';
    /** Referrer policy for the image request. */
    referrerPolicy?:
      | ''
      | 'no-referrer'
      | 'no-referrer-when-downgrade'
      | 'origin'
      | 'origin-when-cross-origin'
      | 'same-origin'
      | 'strict-origin'
      | 'strict-origin-when-cross-origin'
      | 'unsafe-url';
  }>(),
  {
    src: undefined,
    alt: '',
    width: undefined,
    height: undefined,
    fallback: undefined,
    placeholder: false,
    placeholderSrc: undefined,
    preview: true,
    mask: true,
    previewSrc: undefined,
    previewVisible: undefined,
    scaleStep: 0.5,
    minScale: 1,
    maxScale: 50,
    movable: true,
    loading: undefined,
    crossOrigin: undefined,
    decoding: undefined,
    referrerPolicy: undefined,
  },
);

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires when the <img> fails to load. */
  (e: 'error', event: Event): void;
  /** Fires when controlled preview visibility changes. */
  (e: 'update:previewVisible', visible: boolean): void;
  /** Fires on every preview transform change (zoom, rotate, flip, drag). */
  (e: 'transform', payload: { transform: BImageTransform; action: BImageTransformAction }): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Custom loading placeholder content. */
  placeholder?(): unknown;
  /** Custom preview mask overlay. */
  'preview-mask'?(): unknown;
}>();

// ─────────────────────────────────────────────
// Image loading state
// ─────────────────────────────────────────────
const loadStatus = ref<'loading' | 'loaded' | 'error'>('loading');
const useFallback = ref(false);

function handleLoad() {
  loadStatus.value = 'loaded';
}

function handleError(event: Event) {
  if (props.fallback && !useFallback.value) {
    useFallback.value = true;
    loadStatus.value = 'loading';
  } else {
    loadStatus.value = 'error';
  }
  emit('error', event);
}

const displaySrc = computed(() => {
  if (useFallback.value && props.fallback) return props.fallback;
  return props.src;
});

// Reset state when src changes
watch(
  () => props.src,
  () => {
    loadStatus.value = 'loading';
    useFallback.value = false;
  },
);

// ─────────────────────────────────────────────
// Progressive loading (low-res blurry placeholder)
// ─────────────────────────────────────────────
const showProgressivePlaceholder = computed(
  () => props.placeholderSrc && loadStatus.value === 'loading',
);

// ─────────────────────────────────────────────
// Dimension helpers
// ─────────────────────────────────────────────
const dimensionStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width != null) {
    s.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  if (props.height != null) {
    s.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  return s;
});

// ─────────────────────────────────────────────
// Show mask logic
// ─────────────────────────────────────────────
const showMask = computed(() => props.preview && props.mask && loadStatus.value === 'loaded');

// ─────────────────────────────────────────────
// Preview overlay
// ─────────────────────────────────────────────
const internalPreviewOpen = ref(false);
const isControlled = computed(() => props.previewVisible !== undefined);

const previewOpen = computed(() =>
  isControlled.value ? props.previewVisible : internalPreviewOpen.value,
);

function openPreview() {
  if (!props.preview) return;
  if (isControlled.value) {
    emit('update:previewVisible', true);
  } else {
    internalPreviewOpen.value = true;
  }
  nextTick(() => {
    trapFocusInPreview();
  });
}

function closePreview() {
  if (isControlled.value) {
    emit('update:previewVisible', false);
  } else {
    internalPreviewOpen.value = false;
  }
  // Return focus to trigger
  nextTick(() => {
    triggerRef.value?.focus();
  });
}

// ─────────────────────────────────────────────
// Preview transform state
// ─────────────────────────────────────────────
const scale = ref(1);
const rotate = ref(0);
const flipX = ref(false);
const flipY = ref(false);
const dragX = ref(0);
const dragY = ref(0);

function currentTransform(): BImageTransform {
  return {
    scale: scale.value,
    rotate: rotate.value,
    flipX: flipX.value,
    flipY: flipY.value,
    x: dragX.value,
    y: dragY.value,
  };
}

function emitTransform(action: BImageTransformAction) {
  emit('transform', { transform: currentTransform(), action });
}

function resetTransform() {
  scale.value = 1;
  rotate.value = 0;
  flipX.value = false;
  flipY.value = false;
  dragX.value = 0;
  dragY.value = 0;
}

function doResetTransform() {
  resetTransform();
  emitTransform('reset');
}

function zoomIn() {
  const next = scale.value + props.scaleStep;
  scale.value = Math.min(next, props.maxScale);
  emitTransform('zoomIn');
}

function zoomOut() {
  const next = scale.value - props.scaleStep;
  scale.value = Math.max(next, props.minScale);
  emitTransform('zoomOut');
}

function rotateLeft() {
  rotate.value -= 90;
  emitTransform('rotateLeft');
}

function rotateRight() {
  rotate.value += 90;
  emitTransform('rotateRight');
}

function toggleFlipX() {
  flipX.value = !flipX.value;
  emitTransform('flipX');
}

function toggleFlipY() {
  flipY.value = !flipY.value;
  emitTransform('flipY');
}

const previewTransform = computed(() => {
  const parts: string[] = [];
  parts.push(`translate(${dragX.value}px, ${dragY.value}px)`);
  parts.push(`scale(${flipX.value ? -1 : 1}, ${flipY.value ? -1 : 1})`);
  parts.push(`scale(${scale.value})`);
  parts.push(`rotate(${rotate.value}deg)`);
  return parts.join(' ');
});

// Reset transform when preview is opened
watch(previewOpen, (open) => {
  if (open) {
    resetTransform();
  }
});

const previewImageSrc = computed(() => props.previewSrc || props.src);

// ─────────────────────────────────────────────
// Drag-to-pan (movable)
// ─────────────────────────────────────────────
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartTranslateX = ref(0);
const dragStartTranslateY = ref(0);

function handlePreviewPointerDown(event: PointerEvent) {
  if (!props.movable) return;
  // Only initiate drag on the image body (not toolbar/close)
  const target = event.target as HTMLElement;
  if (target.closest('.b-image-preview__toolbar') || target.closest('.b-image-preview__close')) {
    return;
  }

  isDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragStartTranslateX.value = dragX.value;
  dragStartTranslateY.value = dragY.value;

  (event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
  emitTransform('dragStart');
}

function handlePreviewPointerMove(event: PointerEvent) {
  if (!isDragging.value) return;
  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;
  dragX.value = dragStartTranslateX.value + dx;
  dragY.value = dragStartTranslateY.value + dy;
}

function handlePreviewPointerUp() {
  if (!isDragging.value) return;
  isDragging.value = false;
  emitTransform('dragEnd');
}

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
const triggerRef = ref<HTMLElement | null>(null);
const overlayRef = ref<HTMLElement | null>(null);

function trapFocusInPreview() {
  nextTick(() => {
    if (!overlayRef.value) return;
    const focusable = overlayRef.value.querySelectorAll<HTMLElement>(
      'button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  });
}

function handleOverlayKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation();
    closePreview();
    return;
  }

  if (event.key === 'Tab' && overlayRef.value) {
    const focusable = Array.from(
      overlayRef.value.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])'),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openPreview();
  }
}

// ─────────────────────────────────────────────
// Body scroll lock
// ─────────────────────────────────────────────
watch(previewOpen, (open) => {
  if (typeof document === 'undefined') return;
  if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

// ─────────────────────────────────────────────
// Zoom with mouse wheel in preview
// ─────────────────────────────────────────────
function handlePreviewWheel(event: WheelEvent) {
  event.preventDefault();
  if (event.deltaY < 0) {
    const next = scale.value + props.scaleStep;
    scale.value = Math.min(next, props.maxScale);
  } else {
    const next = scale.value - props.scaleStep;
    scale.value = Math.max(next, props.minScale);
  }
  emitTransform('wheel');
}

// ─────────────────────────────────────────────
// Toolbar keyboard support
// ─────────────────────────────────────────────
function handleToolbarKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (target.tagName !== 'BUTTON') return;

  const toolbar = target.closest('.b-image-preview__toolbar');
  if (!toolbar) return;
  const buttons = Array.from(toolbar.querySelectorAll<HTMLElement>('button:not(:disabled)'));
  const index = buttons.indexOf(target);

  let nextIndex = -1;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    nextIndex = (index + 1) % buttons.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    nextIndex = (index - 1 + buttons.length) % buttons.length;
  } else if (event.key === 'Home') {
    event.preventDefault();
    nextIndex = 0;
  } else if (event.key === 'End') {
    event.preventDefault();
    nextIndex = buttons.length - 1;
  }

  if (nextIndex >= 0) {
    buttons[nextIndex].focus();
  }
}
</script>

<template>
  <div
    class="b-image"
    :class="{
      'b-image--error': loadStatus === 'error' && !fallback,
      'b-image--preview': preview,
    }"
    :style="dimensionStyle"
  >
    <!-- Progressive placeholder (blurred low-res image) -->
    <img
      v-if="showProgressivePlaceholder"
      class="b-image__progressive-placeholder"
      :src="placeholderSrc"
      :alt="alt"
      aria-hidden="true"
    />

    <!-- Placeholder (shimmer or slot) -->
    <div
      v-if="(placeholder || $slots.placeholder) && loadStatus === 'loading' && !placeholderSrc"
      class="b-image__placeholder"
      aria-hidden="true"
    >
      <slot name="placeholder">
        <div class="b-image__placeholder-shimmer" />
      </slot>
    </div>

    <!-- Image -->
    <img
      v-show="loadStatus !== 'loading' || (!placeholder && !$slots.placeholder && !placeholderSrc)"
      class="b-image__img"
      :src="displaySrc"
      :alt="alt"
      :width="typeof width === 'number' ? width : undefined"
      :height="typeof height === 'number' ? height : undefined"
      :loading="loading"
      :crossorigin="crossOrigin"
      :decoding="decoding"
      :referrerpolicy="referrerPolicy"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Preview mask overlay (clickable) -->
    <div
      v-if="showMask"
      ref="triggerRef"
      class="b-image__mask"
      role="button"
      tabindex="0"
      :aria-label="`Preview image${alt ? ': ' + alt : ''}`"
      @click="openPreview"
      @keydown="handleTriggerKeydown"
    >
      <slot name="preview-mask">
        <span class="b-image__mask-text" aria-hidden="true">
          <!-- Eye icon -->
          <svg
            class="b-image__mask-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </span>
      </slot>
    </div>

    <!-- Invisible click target when mask is hidden but preview is enabled -->
    <div
      v-else-if="preview && !mask && loadStatus === 'loaded'"
      ref="triggerRef"
      class="b-image__click-target"
      role="button"
      tabindex="0"
      :aria-label="`Preview image${alt ? ': ' + alt : ''}`"
      @click="openPreview"
      @keydown="handleTriggerKeydown"
    />

    <!-- Preview overlay (teleported to body) -->
    <Teleport to="body">
      <Transition name="b-image-preview">
        <div
          v-if="previewOpen"
          ref="overlayRef"
          class="b-image-preview"
          :class="{ 'b-image-preview--dragging': isDragging }"
          role="dialog"
          aria-modal="true"
          :aria-label="`Image preview${alt ? ': ' + alt : ''}`"
          @keydown="handleOverlayKeydown"
          @wheel.prevent="handlePreviewWheel"
          @pointerdown="handlePreviewPointerDown"
          @pointermove="handlePreviewPointerMove"
          @pointerup="handlePreviewPointerUp"
          @pointercancel="handlePreviewPointerUp"
        >
          <!-- Backdrop -->
          <div class="b-image-preview__backdrop" @click="closePreview" />

          <!-- Close button -->
          <button
            class="b-image-preview__close"
            type="button"
            aria-label="Close preview"
            @click="closePreview"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Preview image -->
          <div class="b-image-preview__body">
            <img
              class="b-image-preview__img"
              :src="previewImageSrc"
              :alt="alt"
              :style="{ transform: previewTransform }"
              draggable="false"
            />
          </div>

          <!-- Toolbar -->
          <div
            class="b-image-preview__toolbar"
            role="toolbar"
            aria-label="Image preview controls"
            @keydown="handleToolbarKeydown"
          >
            <!-- Flip Horizontal -->
            <button
              type="button"
              aria-label="Flip horizontal"
              :aria-pressed="String(flipX)"
              @click="toggleFlipX"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                <line x1="12" y1="1" x2="12" y2="23" stroke-dasharray="2 2" />
              </svg>
            </button>

            <!-- Flip Vertical -->
            <button
              type="button"
              aria-label="Flip vertical"
              :aria-pressed="String(flipY)"
              @click="toggleFlipY"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M3 8V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
                <line x1="1" y1="12" x2="23" y2="12" stroke-dasharray="2 2" />
              </svg>
            </button>

            <!-- Rotate Left -->
            <button type="button" aria-label="Rotate left" @click="rotateLeft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>

            <!-- Rotate Right -->
            <button type="button" aria-label="Rotate right" @click="rotateRight">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
              </svg>
            </button>

            <!-- Zoom Out -->
            <button
              type="button"
              aria-label="Zoom out"
              :disabled="scale <= minScale"
              @click="zoomOut"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <!-- Scale indicator -->
            <span class="b-image-preview__scale" aria-live="polite" aria-atomic="true">
              {{ Math.round(scale * 100) }}%
            </span>

            <!-- Zoom In -->
            <button
              type="button"
              aria-label="Zoom in"
              :disabled="scale >= maxScale"
              @click="zoomIn"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <!-- Reset (1:1) -->
            <button type="button" aria-label="Reset to original size" @click="doResetTransform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <text
                  x="12"
                  y="16"
                  text-anchor="middle"
                  fill="currentColor"
                  stroke="none"
                  font-size="10"
                  font-weight="600"
                  font-family="system-ui"
                >
                  1:1
                </text>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-image {
  /* Layout */
  --b-image-border-radius: 8px;
  --b-image-bg: oklch(95% 0.003 260);
  --b-image-object-fit: cover;

  /* Placeholder */
  --b-image-placeholder-bg: oklch(93% 0.005 260);
  --b-image-placeholder-shimmer: linear-gradient(
    90deg,
    oklch(93% 0.005 260) 25%,
    oklch(96% 0.003 260) 50%,
    oklch(93% 0.005 260) 75%
  );
  --b-image-progressive-blur: 20px;

  /* Mask */
  --b-image-mask-bg: oklch(0% 0 0 / 50%);
  --b-image-mask-color: oklch(100% 0 0);
  --b-image-mask-font-size: 14px;
  --b-image-mask-icon-size: 20px;

  /* Error */
  --b-image-error-bg: oklch(95% 0.003 260);
  --b-image-error-color: oklch(55% 0.01 260);
  --b-image-error-icon-size: 32px;

  /* Animation */
  --b-image-transition-duration: 200ms;

  /* Focus */
  --b-image-focus-ring: 2px solid oklch(54.6% 0.245 262.881);
  --b-image-focus-ring-offset: 2px;
}

/* Preview overlay tokens */
.b-image-preview {
  --b-image-preview-backdrop-bg: oklch(0% 0 0 / 65%);
  --b-image-preview-toolbar-bg: oklch(15% 0.005 260 / 85%);
  --b-image-preview-toolbar-color: oklch(95% 0.005 260);
  --b-image-preview-toolbar-btn-size: 40px;
  --b-image-preview-toolbar-icon-size: 20px;
  --b-image-preview-toolbar-gap: 8px;
  --b-image-preview-toolbar-radius: 24px;
  --b-image-preview-toolbar-padding: 4px 16px;
  --b-image-preview-close-size: 40px;
  --b-image-preview-close-color: oklch(90% 0.005 260);
  --b-image-preview-close-hover-bg: oklch(100% 0 0 / 12%);
  --b-image-preview-transition-duration: 250ms;
  --b-image-preview-scale-font-size: 13px;
  --b-image-preview-scale-min-width: 52px;
}

/* ── Dark mode ─────────────────────────────── */
[data-prefers-color='dark'] .b-image {
  --b-image-bg: oklch(22% 0.005 260);
  --b-image-placeholder-bg: oklch(25% 0.005 260);
  --b-image-placeholder-shimmer: linear-gradient(
    90deg,
    oklch(25% 0.005 260) 25%,
    oklch(30% 0.003 260) 50%,
    oklch(25% 0.005 260) 75%
  );
  --b-image-error-bg: oklch(22% 0.005 260);
  --b-image-error-color: oklch(70% 0.01 260);
}

[data-prefers-color='dark'] .b-image-preview {
  --b-image-preview-backdrop-bg: oklch(0% 0 0 / 80%);
  --b-image-preview-toolbar-bg: oklch(10% 0.005 260 / 90%);
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: var(--b-image-border-radius);
  background-color: var(--b-image-bg);
  line-height: 0;
  box-sizing: border-box;
}

.b-image__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--b-image-object-fit);
  border-radius: var(--b-image-border-radius);
}

/* ─────────────────────────────────────────────
   Progressive placeholder (blurred low-res)
   ───────────────────────────────────────────── */
.b-image__progressive-placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: var(--b-image-object-fit);
  border-radius: var(--b-image-border-radius);
  filter: blur(var(--b-image-progressive-blur));
  transform: scale(1.1);
  z-index: 1;
}

/* ─────────────────────────────────────────────
   Placeholder
   ───────────────────────────────────────────── */
.b-image__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--b-image-placeholder-bg);
  border-radius: var(--b-image-border-radius);
  z-index: 1;
}

.b-image__placeholder-shimmer {
  width: 100%;
  height: 100%;
  background: var(--b-image-placeholder-shimmer);
  background-size: 200% 100%;
  animation: b-image-shimmer 1.5s infinite;
  border-radius: var(--b-image-border-radius);
}

@keyframes b-image-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ─────────────────────────────────────────────
   Preview mask
   ───────────────────────────────────────────── */
.b-image__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--b-image-mask-bg);
  color: var(--b-image-mask-color);
  font-size: var(--b-image-mask-font-size);
  border-radius: var(--b-image-border-radius);
  opacity: 0;
  cursor: pointer;
  transition: opacity var(--b-image-transition-duration) ease;
  z-index: 2;
  outline: none;
}

.b-image--preview:hover .b-image__mask,
.b-image__mask:focus-visible {
  opacity: 1;
}

.b-image__mask:focus-visible {
  outline: var(--b-image-focus-ring);
  outline-offset: var(--b-image-focus-ring-offset);
}

.b-image__mask-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  user-select: none;
}

.b-image__mask-icon {
  width: var(--b-image-mask-icon-size);
  height: var(--b-image-mask-icon-size);
}

/* Invisible click target (mask=false, preview=true) */
.b-image__click-target {
  position: absolute;
  inset: 0;
  z-index: 2;
  cursor: pointer;
  outline: none;
}

.b-image__click-target:focus-visible {
  outline: var(--b-image-focus-ring);
  outline-offset: var(--b-image-focus-ring-offset);
}

/* ─────────────────────────────────────────────
   Error state
   ───────────────────────────────────────────── */
.b-image--error {
  background-color: var(--b-image-error-bg);
}

/* ─────────────────────────────────────────────
   Preview overlay
   ───────────────────────────────────────────── */
.b-image-preview {
  position: fixed;
  inset: 0;
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}

.b-image-preview--dragging {
  cursor: grabbing;
}

.b-image-preview__backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--b-image-preview-backdrop-bg);
}

.b-image-preview__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--b-image-preview-close-size);
  height: var(--b-image-preview-close-size);
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--b-image-preview-close-color);
  cursor: pointer;
  padding: 0;
  transition: background-color var(--b-image-preview-transition-duration) ease;
}

.b-image-preview__close:hover,
.b-image-preview__close:focus-visible {
  background-color: var(--b-image-preview-close-hover-bg);
}

.b-image-preview__close:focus-visible {
  outline: var(--b-image-focus-ring);
  outline-offset: var(--b-image-focus-ring-offset);
}

.b-image-preview__close svg {
  width: 20px;
  height: 20px;
}

.b-image-preview__body {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  padding: 40px;
  box-sizing: border-box;
  cursor: grab;
}

.b-image-preview--dragging .b-image-preview__body {
  cursor: grabbing;
}

.b-image-preview__img {
  max-width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
  transition: transform var(--b-image-preview-transition-duration) ease;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.b-image-preview--dragging .b-image-preview__img {
  transition: none;
}

/* ─────────────────────────────────────────────
   Toolbar
   ───────────────────────────────────────────── */
.b-image-preview__toolbar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--b-image-preview-toolbar-gap);
  padding: var(--b-image-preview-toolbar-padding);
  background-color: var(--b-image-preview-toolbar-bg);
  color: var(--b-image-preview-toolbar-color);
  border-radius: var(--b-image-preview-toolbar-radius);
  backdrop-filter: blur(8px);
}

.b-image-preview__toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--b-image-preview-toolbar-btn-size);
  height: var(--b-image-preview-toolbar-btn-size);
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  transition: background-color var(--b-image-preview-transition-duration) ease;
}

.b-image-preview__toolbar button:hover:not(:disabled),
.b-image-preview__toolbar button:focus-visible {
  background-color: var(--b-image-preview-close-hover-bg);
}

.b-image-preview__toolbar button:focus-visible {
  outline: var(--b-image-focus-ring);
  outline-offset: var(--b-image-focus-ring-offset);
}

.b-image-preview__toolbar button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.b-image-preview__toolbar button svg {
  width: var(--b-image-preview-toolbar-icon-size);
  height: var(--b-image-preview-toolbar-icon-size);
}

.b-image-preview__scale {
  font-size: var(--b-image-preview-scale-font-size);
  min-width: var(--b-image-preview-scale-min-width);
  text-align: center;
  font-variant-numeric: tabular-nums;
  user-select: none;
}

/* ─────────────────────────────────────────────
   Preview transitions
   ───────────────────────────────────────────── */
.b-image-preview-enter-active,
.b-image-preview-leave-active {
  transition: opacity var(--b-image-preview-transition-duration) ease;
}

.b-image-preview-enter-from,
.b-image-preview-leave-to {
  opacity: 0;
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-image {
    --b-image-transition-duration: 0ms;
  }

  .b-image-preview {
    --b-image-preview-transition-duration: 0ms;
  }

  .b-image__placeholder-shimmer {
    animation: none;
  }

  .b-image-preview-enter-active,
  .b-image-preview-leave-active {
    transition-duration: 0ms;
  }
}
</style>
