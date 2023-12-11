import { BTextField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTextField> = {
  title: 'Components/TextField',
  component: BTextField,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {},
  args: {
    inputId: '',
    inputCssClass: '',
    validationRules: undefined,
    label: '',
    prependIcon: '',
    hidePrependIcon: false,
    appendIcon: '',
    hideAppendIcon: false,
    placeholder: '',
    autocomplete: false,
    disabled: false,
    readonly: false,
    type: 'text',
    required: false,
    requiredErrorMessage: '',
    hideDetails: false,
    inputHandler: undefined,
    inputmode: 'text',
  },
};

export default meta;
type Story = StoryObj<typeof BTextField>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BTextField },
    setup() {
      const text = ref('');
      return { args, text };
    },
    template: `
      <BTextField v-bind="args"  v-model="text" />
    `,
  }),
  args: {
    modelValue: '',
  },
};
