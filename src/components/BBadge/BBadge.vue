<script setup lang="ts">
import { BCommonColor } from '@/types.ts';
import { debounce } from '@/utils/debounce';
import { computed, ref, watch } from 'vue';

const { color = BCommonColor.Primary, hidden = false } = defineProps<{
  /**
   * Text or number to display inside the badge
   */
  text?: string | number;
  /**
   * Color variant for the badge, can be a CSS color value or a theme color
   * @example 'primary', 'secondary', '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)'
   */
  color?: string | `${BCommonColor}`;
  /**
   * Whether the badge is hidden
   * @default false
   */
  hidden?: boolean;
  /**
   * Whether to display the badge as a dot
   * @default false
   */
  dot?: boolean;
}>();

const svgStyle = computed(() => ({
  color: Object.values(BCommonColor).includes(color as BCommonColor) ? undefined : color,
}));
const isColor = (value: `${BCommonColor}`) => {
  return color === value;
};

const hiddenOuter = ref(false);
const hiddenInner = ref(false);
const hideInnerDebounced = debounce(() => {
  hiddenInner.value = false;
});
watch(
  () => hidden,
  (newVal) => {
    if (newVal) {
      hiddenOuter.value = true;
      hiddenInner.value = true;
    } else {
      hiddenOuter.value = false;
      hideInnerDebounced();
    }
  },
);
</script>

<template>
  <span
    class="b-badge b:inline-block b:transition-all b:transition-discrete"
    :class="[{ 'b:scale-0': hiddenOuter }]"
  >
    <sup
      v-if="!hiddenInner"
      :class="[
        {
          'b:bg-primary': color === 'primary',
          'b:bg-secondary': color === 'secondary',
          'b:bg-success': color === 'success',
          'b:bg-failure': color === 'failure',
          'b:bg-warning': color === 'warning',
          'b:bg-info': color === 'info',
        },
        {
          'b-badge--color': !!svgStyle.color,
        },
        {
          'b:text-white': !isColor('secondary'),
          'b:text-black': isColor('secondary'),
        },
        dot ? 'b:inline-block b:min-h-2 b:min-w-2 b:rounded-full' : 'b:rounded-xl b:px-2 b:py-0.5',
      ]"
    >
      <slot v-if="!dot">
        {{ text }}
      </slot>
    </sup>
  </span>
</template>

<style scoped>
.b-badge--color {
  background-color: v-bind('svgStyle.color');
}

/* NOTE: Animation only applies when the badge appears, not when it is removed */
.b-badge {
  animation: bounce-in 0.6s ease;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
