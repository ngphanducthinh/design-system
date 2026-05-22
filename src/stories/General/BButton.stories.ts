import { BButton } from '@/components';
import { BButtonVariant, BCommonColor, BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'General/Button',
  component: BButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: Object.values(BCommonColor) },
    size: { control: 'select', options: Object.values(BCommonSize) },
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
    color: BCommonColor.Primary,
    size: BCommonSize.Medium,
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

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

// Note: Unlike most components, BButton has NO component-scoped `--b-button-*` CSS vars.
// It is styled entirely with Tailwind utility classes that resolve against the global
// Tailwind theme defined in `src/assets/tailwind.css`. The themable surface is therefore
// the global color family and size tokens listed below.
const DESIGN_TOKENS: TokenRow[] = [
  // ── Global theme color tokens consumed by BButton ──
  {
    token: '--color-primary',
    defaultValue: 'oklch(55% 0.169 237.323)',
    description: 'Solid bg / text / outline color for the primary button.',
  },
  {
    token: '--color-primary-hover',
    defaultValue: 'oklch(48% 0.158 241.966)',
    description: 'Hover bg / text / outline color for the primary button.',
  },
  {
    token: '--color-primary-hover-light',
    defaultValue: 'oklch(80% 0.058 230.902)',
    description: 'Hover background tint used by the text variant of the primary button.',
  },
  {
    token: '--color-secondary',
    defaultValue: 'oklch(92% 0.004 286.32)',
    description: 'Solid bg / outline color for the secondary button.',
  },
  {
    token: '--color-secondary-hover',
    defaultValue: 'oklch(87.1% 0.006 286.286)',
    description: 'Hover color for the secondary button.',
  },
  {
    token: '--color-secondary-hover-light',
    defaultValue: 'oklch(96.7% 0.001 286.375)',
    description: 'Hover background tint for the secondary text variant.',
  },
  {
    token: '--color-success',
    defaultValue: 'oklch(50% 0.17 149.579)',
    description: 'Solid bg / text / outline color for the success button.',
  },
  {
    token: '--color-success-hover',
    defaultValue: 'oklch(43% 0.15 149.214)',
    description: 'Hover color for the success button.',
  },
  {
    token: '--color-success-hover-light',
    defaultValue: 'oklch(87.1% 0.15 154.449)',
    description: 'Hover background tint for the success text variant.',
  },
  {
    token: '--color-failure',
    defaultValue: 'oklch(55% 0.22 25.331)',
    description: 'Solid bg / text / outline color for the failure (danger) button.',
  },
  {
    token: '--color-failure-hover',
    defaultValue: 'oklch(49% 0.21 27.325)',
    description: 'Hover color for the failure button.',
  },
  {
    token: '--color-failure-hover-light',
    defaultValue: 'oklch(80.8% 0.114 19.571)',
    description: 'Hover background tint for the failure text variant.',
  },
  {
    token: '--color-warning',
    defaultValue: 'oklch(55% 0.16 55.934)',
    description: 'Solid bg / text / outline color for the warning button.',
  },
  {
    token: '--color-warning-hover',
    defaultValue: 'oklch(48% 0.15 47.604)',
    description: 'Hover color for the warning button.',
  },
  {
    token: '--color-warning-hover-light',
    defaultValue: 'oklch(90.1% 0.076 70.697)',
    description: 'Hover background tint for the warning text variant.',
  },
  {
    token: '--color-info',
    defaultValue: 'oklch(55% 0.2 259.815)',
    description: 'Solid bg / text / outline color for the info button.',
  },
  {
    token: '--color-info-hover',
    defaultValue: 'oklch(48% 0.2 262.881)',
    description: 'Hover color for the info button.',
  },
  {
    token: '--color-info-hover-light',
    defaultValue: 'oklch(80.9% 0.105 251.813)',
    description: 'Hover background tint for the info text variant.',
  },
  {
    token: '--color-black-base',
    defaultValue: 'oklch(0 0 0 / 0.8)',
    description: 'Text color used by the secondary outlined / text / link variants.',
  },
  // Note: AntD button-specific tokens (contentFontSize/SM/LG, defaultBg, defaultActiveBg,
  // defaultBgDisabled, defaultBorderColor, defaultColor, defaultGhostBorderColor, defaultGhostColor,
  // defaultHoverBg, defaultHoverBorderColor, defaultHoverColor, defaultShadow, primaryColor,
  // primaryShadow, dangerColor, dangerShadow, ghostBg, iconGap, linkHoverBg, onlyIconSize/SM/LG,
  // paddingInline/SM/LG, solidTextColor, textHoverBg, textTextColor, textTextHoverColor,
  // textTextActiveColor, fontWeight, dashedBgDisabled) are not yet implemented as dedicated
  // `--b-button-*` vars. BButton currently relies on Tailwind utility classes that pull from
  // the global theme tokens above; sizes are baked in as Tailwind classes (h-6/8/10, px-2/4,
  // text-sm/base) and not exposed as CSS custom properties.
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'BButton has <strong>no component-scoped <code>--b-button-*</code> CSS variables</strong>. ' +
          'It is styled with Tailwind utility classes that resolve against the global theme tokens ' +
          'defined in <code>src/assets/tailwind.css</code>. To retheme buttons, override the ' +
          '<code>--color-*</code> tokens listed below at <code>:root</code> or any ancestor element. ' +
          'AntD button tokens (e.g. <code>defaultBg</code>, <code>primaryShadow</code>, ' +
          '<code>paddingInline</code>) are not yet implemented as dedicated vars.',
      },
    },
  },
  render: () => ({
    components: { BButton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BButton - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          BButton consumes the global Tailwind theme tokens - there are no component-scoped <code>--b-button-*</code> vars.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:oklch(96% 0.002 260);">
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">CSS Variable</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Default</th>
              <th style="text-align:left;padding:10px 12px;border-bottom:1px solid oklch(85% 0.005 260);">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tokens" :key="t.token" style="border-bottom:1px solid oklch(94% 0.003 260);">
              <td style="padding:8px 12px;font-family:monospace;color:oklch(40% 0.18 280);"><code>{{ t.token }}</code></td>
              <td style="padding:8px 12px;font-family:monospace;color:#595959;">{{ t.defaultValue }}</td>
              <td style="padding:8px 12px;">{{ t.description }}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Three primary-color tokens overridden on a wrapping <code>div</code> retheme every primary button inside it.
        </p>
        <div
          style="
            display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;padding:1rem;border:1px dashed oklch(85% 0.005 260);border-radius:8px;
            --color-primary: oklch(50% 0.18 290);
            --color-primary-hover: oklch(42% 0.2 290);
            --color-primary-hover-light: oklch(90% 0.06 290);
          "
        >
          <BButton variant="solid">Solid</BButton>
          <BButton variant="outlined">Outlined</BButton>
          <BButton variant="dashed">Dashed</BButton>
          <BButton variant="text">Text</BButton>
          <BButton variant="link">Link</BButton>
        </div>
      </div>
    `,
  }),
};
