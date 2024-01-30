import { BImagePicker } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref, watch } from 'vue';
import type { FileItemRead } from '@/types';

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction
const meta: Meta<typeof BImagePicker> = {
  title: 'Components/ImagePicker',
  parameters: {
    docs: {
      description: {
        component: `The <code>BImagePicker</code> component allow to pick single or multiple images from your machine.`,
      },
    },
  },
  component: BImagePicker,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  // https://storybook.js.org/blog/storybook-7-docs/
  tags: ['autodocs'],
  argTypes: {},
  args: {
    inputId: '',
    label: '',
    multiple: false,
    maxFileSize: 20, // MB (Megabyte)
    hideDetails: false,
    required: false,
    requiredErrorMessage: '',
    validationRules: undefined,
  }, // default value
};

export default meta;

type Story = StoryObj<typeof BImagePicker>;
export const Default: Story = {
  render: (args: any) => ({
    components: { BImagePicker },
    setup() {
      const image = ref<FileItemRead>({});
      const images = ref<FileItemRead[]>([]);

      watch(
        () => args.multiple,
        () => {
          image.value = {};
          images.value = [];
        },
      );

      return { args, image, images };
    },
    template: `
      <BImagePicker v-if="args.multiple" v-bind="args" v-model="images" />
      <BImagePicker v-else v-bind="args" v-model="image" />
    `,
  }),
  args: {},
};
