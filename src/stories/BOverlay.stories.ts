import { BOverlay } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BOverlay> = {
  title: 'Components/Overlay',
  parameters: {
    docs: {
      description: {
        component: `The <code>BOverlay</code> is used for displaying an overlay.`,
      },
    },
  },
  component: BOverlay,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof BOverlay>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BOverlay },
    setup() {
      return { args };
    },
    template: `
      <div style="height: 400px">
        <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book</div>
        <BOverlay v-bind="args">
          <i class="fa-solid fa-wrench ds-text-4xl ds-text-white" />
        </BOverlay>
      </div>
    `,
  }),
  args: {},
};
