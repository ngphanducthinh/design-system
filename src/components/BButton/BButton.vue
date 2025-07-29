<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import { BIconBrandName, type BIconName } from '@/components/BIcon/BIconEnum.ts';
import { BButtonColor, BButtonSize, BButtonVariant, BIconColor } from '@/types.ts';

const {
  color = BButtonColor.Primary,
  size = BButtonSize.Medium,
  variant = BButtonVariant.Solid,
  disabled = false,
  prependIcon,
  prependIconColor,
  appendIcon,
  appendIconColor,
} = defineProps<{
  /**
   * The color of the button.
   */
  color?: `${BButtonColor}`;
  /**
   * The size of the button.
   */
  size?: `${BButtonSize}`;
  /**
   * The variant of the button.
   */
  variant?: `${BButtonVariant}`;
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * Prepend icon name, should match the file name in the assets/icons folder.
   * @example 'check', 'cross', 'arrow-right'
   */
  prependIcon?: `${BIconName}` | `${BIconBrandName}`;
  /**
   * Custom color for the prepend icon, can be a CSS color value or a theme color
   * @example 'currentColor', 'primary', 'secondary', '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)'
   */
  prependIconColor?: string | 'currentColor' | `${BIconColor}`;
  /**
   * Append icon name, should match the file name in the assets/icons folder.
   * @example 'check', 'cross', 'arrow-right'
   */
  appendIcon?: `${BIconName}` | `${BIconBrandName}`;
  /**
   * Custom color for the append icon, can be a CSS color value or a theme color
   * @example 'currentColor', 'primary', 'secondary', '#808080', 'rgb(128, 128, 128)', 'hsl(0, 0%, 50%)'
   */
  appendIconColor?: string | 'currentColor' | `${BIconColor}`;
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
    class="b:inline-flex b:items-center b:justify-center b:gap-x-2 b:rounded-lg b:transition-all b:duration-200 b:not-disabled:cursor-pointer b:disabled:opacity-50"
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
    <BIcon v-if="prependIcon" :icon="prependIcon" :color="prependIconColor" size="sm" />

    <span>
      <slot />
    </span>

    <BIcon v-if="appendIcon" :icon="appendIcon" :color="appendIconColor" size="sm" />
  </button>
</template>
