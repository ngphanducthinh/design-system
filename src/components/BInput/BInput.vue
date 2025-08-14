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
    class="b:box-border b:transition-all b:duration-200 b:placeholder:text-zinc-300"
    :class="[
      {
        'b:h-6 b:px-2 b:text-sm': size === BInputSize.Small,
        'b:h-8 b:px-3 b:text-sm': size === BInputSize.Medium,
        'b:h-10 b:px-3 b:text-base': size === BInputSize.Large,
      },
      {
        'b:rounded-lg b:border-1 b:border-zinc-300 b:hover:not-disabled:border-primary b:focus-visible:not-disabled:border-primary':
          variant === BInputVariant.Outline,
        'b:rounded-lg b:border-1 b:border-zinc-100 b:bg-zinc-100 b:focus-visible:not-disabled:border-primary':
          variant === BInputVariant.Filled,
        '': variant === BInputVariant.Borderless,
        'b:border-b-1 b:border-zinc-300 b:focus-visible:not-disabled:border-b-primary':
          variant === BInputVariant.Underlined,
      },
      {
        'b:cursor-not-allowed b:bg-secondary b:opacity-40': disabled,
      },
    ]"
    :placeholder="placeholder"
    :disabled="disabled"
  />
</template>
