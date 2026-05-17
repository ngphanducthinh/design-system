<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';

//#region Props
const {
  defaultChecked = false,
  disabled = false,
  loading = false,
  size = 'default',
} = defineProps<{
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Whether the switch is disabled. */
  disabled?: boolean;
  /** Whether to show a loading spinner on the handle. */
  loading?: boolean;
  /** Size of the switch. */
  size?: 'default' | 'small';
}>();

/**
 * The checked state of the switch.
 * Supports v-model for controlled usage.
 */
const model = defineModel<boolean>({ default: undefined });

const emit = defineEmits<{
  change: [checked: boolean, event: Event];
  click: [checked: boolean, event: MouseEvent];
}>();
//#endregion

//#region Internal state
const internalChecked = ref(defaultChecked);

const isChecked = computed(() =>
  model.value !== undefined ? model.value : internalChecked.value,
);

onMounted(() => {
  if (model.value === undefined) {
    internalChecked.value = defaultChecked;
  }
});

watch(
  () => model.value,
  (val) => {
    if (val !== undefined) {
      internalChecked.value = val;
    }
  },
);
//#endregion

//#region Handlers
function toggle(event: MouseEvent | KeyboardEvent) {
  if (disabled || loading) return;

  const newChecked = !isChecked.value;
  internalChecked.value = newChecked;
  model.value = newChecked;
  emit('change', newChecked, event);

  if (event instanceof MouseEvent) {
    emit('click', newChecked, event);
  }
}

function handleClick(event: MouseEvent) {
  toggle(event);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggle(event);
  }
}
//#endregion

//#region Expose
const rootRef = ref<HTMLButtonElement | null>(null);

function focus() {
  rootRef.value?.focus();
}

function blur() {
  rootRef.value?.blur();
}

defineExpose({ focus, blur });
//#endregion
</script>

<template>
  <button
    ref="rootRef"
    type="button"
    role="switch"
    class="b-switch"
    :class="[
      `b-switch--${size}`,
      {
        'b-switch--checked': isChecked,
        'b-switch--disabled': disabled,
        'b-switch--loading': loading,
      },
    ]"
    :aria-checked="isChecked"
    :aria-disabled="disabled || loading || undefined"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <span class="b-switch__handle" aria-hidden="true">
      <svg
        v-if="loading"
        class="b-switch__loading-icon"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="28"
          stroke-dashoffset="8"
        />
      </svg>
    </span>
    <span class="b-switch__inner" aria-hidden="true">
      <span v-if="isChecked" class="b-switch__inner-checked">
        <slot name="checked" />
      </span>
      <span v-else class="b-switch__inner-unchecked">
        <slot name="unchecked" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.b-switch {
  --b-switch-handle-bg: #fff;
  --b-switch-handle-shadow: 0 2px 4px 0 rgba(0, 35, 11, 0.2);
  --b-switch-handle-size: 18px;
  --b-switch-track-height: 22px;
  --b-switch-track-min-width: 44px;
  --b-switch-track-padding: 2px;
  --b-switch-inner-max-margin: 24px;
  --b-switch-inner-min-margin: 9px;
  --b-switch-track-bg: rgba(0, 0, 0, 0.25);
  --b-switch-track-bg-checked: #1565d8;
  --b-switch-track-bg-disabled: rgba(0, 0, 0, 0.04);
  --b-switch-loading-color: #1565d8;

  position: relative;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  min-width: var(--b-switch-track-min-width);
  height: var(--b-switch-track-height);
  padding: 0;
  border: 0;
  border-radius: calc(var(--b-switch-track-height) / 2);
  background-color: var(--b-switch-track-bg);
  cursor: pointer;
  outline: none;
  transition:
    background-color 0.2s,
    opacity 0.2s;
  vertical-align: middle;
  user-select: none;
  line-height: 1;
}

.b-switch:focus-visible {
  outline: 2px solid var(--b-switch-track-bg-checked);
  outline-offset: 2px;
}

/* Checked state */
.b-switch--checked {
  background-color: var(--b-switch-track-bg-checked);
}

/* Disabled state */
.b-switch--disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* Loading state */
.b-switch--loading {
  cursor: default;
  opacity: 0.85;
}

/* Handle */
.b-switch__handle {
  position: absolute;
  top: var(--b-switch-track-padding);
  inset-inline-start: var(--b-switch-track-padding);
  width: var(--b-switch-handle-size);
  height: var(--b-switch-handle-size);
  border-radius: 50%;
  background-color: var(--b-switch-handle-bg);
  box-shadow: var(--b-switch-handle-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: inset-inline-start 0.2s ease-in-out;
}

.b-switch--checked .b-switch__handle {
  inset-inline-start: calc(
    100% - var(--b-switch-handle-size) - var(--b-switch-track-padding)
  );
}

/* Loading icon */
.b-switch__loading-icon {
  width: calc(var(--b-switch-handle-size) * 0.6);
  height: calc(var(--b-switch-handle-size) * 0.6);
  color: var(--b-switch-loading-color);
  animation: b-switch-spin 1s linear infinite;
}

.b-switch--checked .b-switch__loading-icon {
  color: var(--b-switch-track-bg-checked);
}

@keyframes b-switch-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Inner content */
.b-switch__inner {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 12px;
  color: #fff;
  overflow: hidden;
  padding: 0;
}

.b-switch__inner-checked,
.b-switch__inner-unchecked {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.b-switch__inner-checked {
  margin-inline-start: calc(
    var(--b-switch-track-padding) + var(--b-switch-inner-min-margin)
  );
  margin-inline-end: calc(
    var(--b-switch-handle-size) + var(--b-switch-track-padding) +
      var(--b-switch-inner-min-margin) - var(--b-switch-inner-max-margin) +
      var(--b-switch-inner-max-margin)
  );
}

.b-switch__inner-unchecked {
  margin-inline-start: calc(
    var(--b-switch-handle-size) + var(--b-switch-track-padding) +
      var(--b-switch-inner-min-margin)
  );
  margin-inline-end: calc(
    var(--b-switch-track-padding) + var(--b-switch-inner-min-margin)
  );
}

/* Small size */
.b-switch--small {
  --b-switch-handle-size: 12px;
  --b-switch-track-height: 16px;
  --b-switch-track-min-width: 28px;
  --b-switch-inner-max-margin: 18px;
  --b-switch-inner-min-margin: 6px;
}

/* Dark mode */
[data-prefers-color='dark'] .b-switch {
  --b-switch-track-bg: rgba(255, 255, 255, 0.25);
  --b-switch-track-bg-disabled: rgba(255, 255, 255, 0.08);
  --b-switch-handle-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-switch {
    --b-switch-track-bg: rgba(255, 255, 255, 0.25);
    --b-switch-track-bg-disabled: rgba(255, 255, 255, 0.08);
    --b-switch-handle-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.4);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-switch__handle {
    transition: none;
  }

  .b-switch {
    transition: none;
  }

  .b-switch__loading-icon {
    animation: none;
  }
}
</style>
