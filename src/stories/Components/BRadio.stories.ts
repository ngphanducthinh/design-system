import { BRadio } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BRadio> = {
  title: 'Components/Radio',
  parameters: {
    docs: {
      description: {
        component: `The <code>BRadio</code> component is a simple radio button.`,
      },
    },
  },
  component: BRadio,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {
    inputId: '',
    inputName: '',
    label: '',
    labelOrphan: false,
    disabled: false,
    labelCssClass: '',
    hideDetails: false,
    validationRules: undefined,
    required: false,
    requiredErrorMessage: '',
  },
};

export default meta;
type Story = StoryObj<typeof BRadio>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BRadio },
    setup() {
      const radio = ref('');
      return { args, radio };
    },
    template: `
      <div class="ds-flex ds-gap-4 ds-mb-4">
        <BRadio
          v-bind="args"
          v-model="radio"
          value="01"
          :label="args.label || 'Value 01'"
        />
        <BRadio
          v-bind="args"
          v-model="radio"
          value="02"
          :label="args.label || 'Value 02'"
        />
        <BRadio
          v-bind="args"
          v-model="radio"
          value="03"
          :label="args.label || 'Value 03'"
        />
      </div>

      <p class="ds-text-xs ds-text-gray-500">
        Selected value: {{ radio }}
      </p>
    `,
  }),
  args: {
    modelValue: '',
  },
};
