import { BButton, BToast, BToastItem } from '@/components';
import { BToastItemType } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import type { BToastItemModel } from '@/types';

const meta: Meta<typeof BToast> = {
  title: 'Components/Toast',
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BToast</code> component is used for displaying a quick message to a user.',
      },
    },
  },
  component: BToast,
  tags: ['autodocs'],
  // argTypes: {},
  args: {
    modelValue: [],
  },
};

export default meta;
type Story = StoryObj<typeof BToast>;

const defaultToastItems = [
  {
    text: 'Success',
    type: BToastItemType.Success,
  },
  {
    text: 'Success',
    message: 'This is a success message',
    type: BToastItemType.Success,
  },
  {
    text: 'Error',
    type: BToastItemType.Error,
  },
  {
    text: 'Error',
    message: 'This is a error message',
    type: BToastItemType.Error,
  },
  {
    text: 'Default',
    type: BToastItemType.Default,
  },
  {
    text: 'Default',
    message: 'This is a default message',
    type: BToastItemType.Default,
  },
];
export const Default: Story = {
  render: (args: any) => ({
    components: { BToast, BToastItem, BButton },
    setup() {
      const toastItems = ref<BToastItemModel[]>(
        structuredClone(defaultToastItems),
      );
      const refresh = () => {
        toastItems.value = structuredClone(defaultToastItems);
      };

      return { args, toastItems, refresh };
    },
    template: `
      <BToast v-bind="args" v-model="toastItems" style="position: relative; top: unset; right: unset;" />
      
      <div class="ds-w-full ds-text-right ds-my-24">
        <BButton :disabled="toastItems.length === 3" type="icon" size="sm" @click="refresh">
          <i class="fa-solid fa-arrows-rotate"></i>
        </BButton>
      </div>
    `,
  }),
  args: {
    modelValue: structuredClone(defaultToastItems),
  },
};

export const CustomSlots: Story = {
  render: (args: any) => ({
    components: { BToastItem },
    setup() {
      return { args };
    },
    template: `
      <BToastItem type="success">
        <template #text>
          <span class="ds-font-semibold ds-text-black/80">
            Success
          </span>
        </template>
        <template #message>
          <span class="ds-text-gray-500">
            Nice to meet you!
          </span>
        </template>
      </BToastItem>

      <BToastItem type="error">
        <template #text>
          <span class="ds-font-semibold ds-text-black/80">
            Error
          </span>
        </template>
        <template #message>
          <span class="ds-text-gray-500">
            Nice to meet you!
          </span>
        </template>
      </BToastItem>
      
      <BToastItem>
        <template #text>
          <span class="ds-font-semibold ds-text-black/80">
            Default
          </span>
        </template>
        <template #message>
          <span class="ds-text-gray-500">
            Nice to meet you!
          </span>
        </template>
      </BToastItem>
    `,
  }),
};
