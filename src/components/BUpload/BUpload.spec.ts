import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BUpload from './BUpload.vue';
import { BUploadFileStatus, BUploadListType, type BUploadFile } from './types';

function createMockFileList(files: File[]): FileList {
  const fileList = Object.create(null);
  files.forEach((file, i) => {
    fileList[i] = file;
  });
  fileList.length = files.length;
  fileList.item = (index: number) => files[index] ?? null;
  fileList[Symbol.iterator] = function* () {
    for (let i = 0; i < files.length; i++) {
      yield files[i];
    }
  };
  return fileList as unknown as FileList;
}

function createFile(name = 'test.png', size = 1024, type = 'image/png'): File {
  const content = 'x'.repeat(size);
  return new File([content], name, { type });
}

function getInput(wrapper: VueWrapper) {
  return wrapper.find('input[type="file"]');
}

function getTrigger(wrapper: VueWrapper) {
  return wrapper.find('[role="button"]');
}

function getListItems(wrapper: VueWrapper) {
  return wrapper.findAll('[role="listitem"]');
}

describe('BUpload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('defaults and variants render', () => {
    it('renders with default props', () => {
      const wrapper = mount(BUpload);
      expect(wrapper.find('.b-upload').exists()).toBe(true);
      expect(getTrigger(wrapper).exists()).toBe(true);
      expect(getInput(wrapper).exists()).toBe(true);
    });

    it('renders hidden file input', () => {
      const wrapper = mount(BUpload);
      const input = getInput(wrapper);
      expect(input.attributes('aria-hidden')).toBe('true');
      expect(input.attributes('tabindex')).toBe('-1');
      expect(input.attributes('type')).toBe('file');
    });

    it('renders text list type by default', () => {
      const wrapper = mount(BUpload);
      expect(wrapper.find('.b-upload--text').exists()).toBe(true);
    });

    it('renders picture-card list type', () => {
      const wrapper = mount(BUpload, {
        props: { listType: BUploadListType.PictureCard },
      });
      expect(wrapper.find('.b-upload--picture-card').exists()).toBe(true);
      expect(wrapper.find('.b-upload__card-trigger').exists()).toBe(true);
    });

    it('renders picture-circle list type', () => {
      const wrapper = mount(BUpload, {
        props: { listType: BUploadListType.PictureCircle },
      });
      expect(wrapper.find('.b-upload--picture-circle').exists()).toBe(true);
    });

    it('renders picture list type', () => {
      const wrapper = mount(BUpload, {
        props: { listType: BUploadListType.Picture },
      });
      expect(wrapper.find('.b-upload--picture').exists()).toBe(true);
    });
  });

  describe('props map to DOM and behavior', () => {
    it('applies accept attribute to input', () => {
      const wrapper = mount(BUpload, {
        props: { accept: '.png,.jpg' },
      });
      expect(getInput(wrapper).attributes('accept')).toBe('.png,.jpg');
    });

    it('applies multiple attribute to input', () => {
      const wrapper = mount(BUpload, {
        props: { multiple: true },
      });
      expect(getInput(wrapper).attributes('multiple')).toBeDefined();
    });

    it('applies disabled state', () => {
      const wrapper = mount(BUpload, {
        props: { disabled: true },
      });
      expect(wrapper.find('.b-upload--disabled').exists()).toBe(true);
      expect(getTrigger(wrapper).attributes('aria-disabled')).toBe('true');
      expect(getTrigger(wrapper).attributes('tabindex')).toBe('-1');
      expect(getInput(wrapper).attributes('disabled')).toBeDefined();
    });

    it('applies directory attribute to input', () => {
      const wrapper = mount(BUpload, {
        props: { directory: true },
      });
      expect(getInput(wrapper).attributes('webkitdirectory')).toBeDefined();
    });

    it('renders default file list', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
        { uid: '2', name: 'file2.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      expect(getListItems(wrapper).length).toBe(2);
    });

    it('renders controlled file list via v-model:fileList', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { fileList: files, 'onUpdate:fileList': () => {} },
      });
      expect(getListItems(wrapper).length).toBe(1);
    });

    it('shows upload list when showUploadList is true', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files, showUploadList: true },
      });
      expect(wrapper.find('.b-upload__list').exists()).toBe(true);
    });

    it('hides upload list when showUploadList is false', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files, showUploadList: false },
      });
      expect(wrapper.find('.b-upload__list').exists()).toBe(false);
    });

    it('applies error status class to failed files', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Error },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      expect(wrapper.find('.b-upload__item--error').exists()).toBe(true);
    });

    it('shows progress bar for uploading files', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Uploading, percent: 50 },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.exists()).toBe(true);
      expect(progress.attributes('aria-valuenow')).toBe('50');
    });
  });

  describe('events', () => {
    it('emits change when files are selected', async () => {
      const wrapper = mount(BUpload, {
        props: { action: '/upload' },
      });
      const input = getInput(wrapper);
      const file = createFile();

      Object.defineProperty(input.element, 'files', {
        value: createMockFileList([file]),
        writable: false,
      });

      await input.trigger('change');

      expect(wrapper.emitted('change')).toBeTruthy();
      const [changeInfo] = wrapper.emitted('change')![0] as [{ file: BUploadFile; fileList: BUploadFile[] }];
      expect(changeInfo.file.name).toBe('test.png');
      expect(changeInfo.fileList.length).toBe(1);
    });

    it('emits remove when file is removed', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      const removeBtn = wrapper.find('[aria-label="Remove file"]');
      await removeBtn.trigger('click');

      expect(wrapper.emitted('remove')).toBeTruthy();
      expect(wrapper.emitted('remove')![0][0]).toMatchObject({ uid: '1', name: 'file1.txt' });
    });

    it('emits change after remove with updated list', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
        { uid: '2', name: 'file2.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      const removeBtn = wrapper.findAll('[aria-label="Remove file"]')[0];
      await removeBtn.trigger('click');

      const changeEvents = wrapper.emitted('change')!;
      const lastChange = changeEvents[changeEvents.length - 1][0] as { file: BUploadFile; fileList: BUploadFile[] };
      expect(lastChange.fileList.length).toBe(1);
      expect(lastChange.file.status).toBe(BUploadFileStatus.Removed);
    });

    it('emits preview when preview button is clicked', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done, url: 'http://example.com/file.txt' },
      ];
      const wrapper = mount(BUpload, {
        props: {
          defaultFileList: files,
          showUploadList: { showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: false },
        },
      });
      const previewBtn = wrapper.find('[aria-label="Preview file"]');
      await previewBtn.trigger('click');

      expect(wrapper.emitted('preview')).toBeTruthy();
      expect(wrapper.emitted('preview')![0][0]).toMatchObject({ uid: '1' });
    });

    it('emits download when download button is clicked', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done, url: 'http://example.com/file.txt' },
      ];
      const wrapper = mount(BUpload, {
        props: {
          defaultFileList: files,
          showUploadList: { showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true },
        },
      });
      const downloadBtn = wrapper.find('[aria-label="Download file"]');
      await downloadBtn.trigger('click');

      expect(wrapper.emitted('download')).toBeTruthy();
      expect(wrapper.emitted('download')![0][0]).toMatchObject({ uid: '1' });
    });

    it('emits drop when files are dropped', async () => {
      const wrapper = mount(BUpload);
      const trigger = getTrigger(wrapper);
      const file = createFile();

      const dropEvent = new Event('drop') as unknown as DragEvent;
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: createMockFileList([file]) },
      });
      Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() });

      await trigger.trigger('drop', { dataTransfer: { files: createMockFileList([file]) } });

      expect(wrapper.emitted('drop')).toBeTruthy();
    });
  });

  describe('keyboard and focus behavior', () => {
    it('trigger has tabindex 0 when not disabled', () => {
      const wrapper = mount(BUpload);
      expect(getTrigger(wrapper).attributes('tabindex')).toBe('0');
    });

    it('trigger has tabindex -1 when disabled', () => {
      const wrapper = mount(BUpload, {
        props: { disabled: true },
      });
      expect(getTrigger(wrapper).attributes('tabindex')).toBe('-1');
    });

    it('opens file dialog on Enter key', async () => {
      const wrapper = mount(BUpload);
      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('keydown', { key: 'Enter' });
      expect(clickSpy).toHaveBeenCalled();
    });

    it('opens file dialog on Space key', async () => {
      const wrapper = mount(BUpload);
      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('keydown', { key: ' ' });
      expect(clickSpy).toHaveBeenCalled();
    });

    it('does not open file dialog on Enter when disabled', async () => {
      const wrapper = mount(BUpload, {
        props: { disabled: true },
      });
      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('keydown', { key: 'Enter' });
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('does not open file dialog when openFileDialogOnClick is false', async () => {
      const wrapper = mount(BUpload, {
        props: { openFileDialogOnClick: false },
      });
      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('click');
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('trigger has role="button"', () => {
      const wrapper = mount(BUpload);
      expect(getTrigger(wrapper).attributes('role')).toBe('button');
    });

    it('trigger has aria-label', () => {
      const wrapper = mount(BUpload);
      expect(getTrigger(wrapper).attributes('aria-label')).toBe('Upload file');
    });

    it('supports custom aria-label', () => {
      const wrapper = mount(BUpload, {
        attrs: { 'aria-label': 'Upload profile picture' },
      });
      expect(getTrigger(wrapper).attributes('aria-label')).toBe('Upload profile picture');
    });

    it('file list has role="list"', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      expect(wrapper.find('[role="list"]').exists()).toBe(true);
    });

    it('file list items have role="listitem"', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      expect(wrapper.find('[role="listitem"]').exists()).toBe(true);
    });

    it('progress bar has correct ARIA attributes', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Uploading, percent: 75 },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files },
      });
      const progress = wrapper.find('[role="progressbar"]');
      expect(progress.attributes('aria-valuenow')).toBe('75');
      expect(progress.attributes('aria-valuemin')).toBe('0');
      expect(progress.attributes('aria-valuemax')).toBe('100');
      expect(progress.attributes('aria-label')).toContain('file1.txt');
    });

    it('input is hidden from accessibility tree', () => {
      const wrapper = mount(BUpload);
      const input = getInput(wrapper);
      expect(input.attributes('aria-hidden')).toBe('true');
      expect(input.attributes('tabindex')).toBe('-1');
    });

    it('action buttons have aria-labels', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done, url: 'http://example.com' },
      ];
      const wrapper = mount(BUpload, {
        props: {
          defaultFileList: files,
          showUploadList: { showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true },
        },
      });
      expect(wrapper.find('[aria-label="Preview file"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Download file"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Remove file"]').exists()).toBe(true);
    });

    it('SVG icons are aria-hidden', () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done, url: 'http://example.com' },
      ];
      const wrapper = mount(BUpload, {
        props: {
          defaultFileList: files,
          showUploadList: { showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true },
        },
      });
      const svgs = wrapper.findAll('svg');
      svgs.forEach((svg) => {
        expect(svg.attributes('aria-hidden')).toBe('true');
      });
    });
  });

  describe('edge cases', () => {
    it('respects maxCount limit', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files, maxCount: 2, action: '/upload' },
      });

      const input = getInput(wrapper);
      const file1 = createFile('test1.png');
      const file2 = createFile('test2.png');

      Object.defineProperty(input.element, 'files', {
        value: createMockFileList([file1, file2]),
        writable: false,
      });

      await input.trigger('change');

      const changeEvents = wrapper.emitted('change')!;
      const lastChange = changeEvents[changeEvents.length - 1][0] as { fileList: BUploadFile[] };
      expect(lastChange.fileList.length).toBeLessThanOrEqual(2);
    });

    it('replaces file when maxCount is 1', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files, maxCount: 1, action: '/upload' },
      });

      const input = getInput(wrapper);
      const newFile = createFile('new.png');

      Object.defineProperty(input.element, 'files', {
        value: createMockFileList([newFile]),
        writable: false,
      });

      await input.trigger('change');

      const changeEvents = wrapper.emitted('change')!;
      const lastChange = changeEvents[changeEvents.length - 1][0] as { fileList: BUploadFile[] };
      expect(lastChange.fileList.length).toBe(1);
      expect(lastChange.fileList[0].name).toBe('new.png');
    });

    it('beforeUpload returning false prevents upload', async () => {
      const wrapper = mount(BUpload, {
        props: {
          action: '/upload',
          beforeUpload: () => false,
        },
      });

      const input = getInput(wrapper);
      Object.defineProperty(input.element, 'files', {
        value: createMockFileList([createFile()]),
        writable: false,
      });

      await input.trigger('change');

      expect(wrapper.emitted('change')).toBeFalsy();
    });

    it('beforeUpload can transform file', async () => {
      const transformedFile = createFile('transformed.png', 512);
      const wrapper = mount(BUpload, {
        props: {
          action: '/upload',
          beforeUpload: () => Promise.resolve(transformedFile),
        },
      });

      const input = getInput(wrapper);
      Object.defineProperty(input.element, 'files', {
        value: createMockFileList([createFile()]),
        writable: false,
      });

      await input.trigger('change');
      await vi.runAllTimersAsync();

      const changeEvents = wrapper.emitted('change')!;
      expect(changeEvents.length).toBeGreaterThan(0);
    });

    it('does not trigger click on input when at maxCount', async () => {
      const files: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
        { uid: '2', name: 'file2.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: { defaultFileList: files, maxCount: 2 },
      });

      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('click');
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('uses custom slot for trigger', () => {
      const wrapper = mount(BUpload, {
        slots: {
          default: '<button class="custom-trigger">Custom Upload</button>',
        },
      });
      expect(wrapper.find('.custom-trigger').exists()).toBe(true);
      expect(wrapper.find('.b-upload__default-text').exists()).toBe(false);
    });

    it('renders hint slot', () => {
      const wrapper = mount(BUpload, {
        slots: {
          hint: '<span class="my-hint">Only PNG files</span>',
        },
      });
      expect(wrapper.find('.b-upload__hint').exists()).toBe(true);
      expect(wrapper.find('.my-hint').text()).toBe('Only PNG files');
    });

    it('handles controlled usage with v-model:fileList', async () => {
      const fileList: BUploadFile[] = [
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ];
      const wrapper = mount(BUpload, {
        props: {
          fileList,
          'onUpdate:fileList': (val: BUploadFile[]) => {
            wrapper.setProps({ fileList: val });
          },
          action: '/upload',
        },
      });

      expect(getListItems(wrapper).length).toBe(1);
    });

    it('does not upload when disabled', async () => {
      const wrapper = mount(BUpload, {
        props: { disabled: true, action: '/upload' },
      });
      const input = getInput(wrapper);
      const clickSpy = vi.spyOn(input.element as HTMLInputElement, 'click');

      await getTrigger(wrapper).trigger('click');
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('clears input value after file selection', async () => {
      const wrapper = mount(BUpload, {
        props: { action: '/upload' },
      });
      const input = getInput(wrapper);
      const inputEl = input.element as HTMLInputElement;

      Object.defineProperty(inputEl, 'files', {
        value: createMockFileList([createFile()]),
        writable: false,
      });

      await input.trigger('change');
      expect(inputEl.value).toBe('');
    });
  });

  describe('drag and drop', () => {
    it('adds drag-over class during drag', async () => {
      const wrapper = mount(BUpload);
      await getTrigger(wrapper).trigger('dragover');
      expect(wrapper.find('.b-upload--drag-over').exists()).toBe(true);
    });

    it('removes drag-over class on drag leave', async () => {
      const wrapper = mount(BUpload);
      await getTrigger(wrapper).trigger('dragover');
      await getTrigger(wrapper).trigger('dragleave');
      expect(wrapper.find('.b-upload--drag-over').exists()).toBe(false);
    });

    it('removes drag-over class on drop', async () => {
      const wrapper = mount(BUpload, {
        props: { action: '/upload' },
      });
      await getTrigger(wrapper).trigger('dragover');
      await getTrigger(wrapper).trigger('drop', {
        dataTransfer: { files: createMockFileList([createFile()]) },
      });
      expect(wrapper.find('.b-upload--drag-over').exists()).toBe(false);
    });

    it('does not activate drag when disabled', async () => {
      const wrapper = mount(BUpload, {
        props: { disabled: true },
      });
      await getTrigger(wrapper).trigger('dragover');
      expect(wrapper.find('.b-upload--drag-over').exists()).toBe(false);
    });
  });
});
