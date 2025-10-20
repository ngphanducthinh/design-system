import { BTooltip } from '@/components';
import { BTooltipPlacement, BTooltipTrigger } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Data Display/Tooltip',
  component: BTooltip,
  tags: ['autodocs'],
  argTypes: {
    trigger: { control: 'select', options: Object.values(BTooltipTrigger) },
    placement: { control: 'select', options: Object.values(BTooltipPlacement) },
  },
  parameters: {
    docs: {
      description: {
        component: 'The <code>BTooltip</code> component is a simple text popup box.<br><br>',
      },
    },
  },
} satisfies Meta<typeof BTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the default usage of the BButton component.
 */
export const Default: Story = {
  args: {
    tooltip: 'Have a nice day!',
    trigger: BTooltipTrigger.Hover,
    placement: BTooltipPlacement.TopCenter,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <BTooltip tooltip="Have a nice day!">
            Tooltip will show on mouse enter.
          </BTooltip>
        `,
      },
    },
  },
  render: (args: any) => ({
    components: { BTooltip },
    setup() {
      return { args };
    },
    template: `
      <div class="b:h-24 b:py-8">
        <BTooltip v-bind="args">
          Tooltip will show on mouse enter.
        </BTooltip>
      </div>
    `,
  }),
};
