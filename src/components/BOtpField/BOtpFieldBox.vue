<script lang="ts" setup>
import { onMounted, ref, type Ref, watch } from 'vue';

/**
 * Props
 */
export interface Props {
  value?: string;
  focus?: boolean;
  isDisabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  value: '',
  focus: false,
  isDisabled: false,
});

/**
 * Events
 */
const emit = defineEmits<{
  'on-change': [value: string];
  'on-keydown': [keyboardEvent: KeyboardEvent];
  'on-keyup': [keyboardEvent: KeyboardEvent];
  'on-paste': [clipboardEvent: ClipboardEvent];
  'on-focus': [];
  'on-blur': [];
}>();

/**
 * Data
 */
const model = ref(props.value || '');
const inputRef = ref<HTMLInputElement | null>(null) as Ref<HTMLInputElement>;
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Methods
 */
const handleOnChange = () => {
  if (!digits.includes(model.value)) {
    model.value = '';
    return;
  }

  model.value = model.value.toString();
  if (model.value.length > 1) {
    model.value = model.value.slice(0, 1);
  }
  return emit('on-change', model.value);
};

const handleOnKeyDown = (event: KeyboardEvent) => {
  if (props.isDisabled) {
    event.preventDefault();
  }
  // Only allow characters 0-9, DEL, Backspace, Enter, Right and Left Arrows, and Pasting
  const keyEvent = event;
  if (
    [
      'Alt',
      'Control',
      'Meta',
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'v',
      ...digits,
    ].includes(keyEvent.key)
  ) {
    emit('on-keydown', event);
  } else {
    keyEvent.preventDefault();
  }
};
const handleOnKeyUp = (event: KeyboardEvent) => {
  emit('on-keyup', event);
};
const handleOnPaste = (event: ClipboardEvent) => {
  emit('on-paste', event);
};
const handleOnFocus = () => {
  inputRef.value.select();
  return emit('on-focus');
};
const handleOnBlur = () => emit('on-blur');
const focusFn = () => {
  inputRef.value.focus();
  inputRef.value.select();
};

/**
 * Watch
 */
watch(
  () => props.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      model.value = newValue;
    }
  },
);
watch(
  () => props.focus,
  (newFocusValue, oldFocusValue) => {
    // Check if focusedInput changed
    // Prevent calling function if input already in focus
    if (oldFocusValue !== newFocusValue && inputRef.value && props.focus) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  },
);

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  if (inputRef.value && props.focus) {
    inputRef.value.focus();
    inputRef.value.select();
  }
});

defineExpose({ focus: focusFn });
</script>

<template>
  <input
    ref="inputRef"
    v-model="model"
    :disabled="isDisabled"
    class="ds-h-11 ds-w-11 ds-rounded-lg ds-border ds-text-center ds-drop-shadow-light ds-transition-all ds-duration-200"
    inputmode="numeric"
    maxlength="1"
    @blur="handleOnBlur"
    @focus="handleOnFocus"
    @input="handleOnChange"
    @keydown="handleOnKeyDown"
    @keyup="handleOnKeyUp"
    @paste="handleOnPaste"
  />
</template>
