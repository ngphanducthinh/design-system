<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text,
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  useSlots,
  watch,
  type PropType,
  type VNode,
} from 'vue';

import type {
  BCarouselAutoplayConfig,
  BCarouselDotPlacement,
  BCarouselEffect,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  modelValue,
  defaultActiveIndex = 0,
  arrows = false,
  autoplay = false,
  autoplaySpeed = 3000,
  adaptiveHeight = false,
  dotPlacement = 'bottom',
  dots = true,
  dotsClassName,
  draggable = false,
  fade = false,
  effect,
  infinite = true,
  speed = 500,
  easing = 'linear',
  waitForAnimate = false,
  pauseOnHover = true,
  ariaLabel = 'Carousel',
} = defineProps<{
  /**
   * Active slide index (controlled). Pair with `v-model` for two-way binding.
   * When omitted, the component manages its own state starting from
   * `defaultActiveIndex`.
   */
  modelValue?: number;
  /**
   * Initial active slide index (uncontrolled).
   * @default 0
   */
  defaultActiveIndex?: number;
  /**
   * Show prev/next navigation arrows.
   * @default false
   */
  arrows?: boolean;
  /**
   * Auto-advance to the next slide. Pass an object `{ dotDuration: true }` to
   * also display a filling progress bar inside the active dot.
   * @default false
   */
  autoplay?: boolean | BCarouselAutoplayConfig;
  /**
   * Milliseconds between automatic slide transitions (when autoplay is on).
   * @default 3000
   */
  autoplaySpeed?: number;
  /**
   * When true, the viewport height tracks the active slide's height.
   * @default false
   */
  adaptiveHeight?: boolean;
  /**
   * Position of the dots indicator relative to the viewport.
   * @default 'bottom'
   */
  dotPlacement?: BCarouselDotPlacement;
  /**
   * Whether to render the dot indicators.
   * @default true
   */
  dots?: boolean;
  /** Optional CSS class added to the dots list. */
  dotsClassName?: string;
  /**
   * Allow dragging slides with the pointer (mouse / touch).
   * @default false
   */
  draggable?: boolean;
  /**
   * Use the fade effect instead of horizontal scroll. Convenience for
   * `effect="fade"`.
   * @default false
   */
  fade?: boolean;
  /**
   * Transition effect. Overrides the `fade` shorthand when specified.
   * @default 'scrollx'
   */
  effect?: BCarouselEffect;
  /**
   * When true (default), navigation wraps around at the edges.
   * @default true
   */
  infinite?: boolean;
  /**
   * Transition duration in milliseconds.
   * @default 500
   */
  speed?: number;
  /**
   * CSS easing function used for the slide transition.
   * @default 'linear'
   */
  easing?: string;
  /**
   * When true, navigation requests during an in-flight transition are ignored
   * until the previous transition completes.
   * @default false
   */
  waitForAnimate?: boolean;
  /**
   * Pause autoplay while the pointer hovers over the carousel.
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Accessible label applied to the carousel root region.
   * @default 'Carousel'
   */
  ariaLabel?: string;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Two-way binding update for the active slide index. */
  (e: 'update:modelValue', index: number): void;
  /** Fires AFTER the transition to the new slide completes. */
  (e: 'change', index: number): void;
  /** AntD-aligned alias of `change`. */
  (e: 'afterChange', index: number): void;
  /** Fires BEFORE the transition begins. */
  (e: 'beforeChange', current: number, next: number): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Slides - each immediate child becomes one slide. */
  default?(): unknown;
  /** Custom previous-arrow content. */
  prevArrow?(): unknown;
  /** Custom next-arrow content. */
  nextArrow?(): unknown;
  /** Custom dot renderer. Receives `{ index, active }`. */
  dot?(props: { index: number; active: boolean }): unknown;
}>();

// ─────────────────────────────────────────────
// Slot → slide vnode flattening
// ─────────────────────────────────────────────
const slots = useSlots();

function flattenSlideVnodes(vnodes: readonly VNode[] = []): VNode[] {
  const out: VNode[] = [];
  for (const v of vnodes) {
    if (!v) continue;
    if (v.type === Comment) continue;
    if (
      v.type === Text &&
      typeof v.children === 'string' &&
      v.children.trim() === ''
    ) {
      continue;
    }
    if (v.type === Fragment) {
      out.push(...flattenSlideVnodes(v.children as VNode[]));
    } else {
      out.push(v);
    }
  }
  return out;
}

// slideCount is updated at render time by SlideTrack so that subsequent
// reads (autoplay watcher, navigation) don't invoke the default slot outside
// the render function. Initial value is derived once at setup so that dots
// and arrows render synchronously on first mount.
const slideCount = ref(flattenSlideVnodes(slots.default?.() ?? []).length);

const SlideTrack = defineComponent({
  name: 'BCarouselTrack',
  inheritAttrs: false,
  props: {
    activeIndex: { type: Number, required: true },
    total: { type: Number, required: true },
    slideId: {
      type: Function as PropType<(i: number) => string>,
      required: true,
    },
    trackStyle: { type: Object, default: undefined },
  },
  setup(props, { slots: childSlots }) {
    return () => {
      const children = flattenSlideVnodes(childSlots.default?.());
      // sync count back to parent (post-render to avoid mid-render mutation)
      if (children.length !== slideCount.value) {
        Promise.resolve().then(() => {
          slideCount.value = children.length;
        });
      }
      return h(
        'div',
        { class: 'b-carousel__track', style: props.trackStyle },
        children.map((vnode, i) =>
          h(
            'div',
            {
              id: props.slideId(i),
              class: [
                'b-carousel__slide',
                {
                  'b-carousel__slide--active': i === props.activeIndex,
                },
              ],
              role: 'group',
              'aria-roledescription': 'slide',
              'aria-label': `${i + 1} of ${children.length}`,
              'aria-hidden': i !== props.activeIndex ? 'true' : undefined,
              inert: i !== props.activeIndex ? '' : undefined,
            },
            [vnode],
          ),
        ),
      );
    };
  },
});

// ─────────────────────────────────────────────
// Effective effect (fade shorthand)
// ─────────────────────────────────────────────
const effectiveEffect = computed<BCarouselEffect>(
  () => effect ?? (fade ? 'fade' : 'scrollx'),
);

// ─────────────────────────────────────────────
// Active index state (controlled vs uncontrolled)
// ─────────────────────────────────────────────
const isControlled = computed(() => modelValue !== undefined);
const internalIndex = ref<number>(
  Math.max(0, Math.min(defaultActiveIndex, Math.max(0, slideCount.value - 1))),
);

const activeIndex = computed(() =>
  isControlled.value ? modelValue! : internalIndex.value,
);

// Clamp when slides change
watch(slideCount, (n) => {
  if (n === 0) return;
  if (internalIndex.value >= n) {
    internalIndex.value = n - 1;
  }
});

watch(
  () => modelValue,
  (val) => {
    if (val !== undefined && val !== internalIndex.value) {
      internalIndex.value = val;
    }
  },
);

// ─────────────────────────────────────────────
// IDs (a11y)
// ─────────────────────────────────────────────
const uid = useId();
const slideId = (i: number) => `${uid}-slide-${i}`;
const dotId = (i: number) => `${uid}-dot-${i}`;

// ─────────────────────────────────────────────
// Animation state
// ─────────────────────────────────────────────
const isAnimating = ref(false);
let animationTimer: ReturnType<typeof setTimeout> | null = null;

function setAnimating() {
  isAnimating.value = true;
  if (animationTimer) clearTimeout(animationTimer);
  animationTimer = setTimeout(() => {
    isAnimating.value = false;
    animationTimer = null;
  }, speed);
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
function setIndex(target: number, dontAnimate = false) {
  if (slideCount.value === 0) return;
  if (waitForAnimate && isAnimating.value) return;

  let next = target;
  if (infinite) {
    next = ((target % slideCount.value) + slideCount.value) % slideCount.value;
  } else {
    next = Math.max(0, Math.min(target, slideCount.value - 1));
  }

  const current = activeIndex.value;
  if (next === current) return;

  emit('beforeChange', current, next);

  if (!isControlled.value) {
    internalIndex.value = next;
  }
  emit('update:modelValue', next);

  if (!dontAnimate) {
    setAnimating();
  }

  // afterChange fires once the transition finishes (or immediately when not animating)
  const fire = () => {
    emit('change', next);
    emit('afterChange', next);
  };
  if (dontAnimate) {
    fire();
  } else {
    setTimeout(fire, speed);
  }
}

function goTo(idx: number, dontAnimate = false) {
  setIndex(idx, dontAnimate);
}

function next() {
  setIndex(activeIndex.value + 1);
}

function prev() {
  setIndex(activeIndex.value - 1);
}

defineExpose({ goTo, next, prev });

// ─────────────────────────────────────────────
// Autoplay
// ─────────────────────────────────────────────
const autoplayEnabled = computed(() =>
  typeof autoplay === 'object' ? true : !!autoplay,
);
const showDotProgress = computed(
  () =>
    typeof autoplay === 'object' &&
    autoplay !== null &&
    autoplay.dotDuration === true,
);

let autoplayTimer: ReturnType<typeof setTimeout> | null = null;
const isPaused = ref(false);

function clearAutoplay() {
  if (autoplayTimer) {
    clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
}

function scheduleAutoplay() {
  clearAutoplay();
  if (!autoplayEnabled.value || isPaused.value || slideCount.value <= 1) return;
  if (!infinite && activeIndex.value >= slideCount.value - 1) return;
  autoplayTimer = setTimeout(() => {
    next();
  }, autoplaySpeed);
}

watch(
  [autoplayEnabled, isPaused, activeIndex, slideCount],
  () => {
    if (typeof window === 'undefined') return;
    scheduleAutoplay();
  },
  { flush: 'post' },
);

onMounted(() => {
  scheduleAutoplay();
});

onBeforeUnmount(() => {
  clearAutoplay();
  if (animationTimer) clearTimeout(animationTimer);
});

function onMouseEnter() {
  if (pauseOnHover && autoplayEnabled.value) isPaused.value = true;
}
function onMouseLeave() {
  if (pauseOnHover && autoplayEnabled.value) isPaused.value = false;
}

// ─────────────────────────────────────────────
// Drag-to-scroll
// ─────────────────────────────────────────────
const dragState = ref<{
  active: boolean;
  startX: number;
  deltaX: number;
  width: number;
  pointerId: number | null;
}>({ active: false, startX: 0, deltaX: 0, width: 0, pointerId: null });

const viewportRef = ref<HTMLElement | null>(null);

function onPointerDown(e: PointerEvent) {
  if (!draggable || slideCount.value <= 1) return;
  // ignore non-primary buttons
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const target = viewportRef.value;
  if (!target) return;
  dragState.value = {
    active: true,
    startX: e.clientX,
    deltaX: 0,
    width: target.clientWidth || 1,
    pointerId: e.pointerId,
  };
  try {
    target.setPointerCapture(e.pointerId);
  } catch {
    // ignore (jsdom)
  }
}

function onPointerMove(e: PointerEvent) {
  if (!dragState.value.active) return;
  if (
    dragState.value.pointerId !== null &&
    e.pointerId !== dragState.value.pointerId
  )
    return;
  dragState.value.deltaX = e.clientX - dragState.value.startX;
}

function onPointerUp(e: PointerEvent) {
  if (!dragState.value.active) return;
  const { deltaX, width } = dragState.value;
  const threshold = Math.max(40, width * 0.15);
  if (deltaX <= -threshold) {
    next();
  } else if (deltaX >= threshold) {
    prev();
  }
  dragState.value = {
    active: false,
    startX: 0,
    deltaX: 0,
    width: 0,
    pointerId: null,
  };
  const target = viewportRef.value;
  if (target) {
    try {
      target.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }
}

// ─────────────────────────────────────────────
// Keyboard navigation on the dots tablist
// ─────────────────────────────────────────────
function onDotsKeydown(e: KeyboardEvent) {
  if (slideCount.value === 0) return;
  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      next();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prev();
      break;
    case 'Home':
      e.preventDefault();
      goTo(0);
      break;
    case 'End':
      e.preventDefault();
      goTo(slideCount.value - 1);
      break;
  }
}

// ─────────────────────────────────────────────
// Computed styles & classes
// ─────────────────────────────────────────────
const isHorizontalEffect = computed(() => effectiveEffect.value === 'scrollx');

const trackStyle = computed(() => {
  if (!isHorizontalEffect.value) return undefined;
  const base = -(activeIndex.value * 100);
  const dragOffsetPct =
    dragState.value.active && dragState.value.width > 0
      ? (dragState.value.deltaX / dragState.value.width) * 100
      : 0;
  return {
    transform: `translate3d(${base + dragOffsetPct}%, 0, 0)`,
    transitionDuration: dragState.value.active
      ? '0ms'
      : `var(--b-carousel-speed)`,
    transitionTimingFunction: 'var(--b-carousel-easing)',
  };
});

const rootStyle = computed<Record<string, string>>(() => ({
  '--b-carousel-speed': `${speed}ms`,
  '--b-carousel-easing': easing,
  '--b-carousel-autoplay-duration': `${autoplaySpeed}ms`,
}));

const rootClasses = computed(() => [
  'b-carousel',
  `b-carousel--effect-${effectiveEffect.value}`,
  `b-carousel--dots-${dotPlacement}`,
  {
    'b-carousel--arrows': arrows,
    'b-carousel--draggable': draggable,
    'b-carousel--adaptive-height': adaptiveHeight,
    'b-carousel--no-dots': !dots,
    'b-carousel--dragging': dragState.value.active,
  },
]);

const canPrev = computed(() => infinite || activeIndex.value > 0);
const canNext = computed(
  () => infinite || activeIndex.value < slideCount.value - 1,
);
</script>

<template>
  <section
    :class="rootClasses"
    :style="rootStyle"
    role="region"
    :aria-label="ariaLabel"
    aria-roledescription="carousel"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- ── Viewport ── -->
    <div
      ref="viewportRef"
      class="b-carousel__viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <SlideTrack
        :active-index="activeIndex"
        :total="slideCount"
        :slide-id="slideId"
        :track-style="trackStyle"
      >
        <slot />
      </SlideTrack>
    </div>

    <!-- ── Arrows ── -->
    <template v-if="arrows && slideCount > 1">
      <button
        type="button"
        class="b-carousel__arrow b-carousel__arrow--prev"
        :disabled="!canPrev"
        :aria-disabled="!canPrev || undefined"
        aria-label="Previous slide"
        @click="prev"
      >
        <slot name="prevArrow">
          <svg
            class="b-carousel__arrow-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M10.354 3.646a.5.5 0 0 1 0 .708L6.707 8l3.647 3.646a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0z"
            />
          </svg>
        </slot>
      </button>
      <button
        type="button"
        class="b-carousel__arrow b-carousel__arrow--next"
        :disabled="!canNext"
        :aria-disabled="!canNext || undefined"
        aria-label="Next slide"
        @click="next"
      >
        <slot name="nextArrow">
          <svg
            class="b-carousel__arrow-icon"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M5.646 3.646a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L9.293 8 5.646 4.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        </slot>
      </button>
    </template>

    <!-- ── Live region (announces active slide change) ── -->
    <div class="b-carousel__sr-only" aria-live="polite" aria-atomic="true">
      Slide {{ activeIndex + 1 }} of {{ slideCount }}
    </div>

    <!-- ── Dots ── -->
    <div
      v-if="dots && slideCount > 1"
      class="b-carousel__dots"
      :class="dotsClassName"
      role="tablist"
      :aria-label="`${ariaLabel} pagination`"
      @keydown="onDotsKeydown"
    >
      <div
        v-for="i in slideCount"
        :key="i - 1"
        class="b-carousel__dot-wrapper"
      >
        <button
          type="button"
          :id="dotId(i - 1)"
          class="b-carousel__dot"
          :class="{
            'b-carousel__dot--active': i - 1 === activeIndex,
            'b-carousel__dot--progress':
              showDotProgress && i - 1 === activeIndex && !isPaused,
          }"
          role="tab"
          :aria-selected="i - 1 === activeIndex"
          :aria-controls="slideId(i - 1)"
          :aria-label="`Go to slide ${i}`"
          :tabindex="i - 1 === activeIndex ? 0 : -1"
          @click="goTo(i - 1)"
        >
          <slot name="dot" :index="i - 1" :active="i - 1 === activeIndex">
            <span class="b-carousel__dot-inner" aria-hidden="true" />
          </slot>
        </button>
      </div>
    </div>
  </section>
</template>

<style>
/* ─────────────────────────────────────────────
   BCarousel - Design tokens (scoped to .b-carousel)
   ───────────────────────────────────────────── */
.b-carousel {
  /* ── AntD design tokens ── */
  --b-carousel-arrow-offset: 8px;
  --b-carousel-arrow-size: 16px;
  --b-carousel-dot-active-width: 24px;
  --b-carousel-dot-gap: 4px;
  --b-carousel-dot-height: 3px;
  --b-carousel-dot-offset: 12px;
  --b-carousel-dot-width: 16px;

  /* ── Local extras ── */
  --b-carousel-arrow-color: oklch(100% 0 0);
  --b-carousel-arrow-bg: oklch(20% 0.005 260 / 45%);
  --b-carousel-arrow-bg-hover: oklch(20% 0.005 260 / 70%);
  --b-carousel-arrow-disabled-opacity: 0.3;
  --b-carousel-dot-color: oklch(100% 0 0 / 60%);
  --b-carousel-dot-active-color: oklch(100% 0 0);
  --b-carousel-bg: oklch(20% 0.005 260);
  --b-carousel-radius: 4px;
  --b-carousel-focus-ring: 0 0 0 2px oklch(54.6% 0.245 262.881 / 50%);

  /* ── Motion (set by inline style; defaults below) ── */
  --b-carousel-speed: 500ms;
  --b-carousel-easing: linear;
  --b-carousel-autoplay-duration: 3000ms;

  position: relative;
  display: block;
  box-sizing: border-box;
  width: 100%;
  user-select: none;
}

/* ─────────────────────────────────────────────
   Viewport
   ───────────────────────────────────────────── */
.b-carousel__viewport {
  position: relative;
  overflow: hidden;
  border-radius: var(--b-carousel-radius);
  background: var(--b-carousel-bg);
  touch-action: pan-y;
}

.b-carousel--draggable .b-carousel__viewport {
  cursor: grab;
}

.b-carousel--dragging .b-carousel__viewport {
  cursor: grabbing;
}

/* ─────────────────────────────────────────────
   Track + slides (scrollx effect)
   ───────────────────────────────────────────── */
.b-carousel--effect-scrollx .b-carousel__track {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  transition: transform var(--b-carousel-speed) var(--b-carousel-easing);
  will-change: transform;
}

.b-carousel--effect-scrollx .b-carousel__slide {
  flex: 0 0 100%;
  min-width: 0;
  width: 100%;
}

/* ── Fade effect: stack slides, only active is visible ── */
.b-carousel--effect-fade .b-carousel__track {
  position: relative;
  display: block;
  width: 100%;
}

.b-carousel--effect-fade .b-carousel__slide {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--b-carousel-speed) var(--b-carousel-easing);
}

.b-carousel--effect-fade .b-carousel__slide:first-child {
  /* gives the track its intrinsic height (sized to the first slide) */
  position: relative;
}

.b-carousel--effect-fade .b-carousel__slide--active {
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
}

/* ── Adaptive height ── */
.b-carousel--adaptive-height .b-carousel__viewport,
.b-carousel--adaptive-height .b-carousel__track {
  height: auto;
}

/* ─────────────────────────────────────────────
   Arrows
   ───────────────────────────────────────────── */
.b-carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--b-carousel-arrow-size) + 16px);
  height: calc(var(--b-carousel-arrow-size) + 16px);
  padding: 0;
  border: none;
  background: var(--b-carousel-arrow-bg);
  color: var(--b-carousel-arrow-color);
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: background 200ms;
}

.b-carousel__arrow:hover:not(:disabled) {
  background: var(--b-carousel-arrow-bg-hover);
}

.b-carousel__arrow:disabled {
  cursor: not-allowed;
  opacity: var(--b-carousel-arrow-disabled-opacity);
}

.b-carousel__arrow:focus-visible {
  outline: none;
  box-shadow: var(--b-carousel-focus-ring);
}

.b-carousel__arrow--prev {
  left: var(--b-carousel-arrow-offset);
}

.b-carousel__arrow--next {
  right: var(--b-carousel-arrow-offset);
}

.b-carousel__arrow-icon {
  width: var(--b-carousel-arrow-size);
  height: var(--b-carousel-arrow-size);
  display: block;
}

/* ─────────────────────────────────────────────
   Dots
   ───────────────────────────────────────────── */
.b-carousel__dots {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--b-carousel-dot-gap);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 2;
}

.b-carousel--dots-bottom .b-carousel__dots {
  bottom: var(--b-carousel-dot-offset);
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

.b-carousel--dots-top .b-carousel__dots {
  top: var(--b-carousel-dot-offset);
  left: 50%;
  transform: translateX(-50%);
  flex-direction: row;
}

.b-carousel--dots-start .b-carousel__dots {
  left: var(--b-carousel-dot-offset);
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.b-carousel--dots-end .b-carousel__dots {
  right: var(--b-carousel-dot-offset);
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.b-carousel__dot-wrapper {
  display: flex;
  margin: 0;
  padding: 0;
}

.b-carousel__dot {
  display: block;
  width: var(--b-carousel-dot-width);
  height: var(--b-carousel-dot-height);
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: width 200ms;
}

.b-carousel__dot-inner {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: calc(var(--b-carousel-dot-height) / 2);
  background: var(--b-carousel-dot-color);
  transition:
    background 200ms,
    opacity 200ms;
  pointer-events: none;
}

.b-carousel__dot:hover .b-carousel__dot-inner {
  background: var(--b-carousel-dot-active-color);
  opacity: 0.7;
}

.b-carousel__dot:focus-visible {
  outline: none;
  box-shadow: var(--b-carousel-focus-ring);
  border-radius: calc(var(--b-carousel-dot-height) / 2);
}

.b-carousel__dot--active {
  width: var(--b-carousel-dot-active-width);
}

.b-carousel__dot--active .b-carousel__dot-inner {
  background: var(--b-carousel-dot-active-color);
  opacity: 1;
}

/* Vertical dot orientation (start / end placements) */
.b-carousel--dots-start .b-carousel__dot,
.b-carousel--dots-end .b-carousel__dot {
  width: var(--b-carousel-dot-height);
  height: var(--b-carousel-dot-width);
}

.b-carousel--dots-start .b-carousel__dot--active,
.b-carousel--dots-end .b-carousel__dot--active {
  width: var(--b-carousel-dot-height);
  height: var(--b-carousel-dot-active-width);
}

/* ── Autoplay progress bar (CSS-only) ── */
.b-carousel__dot--progress .b-carousel__dot-inner {
  background: linear-gradient(
    to right,
    var(--b-carousel-dot-active-color) 0%,
    var(--b-carousel-dot-active-color) 100%
  );
  background-size: 0% 100%;
  background-repeat: no-repeat;
  background-color: var(--b-carousel-dot-color);
  animation: b-carousel-dot-progress var(--b-carousel-autoplay-duration) linear
    forwards;
}

@keyframes b-carousel-dot-progress {
  from {
    background-size: 0% 100%;
  }
  to {
    background-size: 100% 100%;
  }
}

/* ─────────────────────────────────────────────
   Screen-reader live region (visually hidden)
   ───────────────────────────────────────────── */
.b-carousel__sr-only {
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

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-carousel {
  --b-carousel-bg: oklch(15% 0.005 260);
  --b-carousel-arrow-bg: oklch(95% 0 0 / 12%);
  --b-carousel-arrow-bg-hover: oklch(95% 0 0 / 25%);
  --b-carousel-arrow-color: oklch(95% 0 0);
  --b-carousel-dot-color: oklch(85% 0 0 / 40%);
  --b-carousel-dot-active-color: oklch(95% 0 0);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-carousel {
    --b-carousel-bg: oklch(15% 0.005 260);
    --b-carousel-arrow-bg: oklch(95% 0 0 / 12%);
    --b-carousel-arrow-bg-hover: oklch(95% 0 0 / 25%);
    --b-carousel-arrow-color: oklch(95% 0 0);
    --b-carousel-dot-color: oklch(85% 0 0 / 40%);
    --b-carousel-dot-active-color: oklch(95% 0 0);
  }
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-carousel {
    --b-carousel-speed: 0ms;
  }
  .b-carousel__dot--progress .b-carousel__dot-inner {
    animation: none;
  }
  .b-carousel__arrow {
    transition: none;
  }
}
</style>
