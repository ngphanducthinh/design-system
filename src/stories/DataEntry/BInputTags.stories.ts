import { BInputTags } from '@/components/BInputTags';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BInputTags — single-line input that accumulates string values as removable chips.
 *
 * Each value the user commits (Enter / comma / space / blur, configurable) is
 * rendered as a tag chip with an inline remove button. Backspace inside an
 * empty input removes the most recent tag. Validation, duplicate-checking,
 * and a `max` cap are built in.
 */
const meta = {
  title: 'DataEntry/InputTags',
  component: BInputTags,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder shown in the inner input when empty.',
      table: { category: 'Props' },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Visual size preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the entire control.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    delimiter: {
      control: 'select',
      options: ['enter', 'comma', 'space'],
      description:
        "Which key(s) commit the input as a tag. May be a single token, an array, or a `RegExp`. Tokens: 'enter' | 'comma' | 'space'.",
      table: { category: 'Props', defaultValue: { summary: "['enter', 'comma']" } },
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum number of tags. When reached the inner input becomes readonly.',
      table: { category: 'Props' },
    },
    allowDuplicate: {
      control: 'boolean',
      description: 'Whether duplicate tag values are accepted.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    validate: {
      description:
        'Optional validator. Return `true` to accept, `false` to silently reject, or a string to reject and emit it as the `invalid` reason.',
      table: { category: 'Props' },
    },
    id: {
      control: 'text',
      description: 'Optional explicit DOM id for the inner input.',
      table: { category: 'Props' },
    },
    inputAriaLabel: {
      control: 'text',
      description: 'ARIA label for the inner input and the wrapper.',
      table: { category: 'Props', defaultValue: { summary: 'Add tag' } },
    },
    modelValue: {
      control: 'object',
      description: 'Array of committed tag strings.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: '[]' } },
    },
    onAdd: {
      description: 'Fired after a tag is successfully added.',
      table: { category: 'Events' },
    },
    onRemove: {
      description: 'Fired after a tag is removed (value, index).',
      table: { category: 'Events' },
    },
    onInvalid: {
      description: 'Fired when an attempted tag value is rejected (value, reason).',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BInputTags</code> component lets users build a list of strings inline. ' +
          'Each tag renders as a chip with a remove button; pressing a delimiter key (or blurring) ' +
          'commits the current input as a new tag.',
      },
    },
  },
} satisfies Meta<typeof BInputTags>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default — empty list, Enter or comma to commit. */
export const Default: Story = {
  args: {
    size: BCommonSize.Medium,
    disabled: false,
    allowDuplicate: false,
    placeholder: 'Add tag…',
  },
  parameters: {
    docs: {
      source: {
        code: `<BInputTags v-model="tags" placeholder="Add tag…" />`,
      },
    },
  },
  render: (args) => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>([]);
      return { args, tags };
    },
    template: `<BInputTags v-bind="args" v-model="tags" />`,
  }),
};

/** Pre-populated with initial tags. */
export const WithInitialTags: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInputTags :model-value="['vue', 'typescript', 'tailwind']" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>(['vue', 'typescript', 'tailwind']);
      return { tags };
    },
    template: `<BInputTags v-model="tags" placeholder="Add tag…" />`,
  }),
};

/** Three sizes for different layout densities. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BInputTags size="sm" placeholder="Small" />
<BInputTags size="md" placeholder="Medium" />
<BInputTags size="lg" placeholder="Large" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const a = ref<string[]>(['sm']);
      const b = ref<string[]>(['md']);
      const c = ref<string[]>(['lg']);
      return { a, b, c };
    },
    template: `
      <div class="b:flex b:flex-col b:gap-3" style="max-width: 360px;">
        <BInputTags size="sm" v-model="a" placeholder="Small" />
        <BInputTags size="md" v-model="b" placeholder="Medium" />
        <BInputTags size="lg" v-model="c" placeholder="Large" />
      </div>
    `,
  }),
};

/** Disabled: input rejects keystrokes and remove buttons are inert. */
export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInputTags disabled :model-value="['locked', 'tags']" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    template: `<BInputTags disabled :model-value="['locked', 'tags']" />`,
  }),
};

/** Custom placeholder. */
export const WithPlaceholder: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInputTags placeholder="Type and press Enter…" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    template: `<BInputTags placeholder="Type and press Enter…" />`,
  }),
};

/** Cap how many tags can be added. The input becomes readonly at the limit. */
export const MaxTags: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInputTags :max="3" placeholder="Up to 3 tags" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>(['one', 'two']);
      return { tags };
    },
    template: `<BInputTags v-model="tags" :max="3" placeholder="Up to 3 tags" />`,
  }),
};

/** Allow repeated values when `allowDuplicate` is true. */
export const AllowDuplicate: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BInputTags allow-duplicate />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    template: `<BInputTags allow-duplicate placeholder="Duplicates ok" />`,
  }),
};

/** Commit on Enter only — comma is treated as a normal character. */
export const DelimiterEnter: Story = {
  name: 'Delimiter — Enter only',
  parameters: {
    docs: {
      source: {
        code: `<BInputTags delimiter="enter" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    template: `<BInputTags delimiter="enter" placeholder="Press Enter to commit" />`,
  }),
};

/** Commit on space — useful for hashtag-style input. */
export const DelimiterSpace: Story = {
  name: 'Delimiter — Space',
  parameters: {
    docs: {
      source: {
        code: `<BInputTags :delimiter="['enter', 'space']" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    template: `<BInputTags :delimiter="['enter', 'space']" placeholder="Hashtag style" />`,
  }),
};

/** Commit on a custom RegExp pattern as the user types. */
export const DelimiterRegExp: Story = {
  name: 'Delimiter — RegExp',
  parameters: {
    docs: {
      source: {
        code: `<BInputTags :delimiter="/;/" />`,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      return { semi: /;/ };
    },
    template: `<BInputTags :delimiter="semi" placeholder="Use ; to commit" />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Reject values that don't pass a custom rule. The string return is used as the rejection reason. */
export const WithValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the <code>validate</code> prop to filter unwanted values. Returning a string both rejects the value and surfaces it as the <code>invalid</code> event reason — useful for inline error messaging.',
      },
      source: {
        code: `
const validateEmail = (v: string) =>
  /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v) || 'must be an email';

<BInputTags :validate="validateEmail" placeholder="Add an email" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>([]);
      const lastReason = ref<string>('');
      const validate = (v: string) =>
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'must be an email';
      const onInvalid = (_value: string, reason: string) => {
        lastReason.value = reason;
      };
      return { tags, validate, onInvalid, lastReason };
    },
    template: `
      <div class="b:flex b:flex-col b:gap-2" style="max-width: 420px;">
        <BInputTags
          v-model="tags"
          :validate="validate"
          placeholder="Add an email"
          @invalid="onInvalid"
        />
        <span v-if="lastReason" style="color: oklch(50% 0.2 25); font-size: 12px;">
          Rejected: {{ lastReason }}
        </span>
      </div>
    `,
  }),
};

/** Pre-fill, observe events, and inspect the bound array as it changes. */
export const ControlledWithEvents: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const tags = ref(['vue', 'pinia']);
<BInputTags v-model="tags" @add="onAdd" @remove="onRemove" />
        `,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>(['vue', 'pinia']);
      const log = ref<string[]>([]);
      const onAdd = (v: string) => log.value.unshift(`+ ${v}`);
      const onRemove = (v: string, i: number) => log.value.unshift(`- ${v} @${i}`);
      return { tags, log, onAdd, onRemove };
    },
    template: `
      <div class="b:flex b:flex-col b:gap-3" style="max-width: 420px;">
        <BInputTags v-model="tags" placeholder="Add tag…" @add="onAdd" @remove="onRemove" />
        <code style="font-size: 12px; color: #595959;">model: {{ JSON.stringify(tags) }}</code>
        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #595959;">
          <li v-for="entry in log.slice(0, 5)" :key="entry">{{ entry }}</li>
        </ul>
      </div>
    `,
  }),
};

/** Inline label + helper text — common form-field shape. */
export const InsideForm: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<label>
  Skills
  <BInputTags v-model="skills" placeholder="Press Enter or comma" />
  <small>Press Enter or comma to add a skill.</small>
</label>
        `,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const skills = ref<string[]>(['vue']);
      return { skills };
    },
    template: `
      <label class="b:flex b:flex-col b:gap-1" style="max-width: 420px; font-size: 14px;">
        <span style="font-weight: 500;">Skills</span>
        <BInputTags v-model="skills" placeholder="Press Enter or comma" />
        <small style="color: #595959;">Press Enter or comma to add a skill.</small>
      </label>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Wrapper exposes <code>role="group"</code> with an <code>aria-label</code>.
 * The inner <input> is the only tab-stop; remove buttons are reachable via
 * pointer or by tabbing back from the input. Backspace on an empty input
 * removes the trailing tag.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BInputTags renders a <code>role="group"</code> wrapper with an accessible label. The inner <code>&lt;input&gt;</code> is the keyboard-reachable element; each remove button has a descriptive <code>aria-label="Remove tag {value}"</code>. <kbd>Backspace</kbd> on an empty input removes the last tag.',
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>(['alpha', 'beta']);
      return { tags };
    },
    template: `<BInputTags v-model="tags" input-aria-label="Tags" />`,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);

    // Wrapper has role="group" and an accessible name.
    const group = c.getByRole('group', { name: 'Tags' });
    expect(group).toBeInTheDocument();

    // Inner input is reachable via Tab.
    const input = c.getByRole('textbox', { name: 'Tags' });
    await userEvent.click(input);
    expect(input).toHaveFocus();

    // Remove buttons expose descriptive labels.
    expect(c.getByRole('button', { name: 'Remove tag alpha' })).toBeInTheDocument();
    expect(c.getByRole('button', { name: 'Remove tag beta' })).toBeInTheDocument();

    // Typing a value and pressing Enter commits it.
    await userEvent.type(input, 'gamma{Enter}');
    expect(c.getByRole('button', { name: 'Remove tag gamma' })).toBeInTheDocument();

    // Backspace on empty input removes the last tag.
    await userEvent.keyboard('{Backspace}');
    expect(c.queryByRole('button', { name: 'Remove tag gamma' })).not.toBeInTheDocument();
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override the scoped CSS variables on the component root to retheme the
 * wrapper and individual tag chips.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-input-tags-border-color-focus</code>, <code>--b-input-tags-tag-bg</code>, <code>--b-input-tags-tag-fg</code>, and <code>--b-input-tags-tag-radius</code> on the component root for a fully custom skin.',
      },
      source: {
        code: `
<BInputTags
  :model-value="['indigo', 'amber']"
  style="
    --b-input-tags-border-color-focus: oklch(50% 0.18 290);
    --b-input-tags-tag-bg: oklch(94% 0.06 290);
    --b-input-tags-tag-fg: oklch(38% 0.18 290);
    --b-input-tags-tag-radius: 999px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BInputTags },
    setup() {
      const tags = ref<string[]>(['indigo', 'amber', 'jade']);
      return { tags };
    },
    template: `
      <BInputTags
        v-model="tags"
        placeholder="Themed input…"
        style="
          --b-input-tags-border-color-focus: oklch(50% 0.18 290);
          --b-input-tags-tag-bg: oklch(94% 0.06 290);
          --b-input-tags-tag-fg: oklch(38% 0.18 290);
          --b-input-tags-tag-radius: 999px;
          --b-input-tags-shadow-focus: 0 0 0 3px oklch(80% 0.1 290 / 0.35);
        "
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-input-tags-bg', defaultValue: '#ffffff', description: 'Background color of the wrapper.' },
  { token: '--b-input-tags-border-color', defaultValue: '#d9d9d9', description: 'Resting border color of the wrapper.' },
  { token: '--b-input-tags-border-color-focus', defaultValue: '#1677ff', description: 'Border color when the wrapper is hovered or focused.' },
  { token: '--b-input-tags-radius', defaultValue: '6px', description: 'Border radius of the wrapper.' },
  { token: '--b-input-tags-padding', defaultValue: '2px 4px', description: 'Inner padding of the wrapper.' },
  { token: '--b-input-tags-gap', defaultValue: '4px', description: 'Gap between chips and the input.' },
  { token: '--b-input-tags-color', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Text color inside the wrapper.' },
  { token: '--b-input-tags-placeholder-color', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Placeholder text color.' },
  { token: '--b-input-tags-shadow-focus', defaultValue: '0 0 0 2px rgba(5, 145, 255, 0.1)', description: 'Focus ring shadow.' },
  { token: '--b-input-tags-disabled-bg', defaultValue: 'rgba(0, 0, 0, 0.04)', description: 'Wrapper background when disabled.' },
  { token: '--b-input-tags-disabled-color', defaultValue: 'rgba(0, 0, 0, 0.25)', description: 'Text color when disabled.' },
  { token: '--b-input-tags-tag-bg', defaultValue: 'rgba(0, 0, 0, 0.06)', description: 'Background color of each tag chip.' },
  { token: '--b-input-tags-tag-fg', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Text color of each tag chip.' },
  { token: '--b-input-tags-tag-radius', defaultValue: '4px', description: 'Border radius of each tag chip.' },
  { token: '--b-input-tags-tag-padding', defaultValue: '0 6px', description: 'Inner padding of each tag chip.' },
  { token: '--b-input-tags-tag-gap', defaultValue: '4px', description: 'Gap between the chip label and remove button.' },
  { token: '--b-input-tags-tag-remove-color', defaultValue: 'rgba(0, 0, 0, 0.45)', description: 'Resting color of the remove button.' },
  { token: '--b-input-tags-tag-remove-color-hover', defaultValue: 'rgba(0, 0, 0, 0.88)', description: 'Hover color of the remove button.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BInputTags</code>. Override on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BInputTags — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          Override these <code>--b-input-tags-*</code> variables on the component root or any ancestor.
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
