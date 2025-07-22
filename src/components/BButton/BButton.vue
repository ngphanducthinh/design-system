<script setup lang="ts">
import { BButtonSize, BButtonVariant } from '@/types.ts'

const {
  variant = BButtonVariant.Primary,
  size = BButtonSize.Medium,
  disabled = false,
} = defineProps<{
  variant?: `${BButtonVariant}`
  size?: `${BButtonSize}`
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="b:rounded-lg b:inline-flex b:items-center b:justify-center b:not-disabled:cursor-pointer b:disabled:opacity-50"
    :class="[
      {
        'b:bg-sky-500 b:hover:not-disabled:bg-sky-600': variant === 'primary',
        'b:bg-slate-500 b:hover:not-disabled:bg-slate-600': variant === 'secondary',
        'b:bg-green-500 b:hover:not-disabled:bg-green-600': variant === 'success',
        'b:bg-red-500 b:hover:not-disabled:bg-red-600': variant === 'failure',
        'b:bg-yellow-500 b:hover:not-disabled:bg-yellow-600': variant === 'warning',
        'b:bg-blue-500 b:hover:not-disabled:bg-blue-600': variant === 'info',
      },
      {
        'b:text-white': variant !== 'secondary',
        'b:text-black': variant === 'secondary',
      },
      {
        'b:h-7': size === 'small',
        'b:h-9': size === 'medium',
        'b:h-10': size === 'large',
      },
      {
        'b:p-2': size === 'small',
        'b:p-3': size === 'medium',
        'b:p-4': size === 'large',
      },
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
