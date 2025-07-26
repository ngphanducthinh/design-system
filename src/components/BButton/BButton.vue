<script setup lang="ts">
import { BButtonColor, BButtonSize, BButtonVariant } from '@/types.ts';

const {
  color = BButtonColor.Primary,
  size = BButtonSize.Medium,
  variant = BButtonVariant.Solid,
  disabled = false,
} = defineProps<{
  color?: `${BButtonColor}`;
  size?: `${BButtonSize}`;
  variant?: `${BButtonVariant}`;
  disabled?: boolean;
}>();

const isColor = (value: `${BButtonColor}`) => {
  return color === value;
};
const isVariant = (value: `${BButtonVariant}`) => {
  return variant === value;
};
const isSize = (value: `${BButtonSize}`) => {
  return size === value;
};
</script>

<template>
  <button
    type="button"
    class="b:inline-flex b:items-center b:justify-center b:rounded-lg b:transition-all b:duration-200 b:not-disabled:cursor-pointer b:disabled:opacity-50"
    :class="[
      isVariant('solid') && {
        'b:text-white': !isColor('secondary'),
        'b:text-black': isColor('secondary'),
        'b:bg-primary b:hover:not-disabled:bg-primary-hover': isColor('primary'),
        'b:bg-secondary b:hover:not-disabled:bg-secondary-hover': isColor('secondary'),
        'b:bg-success b:hover:not-disabled:bg-success-hover': isColor('success'),
        'b:bg-failure b:hover:not-disabled:bg-failure-hover': isColor('failure'),
        'b:bg-warning b:hover:not-disabled:bg-warning-hover': isColor('warning'),
        'b:bg-info b:hover:not-disabled:bg-info-hover': isColor('info'),
      },
      (isVariant('outlined') || isVariant('dashed')) && {
        'b:outline-solid': isVariant('outlined'),
        'b:outline-dashed': isVariant('dashed'),
        'b:text-primary b:outline-primary b:hover:not-disabled:text-primary-hover b:hover:not-disabled:outline-primary-hover':
          isColor('primary'),
        'b:text-secondary b:outline-secondary b:hover:not-disabled:text-secondary-hover b:hover:not-disabled:outline-secondary-hover':
          isColor('secondary'),
        'b:text-success b:outline-success b:hover:not-disabled:text-success-hover b:hover:not-disabled:outline-success-hover':
          isColor('success'),
        'b:text-failure b:outline-failure b:hover:not-disabled:text-failure-hover b:hover:not-disabled:outline-failure-hover':
          isColor('failure'),
        'b:text-warning b:outline-warning b:hover:not-disabled:text-warning-hover b:hover:not-disabled:outline-warning-hover':
          isColor('warning'),
        'b:text-info b:outline-info b:hover:not-disabled:text-info-hover b:hover:not-disabled:outline-info-hover':
          isColor('info'),
      },
      isVariant('text') && {
        'b:text-primary b:hover:not-disabled:bg-primary-hover-light b:hover:not-disabled:text-primary-hover':
          isColor('primary'),
        'b:text-secondary b:hover:not-disabled:bg-secondary-hover-light b:hover:not-disabled:text-secondary-hover':
          isColor('secondary'),
        'b:text-success b:hover:not-disabled:bg-success-hover-light b:hover:not-disabled:text-success-hover':
          isColor('success'),
        'b:text-failure b:hover:not-disabled:bg-failure-hover-light b:hover:not-disabled:text-failure-hover':
          isColor('failure'),
        'b:text-warning b:hover:not-disabled:bg-warning-hover-light b:hover:not-disabled:text-warning-hover':
          isColor('warning'),
        'b:text-info b:hover:not-disabled:bg-info-hover-light b:hover:not-disabled:text-info-hover':
          isColor('info'),
      },
      isVariant('link') && {
        'b:text-primary b:hover:not-disabled:text-primary-hover': isColor('primary'),
        'b:text-secondary b:hover:not-disabled:text-secondary-hover': isColor('secondary'),
        'b:text-success b:hover:not-disabled:text-success-hover': isColor('success'),
        'b:text-failure b:hover:not-disabled:text-failure-hover': isColor('failure'),
        'b:text-warning b:hover:not-disabled:text-warning-hover': isColor('warning'),
        'b:text-info b:hover:not-disabled:text-info-hover': isColor('info'),
      },
      {
        'b:h-6 b:text-sm': isSize('small'),
        'b:h-8 b:text-sm': isSize('medium'),
        'b:h-10 b:text-base': isSize('large'),
      },
      {
        'b:px-2': isSize('small'),
        'b:px-4': isSize('medium') || isSize('large'),
      },
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
