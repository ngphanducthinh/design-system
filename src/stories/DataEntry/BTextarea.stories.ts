import { BTextarea } from '@/components';
import { BCommonSize } from '@/types.ts';
import { BInputStatus, BInputVariant } from '@/components/BInput/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

/**
 * BTextarea — multi-line text input with sizes, variants, status, allowClear,
 * showCount, autosize, and prefix / suffix slots.
 *
 * Story file follows the canonical format described in `docs/STORY_FORMAT.md`:
 *   Usage  → one story per prop value (granular, copy-pasteable)
 *   Examples → composed real-world recipes
 *   Accessibility → roles + ARIA play tests
 *   Theming → CSS-token override demo
 *   Design Tokens → reference table (LAST story)
 */
const meta = {
  title: 'Data Entry/Textarea',
  component: BTextarea,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Height / padding / typography preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    variant: {
      control: 'select',
      options: Object.values(BInputVariant),
      description: 'Visual treatment.',
      table: { category: 'Props', defaultValue: { summary: 'outlined' } },
    },
    status: {
      control: 'select',
      options: [undefined, ...Object.values(BInputStatus)],
      description: 'Validation status.',
      table: { category: 'Props' },
    },
    rows: {
      control: 'number',
      description: 'Minimum number of visible rows.',
      table: { category: 'Props', defaultValue: { summary: '3' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when empty.',
      table: { category: 'Props' },
    },
    maxLength: {
      control: 'number',
      description: 'Maximum number of characters.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled visual.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    readOnly: {
      control: 'boolean',
      description: 'Marks the textarea as read-only.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    allowClear: {
      control: 'boolean',
      description: 'Show a clear button when the textarea has a value.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showCount: {
      control: 'boolean',
      description: 'Display character count. Pass a function for custom output.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    autosize: {
      control: 'boolean',
      description:
        'Auto-grow to fit content. `true` uses CSS `field-sizing`, `{ minRows, maxRows }` uses JS clamp.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    prefix: { description: 'Leading slot inside the textarea wrapper.', table: { category: 'Slots' } },
    suffix: { description: 'Trailing slot inside the textarea wrapper.', table: { category: 'Slots' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTextarea</code> component is a multi-line text input. ' +
          'It supports all four <code>BInput</code> variants, three sizes, validation status, ' +
          '<code>allowClear</code>, character <code>showCount</code>, prefix / suffix slots, ' +
          'and an <code>autosize</code> mode (CSS <code>field-sizing</code> or JS-clamped row bounds).',
      },
    },
  },
} satisfies Meta<typeof BTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default outlined textarea, medium size, 3 rows. */
export const Default: Story = {
  args: {
    size: BCommonSize.Medium,
    variant: BInputVariant.Outlined,
    rows: 3,
    disabled: false,
    readOnly: false,
    allowClear: false,
    showCount: false,
    autosize: false,
  },
  parameters: {
    docs: { source: { code: `<BTextarea placeholder="Enter description..." />` } },
  },
  render: (args) => ({
    components: { BTextarea },
    setup: () => ({ args }),
    template: `<BTextarea v-bind="args" placeholder="Enter description..." />`,
  }),
};

/** Three sizes for different layout densities. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTextarea size="sm" placeholder="Small" />
<BTextarea size="md" placeholder="Medium" />
<BTextarea size="lg" placeholder="Large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BTextarea size="sm" placeholder="Small" />
        <BTextarea size="md" placeholder="Medium" />
        <BTextarea size="lg" placeholder="Large" />
      </div>
    `,
  }),
};

/** Outlined — the default, with a 1px border. */
export const Outlined: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea variant="outlined" placeholder="Outlined" />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea variant="outlined" placeholder="Outlined" />`,
  }),
};

/** Filled — soft background, no visible border until focus. */
export const Filled: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea variant="filled" placeholder="Filled" />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea variant="filled" placeholder="Filled" />`,
  }),
};

/** Borderless — fully transparent surface. */
export const Borderless: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea variant="borderless" placeholder="Borderless" />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea variant="borderless" placeholder="Borderless" />`,
  }),
};

/** Underlined — single bottom border, sleek inline form look. */
export const Underlined: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea variant="underlined" placeholder="Underlined" />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea variant="underlined" placeholder="Underlined" />`,
  }),
};

/** Disabled textareas can't be edited and receive `cursor: not-allowed`. */
export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea disabled aria-label="Disabled textarea" :model-value="'Cannot edit me'" />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea disabled aria-label="Disabled textarea" :model-value="'Cannot edit me'" />`,
  }),
};

/** Read-only textareas display content but block typing. */
export const ReadOnly: Story = {
  parameters: {
    docs: {
      source: { code: `<BTextarea read-only aria-label="Reference text" :model-value="'Reference text — read only.'" />` },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea read-only aria-label="Reference text" :model-value="'Reference text — read only.'" />`,
  }),
};

/** Helpful hint shown when the textarea is empty. */
export const WithPlaceholder: Story = {
  parameters: {
    docs: { source: { code: `<BTextarea placeholder="Tell us what you think..." />` } },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea placeholder="Tell us what you think..." />`,
  }),
};

/** Cap user input to a fixed character budget. Combine with `showCount` for a live counter. */
export const WithMaxLength: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BTextarea :max-length="120" show-count placeholder="Up to 120 characters" aria-label="Bio" />`,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `<BTextarea :max-length="120" show-count placeholder="Up to 120 characters" aria-label="Bio" />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Auto-grow as the user types. Pass `true` for CSS-only growth, or `{ minRows, maxRows }` for JS-clamped bounds. */
export const Autosize: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTextarea autosize placeholder="CSS field-sizing — grows freely" />
<BTextarea :autosize="{ minRows: 2, maxRows: 6 }" placeholder="JS-clamped between 2 and 6 rows" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BTextarea autosize placeholder="CSS field-sizing — grows freely" />
        <BTextarea :autosize="{ minRows: 2, maxRows: 6 }" placeholder="JS-clamped between 2 and 6 rows" />
      </div>
    `,
  }),
};

/** Use the `status` prop to surface validation state. `error` also sets `aria-invalid`. */
export const ErrorStatus: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTextarea status="error" :model-value="'Too short.'" />
<BTextarea status="warning" :model-value="'Looks fine — but double-check.'" />
        `,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BTextarea status="error" aria-label="Bio with error" :model-value="'Too short.'" />
        <BTextarea status="warning" aria-label="Bio with warning" :model-value="'Looks fine — but double-check.'" />
      </div>
    `,
  }),
};

/** Decorate the textarea with a leading or trailing element via the `prefix` / `suffix` slots. */
export const WithPrefixSuffix: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BTextarea placeholder="With prefix and suffix">
  <template #prefix>📝</template>
  <template #suffix>✍️</template>
</BTextarea>
        `,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <BTextarea placeholder="With prefix">
          <template #prefix>📝</template>
        </BTextarea>
        <BTextarea placeholder="With suffix">
          <template #suffix>✍️</template>
        </BTextarea>
        <BTextarea placeholder="With both">
          <template #prefix>📝</template>
          <template #suffix>✍️</template>
        </BTextarea>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BTextarea renders a native `<textarea>` so it is keyboard-reachable, exposes
 * `disabled` / `readonly` semantics, and (when `status="error"`) carries
 * `aria-invalid="true"` for screen readers.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A native <code>&lt;textarea&gt;</code> means standard semantics: tabbable, ' +
          '<code>aria-invalid</code> on error, and an associated <code>&lt;label&gt;</code> wires up correctly.',
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div class="b:flex b:flex-col b:gap-3">
        <label for="bio" style="font-size:13px;color:#595959;">Bio</label>
        <BTextarea id="bio" placeholder="Write a short bio" />

        <label for="feedback" style="font-size:13px;color:#595959;">Feedback (required)</label>
        <BTextarea id="feedback" status="error" :model-value="'too short'" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);

    // Native textarea role
    const textareas = c.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThanOrEqual(2);

    // Label association — getByLabelText resolves the `for`/`id` link.
    const bio = c.getByLabelText('Bio');
    expect(bio).toBeInTheDocument();
    expect(bio.tagName.toLowerCase()).toBe('textarea');

    // aria-invalid set on the error textarea, NOT on the bio textarea.
    const feedback = c.getByLabelText('Feedback (required)');
    expect(feedback).toHaveAttribute('aria-invalid', 'true');
    expect(bio).not.toHaveAttribute('aria-invalid');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * BTextarea exposes component-scoped `--b-textarea-*` CSS variables. Override
 * them on any ancestor (or on `.b-textarea` directly) to retheme without
 * touching the global Tailwind theme.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-textarea-*</code> variables on any ancestor to retheme the textarea.',
      },
      source: {
        code: `
<div
  style="
    --b-textarea-radius: 14px;
    --b-textarea-border-color: oklch(72% 0.13 290);
    --b-textarea-border-color-focus: oklch(50% 0.18 290);
    --b-textarea-active-shadow: 0 0 0 3px oklch(85% 0.08 290);
  "
>
  <BTextarea placeholder="Themed textarea" />
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    template: `
      <div
        class="b:rounded-lg b:p-4"
        style="
          border: 1px dashed oklch(85% 0.005 260);
          --b-textarea-radius: 14px;
          --b-textarea-border-color: oklch(72% 0.13 290);
          --b-textarea-border-color-focus: oklch(50% 0.18 290);
          --b-textarea-active-shadow: 0 0 0 3px oklch(85% 0.08 290);
          --b-textarea-bg: oklch(98% 0.01 290);
        "
      >
        <BTextarea placeholder="Themed textarea — focus me to see the new shadow" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-textarea-bg', defaultValue: '#ffffff', description: 'Background color of the textarea wrapper.' },
  { token: '--b-textarea-fg', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Foreground / text color of the textarea.' },
  { token: '--b-textarea-placeholder-color', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Color of the placeholder text.' },
  { token: '--b-textarea-border-color', defaultValue: '#d9d9d9', description: 'Default border color (outlined / underlined).' },
  { token: '--b-textarea-border-color-hover', defaultValue: '#4096ff', description: 'Border color on hover.' },
  { token: '--b-textarea-border-color-focus', defaultValue: '#1677ff', description: 'Border color on focus.' },
  { token: '--b-textarea-active-shadow', defaultValue: '0 0 0 2px rgba(5, 145, 255, 0.1)', description: 'Box-shadow ring on focus.' },
  { token: '--b-textarea-radius', defaultValue: '6px', description: 'Border radius of the wrapper.' },
  { token: '--b-textarea-padding-x', defaultValue: '11px', description: 'Horizontal padding (md).' },
  { token: '--b-textarea-padding-y', defaultValue: '4px', description: 'Vertical padding (md).' },
  { token: '--b-textarea-padding-x-lg', defaultValue: '11px', description: 'Horizontal padding (lg).' },
  { token: '--b-textarea-padding-y-lg', defaultValue: '7px', description: 'Vertical padding (lg).' },
  { token: '--b-textarea-padding-x-sm', defaultValue: '7px', description: 'Horizontal padding (sm).' },
  { token: '--b-textarea-padding-y-sm', defaultValue: '0px', description: 'Vertical padding (sm).' },
  { token: '--b-textarea-font-size', defaultValue: '14px', description: 'Base font size.' },
  { token: '--b-textarea-font-size-lg', defaultValue: '16px', description: 'Font size for size="lg".' },
  { token: '--b-textarea-font-size-sm', defaultValue: '14px', description: 'Font size for size="sm".' },
  { token: '--b-textarea-line-height', defaultValue: '1.5714', description: 'Unitless line-height multiplier.' },
  { token: '--b-textarea-min-rows', defaultValue: '3', description: 'CSS-autosize minimum row count.' },
  { token: '--b-textarea-max-rows', defaultValue: '8', description: 'CSS-autosize maximum row count.' },
  { token: '--b-textarea-disabled-bg', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Background color when disabled.' },
  { token: '--b-textarea-disabled-fg', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Foreground color when disabled.' },
  { token: '--b-textarea-clear-color', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Idle color of the clear button.' },
  { token: '--b-textarea-clear-hover-color', defaultValue: 'rgba(0, 0, 0, 0.45)', description: 'Hover color of the clear button.' },
  { token: '--b-textarea-count-color', defaultValue: 'rgba(0, 0, 0, 0.65)', description: 'Color of the character-count text.' },
  { token: '--b-textarea-error-border-color', defaultValue: '#ff4d4f', description: 'Border color when status="error".' },
  { token: '--b-textarea-error-shadow', defaultValue: '0 0 0 2px rgba(255, 38, 5, 0.06)', description: 'Focus shadow when status="error".' },
  { token: '--b-textarea-warning-border-color', defaultValue: '#faad14', description: 'Border color when status="warning".' },
  { token: '--b-textarea-warning-shadow', defaultValue: '0 0 0 2px rgba(255, 215, 5, 0.1)', description: 'Focus shadow when status="warning".' },
  { token: '--b-textarea-filled-bg', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Background color for variant="filled".' },
  { token: '--b-textarea-filled-hover-bg', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Hover background for variant="filled".' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'BTextarea exposes the following <code>--b-textarea-*</code> CSS variables. ' +
          'Override them on any ancestor (or directly on <code>.b-textarea</code>) to retheme without ' +
          'touching the global Tailwind theme.',
      },
    },
  },
  render: () => ({
    components: { BTextarea },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BTextarea — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          Override these variables on any ancestor of <code>.b-textarea</code> to retheme the component.
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
