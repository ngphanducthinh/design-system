<script lang="ts" setup>
// https://markus.oberlehner.net/blog/transition-to-height-auto-with-vue/
import { computed } from 'vue';

export interface BCollapseProps {
  modelValue: boolean;
}
const props = defineProps<BCollapseProps>();

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

/**
 * Data
 */
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: boolean) {
    emit('update:modelValue', val);
  },
});

/**
 * Methods
 */
const enter = (el: Element) => {
  const element = el as HTMLElement;
  const { width } = getComputedStyle(element);

  element.style.width = width;
  element.style.position = 'absolute';
  element.style.visibility = 'hidden';
  element.style.height = 'auto';

  const { height } = getComputedStyle(element);

  element.style.width = '';
  element.style.position = '';
  element.style.visibility = '';
  element.style.height = '0px';

  // Force repaint to make sure the animation is triggered correctly.
  // eslint-disable-next-line no-unused-expressions
  getComputedStyle(element).height;

  // Trigger the animation.
  // We use `requestAnimationFrame` because we need to make sure the browser has finished painting
  // after setting the `height` to`0` in the line above.
  requestAnimationFrame(() => {
    element.style.height = height;
  });
};
const afterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = 'auto';
};
const leave = (el: Element) => {
  const element = el as HTMLElement;
  const { height } = getComputedStyle(element);

  element.style.height = height;

  // Force repaint to make sure the animation is triggered correctly.
  // eslint-disable-next-line no-unused-expressions
  getComputedStyle(element).height;

  requestAnimationFrame(() => {
    element.style.height = '0px';
  });
};
</script>

<template>
  <transition
    name="expand"
    @enter="enter"
    @leave="leave"
    @after-enter="afterEnter"
  >
    <div v-show="value">
      <slot></slot>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
// Hardware acceleration
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>
<style lang="scss">
.expand-enter-active,
.expand-leave-active {
  transition: height 0.3s ease-in-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
}
</style>
