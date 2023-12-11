<script lang="ts" setup>
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
import type { DisplayItem } from '@/types';
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
import BErrorMessage from './BErrorMessage.vue';
import BLabel from './BLabel.vue';
import BTextField from './BTextField.vue';

/**
 * Props
 */
export interface BSelectProps {
  inputId?: string;
  modelValue: string | number;
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
   * Allow to type to search.
   */
  allowInput?: boolean;
}
const props = withDefaults(defineProps<BSelectProps>(), {
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
  'update:modelValue': [value: string | number];
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
  validateRule: (val) => !!val,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const inputText = ref('');
const selectedItem = ref<DisplayItem>();
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
watch(value, () => {
  ensureSelectedItem();
  ensureInputText();
});
watch(
  () => props.items,
  () => {
    if (value.value && !selectedItem.value?.value) {
      ensureSelectedItem();
      ensureInputText();
    }
  },
  {
    deep: true,
  },
);

/**
 * Methods
 */
const ensureSelectedItem = () => {
  selectedItem.value = props.items.find((i) => i.value === value.value);
};
const ensureInputText = () => {
  if (props.allowInput) {
    inputText.value = selectedItem.value?.text || '';
  }
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
  value.value = item.value;
  closeSelectMenu();
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
  ensureInputText();
};
const init = () => {
  ensureSelectedItem();
  ensureInputText();
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
      <BLabel :id="id" :label="label" :required="required" />

      <BTextField
        v-if="props.allowInput"
        :id="id"
        ref="inputRef"
        v-model="inputText"
        :disabled="props.disabled"
        :placeholder="props.placeholder"
        hide-details
        @focus="selectMenu = true"
        @click:append="inputRef?.focus()"
        @update:model-value="onChangeInputText"
      >
        <template #appendIcon>
          <svg
            :class="[selectMenu ? 'ds-rotate-180' : '']"
            class="ds-h-4 ds-w-4 ds-transition-transform"
            viewBox="0 0 320 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
            />
          </svg>
        </template>
      </BTextField>
      <button
        v-else
        :id="id"
        :class="btnCssClass"
        :disabled="props.disabled"
        type="button"
        @click="selectMenu = !selectMenu"
      >
        <span :class="valueCssClass" class="ds-truncate">
          <span v-if="selectedItem?.text">{{ selectedItem?.text }}</span>
          <span v-else class="ds-text-black/[0.4]">
            {{ props.placeholder }}
          </span>
        </span>
        &nbsp;
        <svg
          :class="[selectMenu ? 'ds-rotate-180' : '']"
          class="ds-h-4 ds-w-4 ds-transition-transform"
          viewBox="0 0 320 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"
          />
        </svg>
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
              @click="onClickItem(item)"
            >
              <a
                :class="
                  item.cssClass +
                  `${item.value === value ? ' ds-bg-gray-150' : ''}`
                "
                class="ds-block ds-px-4 ds-py-2 hover:ds-bg-gray-150"
              >
                {{ item?.text }}
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
    />
  </div>
</template>
