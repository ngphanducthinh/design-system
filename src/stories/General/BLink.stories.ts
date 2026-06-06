import { BLink } from '@/components';
import { BCommonColor } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

/**
 * BLink — polymorphic link that renders <a>, <RouterLink>, or <button>
 * depending on which props are set.
 *
 * Element resolution priority: `as` → `to` (RouterLink) → `href` → fallback
 * `<button type="button">`. Disabled `<a>` / `<RouterLink>` are downgraded
 * to `<span aria-disabled="true">` because native anchors do not support
 * `:disabled`.
 */
const meta = {
  title: 'General/Link',
  component: BLink,
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL for an `<a>` link.',
      table: { category: 'Props' },
    },
    to: {
      control: 'text',
      description: 'Vue Router target. Renders as `<RouterLink>` when router is registered.',
      table: { category: 'Props' },
    },
    target: {
      control: 'select',
      options: [undefined, '_self', '_blank', '_parent', '_top'],
      description: 'Anchor `target`. Forced to `_blank` when `external` is true.',
      table: { category: 'Props' },
    },
    rel: {
      control: 'text',
      description: 'Anchor `rel`. Augmented with `noopener noreferrer` when external.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    external: {
      control: 'boolean',
      description: 'Marks link as external — adds target=_blank, rel, and an icon.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'none'],
      description: 'Underline behaviour.',
      table: { category: 'Props', defaultValue: { summary: 'hover' } },
    },
    color: {
      control: 'select',
      options: Object.values(BCommonColor),
      description: 'Color family applied to text.',
      table: { category: 'Props', defaultValue: { summary: 'primary' } },
    },
    as: {
      control: 'select',
      options: [undefined, 'a', 'button'],
      description: 'Explicit element override (highest priority).',
      table: { category: 'Props' },
    },
    showExternalIcon: {
      control: 'boolean',
      description: 'Render the trailing external-link icon when external is true.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    default: { description: 'Link text.', table: { category: 'Slots' } },
    leading: { description: 'Content placed before the label.', table: { category: 'Slots' } },
    trailing: { description: 'Content placed after the label.', table: { category: 'Slots' } },
    onClick: {
      description: 'Emitted when the link is activated. Suppressed when disabled.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BLink</code> is a polymorphic link. Set <code>href</code> for plain anchors, <code>to</code> for Vue Router navigation, or use <code>as="button"</code> for action-style links. Mark cross-origin links with <code>external</code> for safe defaults.',
      },
    },
  },
} satisfies Meta<typeof BLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default — primary color, hover-only underline, renders as `<button>` when no href/to is set. */
export const Default: Story = {
  args: {
    color: BCommonColor.Primary,
    underline: 'hover',
    disabled: false,
    external: false,
  },
  parameters: { docs: { source: { code: `<BLink href="/docs">Read the docs</BLink>` } } },
  render: (args) => ({
    components: { BLink },
    setup: () => ({ args }),
    template: `<BLink v-bind="args" href="/docs">Read the docs</BLink>`,
  }),
};

/** With `href` it renders a real `<a>` element. */
export const AsAnchor: Story = {
  parameters: {
    docs: { source: { code: `<BLink href="https://example.com">Visit example.com</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink href="https://example.com">Visit example.com</BLink>`,
  }),
};

/** With no `href` / `to` it renders a `<button type="button">` — useful for "act-like-link" controls. */
export const AsButton: Story = {
  parameters: { docs: { source: { code: `<BLink @click="onClick">Sign out</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink>Sign out</BLink>`,
  }),
};

/** Use `as="button"` to force button semantics even when `href` is provided. */
export const ForcedButton: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BLink as="button" href="https://example.com">Run action</BLink>`,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink as="button" href="https://example.com">Run action</BLink>`,
  }),
};

/** `external` flips on `target="_blank"`, `rel="noopener noreferrer"`, and an icon. */
export const External: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BLink href="https://example.com" external>Docs</BLink>`,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink href="https://example.com" external>Documentation</BLink>`,
  }),
};

/** Underline behaviour — `always`, `hover` (default), `none`. */
export const UnderlineAlways: Story = {
  name: 'Underline: always',
  parameters: {
    docs: { source: { code: `<BLink underline="always" href="/x">Always underlined</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink underline="always" href="/x">Always underlined</BLink>`,
  }),
};

export const UnderlineHover: Story = {
  name: 'Underline: hover',
  parameters: {
    docs: { source: { code: `<BLink underline="hover" href="/x">Underline on hover</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink underline="hover" href="/x">Underline on hover</BLink>`,
  }),
};

export const UnderlineNone: Story = {
  name: 'Underline: none',
  parameters: {
    docs: { source: { code: `<BLink underline="none" href="/x">No underline</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink underline="none" href="/x">No underline</BLink>`,
  }),
};

/** All color families. */
export const Primary: Story = {
  parameters: { docs: { source: { code: `<BLink color="primary" href="/x">Primary</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink color="primary" href="/x">Primary</BLink>`,
  }),
};

export const Secondary: Story = {
  parameters: {
    docs: { source: { code: `<BLink color="secondary" href="/x">Secondary</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `<BLink color="secondary" href="/x">Secondary</BLink>`,
  }),
};

export const Success: Story = {
  parameters: { docs: { source: { code: `<BLink color="success" href="/x">Success</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink color="success" href="/x">Success</BLink>`,
  }),
};

export const Failure: Story = {
  parameters: { docs: { source: { code: `<BLink color="failure" href="/x">Failure</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink color="failure" href="/x">Failure</BLink>`,
  }),
};

export const Warning: Story = {
  parameters: { docs: { source: { code: `<BLink color="warning" href="/x">Warning</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink color="warning" href="/x">Warning</BLink>`,
  }),
};

export const Info: Story = {
  parameters: { docs: { source: { code: `<BLink color="info" href="/x">Info</BLink>` } } },
  render: () => ({
    components: { BLink },
    template: `<BLink color="info" href="/x">Info</BLink>`,
  }),
};

/** Disabled — `<a>`/`<RouterLink>` downgrade to `<span aria-disabled="true">`; `<button>` uses native disabled. */
export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<BLink href="/x" disabled>Disabled link</BLink>` } },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-4">
        <BLink href="/x" disabled>Disabled anchor</BLink>
        <BLink disabled>Disabled button</BLink>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Leading and trailing slots accept any content — typically a `BIcon`. */
export const WithSlots: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BLink href="/x">
  <template #leading>📎</template>
  Attachment
</BLink>
<BLink href="/x">
  Continue
  <template #trailing>→</template>
</BLink>
        `,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-4">
        <BLink href="/x">
          <template #leading>📎</template>
          Attachment
        </BLink>
        <BLink href="/x">
          Continue
          <template #trailing>→</template>
        </BLink>
      </div>
    `,
  }),
};

/** Common in-paragraph usage — inline links inside body copy. */
export const InlineWithText: Story = {
  parameters: {
    docs: {
      source: {
        code: `<p>Read the <BLink href="/docs" underline="always">documentation</BLink> to learn more.</p>`,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <p style="max-width: 50ch; line-height: 1.6;">
        Read the
        <BLink href="/docs" underline="always">documentation</BLink>
        to learn more, or visit our
        <BLink href="https://github.com/example" external>GitHub</BLink>
        for the source.
      </p>
    `,
  }),
};

/** `as="button"` lets a link-styled trigger live in a row of action buttons. */
export const ButtonStyledAction: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BLink as="button" color="failure" @click="onDelete">Delete account</BLink>`,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:items-center b:gap-4">
        <span>Need to remove your data?</span>
        <BLink as="button" color="failure" underline="always">Delete account</BLink>
      </div>
    `,
  }),
};

/** External links auto-secure target/rel and append a small visual cue. */
export const ExternalShowcase: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BLink href="https://example.com" external>Example.com</BLink>`,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:flex-col b:gap-2">
        <BLink href="https://example.com" external>Default — with icon</BLink>
        <BLink href="https://example.com" external :show-external-icon="false">
          Without icon
        </BLink>
        <BLink href="https://example.com" external color="info" underline="always">
          Info + always-underline
        </BLink>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BLink renders native `<a>` / `<button>` semantics. Disabled anchors are
 * downgraded to `<span role="link" aria-disabled="true">` because the
 * `disabled` attribute is not valid on `<a>`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the appropriate native element for its semantics: <code>&lt;a&gt;</code> for navigation, <code>&lt;button&gt;</code> for actions. Disabled links expose <code>aria-disabled="true"</code> and a <code>role="link"</code> on a span (since native disabled is not supported on anchors). Tab order skips disabled buttons; the disabled span has no tabindex so keyboard users cannot focus it.',
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:flex-wrap b:items-center b:gap-4">
        <BLink href="/first">First</BLink>
        <BLink href="/disabled" disabled>Disabled anchor</BLink>
        <BLink as="button" disabled>Disabled button</BLink>
        <BLink href="/last">Last</BLink>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const links = c.getAllByRole('link');
    // 'First', disabled span (role=link), 'Last' → 3 link-roled items
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0]).toHaveTextContent('First');

    // Disabled span exposes aria-disabled
    const disabledSpan = c.getByText('Disabled anchor').closest('[role="link"]');
    expect(disabledSpan).toHaveAttribute('aria-disabled', 'true');

    // Tab moves focus through enabled links/buttons, skipping disabled.
    await userEvent.tab();
    expect(document.activeElement).toBe(links[0]);
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override at least three component-scoped tokens — `--b-link-color`,
 * `--b-link-color-hover`, and `--b-link-underline-offset`.
 */
export const Theming: Story = {
  parameters: {
    a11y: {
      // Contrast is consumer-tunable when overriding theme tokens; disable the
      // strict 4.5:1 rule for this purely-demonstrative palette swap.
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'Override <code>--b-link-color</code>, <code>--b-link-color-hover</code>, and <code>--b-link-underline-offset</code> on the component root or any ancestor.',
      },
      source: {
        code: `
<BLink
  href="/x"
  underline="always"
  style="
    --b-link-color: oklch(50% 0.18 290);
    --b-link-color-hover: oklch(35% 0.2 290);
    --b-link-underline-offset: 4px;
  "
>
  Themed link
</BLink>
        `,
      },
    },
  },
  render: () => ({
    components: { BLink },
    template: `
      <div class="b:flex b:flex-col b:gap-4 b:rounded-lg b:p-4"
           style="border: 1px dashed oklch(85% 0.005 260);">
        <BLink
          href="/x"
          underline="always"
          style="
            --b-link-color: oklch(50% 0.18 290);
            --b-link-color-hover: oklch(35% 0.2 290);
            --b-link-underline-offset: 4px;
            --b-link-underline-thickness: 2px;
          "
        >
          Purple themed link
        </BLink>
        <BLink
          href="/x"
          style="
            --b-link-color: oklch(60% 0.16 30);
            --b-link-color-hover: oklch(45% 0.2 30);
            --b-link-gap: 0.75rem;
          "
        >
          <template #leading>★</template>
          Orange themed link with extra gap
        </BLink>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  {
    token: '--b-link-color',
    defaultValue: 'var(--color-primary, oklch(55% 0.169 237.323))',
    description: 'Resting text / underline color.',
  },
  {
    token: '--b-link-color-hover',
    defaultValue: 'var(--color-primary-hover, oklch(48% 0.158 241.966))',
    description: 'Hover / focus-visible text color.',
  },
  {
    token: '--b-link-color-disabled',
    defaultValue: 'oklch(0 0 0 / 0.35)',
    description: 'Color used for the disabled state (button + span fallback).',
  },
  {
    token: '--b-link-underline-color',
    defaultValue: 'currentColor',
    description: 'Color of the text-decoration underline.',
  },
  {
    token: '--b-link-underline-offset',
    defaultValue: '2px',
    description: 'Distance between text and underline.',
  },
  {
    token: '--b-link-underline-thickness',
    defaultValue: '1px',
    description: 'Underline stroke thickness.',
  },
  {
    token: '--b-link-gap',
    defaultValue: '0.25rem',
    description: 'Gap between leading icon, label, trailing icon.',
  },
  {
    token: '--b-link-focus-outline-color',
    defaultValue: 'currentColor',
    description: 'Focus-visible outline color.',
  },
  {
    token: '--b-link-focus-outline-width',
    defaultValue: '2px',
    description: 'Focus-visible outline width.',
  },
  {
    token: '--b-link-focus-outline-offset',
    defaultValue: '2px',
    description: 'Focus-visible outline offset from the element box.',
  },
  {
    token: '--b-link-transition-duration',
    defaultValue: '150ms',
    description: 'Color / underline transition duration.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BLink</code>. Override them on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BLink — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          Override these <code>--b-link-*</code> tokens on the component root or any ancestor.
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
