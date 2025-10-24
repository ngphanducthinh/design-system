<script setup lang="ts">
import { BCommonColor } from '@/types.ts';
import { computed } from 'vue';

const { color = BCommonColor.Primary } = defineProps<{
  /**
   * Text or number to display inside the badge
   */
  text?: string | number;
  /**
   * Color variant for the badge, can be a CSS color value or a theme color
   * @example 'primary', 'secondary', '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)'
   */
  color?: string | `${BCommonColor}`;
}>();

const svgStyle = computed(() => ({
  color: Object.values(BCommonColor).includes(color as BCommonColor) ? undefined : color,
}));
const isColor = (value: `${BCommonColor}`) => {
  return color === value;
};
</script>

<template>
  <span class="b-badge b:inline-block b:transition-all">
    <sup
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
        'b:rounded-xl b:px-2 b:py-0.5',
      ]"
    >
      {{ text }}
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
