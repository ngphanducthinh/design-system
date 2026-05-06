<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  BTourPlacement,
  BTourType,
  type BTourArrowOptions,
  type BTourGapOptions,
  type BTourResolvedStep,
  type BTourScrollIntoViewOptions,
  type BTourStep,
} from './types.ts';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  steps = [],
  open = undefined,
  current = undefined,
  defaultCurrent = 0,
  arrow = true,
  placement = BTourPlacement.Bottom,
  type = BTourType.Default,
  mask = true,
  gap = { offset: 6, radius: 2 },
  zIndex = 1070,
  keyboard = true,
  scrollIntoViewOptions = true,
  getPopupContainer = undefined,
  closeIcon = true,
  disabledInteraction = false,
} = defineProps<{
  /** Array of step definition objects. */
  steps?: BTourStep[];
  /**
   * Controlled open state. Pair with `current` and `onChange`/`onClose`.
   * Omit to use uncontrolled mode.
   */
  open?: boolean;
  /**
   * Controlled current step index.
   * Omit to use uncontrolled mode.
   */
  current?: number;
  /** Initial step index in uncontrolled mode. @default 0 */
  defaultCurrent?: number;
  /** Show arrow on the popup. Pass `{ pointAtCenter: true }` to center it. */
  arrow?: boolean | BTourArrowOptions;
  /** Default placement for all steps (step-level overrides this). @default 'bottom' */
  placement?: `${BTourPlacement}`;
  /** Visual type variant. @default 'default' */
  type?: `${BTourType}`;
  /**
   * Mask overlay. `false` disables, `true` uses defaults,
   * or object `{ color, style }` for custom styling.
   */
  mask?: boolean | { style?: Record<string, string>; color?: string };
  /** Gap between highlight box and target element. */
  gap?: BTourGapOptions;
  /** z-index of the tour popup and mask. @default 1070 */
  zIndex?: number;
  /** Enable keyboard navigation (ArrowLeft/Right, Escape). @default true */
  keyboard?: boolean;
  /** Scroll target into view. Pass options object or `false` to disable. */
  scrollIntoViewOptions?: boolean | BTourScrollIntoViewOptions;
  /** Container element for the tour popup. Defaults to `document.body`. */
  getPopupContainer?: () => HTMLElement;
  /** Custom close icon. `false` hides the close button. */
  closeIcon?: boolean | string;
  /** Disable pointer interaction on the highlighted region. @default false */
  disabledInteraction?: boolean;
}>();

const emit = defineEmits<{
  /** Fired when the current step changes. */
  (e: 'change', current: number): void;
  /** Fired when the tour is closed (X button or Finish). */
  (e: 'close', current: number): void;
  /** Fires when open state changes (v-model:open). */
  (e: 'update:open', value: boolean): void;
  /** Fires when current step changes (v-model:current). */
  (e: 'update:current', value: number): void;
  /** Fired after the tour finishes (last step next). */
  (e: 'finish'): void;
}>();

defineSlots<{
  /** Override indicator dots/numbers rendering. Receives `{ current, total }`. */
  indicatorsRender?(props: { current: number; total: number }): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const internalOpen = ref(false);
const internalCurrent = ref(defaultCurrent);

const isControlledOpen = computed(() => open !== undefined);
const isControlledCurrent = computed(() => current !== undefined);

const isOpen = computed(() => (isControlledOpen.value ? open! : internalOpen.value));
const currentStep = computed(() =>
  isControlledCurrent.value ? current! : internalCurrent.value,
);

// ─────────────────────────────────────────────
// Derived step data
// ─────────────────────────────────────────────
const totalSteps = computed(() => steps.length);

const resolvedSteps = computed<BTourResolvedStep[]>(() =>
  steps.map((step, index) => {
    let resolvedTarget: HTMLElement | null = null;
    if (step.target) {
      if (typeof step.target === 'string') {
        resolvedTarget = document.querySelector<HTMLElement>(step.target);
      } else if (typeof step.target === 'function') {
        resolvedTarget = step.target();
      } else {
        resolvedTarget = step.target;
      }
    }
    return { ...step, resolvedTarget, index };
  }),
);

const activeStep = computed<BTourResolvedStep | undefined>(
  () => resolvedSteps.value[currentStep.value],
);

/** Effective placement for the current step (step overrides tour-level). */
const effectivePlacement = computed(
  () => activeStep.value?.placement ?? placement,
);

/** Effective arrow config for the current step. */
const effectiveArrow = computed(
  () => activeStep.value?.arrow ?? arrow,
);

const showArrow = computed(() => effectiveArrow.value !== false);

const arrowPointAtCenter = computed(
  () =>
    typeof effectiveArrow.value === 'object' && effectiveArrow.value.pointAtCenter,
);

/** Effective type for the current step. */
const effectiveType = computed(
  () => activeStep.value?.type ?? type,
);

/** Effective mask for the current step. */
const effectiveMask = computed(
  () => activeStep.value?.mask ?? mask,
);

const showMask = computed(() => effectiveMask.value !== false);

const maskColor = computed(() => {
  if (typeof effectiveMask.value === 'object' && effectiveMask.value.color) {
    return effectiveMask.value.color;
  }
  return undefined;
});

/** Whether to show the close button. */
const showCloseIcon = computed(() => {
  const stepClose = activeStep.value?.closeIcon;
  const val = stepClose !== undefined ? stepClose : closeIcon;
  return val !== false;
});

// ─────────────────────────────────────────────
// Highlight box (target element spotlight)
// ─────────────────────────────────────────────
interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

const highlightRect = ref<HighlightRect | null>(null);
const popupStyle = ref<Record<string, string>>({});

const gapOffset = computed(() => {
  const o = gap?.offset ?? 6;
  return Array.isArray(o) ? o : [o, o];
});
const gapRadius = computed(() => gap?.radius ?? 2);

function updateHighlight() {
  const step = activeStep.value;
  if (!step || !isOpen.value) {
    highlightRect.value = null;
    popupStyle.value = {};
    return;
  }

  const target = step.resolvedTarget;
  if (!target) {
    // Center the popup when no target
    highlightRect.value = null;
    popupStyle.value = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
    return;
  }

  const rect = target.getBoundingClientRect();
  const [offsetV, offsetH] = gapOffset.value;
  highlightRect.value = {
    top: rect.top - offsetV,
    left: rect.left - offsetH,
    width: rect.width + offsetH * 2,
    height: rect.height + offsetV * 2,
    radius: gapRadius.value,
  };

  // Position the popup relative to the highlight
  computePopupStyle(rect);
}

function computePopupStyle(rect: DOMRect) {
  const GAP = 12;
  const eff = effectivePlacement.value;
  const style: Record<string, string> = { position: 'fixed' };
  const [offsetV, offsetH] = gapOffset.value;

  const top = rect.top - offsetV;
  const bottom = rect.bottom + offsetV;
  const left = rect.left - offsetH;
  const right = rect.right + offsetH;
  const midX = rect.left + rect.width / 2;
  const midY = rect.top + rect.height / 2;

  switch (eff) {
    case BTourPlacement.Top:
      style.bottom = `${window.innerHeight - top + GAP}px`;
      style.left = `${midX}px`;
      style.transform = 'translateX(-50%)';
      break;
    case BTourPlacement.TopLeft:
      style.bottom = `${window.innerHeight - top + GAP}px`;
      style.left = `${left}px`;
      break;
    case BTourPlacement.TopRight:
      style.bottom = `${window.innerHeight - top + GAP}px`;
      style.right = `${window.innerWidth - right}px`;
      break;
    case BTourPlacement.Bottom:
      style.top = `${bottom + GAP}px`;
      style.left = `${midX}px`;
      style.transform = 'translateX(-50%)';
      break;
    case BTourPlacement.BottomLeft:
      style.top = `${bottom + GAP}px`;
      style.left = `${left}px`;
      break;
    case BTourPlacement.BottomRight:
      style.top = `${bottom + GAP}px`;
      style.right = `${window.innerWidth - right}px`;
      break;
    case BTourPlacement.Left:
      style.top = `${midY}px`;
      style.right = `${window.innerWidth - left + GAP}px`;
      style.transform = 'translateY(-50%)';
      break;
    case BTourPlacement.LeftTop:
      style.top = `${top}px`;
      style.right = `${window.innerWidth - left + GAP}px`;
      break;
    case BTourPlacement.LeftBottom:
      style.bottom = `${window.innerHeight - bottom}px`;
      style.right = `${window.innerWidth - left + GAP}px`;
      break;
    case BTourPlacement.Right:
      style.top = `${midY}px`;
      style.left = `${right + GAP}px`;
      style.transform = 'translateY(-50%)';
      break;
    case BTourPlacement.RightTop:
      style.top = `${top}px`;
      style.left = `${right + GAP}px`;
      break;
    case BTourPlacement.RightBottom:
      style.bottom = `${window.innerHeight - bottom}px`;
      style.left = `${right + GAP}px`;
      break;
    case BTourPlacement.Center:
      style.top = '50%';
      style.left = '50%';
      style.transform = 'translate(-50%, -50%)';
      break;
    default:
      style.top = `${bottom + GAP}px`;
      style.left = `${midX}px`;
      style.transform = 'translateX(-50%)';
  }

  popupStyle.value = style;
}

// ─────────────────────────────────────────────
// Arrow positioning class
// ─────────────────────────────────────────────
const arrowClass = computed(() => {
  if (!showArrow.value) return '';
  const eff = effectivePlacement.value;

  if ([BTourPlacement.Bottom, BTourPlacement.BottomLeft, BTourPlacement.BottomRight].includes(eff as BTourPlacement)) {
    return 'b-tour__arrow--top';
  }
  if ([BTourPlacement.Top, BTourPlacement.TopLeft, BTourPlacement.TopRight].includes(eff as BTourPlacement)) {
    return 'b-tour__arrow--bottom';
  }
  if ([BTourPlacement.Right, BTourPlacement.RightTop, BTourPlacement.RightBottom].includes(eff as BTourPlacement)) {
    return 'b-tour__arrow--left';
  }
  if ([BTourPlacement.Left, BTourPlacement.LeftTop, BTourPlacement.LeftBottom].includes(eff as BTourPlacement)) {
    return 'b-tour__arrow--right';
  }
  return '';
});

// ─────────────────────────────────────────────
// Open / close helpers
// ─────────────────────────────────────────────
function doOpen() {
  if (isControlledOpen.value) {
    emit('update:open', true);
  } else {
    internalOpen.value = true;
  }
}

function doClose() {
  emit('close', currentStep.value);
  if (isControlledOpen.value) {
    emit('update:open', false);
  } else {
    internalOpen.value = false;
  }
}

function setCurrentStep(step: number) {
  emit('change', step);
  if (isControlledCurrent.value) {
    emit('update:current', step);
  } else {
    internalCurrent.value = step;
  }
}

function goNext() {
  if (currentStep.value >= totalSteps.value - 1) {
    emit('finish');
    doClose();
    return;
  }
  setCurrentStep(currentStep.value + 1);
}

function goPrev() {
  if (currentStep.value <= 0) return;
  setCurrentStep(currentStep.value - 1);
}

// ─────────────────────────────────────────────
// Scroll target into view
// ─────────────────────────────────────────────
function scrollIntoView(el: HTMLElement) {
  const opt = activeStep.value?.scrollIntoViewOptions ?? scrollIntoViewOptions;
  if (opt === false) return;
  const options: ScrollIntoViewOptions =
    typeof opt === 'object'
      ? (opt as ScrollIntoViewOptions)
      : { behavior: 'smooth', block: 'center', inline: 'nearest' };
  el.scrollIntoView(options);
}

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
let previouslyFocused: HTMLElement | null = null;
const popupRef = ref<HTMLDivElement | null>(null);

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusFirst() {
  nextTick(() => {
    if (!popupRef.value) return;
    const first = popupRef.value.querySelector<HTMLElement>(focusableSelector);
    if (first) {
      first.focus();
    } else {
      popupRef.value.focus();
    }
  });
}

function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !popupRef.value) return;
  const focusable = Array.from(
    popupRef.value.querySelectorAll<HTMLElement>(focusableSelector),
  );
  if (focusable.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// ─────────────────────────────────────────────
// Keyboard navigation
// ─────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (!keyboard) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    doClose();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    goNext();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goPrev();
  }
  trapFocus(e);
}

// ─────────────────────────────────────────────
// Resize / scroll → update highlight
// ─────────────────────────────────────────────
let resizeObserver: ResizeObserver | null = null;
let targetObserver: ResizeObserver | null = null;

function observeTarget(el: HTMLElement | null) {
  targetObserver?.disconnect();
  if (!el) return;
  targetObserver = new ResizeObserver(updateHighlight);
  targetObserver.observe(el);
}

function onScrollOrResize() {
  if (isOpen.value) updateHighlight();
}

onMounted(() => {
  resizeObserver = new ResizeObserver(onScrollOrResize);
  resizeObserver.observe(document.documentElement);
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  targetObserver?.disconnect();
  window.removeEventListener('scroll', onScrollOrResize);
});

// ─────────────────────────────────────────────
// Watchers
// ─────────────────────────────────────────────
watch(
  [isOpen, currentStep],
  ([open]) => {
    if (!open) {
      highlightRect.value = null;
      popupStyle.value = {};
      targetObserver?.disconnect();
      nextTick(() => previouslyFocused?.focus());
      return;
    }
    const step = resolvedSteps.value[currentStep.value];
    if (step?.resolvedTarget) {
      scrollIntoView(step.resolvedTarget);
      observeTarget(step.resolvedTarget);
    }
    nextTick(() => {
      updateHighlight();
      if (open) {
        previouslyFocused = document.activeElement as HTMLElement | null;
        focusFirst();
      }
    });
  },
  { immediate: true, flush: 'post' },
);

// ─────────────────────────────────────────────
// SVG mask clip-path (spotlight cutout)
// ─────────────────────────────────────────────
const maskId = `b-tour-mask-${Math.random().toString(36).slice(2, 9)}`;

const svgViewBox = computed(() => {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  return `0 0 ${vw} ${vh}`;
});

const maskStyle = computed<Record<string, string>>(() => {
  if (typeof effectiveMask.value === 'object' && effectiveMask.value.style) {
    return effectiveMask.value.style;
  }
  return {};
});

// ─────────────────────────────────────────────
// Cover image helpers
// ─────────────────────────────────────────────
const hasCover = computed(() => Boolean(activeStep.value?.cover));
</script>

<template>
  <Teleport to="body">
    <Transition name="b-tour-fade">
      <div
        v-if="isOpen && totalSteps > 0"
        class="b-tour"
        :class="[`b-tour--${effectiveType}`]"
        :style="{ '--b-tour-z-index': String(zIndex) }"
        role="dialog"
        aria-modal="true"
        :aria-label="activeStep?.title"
      >
        <!-- ── Mask overlay (SVG spotlight) ── -->
        <svg
          v-if="showMask"
          class="b-tour__mask"
          :style="[{ zIndex: zIndex - 1 }, maskStyle]"
          xmlns="http://www.w3.org/2000/svg"
          :viewBox="svgViewBox"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask :id="maskId">
              <!-- White = visible (full viewport) -->
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <!-- Black = transparent cutout (target spotlight) -->
              <rect
                v-if="highlightRect"
                :x="highlightRect.left"
                :y="highlightRect.top"
                :width="highlightRect.width"
                :height="highlightRect.height"
                :rx="highlightRect.radius"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            :fill="maskColor ?? 'var(--b-tour-mask-bg)'"
            :mask="`url(#${maskId})`"
            :style="{ pointerEvents: disabledInteraction ? 'all' : 'none' }"
          />
        </svg>

        <!-- ── Highlight border around target ── -->
        <div
          v-if="highlightRect"
          class="b-tour__spotlight"
          :style="{
            top: `${highlightRect.top}px`,
            left: `${highlightRect.left}px`,
            width: `${highlightRect.width}px`,
            height: `${highlightRect.height}px`,
            borderRadius: `${highlightRect.radius}px`,
            zIndex: zIndex - 1,
            pointerEvents: disabledInteraction ? 'none' : 'auto',
          }"
          aria-hidden="true"
        />

        <!-- ── Popup card ── -->
        <div
          ref="popupRef"
          class="b-tour__popup"
          :class="[
            `b-tour__popup--${effectivePlacement}`,
            { 'b-tour__popup--no-arrow': !showArrow || !highlightRect },
          ]"
          :style="[{ zIndex }, popupStyle]"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <!-- Arrow -->
          <div
            v-if="showArrow && highlightRect && arrowClass"
            class="b-tour__arrow"
            :class="[arrowClass, { 'b-tour__arrow--center': arrowPointAtCenter }]"
            aria-hidden="true"
          />

          <!-- Cover media -->
          <div v-if="hasCover" class="b-tour__cover">
            <img
              v-if="typeof activeStep?.cover === 'string'"
              :src="activeStep.cover"
              class="b-tour__cover-img"
              alt=""
              aria-hidden="true"
            />
            <slot v-else name="cover" />
          </div>

          <!-- Header -->
          <div class="b-tour__header">
            <h4 class="b-tour__title">
              {{ activeStep?.title }}
            </h4>

            <!-- Close button -->
            <button
              v-if="showCloseIcon"
              type="button"
              class="b-tour__close"
              aria-label="Close tour"
              @click="doClose"
            >
              <svg
                v-if="closeIcon === true || activeStep?.closeIcon === true || activeStep?.closeIcon === undefined"
                class="b-tour__close-icon"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              <span v-else>{{ typeof closeIcon === 'string' ? closeIcon : '✕' }}</span>
            </button>
          </div>

          <!-- Description -->
          <div v-if="activeStep?.description" class="b-tour__description">
            {{ activeStep.description }}
          </div>

          <!-- Footer -->
          <div class="b-tour__footer">
            <!-- Indicators -->
            <div class="b-tour__indicators" aria-label="Step progress">
              <slot
                name="indicatorsRender"
                :current="currentStep"
                :total="totalSteps"
              >
                <span
                  v-for="(_, i) in steps"
                  :key="i"
                  class="b-tour__indicator"
                  :class="{ 'b-tour__indicator--active': i === currentStep }"
                  role="presentation"
                  :aria-current="i === currentStep ? 'step' : undefined"
                />
              </slot>
            </div>

            <!-- Actions -->
            <div class="b-tour__actions">
              <!-- Prev button -->
              <button
                v-if="currentStep > 0"
                type="button"
                class="b-tour__btn b-tour__btn--prev"
                v-bind="activeStep?.prevButtonProps ?? {}"
                @click="() => { activeStep?.prevButtonProps?.onClick?.(); goPrev(); }"
              >
                {{ activeStep?.prevButtonProps?.children ?? 'Previous' }}
              </button>

              <!-- Next / Finish button -->
              <button
                type="button"
                class="b-tour__btn b-tour__btn--next"
                v-bind="activeStep?.nextButtonProps ?? {}"
                @click="() => { activeStep?.nextButtonProps?.onClick?.(); goNext(); }"
              >
                {{
                  activeStep?.nextButtonProps?.children ??
                  (currentStep >= totalSteps - 1 ? 'Finish' : 'Next')
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* ────────────────────────────────────────────
   Design tokens — scoped to component root
   (Never on :root — always on .b-tour)
   ──────────────────────────────────────────── */
.b-tour {
  /* AntD token: zIndexPopup → 1070 */
  --b-tour-z-index: 1070;

  /* AntD token: closeBtnSize → 22px */
  --b-tour-close-btn-size: 22px;

  /* AntD token: primaryNextBtnHoverBg → rgb(240,240,240) */
  --b-tour-primary-next-btn-hover-bg: rgb(240, 240, 240);

  /* AntD token: primaryPrevBtnBg → rgba(255,255,255,0.15) */
  --b-tour-primary-prev-btn-bg: rgba(255, 255, 255, 0.15);

  /* Extended tokens for full component coverage */
  --b-tour-popup-bg: #fff;
  --b-tour-popup-color: oklch(25% 0 0);
  --b-tour-popup-font-size: 0.875rem;
  --b-tour-popup-line-height: 1.5;
  --b-tour-popup-border-radius: 0.5rem;
  --b-tour-popup-max-width: 320px;
  --b-tour-popup-min-width: 220px;
  --b-tour-popup-padding: 1rem;
  --b-tour-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  --b-tour-title-font-size: 1rem;
  --b-tour-title-font-weight: 600;
  --b-tour-title-color: oklch(15% 0 0);

  --b-tour-description-color: oklch(35% 0 0);
  --b-tour-description-font-size: 0.875rem;

  --b-tour-mask-bg: rgba(0, 0, 0, 0.45);

  --b-tour-arrow-size: 10px;
  --b-tour-arrow-bg: #fff;

  --b-tour-indicator-size: 6px;
  --b-tour-indicator-bg: oklch(80% 0 0);
  --b-tour-indicator-active-bg: oklch(55% 0.169 237.323); /* primary */

  --b-tour-btn-font-size: 0.875rem;
  --b-tour-btn-border-radius: 0.375rem;
  --b-tour-btn-padding: 0.25rem 0.75rem;

  --b-tour-next-btn-bg: oklch(55% 0.169 237.323);
  --b-tour-next-btn-color: #fff;
  --b-tour-next-btn-hover-bg: oklch(48% 0.158 241.966);

  --b-tour-prev-btn-bg: transparent;
  --b-tour-prev-btn-color: oklch(35% 0 0);
  --b-tour-prev-btn-border: 1px solid oklch(80% 0 0);
  --b-tour-prev-btn-hover-bg: oklch(96% 0 0);

  --b-tour-close-color: oklch(55% 0 0);
  --b-tour-close-hover-color: oklch(25% 0 0);

  --b-tour-cover-border-radius: 0.5rem 0.5rem 0 0;

  --b-tour-transition-duration: 250ms;

  /* Primary type overrides */
  --b-tour-primary-popup-bg: oklch(55% 0.169 237.323);
  --b-tour-primary-title-color: #fff;
  --b-tour-primary-description-color: rgba(255, 255, 255, 0.85);
  --b-tour-primary-close-color: rgba(255, 255, 255, 0.75);
  --b-tour-primary-close-hover-color: #fff;
  --b-tour-primary-indicator-bg: rgba(255, 255, 255, 0.4);
  --b-tour-primary-indicator-active-bg: #fff;
  --b-tour-primary-arrow-bg: oklch(55% 0.169 237.323);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-tour {
  --b-tour-popup-bg: oklch(22% 0 0);
  --b-tour-popup-color: oklch(90% 0 0);
  --b-tour-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.32),
    0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-tour-title-color: oklch(95% 0 0);
  --b-tour-description-color: oklch(72% 0 0);
  --b-tour-mask-bg: rgba(0, 0, 0, 0.65);
  --b-tour-arrow-bg: oklch(22% 0 0);
  --b-tour-indicator-bg: oklch(40% 0 0);
  --b-tour-prev-btn-color: oklch(85% 0 0);
  --b-tour-prev-btn-border: 1px solid oklch(35% 0 0);
  --b-tour-prev-btn-hover-bg: oklch(30% 0 0);
  --b-tour-close-color: oklch(65% 0 0);
  --b-tour-close-hover-color: oklch(90% 0 0);
}

/* ─────────────────────────────────────────────
   Tour container (fullscreen overlay wrapper)
   ───────────────────────────────────────────── */
.b-tour {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: var(--b-tour-z-index);
}

/* ─────────────────────────────────────────────
   Mask (SVG spotlight overlay)
   ───────────────────────────────────────────── */
.b-tour__mask {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ─────────────────────────────────────────────
   Spotlight border ring
   ───────────────────────────────────────────── */
.b-tour__spotlight {
  position: fixed;
  box-shadow: 0 0 0 9999px transparent;
  box-sizing: border-box;
  pointer-events: auto;
}

/* ─────────────────────────────────────────────
   Popup card
   ───────────────────────────────────────────── */
.b-tour__popup {
  position: fixed;
  background: var(--b-tour-popup-bg);
  color: var(--b-tour-popup-color);
  font-size: var(--b-tour-popup-font-size);
  line-height: var(--b-tour-popup-line-height);
  border-radius: var(--b-tour-popup-border-radius);
  box-shadow: var(--b-tour-popup-shadow);
  max-width: var(--b-tour-popup-max-width);
  min-width: var(--b-tour-popup-min-width);
  width: max-content;
  box-sizing: border-box;
  pointer-events: auto;
  outline: none;
}

/* ─────────────────────────────────────────────
   Arrow
   ───────────────────────────────────────────── */
.b-tour__arrow {
  position: absolute;
  width: var(--b-tour-arrow-size);
  height: var(--b-tour-arrow-size);
  background: var(--b-tour-arrow-bg);
  transform: rotate(45deg);
  pointer-events: none;
  z-index: 1;
}

/* Arrow positions: which edge of the popup the arrow sits on */
.b-tour__arrow--top {
  top: calc(var(--b-tour-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-tour-arrow-size) / -2);
}
.b-tour__arrow--bottom {
  bottom: calc(var(--b-tour-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-tour-arrow-size) / -2);
}
.b-tour__arrow--left {
  left: calc(var(--b-tour-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-tour-arrow-size) / -2);
}
.b-tour__arrow--right {
  right: calc(var(--b-tour-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-tour-arrow-size) / -2);
}

/* Center arrow along axis */
.b-tour__arrow--center {
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

/* ─────────────────────────────────────────────
   Cover image
   ───────────────────────────────────────────── */
.b-tour__cover {
  border-radius: var(--b-tour-cover-border-radius);
  overflow: hidden;
  margin: 0;
}

.b-tour__cover-img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* ─────────────────────────────────────────────
   Header (title + close)
   ───────────────────────────────────────────── */
.b-tour__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: var(--b-tour-popup-padding) var(--b-tour-popup-padding) 0;
}

.b-tour__title {
  flex: 1;
  margin: 0;
  font-size: var(--b-tour-title-font-size);
  font-weight: var(--b-tour-title-font-weight);
  color: var(--b-tour-title-color);
  line-height: 1.4;
}

/* ─────────────────────────────────────────────
   Close button
   ───────────────────────────────────────────── */
.b-tour__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--b-tour-close-btn-size);
  height: var(--b-tour-close-btn-size);
  padding: 0;
  margin-top: 0.1em;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--b-tour-close-color);
  cursor: pointer;
  transition: color var(--b-tour-transition-duration) ease;
}

.b-tour__close:hover {
  color: var(--b-tour-close-hover-color);
}

.b-tour__close:focus-visible {
  outline: 2px solid var(--b-tour-next-btn-bg);
  outline-offset: 2px;
}

.b-tour__close-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: block;
}

/* ─────────────────────────────────────────────
   Description
   ───────────────────────────────────────────── */
.b-tour__description {
  padding: 0.5rem var(--b-tour-popup-padding);
  font-size: var(--b-tour-description-font-size);
  color: var(--b-tour-description-color);
  line-height: var(--b-tour-popup-line-height);
}

/* ─────────────────────────────────────────────
   Footer (indicators + actions)
   ───────────────────────────────────────────── */
.b-tour__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem var(--b-tour-popup-padding) var(--b-tour-popup-padding);
  gap: 0.75rem;
}

/* ── Indicators ── */
.b-tour__indicators {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.b-tour__indicator {
  display: inline-block;
  width: var(--b-tour-indicator-size);
  height: var(--b-tour-indicator-size);
  border-radius: 50%;
  background: var(--b-tour-indicator-bg);
  transition: background var(--b-tour-transition-duration) ease,
    width var(--b-tour-transition-duration) ease;
}

.b-tour__indicator--active {
  background: var(--b-tour-indicator-active-bg);
  width: calc(var(--b-tour-indicator-size) * 2.5);
  border-radius: calc(var(--b-tour-indicator-size) / 2);
}

/* ── Actions ── */
.b-tour__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

/* ── Buttons ── */
.b-tour__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--b-tour-btn-padding);
  border-radius: var(--b-tour-btn-border-radius);
  font-size: var(--b-tour-btn-font-size);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--b-tour-transition-duration) ease,
    color var(--b-tour-transition-duration) ease;
  white-space: nowrap;
}

.b-tour__btn:focus-visible {
  outline: 2px solid var(--b-tour-next-btn-bg);
  outline-offset: 2px;
}

.b-tour__btn--prev {
  background: var(--b-tour-prev-btn-bg);
  color: var(--b-tour-prev-btn-color);
  border: var(--b-tour-prev-btn-border);
}

.b-tour__btn--prev:hover {
  background: var(--b-tour-prev-btn-hover-bg);
}

.b-tour__btn--next {
  background: var(--b-tour-next-btn-bg);
  color: var(--b-tour-next-btn-color);
  border: none;
}

.b-tour__btn--next:hover {
  background: var(--b-tour-next-btn-hover-bg);
}

/* ─────────────────────────────────────────────
   Primary type variant
   ───────────────────────────────────────────── */
.b-tour--primary .b-tour__popup {
  background: var(--b-tour-primary-popup-bg);
}

.b-tour--primary .b-tour__title {
  color: var(--b-tour-primary-title-color);
}

.b-tour--primary .b-tour__description {
  color: var(--b-tour-primary-description-color);
}

.b-tour--primary .b-tour__close {
  color: var(--b-tour-primary-close-color);
}

.b-tour--primary .b-tour__close:hover {
  color: var(--b-tour-primary-close-hover-color);
}

.b-tour--primary .b-tour__indicator {
  background: var(--b-tour-primary-indicator-bg);
}

.b-tour--primary .b-tour__indicator--active {
  background: var(--b-tour-primary-indicator-active-bg);
}

.b-tour--primary .b-tour__arrow {
  background: var(--b-tour-primary-arrow-bg);
}

.b-tour--primary .b-tour__btn--prev {
  background: var(--b-tour-primary-prev-btn-bg);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.b-tour--primary .b-tour__btn--prev:hover {
  background: rgba(255, 255, 255, 0.25);
}

.b-tour--primary .b-tour__btn--next {
  background: #fff;
  color: oklch(55% 0.169 237.323);
}

.b-tour--primary .b-tour__btn--next:hover {
  background: var(--b-tour-primary-next-btn-hover-bg);
}

/* ─────────────────────────────────────────────
   Transition
   ───────────────────────────────────────────── */
.b-tour-fade-enter-active,
.b-tour-fade-leave-active {
  transition: opacity var(--b-tour-transition-duration) ease;
}

.b-tour-fade-enter-from,
.b-tour-fade-leave-to {
  opacity: 0;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-tour-fade-enter-active,
  .b-tour-fade-leave-active {
    transition-duration: 0ms;
  }

  .b-tour__indicator,
  .b-tour__btn,
  .b-tour__close {
    transition-duration: 0ms;
  }
}
</style>
