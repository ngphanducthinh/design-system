import { BLoadingOverlay } from '@/components';
import { BLoadingOverlaySpinnerSize } from '@/constants/Enums';
import type { Meta, StoryObj } from '@storybook/vue3';
import { watch } from 'vue';

const meta: Meta<typeof BLoadingOverlay> = {
  title: 'Components/LoadingOverlay',
  parameters: {
    docs: {
      description: {
        component: `The <code>BLoadingOverlay</code> component is used for displaying a loading overlay.`,
      },
    },
  },
  component: BLoadingOverlay,
  tags: ['autodocs'],
  // https://storybook.js.org/docs/react/essentials/controls
  argTypes: {
    spinnerSize: {
      control: 'select',
      options: Object.values(BLoadingOverlaySpinnerSize) as string[],
    },
  },
  args: {
    absolute: false,
    spinnerSize: BLoadingOverlaySpinnerSize.Medium,
  },
};

export default meta;
type Story = StoryObj<typeof BLoadingOverlay>;

export const Default: Story = {
  render: (args: any) => ({
    components: { BLoadingOverlay },
    setup() {
      watch(
        () => args.loading,
        (val) => {
          if (val) {
            setTimeout(() => {
              args.loading = false;
            }, 2000);
          }
        },
        {
          immediate: true,
        },
      );

      return { args };
    },
    template: `
      <BLoadingOverlay v-bind="args" />
      <span class="ds-text-xs ds-text-gray-500">Overlay displays about 2 seconds for demonstration purpose; In fact, it depends on 'loading' props in production mode.</span>
    `,
  }),
  args: {
    loading: false,
  },
};
