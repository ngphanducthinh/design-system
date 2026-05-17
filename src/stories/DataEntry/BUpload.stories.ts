import { BUpload } from '@/components/BUpload';
import {
  BUploadListType,
  BUploadFileStatus,
  type BUploadFile,
} from '@/components/BUpload/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Entry/Upload',
  component: BUpload,
  tags: ['autodocs'],
  argTypes: {
    fileList: {
      control: 'object',
      description: 'Current file list (v-model:fileList).',
      table: { category: 'Two-Way Binding Props' },
    },
    accept: {
      control: 'text',
      description: 'File types that can be accepted.',
    },
    action: {
      control: 'text',
      description: 'Uploading URL.',
    },
    multiple: {
      control: 'boolean',
      description: 'Whether to support multiple file selection.',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the upload is disabled.',
      table: { defaultValue: { summary: 'false' } },
    },
    directory: {
      control: 'boolean',
      description: 'Support uploading directories.',
      table: { defaultValue: { summary: 'false' } },
    },
    maxCount: {
      control: 'number',
      description: 'Limit the number of uploaded files.',
    },
    listType: {
      control: 'select',
      options: Object.values(BUploadListType),
      description: 'Built-in style of the upload list.',
      table: { defaultValue: { summary: BUploadListType.Text } },
    },
    showUploadList: {
      control: 'boolean',
      description: 'Whether to show the upload list.',
      table: { defaultValue: { summary: 'true' } },
    },
    openFileDialogOnClick: {
      control: 'boolean',
      description: 'Click opens file dialog.',
      table: { defaultValue: { summary: 'true' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BUpload</code> provides a file upload component supporting click, drag-and-drop, and directory uploads. ' +
          'It supports multiple list display styles (text, picture, picture-card, picture-circle) and provides full control over the upload lifecycle.',
      },
    },
  },
} satisfies Meta<typeof BUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────

export const Playground: Story = {
  args: {
    action: 'https://httpbin.org/post',
    multiple: false,
    disabled: false,
    listType: BUploadListType.Text,
  },
  render: (args) => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([]);
      return { args, fileList };
    },
    template: `
      <BUpload
        v-bind="args"
        v-model:fileList="fileList"
      />
      <p style="margin-top: 12px; color: #666;">Files: {{ fileList.length }}</p>
    `,
  }),
};

export const ListTypes: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const textFiles = ref<BUploadFile[]>([
        { uid: '1', name: 'document.pdf', status: BUploadFileStatus.Done },
        { uid: '2', name: 'report.xlsx', status: BUploadFileStatus.Done },
      ]);
      const pictureFiles = ref<BUploadFile[]>([
        { uid: '3', name: 'photo.jpg', status: BUploadFileStatus.Done, thumbUrl: 'https://picsum.photos/48/48?random=1' },
        { uid: '4', name: 'avatar.png', status: BUploadFileStatus.Done, thumbUrl: 'https://picsum.photos/48/48?random=2' },
      ]);
      const cardFiles = ref<BUploadFile[]>([
        { uid: '5', name: 'image1.jpg', status: BUploadFileStatus.Done, thumbUrl: 'https://picsum.photos/102/102?random=3' },
        { uid: '6', name: 'image2.jpg', status: BUploadFileStatus.Done, thumbUrl: 'https://picsum.photos/102/102?random=4' },
      ]);
      return { textFiles, pictureFiles, cardFiles, BUploadListType };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 8px;">Text (default)</h4>
          <BUpload :listType="BUploadListType.Text" v-model:fileList="textFiles" action="https://httpbin.org/post" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Picture</h4>
          <BUpload :listType="BUploadListType.Picture" v-model:fileList="pictureFiles" action="https://httpbin.org/post" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Picture Card</h4>
          <BUpload :listType="BUploadListType.PictureCard" v-model:fileList="cardFiles" action="https://httpbin.org/post" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Picture Circle</h4>
          <BUpload :listType="BUploadListType.PictureCircle" v-model:fileList="cardFiles" action="https://httpbin.org/post" />
        </div>
      </div>
    `,
  }),
};

export const DragAndDrop: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([]);
      return { fileList };
    },
    template: `
      <BUpload v-model:fileList="fileList" action="https://httpbin.org/post" multiple>
        <div style="padding: 40px 20px; border: 2px dashed #d9d9d9; border-radius: 8px; text-align: center; cursor: pointer;">
          <p style="margin: 0 0 8px; font-size: 16px; color: #0958d9;">Click or drag file to this area to upload</p>
          <p style="margin: 0; color: rgba(0,0,0,0.6);">Support for single or bulk upload.</p>
        </div>
      </BUpload>
    `,
  }),
};

export const FileStatuses: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'success-file.pdf', status: BUploadFileStatus.Done },
        { uid: '2', name: 'uploading-file.png', status: BUploadFileStatus.Uploading, percent: 65 },
        { uid: '3', name: 'error-file.doc', status: BUploadFileStatus.Error },
      ]);
      return { fileList };
    },
    template: `
      <BUpload v-model:fileList="fileList" action="https://httpbin.org/post" />
    `,
  }),
};

export const MaxCount: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'file1.txt', status: BUploadFileStatus.Done },
      ]);
      return { fileList };
    },
    template: `
      <div>
        <p style="margin-bottom: 8px; color: #666;">Max 3 files allowed:</p>
        <BUpload v-model:fileList="fileList" action="https://httpbin.org/post" :maxCount="3" multiple />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    action: 'https://httpbin.org/post',
  },
  render: (args) => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'existing-file.txt', status: BUploadFileStatus.Done },
      ]);
      return { args, fileList };
    },
    template: `
      <BUpload v-bind="args" v-model:fileList="fileList" />
    `,
  }),
};

export const Accessibility: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'document.pdf', status: BUploadFileStatus.Done, url: 'http://example.com/doc.pdf' },
        { uid: '2', name: 'uploading.txt', status: BUploadFileStatus.Uploading, percent: 50 },
      ]);
      return { fileList };
    },
    template: `
      <BUpload
        v-model:fileList="fileList"
        action="https://httpbin.org/post"
        aria-label="Upload documents"
        :showUploadList="{ showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true }"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: /upload/i });
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('tabindex')).toBe('0');

    const list = canvas.getByRole('list');
    expect(list).toBeTruthy();
    expect(list.getAttribute('aria-label')).toBe('Uploaded files');

    const items = canvas.getAllByRole('listitem');
    expect(items.length).toBe(2);

    const progressBar = canvas.getByRole('progressbar');
    expect(progressBar).toBeTruthy();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');

    const removeButtons = canvas.getAllByLabelText('Remove file');
    expect(removeButtons.length).toBe(2);

    const previewBtn = canvas.getByLabelText('Preview file');
    expect(previewBtn).toBeTruthy();

    const downloadBtn = canvas.getByLabelText('Download file');
    expect(downloadBtn).toBeTruthy();

    await userEvent.tab();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  },
};

export const Theming: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'themed-file.pdf', status: BUploadFileStatus.Done },
        { uid: '2', name: 'uploading.png', status: BUploadFileStatus.Uploading, percent: 40 },
        { uid: '3', name: 'failed.doc', status: BUploadFileStatus.Error },
      ]);
      return { fileList };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div>
          <h4 style="margin-bottom: 8px;">Default theme</h4>
          <BUpload v-model:fileList="fileList" action="https://httpbin.org/post"
            :showUploadList="{ showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true }" />
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Custom theme (purple primary, green success, rounded)</h4>
          <BUpload
            v-model:fileList="fileList"
            action="https://httpbin.org/post"
            :showUploadList="{ showPreviewIcon: true, showRemoveIcon: true, showDownloadIcon: true }"
            style="--b-upload-color-primary: #722ed1; --b-upload-color-error: #eb2f96; --b-upload-border-radius: 16px;"
          />
        </div>
        <div>
          <h4 style="margin-bottom: 8px;">Compact theme (smaller card size)</h4>
          <BUpload
            v-model:fileList="fileList"
            action="https://httpbin.org/post"
            listType="picture-card"
            style="--b-upload-card-size: 72px; --b-upload-color-primary: #13c2c2; --b-upload-color-border: #13c2c2;"
          />
        </div>
      </div>
    `,
  }),
};

export const InteractionTest: Story = {
  render: () => ({
    components: { BUpload },
    setup() {
      const fileList = ref<BUploadFile[]>([
        { uid: '1', name: 'removable.txt', status: BUploadFileStatus.Done },
        { uid: '2', name: 'another.pdf', status: BUploadFileStatus.Done },
      ]);
      return { fileList };
    },
    template: `
      <BUpload v-model:fileList="fileList" action="https://httpbin.org/post" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const items = canvas.getAllByRole('listitem');
    expect(items.length).toBe(2);

    const removeButtons = canvas.getAllByLabelText('Remove file');
    await userEvent.click(removeButtons[0]);

    await waitFor(() => {
      const updatedItems = canvas.getAllByRole('listitem');
      expect(updatedItems.length).toBe(1);
    });

    const trigger = canvas.getByRole('button', { name: /upload file/i });
    expect(trigger).toBeTruthy();

    await userEvent.tab();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    await userEvent.keyboard('{Enter}');
  },
};

export const DesignTokens: Story = {
  render: () => ({
    setup() {
      const tokens = [
        { variable: '--b-upload-actions-color', fallback: 'rgba(0, 0, 0, 0.45)', description: 'Color of action buttons (preview, download, remove)' },
        { variable: '--b-upload-card-size', fallback: '102px', description: 'Width and height of picture-card / picture-circle items' },
        { variable: '--b-upload-color-primary', fallback: '#1677ff', description: 'Primary accent color (focus rings, hover, progress bar)' },
        { variable: '--b-upload-color-error', fallback: '#d32f2f', description: 'Error state color for failed uploads' },
        { variable: '--b-upload-color-success', fallback: '#52c41a', description: 'Success state color (reserved for status indicators)' },
        { variable: '--b-upload-color-border', fallback: '#d9d9d9', description: 'Border color for trigger and file list items' },
        { variable: '--b-upload-color-bg', fallback: '#fafafa', description: 'Background color for card trigger and hover states' },
        { variable: '--b-upload-color-bg-hover', fallback: '#f0f0f0', description: 'Background color on hover and progress track' },
        { variable: '--b-upload-color-text', fallback: 'rgba(0, 0, 0, 0.88)', description: 'Primary text color' },
        { variable: '--b-upload-color-text-secondary', fallback: 'rgba(0, 0, 0, 0.6)', description: 'Secondary text color (hints, icons, card trigger label)' },
        { variable: '--b-upload-border-radius', fallback: '8px', description: 'Border radius for trigger and list items' },
        { variable: '--b-upload-line-height', fallback: '1.5715', description: 'Line height for text content' },
        { variable: '--b-upload-font-size', fallback: '14px', description: 'Base font size' },
        { variable: '--b-upload-progress-stroke-width', fallback: '2px', description: 'Height of the progress bar' },
      ];
      return { tokens };
    },
    template: `
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding: 8px 12px;">CSS Variable</th>
            <th style="text-align: left; padding: 8px 12px;">Default</th>
            <th style="text-align: left; padding: 8px 12px;">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in tokens" :key="token.variable" style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 8px 12px; font-family: monospace; white-space: nowrap;">{{ token.variable }}</td>
            <td style="padding: 8px 12px; font-family: monospace;">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <span
                  v-if="token.fallback.startsWith('#') || token.fallback.startsWith('rgb')"
                  :style="{ width: '14px', height: '14px', borderRadius: '3px', background: token.fallback, border: '1px solid #ddd', display: 'inline-block' }"
                ></span>
                {{ token.fallback }}
              </span>
            </td>
            <td style="padding: 8px 12px;">{{ token.description }}</td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
