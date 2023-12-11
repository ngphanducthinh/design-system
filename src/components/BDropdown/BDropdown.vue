<script lang="ts" setup>
import {
  ensureVisiblePosition,
  resetPosition,
} from '@/helpers/ComponentHelper';
import { v4 as uuid } from 'uuid';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
} from 'vue';
import { PIKey } from '@/constants/Common';

/**
 * Props
 */
export interface BDropdownProps {
  inputId?: string;
  modelValue?: boolean;
  label?: string;
  /**
   * Toggle's content text
   */
  text?: string;
  /**
   * CSS of toggle
   */
  toggleCssClass?: string;
  /**
   * CSS of menu
   */
  menuCssClass?: string;
  /**
   * Prevent menu from closing when clicking outside
   */
  noCloseOnClickOutside?: boolean;
  /**
   * Prevent menu from closing when "Esc" pressed
   */
  noCloseOnEsc?: boolean;
  menuFixed?: boolean; // menu position should be fixed when toggle position is fixed
}
const props = withDefaults(defineProps<BDropdownProps>(), {
  inputId: '',
  modelValue: undefined,
  label: '',
  text: '',
  toggleCssClass: '',
  menuCssClass: '',
  noCloseOnClickOutside: false,
  noCloseOnEsc: false,
  menuFixed: false,
});

/**
 * Events
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  hidden: [];
  shown: [];
}>();

/**
 * Data
 */
const toggle = ref<HTMLElement | null>(null);
const dropdown = ref<HTMLElement | null>(null);
const dropdownMenu = ref<HTMLElement | null>(null);
const mValue = ref(false);
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed({
  get() {
    return props.modelValue !== undefined ? props.modelValue : mValue.value;
  },
  set(val: boolean) {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val);
    } else {
      mValue.value = val;
    }
  },
});

/**
 * Watch
 */
watch(value, (val) => {
  if (val) {
    ensureMenuPosition();
  } else {
    resetMenuPosition();
    toggle.value?.blur();
  }
});

/**
 * Watch
 */
watch(
  () => props.noCloseOnClickOutside,
  (val) => {
    if (val) {
      removeClickOutsideEventListener();
    } else {
      initClickOutsideEventListener();
    }
  },
);

watch(
  () => props.noCloseOnEsc,
  (val) => {
    if (val) {
      removePressEscapeEventListener();
    } else {
      initPressEscapeEventListener();
    }
  },
);

/**
 * Methods
 */
const initPressEscapeEventListener = () => {
  document.addEventListener('keydown', closeOnEscapePressed);
};
const closeOnEscapePressed = (event: any) => {
  if (event.key === 'Escape') {
    close();
  }
};
const initClickOutsideEventListener = () => {
  document.addEventListener('click', closeOnClickOutside);
};
const closeOnClickOutside = (event: any) => {
  const refs = [dropdown.value, dropdownMenu.value];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    close();
  }
};
const onClickToggle = () => {
  value.value = !value.value;
};
const ensureMenuPosition = () => {
  nextTick(() => {
    ensureVisiblePosition(
      dropdown.value!,
      dropdownMenu.value!,
      props.menuFixed,
    );
    emit('shown');
  });
};
const resetMenuPosition = () => {
  resetPosition(dropdown.value!, dropdownMenu.value!);
  emit('hidden');
};
const close = () => {
  value.value = false;
};
const removePressEscapeEventListener = () => {
  document.removeEventListener('keydown', closeOnEscapePressed);
};
const removeClickOutsideEventListener = () => {
  document.removeEventListener('click', closeOnClickOutside);
};

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  if (!props.noCloseOnEsc) {
    initPressEscapeEventListener();
  }
  if (!props.noCloseOnClickOutside) {
    initClickOutsideEventListener();
  }
});
onBeforeUnmount(() => {
  removePressEscapeEventListener();
  removeClickOutsideEventListener();
  // Make sure dropdown menu unmounted with itself
  resetMenuPosition();
});

/**
 * Provide
 */
provide(PIKey.CloseDropdown, close);
</script>

<template>
  <div ref="dropdown">
    <label
      v-if="props.label"
      :for="id"
      class="ds-mb-2 ds-block ds-text-xs ds-font-bold ds-capitalize ds-text-gray-500"
    >
      {{ props.label }}
    </label>
    <button
      :id="id"
      ref="toggle"
      :class="toggleCssClass"
      class="ds-inline-flex ds-w-full ds-items-center ds-justify-between ds-rounded-lg ds-bg-gray-200 ds-px-5 ds-py-2.5 ds-text-gray-700 focus:ds-ring-1 focus:ds-ring-primary-t"
      type="button"
      @click="onClickToggle"
    >
      <slot name="toggle">
        <span class="ds-truncate">{{ props.text }}</span>
        &nbsp;
        <span
          :class="`${value ? 'ds-rotate-180' : ''}`"
          class="fa-solid fa-caret-down ds-transition-transform"
        >
        </span>
      </slot>
    </button>
    <div
      v-show="value"
      :id="`${id}Menu`"
      ref="dropdownMenu"
      :class="`${menuCssClass} ${props.menuFixed ? 'ds-fixed' : 'ds-absolute'}`"
      :data-cy="$attrs['data-cy'] ? `${$attrs['data-cy']}Menu` : undefined"
      :data-ut="$attrs['data-ut'] ? `${$attrs['data-ut']}Menu` : undefined"
      class="ds-z-50 ds-py-1"
    >
      <slot></slot>
    </div>
  </div>
</template>