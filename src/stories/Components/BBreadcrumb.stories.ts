import { BBreadcrumb } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3';

const meta: Meta<typeof BBreadcrumb> = {
  title: 'Components/Breadcrumb',
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BBreadcrumb</code> component is used as a responsive navigational helper and hierarchy for pages.',
      },
    },
  },
  component: BBreadcrumb,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  // argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof BBreadcrumb>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BBreadcrumb },
    setup() {
      return { args };
    },
    template: `
      <div class="ds-shadow ds-rounded-lg ds-p-5">
          <BBreadcrumb v-bind="args">
          </BBreadcrumb>
      </div>
      <div style="font-size: 0.75rem; color: gray; margin-top: 1rem; margin-bottom: 60px">
        Breadcrumb items will be hidden selectively on smaller screen.
      </div>
    `,
  }),
  args: {
    items: [
      { text: 'Home', href: '/' },
      { text: 'Location', href: '#location' },
      { text: 'North America', href: '#location/north-america' },
      {
        text: 'United States of America',
        href: '#location/north-america/usa',
      },
    ],
  },
};
