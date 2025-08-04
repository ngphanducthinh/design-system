<script setup lang="ts">
import { BInputSize, BInputVariant } from '@/types.ts';

const {
  size = BInputSize.Medium,
  placeholder,
  variant = BInputVariant.Outline,
} = defineProps<{
  /**
   * Size of the input field.
   */
  size?: `${BInputSize}`;
  /**
   * Placeholder text for the input field.
   */
  placeholder?: string;
  /**
   * Whether the input field is disabled.
   */
  disabled?: boolean;
  /**
   * Variant of the input field.
   */
  variant?: `${BInputVariant}`;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <input
    v-model="model"
    class="b:transition-all b:duration-200 b:placeholder:text-gray-300"
    :class="[
      {
        'b:h-6 b:px-2 b:text-sm': size === BInputSize.Small,
        'b:h-8 b:px-3 b:text-sm': size === BInputSize.Medium,
        'b:h-10 b:px-3 b:text-base': size === BInputSize.Large,
      },
      {
        'b:rounded-lg b:ring-1 b:ring-gray-300 b:hover:not-disabled:ring-primary b:focus-visible:not-disabled:ring-primary':
          variant === BInputVariant.Outline,
        'b:rounded-lg b:bg-zinc-100 b:ring-1 b:ring-zinc-100 b:focus-visible:not-disabled:ring-primary':
          variant === BInputVariant.Filled,
        '': variant === BInputVariant.Borderless,
        'b:box-border b:border-b-1 b:border-gray-300 b:focus-visible:not-disabled:border-b-primary':
          variant === BInputVariant.Underlined,
      },
    ]"
    :placeholder="placeholder"
    :disabled="disabled"
  />
</template>
