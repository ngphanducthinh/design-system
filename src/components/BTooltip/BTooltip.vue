<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BTooltipPlacement, BTooltipTrigger } from '@/types.ts';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const model = defineModel<boolean>();
const internalModel = ref(false);
const uModel = computed({
  get() {
    return model.value !== undefined ? model.value : internalModel.value;
  },
  set(val: boolean) {
    if (model.value !== undefined) {
      model.value = val;
    } else {
      internalModel.value = val;
    }
  },
});
const {
  tooltip,
  trigger = BTooltipTrigger.Hover,
  placement = BTooltipPlacement.TopCenter,
} = defineProps<{
  /**
   * The text to display inside the tooltip.
   */
  tooltip?: string;
  /**
   * The event that triggers the tooltip to open.
   *
   * Default: `hover`.
   */
  trigger?: `${BTooltipTrigger}`;
  /**
   * The placement of the tooltip relative to the toggle element.
   * This value is used as the first preference. If there is not enough space, it will try other placements.
   *
   * Default: `top-center`.
   */
  placement?: `${BTooltipPlacement}`;
  /**
   * Additional classes to apply to the tooltip element.
   */
  toggleClass?: string;
  /**
   * Additional classes to apply to the inner content of the tooltip element.
   */
  tooltipClass?: string;
  /**
   * Additional classes to apply to the inner content of the tooltip element.
   */
  tooltipInnerClass?: string;
}>();

const emit = defineEmits<{
  /**
   * Emitted when the tooltip is opened or closed.
   * @param isOpen - Whether the tooltip is open.
   */
  toggle: [isOpen: boolean];
}>();

const updateIsOpen = ({ newState }: ToggleEvent) => {
  uModel.value = newState === 'open';
  emit('toggle', uModel.value);
};

const tooltipRef = ref<HTMLDivElement | null>(null);
const toggleRef = ref<HTMLDivElement | null>(null);
const toggleMenu = () => {
  if (uModel.value) {
    tooltipRef.value?.hidePopover();
  } else {
    tooltipRef.value?.showPopover();
  }
};
const onClick = () => {
  toggleMenu();
};
const onFocus = () => {
  tooltipRef.value?.showPopover();
};
const onFocusOut = () => {
  tooltipRef.value?.hidePopover();
};
const onHover = () => {
  tooltipRef.value?.showPopover();
};
const onHoverOut = () => {
  tooltipRef.value?.hidePopover();
};
const ensureEventListeners = () => {
  switch (trigger) {
    case BTooltipTrigger.Click:
      toggleRef.value?.addEventListener('click', onClick);
      break;
    case BTooltipTrigger.Focus:
      toggleRef.value?.addEventListener('focus', onFocus);
      toggleRef.value?.addEventListener('focusout', onFocusOut);
      break;
    case BTooltipTrigger.Hover:
    default:
      toggleRef.value?.addEventListener('mouseover', onHover);
      toggleRef.value?.addEventListener('mouseleave', onHoverOut);
      break;
  }
};
const clearEventListeners = () => {
  toggleRef.value?.removeEventListener('click', onClick);
  toggleRef.value?.removeEventListener('focus', onFocus);
  toggleRef.value?.removeEventListener('mouseover', onHover);
  toggleRef.value?.removeEventListener('mouseleave', onHoverOut);
};
onMounted(() => {
  ensureEventListeners();
});
onBeforeUnmount(() => {
  clearEventListeners();
});
watch(
  () => trigger,
  () => {
    clearEventListeners();
    ensureEventListeners();
  },
);

const isTriggerClick = computed(() => trigger === BTooltipTrigger.Click);

const { componentUID } = useComponentId();
const anchorName = computed(() => `--toggle-${componentUID.value}`);
const tooltipContentInnerId = computed(() => `tooltip-content-inner-${componentUID.value}`);
</script>

<template>
  <div
    ref="toggleRef"
    :class="['b-tooltip__toggle', 'b:inline-block', toggleClass]"
    :aria-describedby="tooltipContentInnerId"
  >
    <slot />
  </div>

  <div
    ref="tooltipRef"
    :popover="isTriggerClick ? 'auto' : 'manual'"
    :class="[
      'b-tooltip__content',
      {
        'top-left': placement === BTooltipPlacement.TopLeft,
        'top-center': placement === BTooltipPlacement.TopCenter,
        'top-right': placement === BTooltipPlacement.TopRight,
        'right-top': placement === BTooltipPlacement.RightTop,
        'right-center': placement === BTooltipPlacement.RightCenter,
        'right-bottom': placement === BTooltipPlacement.RightBottom,
        'bottom-right': placement === BTooltipPlacement.BottomRight,
        'bottom-center': placement === BTooltipPlacement.BottomCenter,
        'bottom-left': placement === BTooltipPlacement.BottomLeft,
        'left-bottom': placement === BTooltipPlacement.LeftBottom,
        'left-center': placement === BTooltipPlacement.LeftCenter,
        'left-top': placement === BTooltipPlacement.LeftTop,
      },
      tooltipClass,
    ]"
    @toggle="updateIsOpen"
  >
    <div
      :id="tooltipContentInnerId"
      :class="['b:rounded-lg b:bg-zinc-900 b:px-2 b:py-1.5 b:text-white', tooltipInnerClass]"
      role="tooltip"
    >
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
.b-tooltip__toggle {
  /* Anchor for positioning the tooltip */
  anchor-name: v-bind('anchorName');
}

.b-tooltip__content {
  /* Reset default styles of browsers */
  position: absolute;
  /* Positioning based on anchor element */
  position-anchor: v-bind('anchorName');
  /* ATTENTION: Too many fallbacks make the browser silently ignores the property, for now this should be less than 10 */
  position-try-fallbacks: --right-center, --bottom-center, --left-center;

  /* Default position: Top Center*/
  /* https://developer.mozilla.org/en-US/docs/Web/CSS/position-anchor#multiple_positioned_elements_and_anchors */
  &.top-left {
    inset: auto;
    bottom: anchor(top);
    left: anchor(left);

    margin: 0 0 var(--b-spacing) 0;
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;

    margin: 0 0 var(--b-spacing) 0;
  }
  &.top-right {
    inset: auto;
    bottom: anchor(top);
    right: anchor(right);

    margin: 0 0 var(--b-spacing) 0;
  }
  &.right-top {
    inset: auto;
    top: anchor(top);
    left: anchor(right);

    margin: 0 0 0 var(--b-spacing);
  }
  &.right-center {
    inset: auto;
    align-self: anchor-center;
    left: anchor(right);

    margin: 0 0 0 var(--b-spacing);
  }
  &.right-bottom {
    inset: auto;
    bottom: anchor(bottom);
    left: anchor(right);

    margin: 0 0 0 var(--b-spacing);
  }
  &.bottom-right {
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);

    margin: var(--b-spacing) 0 0 0;
  }
  &.bottom-center {
    inset: auto;
    top: anchor(bottom);
    justify-self: anchor-center;

    margin: var(--b-spacing) 0 0 0;
  }
  &.bottom-left {
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);

    margin: var(--b-spacing) 0 0 0;
  }
  &.left-bottom {
    inset: auto;
    bottom: anchor(bottom);
    right: anchor(left);

    margin: 0 var(--b-spacing) 0 0;
  }
  &.left-center {
    inset: auto;
    align-self: anchor-center;
    right: anchor(left);

    margin: 0 var(--b-spacing) 0 0;
  }
  &.left-top {
    inset: auto;
    top: anchor(top);
    right: anchor(left);

    margin: 0 var(--b-spacing) 0 0;
  }

  /* Animation and visibility */
  transition:
    display 0.2s,
    opacity 0.2s;
  transition-behavior: allow-discrete;
  opacity: 0;
  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }
}

@position-try --top-left {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);

  margin: 0 0 var(--b-spacing) 0;
}

@position-try --top-center {
  inset: auto;
  bottom: anchor(top);
  justify-self: anchor-center;

  margin: 0 0 var(--b-spacing) 0;
}

@position-try --top-right {
  inset: auto;
  bottom: anchor(top);
  right: anchor(right);

  margin: 0 0 var(--b-spacing) 0;
}

@position-try --right-top {
  inset: auto;
  top: anchor(top);
  left: anchor(right);

  margin: 0 0 0 var(--b-spacing);
}

@position-try --right-center {
  inset: auto;
  align-self: anchor-center;
  left: anchor(right);

  margin: 0 0 0 var(--b-spacing);
}

@position-try --right-bottom {
  inset: auto;
  bottom: anchor(bottom);
  left: anchor(right);

  margin: 0 0 0 var(--b-spacing);
}

@position-try --bottom-right {
  inset: auto;
  top: anchor(bottom);
  right: anchor(right);

  margin: var(--b-spacing) 0 0 0;
}

@position-try --bottom-center {
  inset: auto;
  top: anchor(bottom);
  justify-self: anchor-center;

  margin: var(--b-spacing) 0 0 0;
}

@position-try --bottom-left {
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);

  margin: var(--b-spacing) 0 0 0;
}

@position-try --left-bottom {
  inset: auto;
  bottom: anchor(bottom);
  right: anchor(left);

  margin: 0 var(--b-spacing) 0 0;
}

@position-try --left-center {
  inset: auto;
  align-self: anchor-center;
  right: anchor(left);

  margin: 0 var(--b-spacing) 0 0;
}

@position-try --left-top {
  inset: auto;
  top: anchor(top);
  right: anchor(left);

  margin: 0 var(--b-spacing) 0 0;
}
</style>
