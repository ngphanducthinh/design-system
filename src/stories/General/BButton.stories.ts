import { BButton } from '@/components';
import { BButtonVariant, BCommonColor, BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

/**
 * BButton — versatile button supporting colors, sizes, variants, leading/trailing icons.
 *
 * The story file follows the canonical format described in `docs/STORY_FORMAT.md`:
 *   Usage  → one story per prop value (granular, copy-pasteable)
 *   Examples → composed real-world recipes
 *   Accessibility → roles + keyboard play tests
 *   Theming → CSS-token override demo
 *   Design Tokens → reference table (LAST story)
 */
const meta = {
  title: 'General/Button',
  component: BButton,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: Object.values(BCommonColor),
      description: 'Color family applied to background / text / outline.',
      table: { category: 'Props', defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Height / padding / typography preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: Object.values(BButtonVariant),
      description: 'Visual treatment.',
      table: { category: 'Props', defaultValue: { summary: 'solid' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled visual.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    prependIcon: {
      control: 'text',
      description: 'Icon name shown before the label.',
      table: { category: 'Props' },
    },
    appendIcon: {
      control: 'text',
      description: 'Icon name shown after the label.',
      table: { category: 'Props' },
    },
    default: {
      description: 'Button label / inline content.',
      table: { category: 'Slots' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BButton</code> component is a versatile button supporting various colors, sizes and variants.<br><br>' +
          '🔵 Primary — main action, at most one per section.<br>' +
          '⚪️ Secondary — equal-priority secondary actions.<br>' +
          '😶 Dashed — typically "add more".<br>' +
          '🔤 Text — the most secondary action.<br>' +
          '🔗 Link — external links rendered as buttons.',
      },
    },
  },
} satisfies Meta<typeof BButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default solid primary button. */
export const Default: Story = {
  args: {
    color: BCommonColor.Primary,
    size: BCommonSize.Medium,
    disabled: false,
    variant: BButtonVariant.Solid,
  },
  parameters: { docs: { source: { code: `<BButton>Primary</BButton>` } } },
  render: (args) => ({
    components: { BButton },
    setup: () => ({ args }),
    template: `<BButton v-bind="args">Primary</BButton>`,
  }),
};

/** Primary — for the page's main action. */
export const Primary: Story = {
  parameters: { docs: { source: { code: `<BButton color="primary">Primary</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="primary">Primary</BButton>`,
  }),
};

/** Secondary — for equal-priority actions. */
export const Secondary: Story = {
  parameters: { docs: { source: { code: `<BButton color="secondary">Secondary</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="secondary">Secondary</BButton>`,
  }),
};

/** Success — confirmations, completed states. */
export const Success: Story = {
  parameters: { docs: { source: { code: `<BButton color="success">Success</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="success">Success</BButton>`,
  }),
};

/** Failure — destructive / error actions. */
export const Failure: Story = {
  parameters: { docs: { source: { code: `<BButton color="failure">Delete</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="failure">Delete</BButton>`,
  }),
};

/** Warning — caution required. */
export const Warning: Story = {
  parameters: { docs: { source: { code: `<BButton color="warning">Warning</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="warning">Warning</BButton>`,
  }),
};

/** Info — neutral informational action. */
export const Info: Story = {
  parameters: { docs: { source: { code: `<BButton color="info">Info</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton color="info">Info</BButton>`,
  }),
};

/** Three sizes for different layout densities. Typography and height adjust together. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BButton size="sm">Small</BButton>
<BButton size="md">Medium</BButton>
<BButton size="lg">Large</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton size="sm">Small</BButton>
        <BButton size="md">Medium</BButton>
        <BButton size="lg">Large</BButton>
      </div>
    `,
  }),
};

/** The five visual variants — `solid`, `outlined`, `dashed`, `text`, `link`. */
export const Solid: Story = {
  parameters: { docs: { source: { code: `<BButton variant="solid">Solid</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton variant="solid">Solid</BButton>`,
  }),
};

export const Outlined: Story = {
  parameters: { docs: { source: { code: `<BButton variant="outlined">Outlined</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton variant="outlined">Outlined</BButton>`,
  }),
};

export const Dashed: Story = {
  parameters: { docs: { source: { code: `<BButton variant="dashed">Dashed</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton variant="dashed">Dashed</BButton>`,
  }),
};

export const Text: Story = {
  parameters: { docs: { source: { code: `<BButton variant="text">Text</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton variant="text">Text</BButton>`,
  }),
};

export const LinkVariant: Story = {
  name: 'Link',
  parameters: { docs: { source: { code: `<BButton variant="link">Link</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `<BButton variant="link">Link</BButton>`,
  }),
};

/** Disabled buttons receive `cursor: not-allowed` semantics and reduced opacity. */
export const Disabled: Story = {
  parameters: { docs: { source: { code: `<BButton disabled>Disabled</BButton>` } } },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton disabled>Solid</BButton>
        <BButton variant="outlined" disabled>Outlined</BButton>
        <BButton variant="text" disabled>Text</BButton>
      </div>
    `,
  }),
};

/** Visual matrix of every variant × every color. Useful as a regression reference. */
export const VariantMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Every variant rendered against every color — visual regression reference.',
      },
      source: {
        code: `
<BButton variant="solid" color="primary">Solid</BButton>
<BButton variant="outlined" color="primary">Outlined</BButton>
<BButton variant="dashed" color="primary">Dashed</BButton>
<BButton variant="text" color="primary">Text</BButton>
<BButton variant="link" color="primary">Link</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    setup() {
      return {
        colors: Object.values(BCommonColor),
        variants: Object.values(BButtonVariant),
      };
    },
    template: `
      <table>
        <tbody>
          <tr v-for="c in colors" :key="c">
            <td>
              <div class="b:py-4 b:pr-4" style="text-transform:capitalize;">{{ c }}:</div>
            </td>
            <td>
              <div class="b:flex b:flex-wrap b:items-center b:gap-2">
                <BButton v-for="v in variants" :key="v" :variant="v" :color="c">
                  {{ v.charAt(0).toUpperCase() + v.slice(1) }}
                </BButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Buttons can render leading and trailing icons via the `prependIcon` / `appendIcon` props. */
export const WithIcon: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BButton prepend-icon="check">Approve</BButton>
<BButton append-icon="arrow-right" variant="outlined">Continue</BButton>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton prepend-icon="check">Approve</BButton>
        <BButton append-icon="arrow-right" variant="outlined">Continue</BButton>
        <BButton prepend-icon="trash" color="failure" variant="text">Delete</BButton>
      </div>
    `,
  }),
};

/** Without a default slot, the button squares to a fixed icon-only footprint. */
export const IconOnly: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BButton prepend-icon="check" aria-label="Confirm" />`,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-2">
        <BButton size="sm" prepend-icon="check" aria-label="Confirm small" />
        <BButton size="md" prepend-icon="check" aria-label="Confirm medium" />
        <BButton size="lg" prepend-icon="check" aria-label="Confirm large" />
      </div>
    `,
  }),
};

/** Several buttons forming a button-bar — common in toolbars and dialog footers. */
export const ButtonGroup: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<div class="b:flex b:gap-2">
  <BButton variant="outlined">Cancel</BButton>
  <BButton color="failure">Delete</BButton>
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:gap-2">
        <BButton variant="outlined">Cancel</BButton>
        <BButton color="failure">Delete</BButton>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BButton renders a native `<button type="button">`, so it is reachable via Tab,
 * activates on Enter or Space, and exposes `disabled` semantics to assistive tech.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The component renders a native <code>&lt;button&gt;</code>, so it is keyboard-reachable via <kbd>Tab</kbd>, activates on <kbd>Enter</kbd> or <kbd>Space</kbd>, and skips the disabled instance.',
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div class="b:flex b:gap-2">
        <BButton>First</BButton>
        <BButton disabled>Disabled</BButton>
        <BButton variant="outlined">Last</BButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const buttons = c.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('First');
    expect(buttons[1]).toBeDisabled();

    // Tab moves focus to the first enabled button, skipping disabled when re-tabbed.
    await userEvent.tab();
    expect(buttons[0]).toHaveFocus();
    await userEvent.tab();
    // Native disabled buttons are skipped by the browser's tab order.
    expect(buttons[2]).toHaveFocus();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * BButton has no component-scoped `--b-button-*` vars — it consumes the global
 * theme tokens from `src/assets/tailwind.css`. Override the `--color-*` family
 * on a wrapping element to retheme the buttons inside it.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BButton uses Tailwind utilities that resolve against the global <code>--color-*</code> tokens. Override <code>--color-primary</code>, <code>--color-primary-hover</code>, and <code>--color-primary-hover-light</code> on any ancestor to retheme primary buttons inside.',
      },
      source: {
        code: `
<div
  style="
    --color-primary: oklch(50% 0.18 290);
    --color-primary-hover: oklch(42% 0.2 290);
    --color-primary-hover-light: oklch(90% 0.06 290);
  "
>
  <BButton variant="solid">Solid</BButton>
  <BButton variant="outlined">Outlined</BButton>
  <BButton variant="text">Text</BButton>
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton },
    template: `
      <div
        class="b:flex b:flex-wrap b:items-center b:gap-2 b:rounded-lg b:p-4"
        style="
          border: 1px dashed oklch(85% 0.005 260);
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
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

// Note: Unlike most components, BButton has NO component-scoped `--b-button-*` CSS vars.
// It is styled entirely with Tailwind utility classes that resolve against the global
// Tailwind theme defined in `src/assets/tailwind.css`. The themable surface is therefore
// the global color family and size tokens listed below.
const DESIGN_TOKENS: TokenRow[] = [
  { token: '--color-primary', defaultValue: 'oklch(55% 0.169 237.323)', description: 'Solid bg / text / outline color for the primary button.' },
  { token: '--color-primary-hover', defaultValue: 'oklch(48% 0.158 241.966)', description: 'Hover bg / text / outline color for the primary button.' },
  { token: '--color-primary-hover-light', defaultValue: 'oklch(80% 0.058 230.902)', description: 'Hover background tint used by the text variant of the primary button.' },
  { token: '--color-secondary', defaultValue: 'oklch(92% 0.004 286.32)', description: 'Solid bg / outline color for the secondary button.' },
  { token: '--color-secondary-hover', defaultValue: 'oklch(87.1% 0.006 286.286)', description: 'Hover color for the secondary button.' },
  { token: '--color-secondary-hover-light', defaultValue: 'oklch(96.7% 0.001 286.375)', description: 'Hover background tint for the secondary text variant.' },
  { token: '--color-success', defaultValue: 'oklch(50% 0.17 149.579)', description: 'Solid bg / text / outline color for the success button.' },
  { token: '--color-success-hover', defaultValue: 'oklch(43% 0.15 149.214)', description: 'Hover color for the success button.' },
  { token: '--color-success-hover-light', defaultValue: 'oklch(87.1% 0.15 154.449)', description: 'Hover background tint for the success text variant.' },
  { token: '--color-failure', defaultValue: 'oklch(55% 0.22 25.331)', description: 'Solid bg / text / outline color for the failure (danger) button.' },
  { token: '--color-failure-hover', defaultValue: 'oklch(49% 0.21 27.325)', description: 'Hover color for the failure button.' },
  { token: '--color-failure-hover-light', defaultValue: 'oklch(80.8% 0.114 19.571)', description: 'Hover background tint for the failure text variant.' },
  { token: '--color-warning', defaultValue: 'oklch(55% 0.16 55.934)', description: 'Solid bg / text / outline color for the warning button.' },
  { token: '--color-warning-hover', defaultValue: 'oklch(48% 0.15 47.604)', description: 'Hover color for the warning button.' },
  { token: '--color-warning-hover-light', defaultValue: 'oklch(90.1% 0.076 70.697)', description: 'Hover background tint for the warning text variant.' },
  { token: '--color-info', defaultValue: 'oklch(55% 0.2 259.815)', description: 'Solid bg / text / outline color for the info button.' },
  { token: '--color-info-hover', defaultValue: 'oklch(48% 0.2 262.881)', description: 'Hover color for the info button.' },
  { token: '--color-info-hover-light', defaultValue: 'oklch(80.9% 0.105 251.813)', description: 'Hover background tint for the info text variant.' },
  { token: '--color-black-base', defaultValue: 'oklch(0 0 0 / 0.8)', description: 'Text color used by the secondary outlined / text / link variants.' },
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
          '<code>--color-*</code> tokens listed below at <code>:root</code> or any ancestor element.',
      },
    },
  },
  render: () => ({
    components: { BButton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BButton — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          BButton consumes the global Tailwind theme tokens — there are no component-scoped <code>--b-button-*</code> vars.
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
      </div>
    `,
  }),
};
