<script setup lang="ts">
import { BTooltipTrigger } from '@/types.ts';
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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

const { tooltip, trigger = BTooltipTrigger.Hover } = defineProps<{
  /**
   * The text to display inside the tooltip.
   */
  tooltip?: string;

  /**
   * The event that triggers the tooltip to open.
   *
   * @default BTooltipTrigger.Hover
   */
  trigger?: 'click' | 'hover' | 'focus';
}>();

const tooltipRef = ref<HTMLDivElement | null>(null);
const toggleMenu = () => {
  if (uModel.value) {
    tooltipRef.value?.hidePopover();
  } else {
    tooltipRef.value?.showPopover();
  }
};
const updateIsOpen = ({ newState }: ToggleEvent) => {
  uModel.value = newState === 'open';
};

const toggleRef = ref<HTMLDivElement | null>(null);
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

const componentInstance = getCurrentInstance();
const componentUID = computed(() => componentInstance?.uid);
const anchorName = computed(() => `--toggle-${componentUID.value}`);
</script>

<template>
  <div ref="toggleRef" class="b-tooltip-toggle b:inline-block">
    <slot />
  </div>

  <div
    ref="tooltipRef"
    :popover="isTriggerClick ? 'auto' : 'manual'"
    class="b-tooltip-content top-center"
    @toggle="updateIsOpen"
  >
    <slot name="tooltip">
      {{ tooltip }}
    </slot>
  </div>
</template>

<style scoped>
.b-tooltip-toggle {
  /* Anchor for positioning the tooltip */
  anchor-name: v-bind('anchorName');
}

.b-tooltip-content {
  /* Reset default styles of browsers */
  position: absolute;
  margin-top: var(--b-spacing);
  /* Positioning based on anchor element */
  position-anchor: v-bind('anchorName');
  /* ATTENTION: Too many fallbacks make the browser silently ignores the property */
  position-try-fallbacks: --right-center, --bottom-center, --left-center;

  /* Default position: Top Center*/
  /* https://developer.mozilla.org/en-US/docs/Web/CSS/position-anchor#multiple_positioned_elements_and_anchors */
  &.top-left {
    inset: auto;
    bottom: anchor(top);
    left: anchor(left);
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;
  }
}

@position-try --top-left {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
}

@position-try --top-center {
  inset: auto;
  bottom: anchor(top);
  justify-self: anchor-center;
}

@position-try --top-right {
  inset: auto;
  bottom: anchor(top);
  right: anchor(right);
}

@position-try --right-top {
  inset: auto;
  top: anchor(top);
  left: anchor(right);
}

@position-try --right-center {
  inset: auto;
  align-self: anchor-center;
  left: anchor(right);
}

@position-try --right-bottom {
  inset: auto;
  bottom: anchor(bottom);
  left: anchor(right);
}

@position-try --bottom-right {
  inset: auto;
  top: anchor(bottom);
  right: anchor(right);
}

@position-try --bottom-center {
  inset: auto;
  top: anchor(bottom);
  justify-self: anchor-center;
}

@position-try --bottom-left {
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
}

@position-try --left-bottom {
  inset: auto;
  bottom: anchor(bottom);
  right: anchor(left);
}

@position-try --left-center {
  inset: auto;
  align-self: anchor-center;
  right: anchor(left);
}

@position-try --left-top {
  inset: auto;
  top: anchor(top);
  right: anchor(left);
}
</style>
