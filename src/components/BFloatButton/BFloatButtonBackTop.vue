<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import BFloatButton from './BFloatButton.vue';
import { BFloatButtonShape, BFloatButtonType } from './types.ts';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  duration = 450,
  target,
  visibilityHeight = 400,
  shape = BFloatButtonShape.Circle,
  type = BFloatButtonType.Default,
} = defineProps<{
  /**
   * Scroll animation duration in milliseconds.
   * @default 450
   */
  duration?: number;
  /**
   * A function that returns the scrollable container.
   * Defaults to `window`. May return `null` (e.g. if the element hasn't mounted yet).
   */
  target?: () => HTMLElement | Window | null;
  /**
   * The button becomes visible when the scroll position exceeds this value (px).
   * @default 400
   */
  visibilityHeight?: number;
  /**
   * Shape of the back-top button.
   * @default 'circle'
   */
  shape?: `${BFloatButtonShape}`;
  /**
   * Type of the back-top button.
   * @default 'default'
   */
  type?: `${BFloatButtonType}`;
}>();

const emit = defineEmits<{
  /** Emitted when the back-top button is clicked. */
  (e: 'click', event: MouseEvent): void;
}>();

defineSlots<{
  /** Custom content for the button. If omitted, renders an up-arrow icon. */
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Scroll logic
// ─────────────────────────────────────────────
const visible = ref(false);
let scrollContainer: HTMLElement | Window = window;

function getScrollTop(): number {
  if (scrollContainer === window) return window.scrollY;
  return (scrollContainer as HTMLElement).scrollTop;
}

function onScroll() {
  visible.value = getScrollTop() > visibilityHeight;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function scrollToTop() {
  const startTime = performance.now();
  const startTop = getScrollTop();

  function step(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    const newTop = startTop * (1 - eased);

    if (scrollContainer === window) {
      window.scrollTo(0, newTop);
    } else {
      (scrollContainer as HTMLElement).scrollTop = newTop;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function handleClick(event: MouseEvent) {
  scrollToTop();
  emit('click', event);
}

onMounted(() => {
  scrollContainer = target?.() ?? window;
  scrollContainer.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  scrollContainer.removeEventListener('scroll', onScroll);
});

const isVisible = visible;
</script>

<template>
  <Transition name="b-float-button-backtop">
    <BFloatButton
      v-if="isVisible"
      :shape="shape"
      :type="type"
      aria-label="Back to top"
      class="b-float-button-backtop"
      @click="handleClick"
    >
      <template #icon>
        <slot>
          <!-- Default: up arrow -->
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
          </svg>
        </slot>
      </template>
    </BFloatButton>
  </Transition>
</template>

<style>
/* ─────────────────────────────────────────────
   BackTop enter/leave transitions
   ───────────────────────────────────────────── */
.b-float-button-backtop-enter-active,
.b-float-button-backtop-leave-active {
  transition:
    opacity 300ms ease,
    transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.b-float-button-backtop-enter-from,
.b-float-button-backtop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (prefers-reduced-motion: reduce) {
  .b-float-button-backtop-enter-active,
  .b-float-button-backtop-leave-active {
    transition-duration: 0ms;
  }
}
</style>
