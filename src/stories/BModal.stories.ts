import {
  BButton,
  BModal,
  BModalBody,
  BModalFooter,
  BModalHeader,
} from '@/components';
import { BModalSize } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';

const meta: Meta<typeof BModal> = {
  title: 'Components/Modal',
  component: BModal,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    // @ts-ignore
    size: {
      control: 'select',
      options: Object.values(BModalSize) as string[],
    },
  },
  args: {
    // @ts-ignore
    modelValue: false,
    size: BModalSize.Medium,
    fullscreen: false,
    persistent: false,
  },
};

export default meta;
type Story = StoryObj<typeof BModal>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BModal, BModalHeader, BModalBody, BModalFooter, BButton },
    setup() {
      const modals = ref({
        test: false,
      });

      return { args, modals };
    },
    template: `
      <BButton @click="modals.test = true">{{ 'Open Modal' }}</BButton>
      <BModal v-bind="args" v-model="modals.test">
        <BModalHeader>
          <span style="font-size: 20px; font-weight: 600">{{ 'Modal Header' }}</span>
        </BModalHeader>
        <BModalBody>
          <div class="ds-flex ds-justify-center">
            <img src="https://wallpapers.com/images/hd/attractive-lake-nature-pczghhhvhzi0yf7t.webp" class="rounded-lg object-cover" style="max-height: 400px" alt="" />
          </div>
        </BModalBody>
        <BModalFooter>
          <BButton @click="modals.test = false">{{ 'Close' }}</BButton>
        </BModalFooter>
      </BModal>
    `,
  }),
  args: {},
};
