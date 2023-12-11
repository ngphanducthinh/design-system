import { BTextarea, BTextField } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import FormValidationExample from './FormValidationExample.vue';

const meta: Meta<typeof FormValidationExample> = {
  title: 'FormValidation/Basic',
  component: FormValidationExample,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof FormValidationExample>;

export const Default: Story = {
  render: (args: any) => ({
    components: { FormValidationExample, BTextField, BTextarea },
    setup() {
      const formData = ref({
        firstName: '',
        lastName: '',

        message: '',
      });

      return { args, formData };
    },
    template: `
      <FormValidationExample v-bind="args">
        <div class="ds-flex-1">
          <BTextField v-model="formData.firstName" label="First name" required />
        </div>
        <div class="ds-flex-1">
          <BTextField v-model="formData.lastName" label="Last name" required />
        </div>
        <div class="ds-w-full">
          <BTextarea v-model="formData.message" label="Message" required />
        </div>
      </FormValidationExample>
    `,
  }),
  args: {},
};
