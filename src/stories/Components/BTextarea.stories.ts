import { BTextarea } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTextarea> = {
  title: 'Components/Textarea',
  parameters: {
    docs: {
      description: {
        component: `The <code>BTextarea</code> component is used for collecting large amounts of textual data.`,
      },
    },
  },
  component: BTextarea,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    inputCssClass: '',
    validationRules: undefined,
    label: '',
    placeholder: '',
    autocomplete: false,
    disabled: false,
    readonly: false,
    rows: 3,
    required: false,
    requiredErrorMessage: '',
    hideDetails: false,
  },
};

export default meta;
type Story = StoryObj<typeof BTextarea>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BTextarea },
    setup() {
      const text = ref('');
      return { args, text };
    },
    template: `
      <BTextarea v-bind="args"  v-model="text" />
    `,
  }),
  args: {
    modelValue: '',
  },
};
