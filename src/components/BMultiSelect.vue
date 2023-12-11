<script lang="ts" setup>
// https://vuejs.org/guide/essentials/event-handling.html#event-modifiers
import {
  useValidationField,
  type ValidationRule,
} from '@/composables/Validation';
import {
  ensureVisiblePosition,
  lockScrollBody,
  resetPosition,
  unlockScrollBody,
} from '@/helpers/ComponentHelper';
import { v4 as uuid } from 'uuid';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import BCheckbox from './BCheckbox.vue';
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';
import BTextField from './BTextField.vue';
import type { DisplayItem } from '@/types';

/**
 * Props
 */
export interface BMultiSelectProps {
  inputId?: string;
  modelValue: Array<string | number>;
  label?: string;
  items: DisplayItem[];
  disabled?: boolean;
  placeholder?: string;
  valueCssClass?: string;
  menuCssClass?: string;
  /**
   * Array of custom validation rules.
   */
  validationRules?: ValidationRule[];
  /**
   * Validate if the field is left empty.
   */
  required?: boolean;
  requiredErrorMessage?: string;
  /**
   * Hide the validation error message.
   */
  hideDetails?: boolean;
  /**
   * Show number of selected items.
   */
  showSelectedItemCount?: boolean;
  /**
   * Allow to type to search.
   */
  allowInput?: boolean;
}
const props = withDefaults(defineProps<BMultiSelectProps>(), {
  inputId: '',
  label: '',
  disabled: false,
  placeholder: '',
  valueCssClass: '',
  menuCssClass: '',
  validationRules: undefined,
  required: false,
  requiredErrorMessage: '',
  hideDetails: false,
  showSelectedItemCount: false,
  allowInput: false,
});

/**
 * Events
 */
const emit = defineEmits<{
  change: [value: string | number];
  open: [];
  close: [];
  'change:input': [inputValue: string];
  'update:modelValue': [value: Array<string | number>];
}>();

/**
 * Data
 */
const selectEl = ref<HTMLElement | null>(null);
const inputRef = ref<InstanceType<typeof BTextField> | null>(null);
const selectMenuEl = ref<HTMLElement | null>(null);
const selectMenu = ref(false);
const { t } = useI18n();
const validateRequired: ValidationRule = {
  validateRule: (val: Array<string | number>) => !!val && val.length > 0,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const inputText = ref('');
const selectedItems = ref<DisplayItem[]>([]);
const id = computed(() => props.inputId || `id-${uuid()}`);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
const btnCssClass = computed(() => {
  let result = `ds-border ds-drop-shadow-light ds-text-sm ds-h-[40px] ds-px-3 ds-rounded-lg ds-block ds-w-full ds-inline-flex ds-items-center ds-justify-between `;
  result += props.disabled
    ? `ds-cursor-not-allowed ds-bg-[#f2f2f2] ds-text-black/[0.4] `
    : `ds-bg-white ds-text-black/[0.85] `;
  result += !validationResult.value.valid
    ? `ds-border-error focus:ds-ring-1 focus:ds-ring-error `
    : `ds-border-black/10 focus:ds-border-focus focus:ds-ring-1 focus:ds-ring-focus `;

  return result;
});
const vRules = computed(() => {
  let result: ValidationRule[] = [];

  if (props.required) {
    result.push(validateRequired);
  }
  if (props.validationRules) {
    result = result.concat(props.validationRules);
  }

  return result.length ? result : undefined;
});
const selectedItemCount = computed(() =>
  value.value?.length > 1
    ? ` (${t('ds.components.base.multi_select.selected_item_count', {
        count: value.value?.length,
      })})`
    : '',
);
const labelDisplay = computed(() =>
  props.showSelectedItemCount
    ? `${props.label}${selectedItemCount.value}`
    : props.label,
);
const { validate, validationResult } = useValidationField(
  id.value,
  value,
  vRules.value,
);

/**
 * Watch
 */
watch(selectMenu, (val) => {
  if (val) {
    lockScrollBody();
    ensureMenuPosition();
    emit('open');
  } else {
    unlockScrollBody();
    resetMenuPosition();
    emit('close');
  }
});
watch(
  value,
  () => {
    ensureSelectedItems();
  },
  {
    deep: true,
  },
);
watch(
  () => props.items,
  () => {
    if (value.value.length !== 0 && selectedItems.value.length === 0) {
      ensureSelectedItems();
    }
  },
  {
    deep: true,
  },
);

/**
 * Methods
 */
const ensureSelectedItems = () => {
  selectedItems.value = value.value.map((v) => {
    let item = selectedItems.value.find((i) => i.value === v);
    if (!item) {
      item = props.items.find((i) => i.value === v);
    }
    return { text: item?.text, value: v, cssClass: item?.cssClass };
  });
};
const initPressEscapeEventListener = () => {
  document.addEventListener('keydown', closeOnEscapePressed);
};
const closeOnEscapePressed = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeSelectMenu();
  }
};
const initClickOutsideEventListener = () => {
  document.addEventListener('click', closeOnClickOutside);
};
const closeOnClickOutside = (event: any) => {
  const refs = [selectEl.value, selectMenuEl.value];
  const withinBoundaries = refs.some((r) => event.composedPath().includes(r));
  if (!withinBoundaries) {
    closeSelectMenu();
  }
};
const onClickItem = (item: DisplayItem) => {
  const index = value.value.findIndex((v) => v === item.value);
  if (index !== -1) {
    value.value.splice(index, 1);
  } else {
    value.value.push(item.value);
  }
  emit('change', item.value);
  nextTick(() => {
    validate();
  });
};
const ensureMenuWidth = (parentEl: HTMLElement, menuEl: HTMLElement) => {
  menuEl.style.width = `${parentEl.offsetWidth}px`;
};
const ensureMenuPosition = () => {
  nextTick(() => {
    ensureVisiblePosition(selectEl.value!, selectMenuEl.value!);
    ensureMenuWidth(selectEl.value!, selectMenuEl.value!);
  });
};
const resetMenuPosition = () => {
  resetPosition(selectEl.value!, selectMenuEl.value!);
};
const onChangeInputText = (text: string) => {
  emit('change:input', text);
};
const closeSelectMenu = () => {
  selectMenu.value = false;
  inputRef.value?.blur();
  inputText.value = '';
};
const deselectItem = (item: DisplayItem) => {
  const index = value.value.findIndex((v) => v === item.value);
  if (index !== -1) {
    value.value.splice(index, 1);
    emit('change', item.value);
    nextTick(() => {
      validate();
    });
  }
};
const init = () => {
  if (props.items.length > 0) {
    ensureSelectedItems();
  }
};
init();

/**
 * Lifecycle Hooks
 */
onMounted(() => {
  initPressEscapeEventListener();
  initClickOutsideEventListener();
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', closeOnEscapePressed);
  document.removeEventListener('click', closeOnClickOutside);
  unlockScrollBody();
  // Make sure dropdown menu unmounted with itself
  resetMenuPosition();
});

defineExpose({ validate, selectMenu });
</script>

<template>
  <div>
    <div ref="selectEl">
      <BLabel :id="id" :label="labelDisplay" :required="required" />

      <div
        v-if="props.allowInput"
        :class="{
          'ds-border-focus ds-ring-1 ds-ring-focus':
            selectMenu && validationResult.valid,
          'ds-ring-1 ds-ring-error': selectMenu && !validationResult.valid,
          'ds-border-black/10': validationResult.valid,
          'ds-border-error': !validationResult.valid,
        }"
        class="ds-relative ds-flex ds-flex-wrap ds-items-center ds-gap-x-1 ds-rounded-lg ds-border ds-bg-white ds-px-3 ds-py-1 ds-drop-shadow-light"
      >
        <div class="ds-absolute ds-right-3 ds-z-[1]">
          <i
            :class="`fa-solid fa-caret-down ds-transition-transform ${
              selectMenu ? 'ds-rotate-180' : ''
            }`"
            @click="inputRef?.focus()"
          />
        </div>
        <div
          v-for="(item, i) in selectedItems"
          :key="`item${i}`"
          class="ds-my-0.5 ds-flex-initial ds-space-x-1 ds-rounded-lg ds-bg-black/10 ds-px-2"
        >
          <span>{{ item.text }}</span>
          <i
            class="fa-solid fa-circle-xmark ds-cursor-pointer ds-text-black/60 hover:ds-text-black/40"
            @click="deselectItem(item)"
          />
        </div>
        <BTextField
          v-if="props.allowInput"
          :id="id"
          ref="inputRef"
          v-model="inputText"
          :disabled="props.disabled"
          class="ds-flex-auto"
          hide-details
          input-css-class="ds-drop-shadow-none ds-border-none !ds-ring-0 ds-px-0 !ds-h-[30px] ds-pl-0"
          @focus="selectMenu = true"
          @update:model-value="onChangeInputText"
        />
      </div>
      <button
        v-else
        :id="id"
        :class="btnCssClass"
        :disabled="disabled"
        type="button"
        @click="selectMenu = !selectMenu"
      >
        <span
          v-if="selectedItems.length > 0"
          :class="valueCssClass"
          class="ds-truncate ds-text-sm"
        >
          {{ selectedItems?.map((s) => s.text).join(', ') }}
        </span>
        <span
          v-else
          :class="valueCssClass"
          class="ds-truncate ds-text-sm ds-text-black/[0.4]"
        >
          {{ props.placeholder }}
        </span>
        &nbsp;
        <span
          :class="`${selectMenu ? 'ds-rotate-180' : ''}`"
          class="fa-solid fa-caret-down ds-text-base ds-transition-transform"
        >
        </span>
      </button>

      <div
        v-show="selectMenu"
        :id="`${id}Menu`"
        ref="selectMenuEl"
        :class="menuCssClass"
        :data-cy="$attrs['data-cy'] ? `${$attrs['data-cy']}Menu` : undefined"
        :data-ut="$attrs['data-ut'] ? `${$attrs['data-ut']}Menu` : undefined"
        class="ds-absolute ds-z-50 ds-min-w-[8rem] ds-py-1"
      >
        <div
          class="ds-max-h-72 ds-overflow-y-auto ds-rounded-lg ds-bg-white ds-shadow"
        >
          <ul class="ds-py-1 ds-text-sm ds-text-black/[0.85]">
            <li
              v-for="(item, index) in items"
              :key="`item${index}`"
              class="ds-cursor-pointer"
              @click.prevent="onClickItem(item)"
            >
              <a
                :class="
                  item.cssClass +
                  `${
                    selectedItems.some((s) => s.value === item.value)
                      ? ' ds-bg-slate-100'
                      : ''
                  }`
                "
                class="ds-flex ds-items-center ds-space-x-2 ds-px-4 ds-py-2 hover:ds-bg-slate-100"
              >
                <BCheckbox v-model="value" :value="item.value" size="sm" />
                <span>{{ item?.text }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <BErrorMessage
      v-if="!hideDetails"
      :error-message="validationResult.errorMessage()"
      class="ds-mt-1"
      prepend-icon="fa-solid fa-circle-exclamation"
    />
  </div>
</template>
