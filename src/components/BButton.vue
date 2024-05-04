<script lang="ts" setup>
import { BButtonSize, BButtonType } from '@/constants/Enums';
import { computed } from 'vue';

//#region Props
export interface BButtonProps {
  /**
   * Button type.
   */
  type?: `${BButtonType}`;
  /**
   * Button size.
   */
  size?: `${BButtonSize}`;
  disabled?: boolean;
}

const props = withDefaults(defineProps<BButtonProps>(), {
  type: BButtonType.Secondary,
  size: BButtonSize.Medium,
  disabled: false,
});
//#endregion

//#region Data
const btnCssClass = computed(() => {
  let result = 'ds-font-semibold ds-text-center ';
  result += 'disabled:ds-cursor-not-allowed ';

  switch (props.type) {
    case BButtonType.Primary:
    default:
      result += `ds-bg-gradient-to-r ds-from-primary-f-stop enabled:hover:ds-from-primary-f/90 enabled:hover:ds-to-primary-t/90 disabled:ds-text-black/40 ds-rounded-lg ds-text-white focus-visible:ds-to-primary-t/90 `;
      result += props.disabled
        ? `ds-bg-gray-150 `
        : `ds-from-primary-f ds-to-primary-t `;
      break;
    case BButtonType.Secondary:
      result += `ds-rounded-lg ds-bg-transparent ds-text-primary-t enabled:hover:ds-bg-blue-light disabled:ds-text-black/[0.4] focus-visible:ds-bg-blue-light `;
      result += props.disabled
        ? `ds-border-inner-secondary--disabled `
        : `ds-border-inner-secondary `;
      break;
    case BButtonType.Additional:
      result += `ds-rounded-lg ds-bg-transparent ds-text-black/[0.85] enabled:hover:ds-bg-gray-150 disabled:ds-text-black/[0.4] focus-visible:ds-bg-gray-150 `;
      result += props.disabled
        ? `ds-border-inner-additional--disabled `
        : `ds-border-inner-additional `;
      break;
    case BButtonType.Clear:
      result += `ds-rounded-lg ds-bg-transparent ds-text-primary-t enabled:hover:ds-bg-blue-light disabled:ds-text-black/[0.4] focus-visible:ds-bg-blue-light `;
      break;
    case BButtonType.Icon:
      result += `ds-bg-gradient-to-r ds-from-primary-f-stop enabled:hover:ds-from-primary-f/90 enabled:hover:ds-to-primary-t/90 disabled:ds-text-black/40 ds-rounded-full ds-rounded-full ds-text-white focus-visible:ds-from-primary-f/90 focus-visible:ds-to-primary-t/90 `;
      result += props.disabled
        ? `disabled:ds-bg-gray-150 `
        : `ds-from-primary-f ds-to-primary-t `;
      break;
  }

  switch (props.size) {
    case BButtonSize.Small:
      result +=
        props.type !== BButtonType.Icon
          ? `ds-text-sm ds-leading-4 ds-py-2 ds-px-3 `
          : `ds-text-base ds-leading-4 ds-h-8 ds-w-8 `;
      break;
    case BButtonSize.Medium:
    default:
      result +=
        props.type !== BButtonType.Icon
          ? `ds-text-sm ds-leading-4 ds-py-3.5 lg:ds-py-3 ds-px-4 `
          : `ds-text-2xl ds-leading-4 ds-h-11 ds-w-11 lg:ds-h-10 lg:ds-w-10 `;
      break;
  }

  return result;
});
//#endregion
</script>

<template>
  <button
    :class="btnCssClass"
    :disabled="disabled"
    class="ds-inline-flex ds-items-center ds-justify-center ds-gap-x-2"
    type="button"
  >
    <span v-if="$slots['prependIcon']">
      <slot name="prependIcon" />
    </span>

    <span class="ds-flex-auto">
      <slot />
    </span>

    <span v-if="$slots['appendIcon']">
      <slot name="appendIcon" />
    </span>
  </button>
</template>
