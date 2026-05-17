<script lang="ts" setup>
import { ref, computed, watch, onMounted, useAttrs } from 'vue';
import { useComponentId } from '@/composables/useComponentId';
import {
  BUploadListType,
  BUploadFileStatus,
  type BUploadFile,
  type BUploadChangeInfo,
  type BUploadRequestOption,
  type BUploadShowUploadList,
} from './types';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();

//#region Props
const {
  accept = '',
  action = '',
  multiple = false,
  disabled = false,
  directory = false,
  maxCount,
  listType = BUploadListType.Text,
  method = 'POST',
  name: fieldName = 'file',
  headers,
  data,
  withCredentials = false,
  openFileDialogOnClick = true,
  showUploadList = true,
  defaultFileList = [],
  beforeUpload,
  customRequest,
} = defineProps<{
  /** File types that can be accepted (MIME types or extensions). */
  accept?: string;
  /** Uploading URL. */
  action?: string | ((file: File) => Promise<string>);
  /** Whether to support multiple file selection. */
  multiple?: boolean;
  /** Whether to disable the upload button. */
  disabled?: boolean;
  /** Support uploading directories. */
  directory?: boolean;
  /** Limit the number of uploaded files. */
  maxCount?: number;
  /** Built-in style of the upload list. */
  listType?: BUploadListType | `${BUploadListType}`;
  /** HTTP method for upload request. */
  method?: string;
  /** The name of the file field in the upload request. */
  name?: string;
  /** Custom request headers for upload. */
  headers?: Record<string, string>;
  /** Extra data to include with the upload request. */
  data?: Record<string, unknown> | ((file: BUploadFile) => Record<string, unknown>);
  /** Whether to send cookies with the request. */
  withCredentials?: boolean;
  /** Whether clicking the component opens the file dialog. */
  openFileDialogOnClick?: boolean;
  /** Whether to show the upload list. */
  showUploadList?: boolean | BUploadShowUploadList;
  /** Initial file list for uncontrolled usage. */
  defaultFileList?: BUploadFile[];
  /** Hook before uploading. Return false or a rejected Promise to stop. */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<File | Blob | boolean | void>;
  /** Override the default upload behavior. */
  customRequest?: (options: BUploadRequestOption) => void;
}>();
//#endregion

//#region Model & Events
const model = defineModel<BUploadFile[]>('fileList', { default: undefined });

const emit = defineEmits<{
  change: [info: BUploadChangeInfo];
  remove: [file: BUploadFile];
  preview: [file: BUploadFile];
  download: [file: BUploadFile];
  drop: [event: DragEvent];
}>();
//#endregion

//#region Internal State
const { componentUID } = useComponentId();
const inputRef = ref<HTMLInputElement | null>(null);
const dragOver = ref(false);
const internalFileList = ref<BUploadFile[]>(Array.isArray(defaultFileList) ? [...defaultFileList] : []);

const fileList = computed<BUploadFile[]>({
  get: () => (model.value !== undefined ? model.value : internalFileList.value),
  set: (val) => {
    internalFileList.value = val;
    if (model.value !== undefined) {
      model.value = val;
    }
  },
});

onMounted(() => {
  if (model.value === undefined && defaultFileList.length > 0) {
    internalFileList.value = [...defaultFileList];
  }
});

watch(
  () => model.value,
  (val) => {
    if (val !== undefined) {
      internalFileList.value = val;
    }
  },
);

const isPictureCard = computed(
  () =>
    listType === BUploadListType.PictureCard ||
    listType === BUploadListType.PictureCircle,
);

const showListConfig = computed<BUploadShowUploadList | false>(() => {
  if (showUploadList === false) return false;
  if (showUploadList === true) {
    return { showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: false };
  }
  return showUploadList;
});

const atMaxCount = computed(() => maxCount !== undefined && maxCount !== 1 && fileList.value.length >= maxCount);
//#endregion

//#region Upload Logic
let fileUidCounter = 0;

function genUid(): string {
  fileUidCounter += 1;
  return `b-upload-${componentUID.value}-${fileUidCounter}-${Date.now()}`;
}

function fileToUploadFile(file: File): BUploadFile {
  return {
    uid: genUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: BUploadFileStatus.Uploading,
    percent: 0,
    originFileObj: file,
  };
}

function triggerChange(file: BUploadFile, newFileList: BUploadFile[], event?: ProgressEvent) {
  fileList.value = newFileList;
  emit('change', { file, fileList: newFileList, event });
}

function defaultUpload(options: BUploadRequestOption) {
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable && options.onProgress) {
      options.onProgress({ percent: Math.round((e.loaded / e.total) * 100) });
    }
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      options.onSuccess?.(xhr.response);
    } else {
      options.onError?.(new Error(`Upload failed with status ${xhr.status}`));
    }
  });

  xhr.addEventListener('error', () => {
    options.onError?.(new Error('Upload network error'));
  });

  xhr.open(options.method || 'POST', options.action, true);

  if (options.withCredentials) {
    xhr.withCredentials = true;
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, val]) => {
      xhr.setRequestHeader(key, val);
    });
  }

  const formData = new FormData();
  if (options.data) {
    Object.entries(options.data).forEach(([key, val]) => {
      formData.append(key, val as string);
    });
  }
  formData.append(options.filename, options.file);

  xhr.send(formData);
}

async function uploadFile(file: File, rawFiles: File[]) {
  if (beforeUpload) {
    try {
      const result = await beforeUpload(file, rawFiles);
      if (result === false) return;
      if (result instanceof Blob) {
        const transformed = result instanceof File ? result : new File([result], file.name, { type: result.type });
        processUpload(transformed);
        return;
      }
    } catch {
      return;
    }
  }
  processUpload(file);
}

function processUpload(file: File) {
  const uploadFile = fileToUploadFile(file);
  let newList: BUploadFile[];

  if (maxCount === 1) {
    newList = [uploadFile];
  } else if (maxCount !== undefined) {
    newList = [...fileList.value, uploadFile].slice(-maxCount);
  } else {
    newList = [...fileList.value, uploadFile];
  }

  triggerChange(uploadFile, newList);

  const resolvedAction = typeof action === 'function' ? action(file) : Promise.resolve(action);

  resolvedAction.then((url: string) => {
    const requestFn = customRequest || defaultUpload;
    const extraData = typeof data === 'function' ? data(uploadFile) : (data || {});

    requestFn({
      action: url,
      file,
      filename: fieldName,
      headers,
      data: extraData,
      withCredentials,
      method,
      onProgress: (e) => {
        const updatedFile = { ...uploadFile, percent: e.percent };
        const updatedList = fileList.value.map((f) =>
          f.uid === uploadFile.uid ? updatedFile : f,
        );
        triggerChange(updatedFile, updatedList);
      },
      onSuccess: (response) => {
        const updatedFile = {
          ...uploadFile,
          status: BUploadFileStatus.Done,
          percent: 100,
          response,
        };
        const updatedList = fileList.value.map((f) =>
          f.uid === uploadFile.uid ? updatedFile : f,
        );
        triggerChange(updatedFile, updatedList);
      },
      onError: (error) => {
        const updatedFile = {
          ...uploadFile,
          status: BUploadFileStatus.Error,
          error,
        };
        const updatedList = fileList.value.map((f) =>
          f.uid === uploadFile.uid ? updatedFile : f,
        );
        triggerChange(updatedFile, updatedList);
      },
    });
  });
}

function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return;

  const rawFiles = Array.from(files);
  let filesToUpload: File[];

  if (maxCount === 1) {
    filesToUpload = rawFiles.slice(0, 1);
  } else if (maxCount !== undefined) {
    const remaining = maxCount - fileList.value.length;
    filesToUpload = remaining > 0 ? rawFiles.slice(0, remaining) : [];
  } else {
    filesToUpload = rawFiles;
  }

  filesToUpload.forEach((file) => uploadFile(file, rawFiles));
}
//#endregion

//#region Event Handlers
function handleClick() {
  if (disabled || !openFileDialogOnClick || atMaxCount.value) return;
  inputRef.value?.click();
}

function handleKeyDown(event: KeyboardEvent) {
  if (disabled || atMaxCount.value) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    inputRef.value?.click();
  }
}

function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement;
  handleFiles(input.files);
  input.value = '';
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (disabled) return;
  dragOver.value = true;
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  dragOver.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragOver.value = false;
  if (disabled) return;
  emit('drop', event);
  handleFiles(event.dataTransfer?.files ?? null);
}

function handleRemove(file: BUploadFile) {
  emit('remove', file);
  const newList = fileList.value.filter((f) => f.uid !== file.uid);
  triggerChange({ ...file, status: BUploadFileStatus.Removed }, newList);
}

function handlePreview(file: BUploadFile) {
  emit('preview', file);
}

function handleDownload(file: BUploadFile) {
  emit('download', file);
}
//#endregion

//#region Expose
defineExpose({
  /** Open the native file dialog programmatically. */
  openFileDialog: () => inputRef.value?.click(),
});
//#endregion
</script>

<template>
  <div
    class="b-upload"
    :class="{
      'b-upload--disabled': disabled,
      'b-upload--drag-over': dragOver,
      [`b-upload--${listType}`]: true,
    }"
  >
    <!-- Upload trigger area -->
    <div
      v-if="!isPictureCard || !atMaxCount"
      class="b-upload__trigger"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled || undefined"
      :aria-label="(attrs['aria-label'] as string) || 'Upload file'"
      @click="handleClick"
      @keydown="handleKeyDown"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <slot>
        <div v-if="isPictureCard" class="b-upload__card-trigger">
          <span class="b-upload__plus-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span class="b-upload__card-text">Upload</span>
        </div>
        <span v-else class="b-upload__default-text">Click to Upload</span>
      </slot>
    </div>

    <!-- Hidden file input -->
    <input
      ref="inputRef"
      class="b-upload__input"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      :disabled="disabled"
      :webkitdirectory="directory || undefined"
      aria-hidden="true"
      tabindex="-1"
      @change="handleInputChange"
    />

    <!-- File list -->
    <div
      v-if="showListConfig !== false && fileList.length > 0"
      class="b-upload__list"
      :class="`b-upload__list--${listType}`"
      role="list"
      aria-label="Uploaded files"
    >
      <div
        v-for="file in fileList"
        :key="file.uid"
        class="b-upload__item"
        :class="{
          'b-upload__item--error': file.status === BUploadFileStatus.Error,
          'b-upload__item--done': file.status === BUploadFileStatus.Done,
          'b-upload__item--uploading': file.status === BUploadFileStatus.Uploading,
        }"
        role="listitem"
      >
        <!-- Thumbnail for picture types -->
        <span
          v-if="listType !== BUploadListType.Text"
          class="b-upload__item-thumbnail"
          aria-hidden="true"
        >
          <img
            v-if="file.thumbUrl || file.url"
            :src="file.thumbUrl || file.url"
            :alt="file.name"
            class="b-upload__item-image"
          />
          <span v-else class="b-upload__item-file-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </span>
        </span>

        <!-- File info -->
        <span class="b-upload__item-info">
          <span class="b-upload__item-name" :title="file.name">
            {{ file.name }}
          </span>
        </span>

        <!-- Actions -->
        <span class="b-upload__item-actions">
          <button
            v-if="showListConfig && showListConfig.showPreviewIcon && (file.url || file.thumbUrl)"
            class="b-upload__action-btn"
            type="button"
            aria-label="Preview file"
            @click.stop="handlePreview(file)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            v-if="showListConfig && showListConfig.showDownloadIcon && file.status === BUploadFileStatus.Done"
            class="b-upload__action-btn"
            type="button"
            aria-label="Download file"
            @click.stop="handleDownload(file)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button
            v-if="showListConfig && showListConfig.showRemoveIcon"
            class="b-upload__action-btn b-upload__action-btn--remove"
            type="button"
            aria-label="Remove file"
            :disabled="disabled"
            @click.stop="handleRemove(file)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>

        <!-- Progress bar -->
        <div
          v-if="file.status === BUploadFileStatus.Uploading"
          class="b-upload__progress"
          role="progressbar"
          :aria-valuenow="file.percent ?? 0"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Uploading ${file.name}`"
        >
          <div
            class="b-upload__progress-bar"
            :style="{ width: `${file.percent ?? 0}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Hint slot -->
    <div v-if="$slots.hint" class="b-upload__hint">
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>
.b-upload {
  --b-upload-actions-color: rgba(0, 0, 0, 0.45);
  --b-upload-card-size: 102px;
  --b-upload-color-primary: #1677ff;
  --b-upload-color-error: #d32f2f;
  --b-upload-color-success: #52c41a;
  --b-upload-color-border: #d9d9d9;
  --b-upload-color-bg: #fafafa;
  --b-upload-color-bg-hover: #f0f0f0;
  --b-upload-color-text: rgba(0, 0, 0, 0.88);
  --b-upload-color-text-secondary: rgba(0, 0, 0, 0.6);
  --b-upload-border-radius: 8px;
  --b-upload-line-height: 1.5715;
  --b-upload-font-size: 14px;
  --b-upload-progress-stroke-width: 2px;

  position: relative;
  font-size: var(--b-upload-font-size);
  line-height: var(--b-upload-line-height);
  color: var(--b-upload-color-text);
}

/* Picture-card/circle layout: root becomes flex container */
.b-upload--picture-card,
.b-upload--picture-circle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

/* Hidden file input */
.b-upload__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Trigger */
.b-upload__trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  outline: none;
  border-radius: var(--b-upload-border-radius);
}

.b-upload__trigger:focus-visible {
  outline: 2px solid var(--b-upload-color-primary);
  outline-offset: 2px;
}

.b-upload--disabled .b-upload__trigger {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Default text trigger */
.b-upload__default-text {
  padding: 4px 15px;
  border: 1px solid var(--b-upload-color-border);
  border-radius: var(--b-upload-border-radius);
  background: #fff;
  color: var(--b-upload-color-text);
  transition: border-color 0.2s, color 0.2s;
}

.b-upload__trigger:hover .b-upload__default-text {
  color: var(--b-upload-color-primary);
  border-color: var(--b-upload-color-primary);
}

/* Picture card trigger */
.b-upload--picture-card .b-upload__trigger,
.b-upload--picture-circle .b-upload__trigger {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--b-upload-card-size);
  height: var(--b-upload-card-size);
  border: 1px dashed var(--b-upload-color-border);
  border-radius: var(--b-upload-border-radius);
  background: var(--b-upload-color-bg);
  transition: border-color 0.2s;
}

.b-upload--picture-circle .b-upload__trigger {
  border-radius: 50%;
}

.b-upload--picture-card .b-upload__trigger:hover,
.b-upload--picture-circle .b-upload__trigger:hover {
  border-color: var(--b-upload-color-primary);
}

.b-upload__card-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--b-upload-color-text-secondary);
}

.b-upload__plus-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.b-upload__plus-icon svg {
  width: 20px;
  height: 20px;
}

.b-upload__card-text {
  font-size: var(--b-upload-font-size);
}

/* Drag states */
.b-upload--drag-over .b-upload__trigger {
  border-color: var(--b-upload-color-primary);
  background: color-mix(in srgb, var(--b-upload-color-primary) 5%, transparent);
}

/* File list - text type */
.b-upload__list {
  margin-top: 8px;
}

.b-upload__list--text .b-upload__item,
.b-upload__list--picture .b-upload__item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: var(--b-upload-border-radius);
  transition: background-color 0.2s;
  position: relative;
}

.b-upload__list--text .b-upload__item:hover,
.b-upload__list--picture .b-upload__item:hover {
  background: var(--b-upload-color-bg);
}

/* File list - picture-card type */
.b-upload__list--picture-card,
.b-upload__list--picture-circle {
  display: contents;
}

.b-upload__list--picture-card .b-upload__item,
.b-upload__list--picture-circle .b-upload__item {
  position: relative;
  width: var(--b-upload-card-size);
  height: var(--b-upload-card-size);
  border: 1px solid var(--b-upload-color-border);
  border-radius: var(--b-upload-border-radius);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.b-upload__list--picture-circle .b-upload__item {
  border-radius: 50%;
}

/* Thumbnails */
.b-upload__item-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin-right: 8px;
}

.b-upload__list--picture-card .b-upload__item-thumbnail,
.b-upload__list--picture-circle .b-upload__item-thumbnail {
  width: 100%;
  height: 100%;
  margin-right: 0;
}

.b-upload__item-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.b-upload__item-file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--b-upload-color-text-secondary);
}

.b-upload__item-file-icon svg {
  width: 24px;
  height: 24px;
}

/* File info */
.b-upload__item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.b-upload__item-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--b-upload-color-text);
  transition: color 0.2s;
}

.b-upload__item--error .b-upload__item-name {
  color: var(--b-upload-color-error);
}

/* For card mode, hide file info text */
.b-upload__list--picture-card .b-upload__item-info,
.b-upload__list--picture-circle .b-upload__item-info {
  display: none;
}

/* Actions */
.b-upload__item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.b-upload__list--picture-card .b-upload__item-actions,
.b-upload__list--picture-circle .b-upload__item-actions {
  position: absolute;
  inset: 0;
  margin-left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.b-upload__list--picture-card .b-upload__item:hover .b-upload__item-actions,
.b-upload__list--picture-circle .b-upload__item:hover .b-upload__item-actions {
  opacity: 1;
}

.b-upload__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--b-upload-actions-color);
  transition: color 0.2s;
}

.b-upload__action-btn:hover {
  color: var(--b-upload-color-primary);
}

.b-upload__action-btn--remove:hover {
  color: var(--b-upload-color-error);
}

.b-upload__action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.b-upload__action-btn svg {
  width: 16px;
  height: 16px;
}

.b-upload__list--picture-card .b-upload__action-btn,
.b-upload__list--picture-circle .b-upload__action-btn {
  color: rgba(255, 255, 255, 0.85);
}

.b-upload__list--picture-card .b-upload__action-btn svg,
.b-upload__list--picture-circle .b-upload__action-btn svg {
  width: 24px;
  height: 24px;
}

.b-upload__list--picture-card .b-upload__action-btn:hover,
.b-upload__list--picture-circle .b-upload__action-btn:hover {
  color: #fff;
}

/* Progress bar */
.b-upload__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--b-upload-progress-stroke-width);
  background: var(--b-upload-color-bg-hover);
  overflow: hidden;
}

.b-upload__progress-bar {
  height: 100%;
  background: var(--b-upload-color-primary);
  transition: width 0.2s;
}

/* Hint */
.b-upload__hint {
  margin-top: 8px;
  color: var(--b-upload-color-text-secondary);
  font-size: 12px;
}

/* Dark mode - explicit */
[data-prefers-color='dark'] .b-upload {
  --b-upload-actions-color: rgba(255, 255, 255, 0.45);
  --b-upload-color-border: #424242;
  --b-upload-color-bg: #1f1f1f;
  --b-upload-color-bg-hover: #2f2f2f;
  --b-upload-color-text: rgba(255, 255, 255, 0.85);
  --b-upload-color-text-secondary: rgba(255, 255, 255, 0.6);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-upload {
    --b-upload-actions-color: rgba(255, 255, 255, 0.45);
    --b-upload-color-border: #424242;
    --b-upload-color-bg: #1f1f1f;
    --b-upload-color-bg-hover: #2f2f2f;
    --b-upload-color-text: rgba(255, 255, 255, 0.85);
    --b-upload-color-text-secondary: rgba(255, 255, 255, 0.6);
  }
}

/* Dark mode - follow system (only when no explicit preference is set) */
@media (prefers-color-scheme: dark) {
  :root:not([data-prefers-color]) .b-upload {
    --b-upload-actions-color: rgba(255, 255, 255, 0.45);
    --b-upload-color-border: #424242;
    --b-upload-color-bg: #1f1f1f;
    --b-upload-color-bg-hover: #2f2f2f;
    --b-upload-color-text: rgba(255, 255, 255, 0.85);
    --b-upload-color-text-secondary: rgba(255, 255, 255, 0.6);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-upload__trigger,
  .b-upload__default-text,
  .b-upload__item-name,
  .b-upload__action-btn,
  .b-upload__progress-bar,
  .b-upload__item-actions,
  .b-upload__list--text .b-upload__item,
  .b-upload__list--picture .b-upload__item {
    transition: none;
  }
}
</style>
