<script lang="ts" setup>
// Drag & Drop: https://www.w3schools.com/jsref/event_ondragover.asp
import { FileImageTypes } from '@/constants/Common';
import type { FileItemRead } from '@/types';
import { isEmpty } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BImagePickerCloseButton from './BImagePickerCloseButton.vue';
import ImagePreview from './BImagePreview.vue';
import type { ValidationRule } from '@/composables/Validation';
import { useValidationField } from '@/composables/Validation';
import BLabel from '../BLabel.vue';
import BButton from '../BButton.vue';
import BErrorMessage from '../BErrorMessage.vue';

//#region Props
export interface Props {
  inputId?: string;
  modelValue: FileItemRead[];
  label?: string;
  multiple?: boolean;
  maxFileSize?: number;
  hideDetails?: boolean;
  required?: boolean;
  requiredErrorMessage?: string;
  validationRules?: ValidationRule[];
}

const props = withDefaults(defineProps<Props>(), {
  inputId: '',
  label: '',
  multiple: false,
  maxFileSize: 20, // MB (Megabyte)
  hideDetails: false,
  required: false,
  requiredErrorMessage: '',
  validationRules: undefined,
});
//#endregion

//#region Events
const emit = defineEmits<{
  /**
   * Value has been changed
   * @param e
   */
  (e: 'change'): void;
  /**
   * Update value, param: <code>value: FileItemRead[]</code>
   * @param e
   * @param value
   */
  (e: 'update:modelValue', value: FileItemRead[]): void;
}>();
//#endregion

//#region Data
const { t } = useI18n();
const inputRef = ref<HTMLInputElement | null>(null);
const draggedIndex = ref(0);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});
const fileTypesValid = ref(true);
const fileSizeValid = ref(true);
const previewImage = ref({
  visible: false,
  url: '',
});
const allowedTypes = computed(() => FileImageTypes.join(', '));
const id = computed(() => props.inputId || `id-${uuid()}`);
const validateRequired: ValidationRule = {
  validateRule: (val: FileItemRead[]) => !!val && val.length > 0,
  errorMessage: () =>
    props.requiredErrorMessage || t('ds.global.field_required'),
};
const validateFileTypesValid: ValidationRule = {
  validateRule: () => fileTypesValid.value,
  errorMessage: () =>
    t('ds.components.base.image_picker.file_types_valid', {
      types: allowedTypes.value,
    }),
};
const validateFileSizeValid: ValidationRule = {
  validateRule: () => fileSizeValid.value,
  errorMessage: () =>
    t('ds.components.base.image_picker.file_size_valid', {
      size: props.maxFileSize,
    }),
};
const vRules = computed(() => {
  let result: ValidationRule[] = [];

  if (props.required) {
    result.push(validateRequired);
  }
  if (props.validationRules) {
    result = result.concat(props.validationRules);
  }
  result.push(validateFileTypesValid);
  result.push(validateFileSizeValid);

  return result.length ? result : undefined;
});
const { validate, validationResult } = useValidationField(
  id.value,
  value,
  vRules.value,
);
//#endregion

//#region Methods
/* Events fired on the drag target */
const handleDragStart = (index: number, e: DragEvent) => {
  draggedIndex.value = index;
  const target = e.target as HTMLDivElement;
  target.classList.add('dragging');
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('index', index.toString());
};
const handleDragEnd = (e: DragEvent) => {
  const target = e.target as HTMLDivElement;
  target.classList.remove('dragging');
};
/* Events fired on the drop target */
const handleDragEnter = (index: number, e: DragEvent) => {
  const target = e.target as HTMLDivElement;
  if (draggedIndex.value !== index) {
    target.classList.add('dropped-target');
  }
};
const handleDragOver = (e: DragEvent) => {
  // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
};
const handleDragLeave = (e: DragEvent) => {
  // When the draggable p element leaves the droptarget, reset the style
  const target = e.target as HTMLDivElement;
  target.classList.remove('dropped-target');
};
const handleDrop = (index: number, e: DragEvent) => {
  e.preventDefault();
  const target = e.target as HTMLDivElement;
  target.classList.remove('dropped-target');
  const draggedIndex = parseInt(e.dataTransfer!.getData('index'));
  const draggedImg = value.value[draggedIndex];
  value.value.splice(draggedIndex, 1);
  value.value.splice(index, 0, draggedImg);

  emit('change');
  validate();
};
const openFileDialog = () => {
  inputRef.value?.click();
};
const onChangeInput = (e: any) => {
  let fileList: FileList = e.target.files || e.dataTransfer.files;
  if (!fileList.length) {
    return;
  }
  createFileImages(fileList);
};
const createFileImages = (fileList: FileList) => {
  Array.from(fileList).forEach((file) => {
    fileTypesValid.value = FileImageTypes.includes(file.type);
    fileSizeValid.value = convertToMB(file.size) <= props.maxFileSize;

    if (fileTypesValid.value && fileSizeValid.value) {
      let reader: any = new FileReader();

      reader.onload = (f: any) => {
        if (props.multiple) {
          value.value.push({
            url: f.target.result,
            file,
            type: file.type,
          });
        } else {
          value.value.splice(0, 1, {
            url: f.target.result,
            file,
            type: file.type,
          });
        }

        emit('change');
        validate();
      };

      reader.readAsDataURL(file);
    } else {
      validate();
    }
  });
};
const removeFileImage = (e: Event, index: number) => {
  e.stopPropagation();
  value.value.splice(index, 1);

  emit('change');
  validate();
};
const convertToMB = (numberOfBytes: number) => numberOfBytes / 1024 ** 2;
const preview = (item: FileItemRead) => {
  previewImage.value.url = item.url;
  previewImage.value.visible = true;
};
//#endregion

defineExpose({ validate });
</script>

<template>
  <div class="ds-w-full">
    <BLabel :label="props.label" />

    <div
      class="ds-gap-2 ds-space-y-4 ds-rounded-lg ds-bg-white ds-p-4 ds-drop-shadow"
    >
      <div
        v-if="!isEmpty(value)"
        class="ds-flex ds-flex-wrap ds-justify-center ds-gap-1"
      >
        <div
          v-for="(item, index) in value"
          :key="index"
          class="draggable ds-h-full ds-cursor-pointer ds-rounded-lg ds-transition-all hover:ds-ring-2 hover:ds-ring-primary-t"
          draggable="true"
          @click="preview(item)"
          @dragend="handleDragEnd"
          @dragenter="handleDragEnter(index, $event)"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
          @dragstart="handleDragStart(index, $event)"
          @drop="handleDrop(index, $event)"
        >
          <img
            :src="item.url"
            alt="image"
            class="ds-h-full ds-w-full ds-rounded-lg"
          />
          <BImagePickerCloseButton
            class="ds-right-1 ds-top-1 ds-h-8 ds-w-8"
            @click="(e) => removeFileImage(e, index)"
          />
        </div>
      </div>

      <div class="ds-flex ds-flex-wrap ds-justify-center">
        <BButton @click="openFileDialog">
          <template #default>
            {{ $t('ds.components.base.image_picker.select_image') }}
          </template>
          <template #append-icon>
            <svg
              class="ds-absolute -ds-bottom-[3px] ds-left-0 ds-h-4 ds-w-4 ds-fill-primary-t"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M447.1 32h-384C28.64 32-.0091 60.65-.0091 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96C511.1 60.65 483.3 32 447.1 32zM111.1 96c26.51 0 48 21.49 48 48S138.5 192 111.1 192s-48-21.49-48-48S85.48 96 111.1 96zM446.1 407.6C443.3 412.8 437.9 416 432 416H82.01c-6.021 0-11.53-3.379-14.26-8.75c-2.73-5.367-2.215-11.81 1.334-16.68l70-96C142.1 290.4 146.9 288 152 288s9.916 2.441 12.93 6.574l32.46 44.51l93.3-139.1C293.7 194.7 298.7 192 304 192s10.35 2.672 13.31 7.125l128 192C448.6 396 448.9 402.3 446.1 407.6z"
              />
            </svg>
          </template>
        </BButton>
        <input
          ref="inputRef"
          :accept="allowedTypes"
          :multiple="props.multiple"
          class="ds-hidden"
          type="file"
          @change="onChangeInput"
        />
      </div>
    </div>

    <BErrorMessage
      v-if="!props.hideDetails"
      :error-message="validationResult.errorMessage()"
      class="mt-1"
    />

    <ImagePreview v-model="previewImage.visible" :url="previewImage.url" />
  </div>
</template>

<style lang="scss" scoped>
.draggable {
  width: 100%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: theme('borderRadius.lg');
  }
}

@media (min-width: 640px) {
  .draggable {
    // Minus "gap-2"
    width: calc((100% / 3) - (0.5rem * 2 / 3));
  }
}

@media (min-width: 768px) {
  .draggable {
    width: calc(25% - (0.5rem * 3 / 4));
  }
}

@media (min-width: 1280px) {
  .draggable {
    width: calc(20% - (0.5rem * 4 / 5));
  }
}

.dragging {
  opacity: theme('opacity.50');
}

.dropped-target {
  @apply ds-border-2 ds-border-primary-f;
}
</style>
