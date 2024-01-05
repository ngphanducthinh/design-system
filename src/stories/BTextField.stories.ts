import { BTextField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BTextField> = {
  title: 'Components/TextField',
  // https://storybook.js.org/docs/api/doc-block-description#writing-descriptions
  parameters: {
    docs: {
      description: {
        component:
          'Text field components are used for collecting user provided information.',
      },
    },
  },
  component: BTextField,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    prependIcon: {
      control: 'text',
      description: 'Prepend icon',
    },
    appendIcon: {
      control: 'text',
      description: 'Append icon',
    },
  },
  args: {
    inputId: '',
    inputCssClass: '',
    validationRules: undefined,
    label: '',
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
      <BTextField v-bind="args" v-model="text">
        <template v-if="args.prependIcon" #prependIcon><span v-html="args.prependIcon" /></template>
        <template v-if="args.appendIcon" #appendIcon><span v-html="args.appendIcon" /></template>
      </BTextField>
      <div style="font-size: 0.75rem; color: gray; margin-top: 1rem">
        <b>FontAwesome v6.1.0 - Solid</b> has been imported already & can be used for demo.
      </div>
    `,
  }),
  args: {
    modelValue: '',
    prependIcon: '',
    appendIcon: '<i class="fa-solid fa-magnifying-glass" />',
  },
};
