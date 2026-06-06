import { BDivider } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

/**
 * BDivider — separates content into clear groups.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST)
 */
const meta = {
  title: 'Layout/Divider',
  component: BDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Line direction.',
      table: { category: 'Props', defaultValue: { summary: 'horizontal' } },
    },
    variant: {
      control: 'select',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Line style.',
      table: { category: 'Props', defaultValue: { summary: 'solid' } },
    },
    dashed: {
      control: 'boolean',
      description: 'Legacy shorthand for `variant="dashed"`. Prefer `variant` prop.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    plain: {
      control: 'boolean',
      description: 'Render embedded text in plain (normal weight) style.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Vertical spacing around horizontal dividers.',
      table: { category: 'Props', defaultValue: { summary: 'large' } },
    },
    titlePlacement: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Horizontal position of the title text.',
      table: { category: 'Props', defaultValue: { summary: 'center' } },
    },
    default: {
      description: 'Optional embedded text / content rendered inline within the divider.',
      table: { category: 'Slots' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDivider</code> component separates content into clear groups.<br><br>' +
          'It supports <strong>horizontal</strong> (block-level rule) and <strong>vertical</strong> (inline separator) orientations, ' +
          'three line styles (<em>solid</em>, <em>dashed</em>, <em>dotted</em>), optional embedded text, and size variants for vertical spacing.',
      },
    },
  },
} satisfies Meta<typeof BDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default horizontal solid divider with optional embedded text. */
export const Default: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    dashed: false,
    plain: true,
    size: 'large',
    titlePlacement: 'center',
  },
  parameters: {
    docs: {
      source: { code: `<BDivider>With Text</BDivider>` },
    },
  },
  render: (args) => ({
    components: { BDivider },
    setup: () => ({ args }),
    template: `
      <div>
        <p style="margin:0 0 0.5rem;">Content above</p>
        <BDivider v-bind="args">With Text</BDivider>
        <p style="margin:0.5rem 0 0;">Content below</p>
      </div>
    `,
  }),
};

/** Solid line — the default style. */
export const Solid: Story = {
  parameters: { docs: { source: { code: `<BDivider variant="solid" />` } } },
  render: () => ({
    components: { BDivider },
    template: `<BDivider variant="solid" />`,
  }),
};

/** Dashed line — useful as a softer separator. */
export const Dashed: Story = {
  parameters: { docs: { source: { code: `<BDivider variant="dashed" />` } } },
  render: () => ({
    components: { BDivider },
    template: `<BDivider variant="dashed" />`,
  }),
};

/** Dotted line — the lightest visual weight. */
export const Dotted: Story = {
  parameters: { docs: { source: { code: `<BDivider variant="dotted" />` } } },
  render: () => ({
    components: { BDivider },
    template: `<BDivider variant="dotted" />`,
  }),
};

/** The `size` prop controls vertical spacing (margin-block) around horizontal dividers. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDivider size="small" />
<BDivider size="medium" />
<BDivider size="large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="background:oklch(96% 0.01 264);padding:1rem;">
        <p style="margin:0;font-size:0.75rem;color:#595959;">size="small"</p>
        <BDivider size="small" />
        <p style="margin:0;font-size:0.75rem;color:#595959;">size="medium"</p>
        <BDivider size="medium" />
        <p style="margin:0;font-size:0.75rem;color:#595959;">size="large" (default)</p>
        <BDivider size="large" />
      </div>
    `,
  }),
};

/** Embedded text positioned via `titlePlacement` (`start` / `center` / `end`). */
export const WithText: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BDivider title-placement="start">Start</BDivider>
<BDivider title-placement="center">Center</BDivider>
<BDivider title-placement="end">End</BDivider>
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        <BDivider title-placement="start">Start</BDivider>
        <BDivider title-placement="center">Center (default)</BDivider>
        <BDivider title-placement="end">End</BDivider>
      </div>
    `,
  }),
};

/** Compare bold heading style (`plain=false`) vs the default plain style. */
export const PlainVsHeading: Story = {
  name: 'Plain vs Heading',
  parameters: {
    docs: {
      source: {
        code: `
<BDivider :plain="true">Plain text (default)</BDivider>
<BDivider :plain="false">Heading weight</BDivider>
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        <BDivider :plain="true">Plain text (default)</BDivider>
        <BDivider :plain="false">Heading weight</BDivider>
      </div>
    `,
  }),
};

/** Vertical orientation — inline separator between text or links. */
export const Vertical: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<span>Home</span>
<BDivider orientation="vertical" />
<span>About</span>
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="font-size:1rem;line-height:2;">
        <span>Home</span>
        <BDivider orientation="vertical" />
        <span>About</span>
        <BDivider orientation="vertical" variant="dashed" />
        <span>Contact</span>
        <BDivider orientation="vertical" variant="dotted" />
        <span>Blog</span>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Common breadcrumb-style nav using vertical dividers. */
export const InlineBreadcrumb: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<a href="#">Home</a>
<BDivider orientation="vertical" />
<a href="#">Library</a>
<BDivider orientation="vertical" />
<span>Data</span>
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="font-size:0.875rem;line-height:1.5;color:#595959;">
        <a href="#" style="color:oklch(50% 0.18 260);">Home</a>
        <BDivider orientation="vertical" />
        <a href="#" style="color:oklch(50% 0.18 260);">Library</a>
        <BDivider orientation="vertical" />
        <span>Data</span>
      </div>
    `,
  }),
};

/** Section header pattern using a non-plain divider with a heading-weight label. */
export const SectionHeader: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BDivider :plain="false" title-placement="start">Account Settings</BDivider>`,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="max-width:480px;">
        <BDivider :plain="false" title-placement="start">Account Settings</BDivider>
        <p style="margin:0.5rem 0;color:#595959;">Manage your profile, password, and notifications.</p>
        <BDivider :plain="false" title-placement="start">Billing</BDivider>
        <p style="margin:0.5rem 0;color:#595959;">View invoices and update payment methods.</p>
      </div>
    `,
  }),
};

/** "OR" divider commonly used to separate auth methods. */
export const OrSeparator: Story = {
  parameters: {
    docs: {
      source: { code: `<BDivider plain>OR</BDivider>` },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="max-width:320px;display:flex;flex-direction:column;gap:0.5rem;">
        <button style="padding:0.5rem 1rem;border:1px solid #d9d9d9;border-radius:4px;background:#fff;">Sign in with Email</button>
        <BDivider plain>OR</BDivider>
        <button style="padding:0.5rem 1rem;border:1px solid #d9d9d9;border-radius:4px;background:#fff;">Continue with SSO</button>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BDivider always exposes `role="separator"` and the correct `aria-orientation`.
 * Dividers carry no `tabindex` — they are purely presentational.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All divider variants expose <code>role="separator"</code> and the correct ' +
          '<code>aria-orientation</code>. Dividers carry no <code>tabindex</code> as they are ' +
          'purely presentational.',
      },
      source: {
        code: `
<BDivider />
<BDivider>Section Title</BDivider>
<BDivider orientation="vertical" />
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div data-testid="divider-a11y" style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">Horizontal (no text)</p>
          <BDivider data-testid="plain-hr" />
        </div>
        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">Horizontal (with text)</p>
          <BDivider data-testid="with-text" title-placement="start">Label</BDivider>
        </div>
        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">Vertical</p>
          <span>Item A</span>
          <BDivider data-testid="vertical" orientation="vertical" />
          <span>Item B</span>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Horizontal div (no text)
    const divNoText = canvasElement.querySelector('div.b-divider:not(.b-divider--with-text)');
    expect(divNoText).not.toBeNull();
    expect(divNoText!.getAttribute('role')).toBe('separator');
    expect(divNoText!.getAttribute('aria-orientation')).toBe('horizontal');

    // 2. Div with text — uses underlying tag DIV with role separator
    const withText = canvasElement.querySelector('[data-testid="with-text"]');
    expect(withText).not.toBeNull();
    expect(withText!.tagName).toBe('DIV');
    expect(withText!.classList.contains('b-divider--with-text')).toBe(true);
    expect(withText!.classList.contains('b-divider--text-start')).toBe(true);
    const content = withText!.querySelector('.b-divider__content');
    expect(content).not.toBeNull();
    expect(content!.textContent).toBe('Label');

    // 3. Vertical
    const spanSep = canvasElement.querySelector('span.b-divider--vertical');
    expect(spanSep).not.toBeNull();
    expect(spanSep!.getAttribute('role')).toBe('separator');
    expect(spanSep!.getAttribute('aria-orientation')).toBe('vertical');

    // Plain horizontal class hooks
    const plainSep = canvasElement.querySelector('[data-testid="plain-hr"]');
    expect(plainSep).not.toBeNull();
    expect(plainSep!.tagName).toBe('DIV');
    expect(plainSep!.getAttribute('role')).toBe('separator');
    expect(plainSep!.classList.contains('b-divider--solid')).toBe(true);
    expect(plainSep!.classList.contains('b-divider--size-large')).toBe(true);

    // None of the dividers should be focusable
    const allDividers = canvasElement.querySelectorAll('.b-divider');
    allDividers.forEach((el) => {
      expect(el.getAttribute('tabindex')).toBeNull();
    });

    // canvas query just to silence unused-import warnings
    expect(canvas).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-divider-color`, `--b-divider-text-color`, and
 * `--b-divider-text-padding-inline` directly on the component or any ancestor
 * to retheme without touching component source.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-divider-color</code>, <code>--b-divider-text-color</code>, and ' +
          '<code>--b-divider-text-padding-inline</code> on the component (or an ancestor) to ' +
          'retheme appearance without touching component source.',
      },
      source: {
        code: `
<BDivider style="
  --b-divider-color: #e94560;
  --b-divider-text-color: #b91535;
  --b-divider-text-padding-inline: 2rem;
">Custom Theme</BDivider>
        `,
      },
    },
  },
  render: () => ({
    components: { BDivider },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;">
        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">Default theme</p>
          <BDivider>Default</BDivider>
        </div>

        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">
            --b-divider-color + --b-divider-text-color + --b-divider-text-padding-inline
          </p>
          <BDivider style="
            --b-divider-color: #e94560;
            --b-divider-text-color: #b91535;
            --b-divider-text-padding-inline: 2rem;
          ">Custom Colour</BDivider>
        </div>

        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">
            --b-divider-color + --b-divider-line-width + dotted variant
          </p>
          <BDivider
            variant="dotted"
            style="
              --b-divider-color: oklch(55% 0.18 145);
              --b-divider-line-width: 2px;
            "
          />
        </div>

        <div>
          <p style="margin:0 0 0.25rem;font-size:0.75rem;color:#595959;">
            Vertical — --b-divider-vertical-margin-inline
          </p>
          <span>Left</span>
          <BDivider
            orientation="vertical"
            style="--b-divider-vertical-margin-inline: 24px; --b-divider-color: oklch(55% 0.18 260);"
          />
          <span>Right</span>
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-divider-orientation-margin',
    defaultValue: '5%',
    description:
      'Distance between text and edge when orientation is left/right (AntD: orientationMargin).',
  },
  {
    token: '--b-divider-text-padding-inline',
    defaultValue: '1em',
    description: 'Horizontal padding around the text label (AntD: textPaddingInline).',
  },
  {
    token: '--b-divider-vertical-margin-inline',
    defaultValue: '0.5rem',
    description: 'Horizontal margin around vertical dividers (AntD: verticalMarginInline).',
  },
  // ── Local extras ──
  {
    token: '--b-divider-color',
    defaultValue: 'oklch(0% 0 0 / 6%)',
    description: 'Color of the divider line (AntD: colorSplit).',
  },
  {
    token: '--b-divider-line-width',
    defaultValue: '1px',
    description: 'Thickness of the divider line.',
  },
  {
    token: '--b-divider-text-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Color of the text label.',
  },
  {
    token: '--b-divider-font-size',
    defaultValue: '1rem',
    description: 'Font size of the text label.',
  },
  {
    token: '--b-divider-font-weight-text',
    defaultValue: '500',
    description: 'Font weight of the text label.',
  },
  {
    token: '--b-divider-margin-block-small',
    defaultValue: '0.5rem',
    description: 'Vertical margin for small horizontal dividers.',
  },
  {
    token: '--b-divider-margin-block-medium',
    defaultValue: '1rem',
    description: 'Vertical margin for medium horizontal dividers.',
  },
  {
    token: '--b-divider-margin-block-large',
    defaultValue: '1.5rem',
    description: 'Vertical margin for large horizontal dividers.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-divider-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BDivider },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BDivider — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-divider</code>. Override inline or via a CSS class.
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
          Three tokens overridden inline (color, line-width, text-color).
        </p>
        <BDivider
          style="
            --b-divider-color: oklch(50% 0.18 290);
            --b-divider-line-width: 2px;
            --b-divider-text-color: oklch(35% 0.18 290);
          "
        >
          Themed divider
        </BDivider>
      </div>
    `,
  }),
};
