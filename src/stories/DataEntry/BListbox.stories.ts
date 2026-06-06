import { BListbox } from '@/components';
import { BCommonSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BListbox — the standalone selectable-list primitive that powers select-style controls.
 *
 * The story file follows the canonical format described in `docs/STORY_FORMAT.md`:
 *   Usage  → one story per prop / state
 *   Examples → composed real-world recipes
 *   Accessibility → roles + keyboard play tests
 *   Theming → CSS-token override demo
 *   Design Tokens → reference table (LAST story)
 */
const meta = {
  title: 'DataEntry/Listbox',
  component: BListbox,
  tags: ['autodocs'],
  argTypes: {
    options: {
      control: 'object',
      description: 'Array of `{ label, value, disabled?, group? }` records to render as options.',
      table: { category: 'Props', defaultValue: { summary: '[]' } },
    },
    multiple: {
      control: 'boolean',
      description: 'When true the model becomes an array and consumers can pick multiple options.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the entire listbox — no keyboard nav, no selection.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    size: {
      control: 'select',
      options: Object.values(BCommonSize),
      description: 'Visual density preset.',
      table: { category: 'Props', defaultValue: { summary: 'md' } },
    },
    valueKey: {
      control: 'text',
      description: 'Key on each option object that holds the value. Defaults to `value`.',
      table: { category: 'Props', defaultValue: { summary: 'value' } },
    },
    labelKey: {
      control: 'text',
      description: 'Key on each option object that holds the display label. Defaults to `label`.',
      table: { category: 'Props', defaultValue: { summary: 'label' } },
    },
    id: {
      control: 'text',
      description: 'Optional id for the underlying `<ul role="listbox">`. Auto-generated when omitted.',
      table: { category: 'Props' },
    },
    modelValue: {
      control: 'object',
      description: 'Bound selected value(s) — `T` in single mode, `T[]` in multiple, or `null`.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'null' } },
    },
    onChange: {
      description: 'Fired when the selection changes. Payload is the value (single) or array (multiple).',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          '<code>BListbox</code> is the inner widget of a select control surfaced as a primitive. ' +
          'Useful for command palettes, in-page filter pickers, and as the core of richer combobox UIs.<br><br>' +
          '⌨️ Full keyboard support: <kbd>↑</kbd>/<kbd>↓</kbd> to move, <kbd>Home</kbd>/<kbd>End</kbd> ' +
          'to jump, <kbd>Enter</kbd>/<kbd>Space</kbd> to toggle, type-ahead to jump by first letter.<br>' +
          '👥 Use the optional <code>group</code> field on options to cluster items under a shared label.',
      },
    },
  },
} satisfies Meta<typeof BListbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
];

const groupedOptions = [
  { label: 'Apple', value: 'apple', group: 'Fruits' },
  { label: 'Banana', value: 'banana', group: 'Fruits' },
  { label: 'Cherry', value: 'cherry', group: 'Fruits' },
  { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
  { label: 'Daikon', value: 'daikon', group: 'Vegetables' },
  { label: 'Eggplant', value: 'eggplant', group: 'Vegetables' },
];

const disabledOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana (out of stock)', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date (out of stock)', value: 'date', disabled: true },
  { label: 'Elderberry', value: 'elderberry' },
];

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default single-select listbox with five fruit options. */
export const Default: Story = {
  args: {
    options: sampleOptions,
    size: BCommonSize.Medium,
    multiple: false,
    disabled: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BListbox v-model="selected" :options="options" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { BListbox },
    setup() {
      const selected = ref<string | null>(null);
      return { args, selected };
    },
    template: `
      <div style="max-width:280px;">
        <BListbox v-bind="args" v-model="selected" />
        <p style="margin-top:8px;font-size:13px;color:#595959;">Selected: <code>{{ selected ?? 'none' }}</code></p>
      </div>
    `,
  }),
};

/** Three sizes for different layout densities. */
export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BListbox size="sm" :options="options" />
<BListbox size="md" :options="options" />
<BListbox size="lg" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: sampleOptions.slice(0, 3) }),
    template: `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#595959;">size="sm"</p>
          <BListbox size="sm" :options="options" />
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#595959;">size="md"</p>
          <BListbox size="md" :options="options" />
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#595959;">size="lg"</p>
          <BListbox size="lg" :options="options" />
        </div>
      </div>
    `,
  }),
};

/** Multiple-select mode — model becomes an array, options toggle on click. */
export const Multiple: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BListbox multiple v-model="selected" :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup() {
      const selected = ref<string[]>(['apple', 'cherry']);
      return { selected, options: sampleOptions };
    },
    template: `
      <div style="max-width:280px;">
        <BListbox multiple v-model="selected" :options="options" />
        <p style="margin-top:8px;font-size:13px;color:#595959;">
          Selected: <code>{{ JSON.stringify(selected) }}</code>
        </p>
      </div>
    `,
  }),
};

/** When `disabled` is set on the listbox, it's removed from tab order and rejects all input. */
export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<BListbox disabled :options="options" />` } },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: sampleOptions.slice(0, 3) }),
    template: `
      <div style="max-width:280px;">
        <BListbox disabled :options="options" />
      </div>
    `,
  }),
};

/** Individual options can be marked `disabled` — they render but skip keyboard nav and clicks. */
export const DisabledOptions: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana (out of stock)', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

<BListbox :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: disabledOptions }),
    template: `
      <div style="max-width:280px;">
        <BListbox :options="options" />
      </div>
    `,
  }),
};

/** Options sharing a `group` field cluster under a labeled `<span role="group">`. */
export const Grouped: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const options = [
  { label: 'Apple', value: 'apple', group: 'Fruits' },
  { label: 'Banana', value: 'banana', group: 'Fruits' },
  { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
];

<BListbox :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: groupedOptions }),
    template: `
      <div style="max-width:280px;">
        <BListbox :options="options" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Adapt a foreign option shape via `valueKey` / `labelKey` instead of remapping the array. */
export const CustomKeys: Story = {
  parameters: {
    docs: {
      source: {
        code: `
const users = [
  { id: 'u1', name: 'Ada Lovelace', label: '', value: '' },
  { id: 'u2', name: 'Grace Hopper', label: '', value: '' },
];

<BListbox value-key="id" label-key="name" :options="users" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup() {
      const users = [
        { id: 'u1', name: 'Ada Lovelace', label: '', value: '' },
        { id: 'u2', name: 'Grace Hopper', label: '', value: '' },
        { id: 'u3', name: 'Margaret Hamilton', label: '', value: '' },
      ];
      const selected = ref<string | null>(null);
      return { users, selected };
    },
    template: `
      <div style="max-width:280px;">
        <BListbox value-key="id" label-key="name" v-model="selected" :options="users" />
        <p style="margin-top:8px;font-size:13px;color:#595959;">Selected user id: <code>{{ selected ?? 'none' }}</code></p>
      </div>
    `,
  }),
};

/** Combine `multiple` with grouping — common pattern for facet pickers. */
export const MultipleWithGroups: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BListbox multiple v-model="selected" :options="groupedOptions" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup() {
      const selected = ref<string[]>(['apple', 'carrot']);
      return { selected, options: groupedOptions };
    },
    template: `
      <div style="max-width:280px;">
        <BListbox multiple v-model="selected" :options="options" />
        <p style="margin-top:8px;font-size:13px;color:#595959;">
          Selected: <code>{{ JSON.stringify(selected) }}</code>
        </p>
      </div>
    `,
  }),
};

/** Controlled (v-model) and uncontrolled usages side-by-side. */
export const ControlledVsUncontrolled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<!-- Controlled -->
<BListbox v-model="selected" :options="options" />

<!-- Uncontrolled (component manages its own state internally) -->
<BListbox :options="options" />
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup() {
      const selected = ref<string | null>('banana');
      return { selected, options: sampleOptions.slice(0, 3) };
    },
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:560px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#595959;">Controlled (v-model)</p>
          <BListbox v-model="selected" :options="options" />
          <p style="margin-top:8px;font-size:13px;color:#595959;">Value: <code>{{ selected ?? 'none' }}</code></p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:12px;color:#595959;">Uncontrolled</p>
          <BListbox :options="options" />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BListbox renders `<ul role="listbox">` with `aria-multiselectable`, `aria-activedescendant`,
 * and one `<li role="option">` per item. Focus stays on the `<ul>` and the active option
 * is tracked via `aria-activedescendant`. Disabled options expose `aria-disabled="true"`
 * and are skipped by keyboard nav.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The listbox is keyboard-reachable via <kbd>Tab</kbd>. ' +
          '<kbd>↓</kbd>/<kbd>↑</kbd> moves the active descendant, <kbd>Home</kbd>/<kbd>End</kbd> jump to the ends, ' +
          '<kbd>Enter</kbd>/<kbd>Space</kbd> toggles selection, and typing a letter jumps to the next option that starts with it.',
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: sampleOptions }),
    template: `<BListbox id="a11y-listbox" :options="options" />`,
  }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const listbox = c.getByRole('listbox');

    // role and tabindex
    await expect(listbox).toHaveAttribute('role', 'listbox');
    await expect(listbox).toHaveAttribute('tabindex', '0');

    // options
    const options = c.getAllByRole('option');
    await expect(options).toHaveLength(5);
    await expect(options[0]).toHaveAttribute('role', 'option');

    // Focus and navigate via keyboard
    listbox.focus();
    await expect(listbox).toHaveFocus();
    await expect(listbox).toHaveAttribute('aria-activedescendant', 'a11y-listbox-option-0');

    await userEvent.keyboard('{ArrowDown}');
    await expect(listbox).toHaveAttribute('aria-activedescendant', 'a11y-listbox-option-1');

    await userEvent.keyboard('{End}');
    await expect(listbox).toHaveAttribute('aria-activedescendant', 'a11y-listbox-option-4');

    await userEvent.keyboard('{Home}');
    await expect(listbox).toHaveAttribute('aria-activedescendant', 'a11y-listbox-option-0');

    // Enter selects
    await userEvent.keyboard('{Enter}');
    await expect(options[0]).toHaveAttribute('aria-selected', 'true');
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * BListbox exposes a family of `--b-listbox-*` CSS variables. Override them on the
 * component root (or any ancestor) to retheme without writing new CSS rules.
 */
export const Theming: Story = {
  parameters: {
    a11y: {
      // Theme story uses demonstrative colors; contrast is consumer-tunable.
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
    docs: {
      description: {
        story:
          'Override <code>--b-listbox-bg</code>, <code>--b-listbox-option-bg-selected</code>, ' +
          '<code>--b-listbox-option-fg-selected</code>, and <code>--b-listbox-radius</code> to ' +
          'create a custom theme — no new CSS rules required.',
      },
      source: {
        code: `
<BListbox
  :options="options"
  :model-value="'banana'"
  style="
    --b-listbox-bg: oklch(96% 0.04 300);
    --b-listbox-border-color: oklch(70% 0.18 300);
    --b-listbox-option-bg-selected: oklch(72% 0.18 300);
    --b-listbox-option-fg-selected: white;
    --b-listbox-radius: 12px;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BListbox },
    setup: () => ({ options: sampleOptions.slice(0, 4) }),
    template: `
      <div style="max-width:280px;">
        <BListbox
          :options="options"
          :model-value="'banana'"
          style="
            --b-listbox-bg: oklch(96% 0.04 300);
            --b-listbox-border-color: oklch(70% 0.18 300);
            --b-listbox-option-bg-selected: oklch(72% 0.18 300);
            --b-listbox-option-fg-selected: white;
            --b-listbox-option-bg-hover: oklch(92% 0.06 300);
            --b-listbox-radius: 12px;
          "
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-listbox-bg', defaultValue: '#ffffff', description: 'Listbox surface background.' },
  { token: '--b-listbox-fg', defaultValue: 'rgba(0,0,0,0.88)', description: 'Default text color for options.' },
  { token: '--b-listbox-border-color', defaultValue: '#d9d9d9', description: 'Outer border color.' },
  { token: '--b-listbox-radius', defaultValue: '6px', description: 'Border radius of the listbox surface.' },
  { token: '--b-listbox-option-padding-x', defaultValue: '12px', description: 'Horizontal padding inside each option (md size).' },
  { token: '--b-listbox-option-padding-y', defaultValue: '6px', description: 'Vertical padding inside each option (md size).' },
  { token: '--b-listbox-option-bg-hover', defaultValue: 'rgba(0,0,0,0.04)', description: 'Background of an option on mouse hover.' },
  { token: '--b-listbox-option-bg-active', defaultValue: 'rgba(0,0,0,0.06)', description: 'Background of the currently active descendant.' },
  { token: '--b-listbox-option-bg-selected', defaultValue: 'oklch(95% 0.04 240)', description: 'Background of selected options.' },
  { token: '--b-listbox-option-fg-selected', defaultValue: 'oklch(45% 0.18 258)', description: 'Text color of selected options.' },
  { token: '--b-listbox-font-size', defaultValue: '14px', description: 'Base font size; size variants override this.' },
  { token: '--b-listbox-group-label-color', defaultValue: 'rgba(0,0,0,0.45)', description: 'Color of the group section header.' },
  { token: '--b-listbox-disabled-color', defaultValue: 'rgba(0,0,0,0.25)', description: 'Text color for disabled options.' },
  { token: '--b-listbox-focus-ring', defaultValue: '0 0 0 2px rgba(5,145,255,0.2)', description: 'Box-shadow used as the keyboard focus ring on the listbox surface.' },
  { token: '--b-listbox-transition-duration', defaultValue: '150ms', description: 'Background / color transition duration on options.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BListbox</code>. Override on the component ' +
          'root or any ancestor selector. Dark-mode reassigns the same variables — no new ones are introduced.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BListbox — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          Component-scoped CSS variables defined on <code>.b-listbox</code>.
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
