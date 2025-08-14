import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { BButtonColor, BButtonSize, BButtonVariant } from '@/types.ts';
import { BButton } from '../components';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Example/Button',
  component: BButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: Object.values(BButtonColor) },
    size: { control: 'select', options: Object.values(BButtonSize) },
    variant: { control: 'select', options: Object.values(BButtonVariant) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BButton</code> component is a versatile button component that supports various colors, sizes, and variants.<br><br>' +
          '🔵 Primary button: used for the main action, there can be at most one primary button in a section.<br>' +
          '⚪️ Secondary button: used for a series of actions without priority.<br>' +
          '😶 Dashed button: commonly used for adding more actions.<br>' +
          '🔤 Text button: used for the most secondary action.<br>' +
          '🔗 Link button: used for external links.',
      },
    },
  },
} satisfies Meta<typeof BButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * This story demonstrates the default usage of the BButton component.
 */
export const Default: Story = {
  args: {
    color: BButtonColor.Primary,
    size: BButtonSize.Medium,
    disabled: false,
    variant: BButtonVariant.Solid,
  },
  render: (args: any) => ({
    components: { BButton },
    setup() {
      return { args };
    },
    template: `
      <BButton v-bind="args">Primary</BButton>
    `,
  }),
};

/**
 * This story demonstrates the default usage of the BButton component.
 */
export const Color: Story = {
  parameters: {
    docs: {
      source: {
        code: `
          <BButton>Primary</BButton>
          <BButton color="secondary">Secondary</BButton>
          <BButton color="success">Success</BButton>
          <BButton color="failure">Failure</BButton>
          <BButton color="warning">Warning</BButton>
          <BButton color="info">Info</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton>Primary</BButton>
        <BButton color="secondary">Secondary</BButton>
        <BButton color="success">Success</BButton>
        <BButton color="failure">Failure</BButton>
        <BButton color="warning">Warning</BButton>
        <BButton color="info">Info</BButton>
      </div>
    `,
  }),
};

/**
 * This story demonstrates the different button sizes available in the BButton component.
 */
export const Size: Story = {
  parameters: {
    docs: {
      source: {
        code: `
          <BButton size="sm">Primary</BButton>
          <BButton>Secondary</BButton>
          <BButton size="lg">Success</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton size="sm">Small</BButton>
        <BButton>Medium</BButton>
        <BButton size="lg">Large</BButton>
      </div>
    `,
  }),
};

/**
 * This story demonstrates the different button variants available in the BButton component.
 */
export const Variant: Story = {
  parameters: {
    docs: {
      source: {
        code: `
          <BButton variant="solid">Solid</BButton>
          <BButton variant="outlined">Outlined</BButton>
          <BButton variant="dashed">Dashed</BButton>
          <BButton variant="text">Text</BButton>
          <BButton variant="link">Link</BButton>

          <BButton variant="solid" color="secondary">Solid</BButton>
          <BButton variant="outlined" color="secondary">Outlined</BButton>
          <BButton variant="dashed" color="secondary">Dashed</BButton>
          <BButton variant="text" color="secondary">Text</BButton>
          <BButton variant="link" color="secondary">Link</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <table>
        <tbody>
          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Primary:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid">Solid</BButton>
                <BButton variant="outlined">Outlined</BButton>
                <BButton variant="dashed">Dashed</BButton>
                <BButton variant="text">Text</BButton>
                <BButton variant="link">Link</BButton>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Secondary:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid" color="secondary">Solid</BButton>
                <BButton variant="outlined" color="secondary">Outlined</BButton>
                <BButton variant="dashed" color="secondary">Dashed</BButton>
                <BButton variant="text" color="secondary">Text</BButton>
                <BButton variant="link" color="secondary">Link</BButton>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Success:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid" color="success">Solid</BButton>
                <BButton variant="outlined" color="success">Outlined</BButton>
                <BButton variant="dashed" color="success">Dashed</BButton>
                <BButton variant="text" color="success">Text</BButton>
                <BButton variant="link" color="success">Link</BButton>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Failure:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid" color="failure">Solid</BButton>
                <BButton variant="outlined" color="failure">Outlined</BButton>
                <BButton variant="dashed" color="failure">Dashed</BButton>
                <BButton variant="text" color="failure">Text</BButton>
                <BButton variant="link" color="failure">Link</BButton>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Warning:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid" color="warning">Solid</BButton>
                <BButton variant="outlined" color="warning">Outlined</BButton>
                <BButton variant="dashed" color="warning">Dashed</BButton>
                <BButton variant="text" color="warning">Text</BButton>
                <BButton variant="link" color="warning">Link</BButton>
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <div class="b:py-4 b:pr-4">
                Info:
              </div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton variant="solid" color="info">Solid</BButton>
                <BButton variant="outlined" color="info">Outlined</BButton>
                <BButton variant="dashed" color="info">Dashed</BButton>
                <BButton variant="text" color="info">Text</BButton>
                <BButton variant="link" color="info">Link</BButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};
