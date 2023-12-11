<script lang="ts" setup>
import { BButtonSize, BButtonType } from '@/constants/Enums';
import { computed } from 'vue';

/**
 * Props
 */
export interface BButtonProps {
  type?: `${BButtonType}`;
  /**
   * FontAwesome v6.1.0 - Solid.
   */
  prependIcon?: string;
  /**
   * FontAwesome v6.1.0 - Solid.
   */
  appendIcon?: string;
  size?: `${BButtonSize}`;
  disabled?: boolean;
}
const props = withDefaults(defineProps<BButtonProps>(), {
  type: BButtonType.Secondary,
  prependIcon: '',
  appendIcon: '',
  size: BButtonSize.Medium,
  disabled: false,
});

/**
 * Data
 */
const btnCssClass = computed(() => {
  let result = 'ds-font-semibold ds-text-center ';
  result += 'disabled:ds-cursor-not-allowed ';

  switch (props.type) {
    case BButtonType.Primary:
    default:
      result += `ds-bg-gradient-to-r ds-from-primary-f-stop enabled:hover:ds-from-primary-f/90 enabled:hover:ds-to-primary-t/90 disabled:ds-text-black/40 ds-rounded-lg ds-text-white `;
      result += props.disabled
        ? `ds-bg-gray-150 `
        : `ds-from-primary-f ds-to-primary-t `;
      break;
    case BButtonType.Secondary:
      result += `ds-rounded-lg ds-bg-transparent ds-text-primary-t enabled:hover:ds-bg-[#e6f0fe] disabled:ds-text-black/[0.4] `;
      result += props.disabled
        ? `ds-border-inner-secondary--disabled `
        : `ds-border-inner-secondary `;
      break;
    case BButtonType.Additional:
      result += `ds-rounded-lg ds-bg-transparent ds-text-black/[0.85] enabled:hover:ds-bg-gray-150 disabled:ds-text-black/[0.4] `;
      result += props.disabled
        ? `ds-border-inner-additional--disabled `
        : `ds-border-inner-additional `;
      break;
    case BButtonType.Clear:
      result += `ds-rounded-lg ds-bg-transparent ds-text-primary-t enabled:hover:ds-bg-[#e6f0fe] disabled:ds-text-black/[0.4] `;
      break;
    case BButtonType.Icon:
      result += `ds-bg-gradient-to-r ds-from-primary-f-stop enabled:hover:ds-from-primary-f/90 enabled:hover:ds-to-primary-t/90 disabled:ds-text-black/40 ds-rounded-full ds-rounded-full ds-text-white `;
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
const iconCssClass = computed(() => {
  let result = '';

  switch (props.size) {
    case BButtonSize.Small:
      result += `ds-h-[8px] ds-w-[16px] `;
      break;
    case BButtonSize.Medium:
    default:
      result += `ds-h-[8px] ds-w-[16px] `;
      break;
  }

  return result;
});
</script>

<template>
  <button :class="btnCssClass" :disabled="disabled" type="button">
    <div class="ds-flex ds-items-center ds-justify-center">
      <div
        v-if="prependIcon || $slots['prepend-icon']"
        :class="iconCssClass"
        class="ds-relative ds-mr-2"
      >
        <slot name="prepend-icon">
          <span
            :class="prependIcon"
            class="ds-absolute -ds-bottom-[3px] ds-left-0 ds-text-[16px]"
          />
        </slot>
      </div>

      <div class="ds-flex ds-items-center">
        <slot />
      </div>

      <div
        v-if="appendIcon || $slots['append-icon']"
        :class="iconCssClass"
        class="ds-relative ds-ml-2"
      >
        <slot name="append-icon">
          <span
            :class="appendIcon"
            class="ds-absolute -ds-bottom-[3px] ds-left-0 ds-text-[16px]"
          />
        </slot>
      </div>
    </div>
  </button>
</template>