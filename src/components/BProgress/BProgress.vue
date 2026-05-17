<script setup lang="ts">
import { computed } from 'vue';

const { percent = 0 } = defineProps<{
  percent: number;
}>();
const progress = computed(() => `${percent}%`);

const color = 'green';

/**
 * ARIA busy state is true when progress is between 0 and 100 (exclusive) to prevent screen readers to read intermediate states annoyingly.
 * It is false when progress is 0 (not started) or 100 (completed).
 * https://www.w3.org/TR/wai-aria-1.2/#aria-busy
 */
const isBusy = computed(() => percent > 0 && percent < 100);

const successIcon = computed(
  () =>
    `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="${color}" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>')`,
);
</script>

<template>
  <div role="progressbar" class="b-progress" :aria-valuenow="percent" :aria-busy="isBusy" />
</template>

<style scoped>
/*
  Allow to animate the progress change
  https://developer.mozilla.org/en-US/docs/Web/CSS/@property
*/
@property --progress {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

.b-progress {
  /* CSS Variables */
  --size: 6rem;
  --bar-width: 1rem;
  --font-size: 1rem;
  --progress: v-bind('progress');
  --color-from: var(--b-color-primary);
  --color-to: var(--b-color-zinc-200);

  width: var(--size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: conic-gradient(var(--color-from) var(--progress), var(--color-to) 0%);
  transition: --progress 0.5s linear;

  display: grid;
  place-items: center;
  /*
    [Equivalent to:]
    display: flex;
    align-items: center;
    justify-content: center;
  */

  &::after {
    content: attr(aria-valuenow) '%';
    display: grid;
    place-items: center;

    width: calc(100% - var(--bar-width));
    border-radius: inherit;
    aspect-ratio: 1 / 1;
    background: white;

    font-size: var(--font-size);
  }

  &[aria-valuenow='100']::after {
    animation: progressComplete 0s forwards;
    animation-delay: 0.6s;
  }
}

@keyframes progressComplete {
  to {
    content: v-bind('successIcon');
  }
}
</style>
