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

//#region Props
export interface BDropdownProps {
  inputId?: string;
  modelValue?: boolean;
  label?: string;
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
  /**
   * Enable "fix" position for menu
   */
  menuFixed?: boolean; // menu position should be fixed when toggle position is fixed
}

const props = withDefaults(defineProps<BDropdownProps>(), {
  inputId: '',
  modelValue: undefined,
  label: '',
  toggleCssClass: '',
  menuCssClass: '',
  noCloseOnClickOutside: false,
  noCloseOnEsc: false,
  menuFixed: false,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Menu is hidden
   * @param e
   */
  (e: 'hidden'): void;
  /**
   * Menu is shown
   * @param e
   */
  (e: 'shown'): void;
  /**
   * Update value
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: boolean): void;
}>();
//#endregion

//#region Data
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
//#endregion

//#region Watchers
watch(value, (val) => {
  if (val) {
    ensureMenuPosition();
  } else {
    resetMenuPosition();
    toggle.value?.blur();
  }
});
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
//#endregion

//#region Methods
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
//#endregion

//#region Lifecycle Hooks
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
//#endregion

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
      class="focus:ds-ring-1 focus:ds-ring-primary-t"
      type="button"
      @click="onClickToggle"
    >
      <slot name="toggle" />
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
      <slot />
    </div>
  </div>
</template>
