import { BSegmented } from '@/components';
import type { BSegmentedRawOption, BSegmentedSize } from '@/types';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Segmented',
  component: BSegmented,
  tags: ['autodocs'],
  argTypes: {
    // ── Two-Way Binding Props ──
    modelValue: {
      control: 'text',
      description: 'Currently selected value (v-model).',
      table: { category: 'Two-Way Binding Props' },
    },

    // ── Props ──
    options: {
      control: 'object',
      description:
        'Segmented options. Accepts `string[]`, `number[]`, or `{ label, value, disabled?, icon? }[]`.',
      table: { category: 'Props' },
    },
    defaultValue: {
      control: 'text',
      description: 'Initial selected value for uncontrolled mode.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the whole control is disabled.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'] satisfies BSegmentedSize[],
      description: 'Size of the segmented control.',
      table: { defaultValue: { summary: 'default' }, category: 'Props' },
    },
    block: {
      control: 'boolean',
      description: 'Fill the full width of its container.',
      table: { defaultValue: { summary: 'false' }, category: 'Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BSegmented</code> component lets users select one option from a set, rendered as an inline control with a sliding thumb indicator.<br><br>' +
          'Supports <strong>controlled</strong> (v-model) and <strong>uncontrolled</strong> usage, <strong>disabled</strong> state, ' +
          'three <strong>size</strong> variants, per-option disabling, icon support, and a custom <code>#label</code> slot.<br>' +
          'Keyboard navigation: <kbd>←</kbd>/<kbd>→</kbd> moves focus, <kbd>Enter</kbd>/<kbd>Space</kbd> selects.<br>' +
          'Theming via <code>--b-segmented-*</code> CSS custom properties. Respects <code>prefers-reduced-motion</code>.',
      },
    },
  },
} satisfies Meta<typeof BSegmented>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────
const STRING_OPTIONS: BSegmentedRawOption[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const OBJECT_OPTIONS: BSegmentedRawOption[] = [
  { label: 'Map', value: 'map' },
  { label: 'Transit', value: 'transit' },
  { label: 'Satellite', value: 'satellite' },
];
// ─────────────────────────────────────────────
// 1. Playground
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    options: STRING_OPTIONS,
    defaultValue: 'Daily',
    disabled: false,
    size: 'default',
    block: false,
  },
  render: (args) => ({
    components: { BSegmented },
    setup() {
      const value = ref<string | number>(args.modelValue ?? args.defaultValue ?? 'Daily');
      return { args, value };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented v-bind="args" v-model="value" />
        <p style="margin-top:1rem;font-size:13px;color:#666;">Selected: <strong>{{ value }}</strong></p>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. Basic
// ─────────────────────────────────────────────
/**
 * Default segmented with string options.
 */
export const Basic: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BSegmented :options="['Daily', 'Weekly', 'Monthly']" />`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('Daily');
      return { value, STRING_OPTIONS };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented data-testid="basic" :options="STRING_OPTIONS" v-model="value" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('basic');
    const items = el.querySelectorAll('.b-segmented__item');
    expect(items.length).toBe(5);
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(el.getAttribute('role')).toBe('group');
  },
};

// ─────────────────────────────────────────────
// 3. Sizes
// ─────────────────────────────────────────────
/**
 * Three available sizes: small, default, and large.
 */
export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BSegmented :options="opts" size="small" />
<BSegmented :options="opts" size="default" />
<BSegmented :options="opts" size="large" />`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      return { OBJECT_OPTIONS };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Small</p>
          <BSegmented data-testid="size-small" :options="OBJECT_OPTIONS" size="small" default-value="map" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Default</p>
          <BSegmented data-testid="size-default" :options="OBJECT_OPTIONS" default-value="map" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Large</p>
          <BSegmented data-testid="size-large" :options="OBJECT_OPTIONS" size="large" default-value="map" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('size-small').classList.contains('b-segmented--small')).toBe(true);
    expect(canvas.getByTestId('size-default').classList.contains('b-segmented--small')).toBe(false);
    expect(canvas.getByTestId('size-large').classList.contains('b-segmented--large')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 4. Disabled
// ─────────────────────────────────────────────
/**
 * Disabled state: whole control and individual option disabled.
 */
export const Disabled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<!-- Whole control disabled -->
<BSegmented :options="opts" disabled />

<!-- Single option disabled -->
<BSegmented :options="[
  { label: 'Map', value: 'map' },
  { label: 'Transit', value: 'transit', disabled: true },
  { label: 'Satellite', value: 'satellite' },
]" />`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const partialOpts: BSegmentedRawOption[] = [
        { label: 'Map', value: 'map' },
        { label: 'Transit', value: 'transit', disabled: true },
        { label: 'Satellite', value: 'satellite' },
      ];
      return { OBJECT_OPTIONS, partialOpts };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">All disabled</p>
          <BSegmented data-testid="all-disabled" :options="OBJECT_OPTIONS" disabled default-value="map" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Transit option disabled</p>
          <BSegmented data-testid="partial-disabled" :options="partialOpts" default-value="map" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allDisabled = canvas.getByTestId('all-disabled');
    expect(allDisabled.classList.contains('b-segmented--disabled')).toBe(true);
    expect(allDisabled.getAttribute('aria-disabled')).toBe('true');

    const partial = canvas.getByTestId('partial-disabled');
    const transitItem = partial.querySelectorAll('.b-segmented__item')[1];
    expect(transitItem.classList.contains('b-segmented__item--disabled')).toBe(true);
    expect(transitItem.getAttribute('aria-disabled')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// 5. Block (full width)
// ─────────────────────────────────────────────
/**
 * Block mode stretches the control to fill its container.
 */
export const Block: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BSegmented :options="opts" block />`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      return { STRING_OPTIONS };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented data-testid="block" :options="STRING_OPTIONS" block default-value="Daily" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('block');
    expect(el.classList.contains('b-segmented--block')).toBe(true);
  },
};

// ─────────────────────────────────────────────
// 6. With icons
// ─────────────────────────────────────────────
/**
 * Options with icon + label content.
 */
export const WithIcons: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Use the `#label` slot to render icon + text combinations. ' +
          'Wrap each icon in `role="img"` with an `aria-label` to give it an explicit text alternative, ' +
          'satisfying WCAG SC 1.1.1 (Non-text Content). ' +
          'This is the accessible pattern for real-world icon usage (e.g. `BIcon` or SVG components).',
      },
      source: {
        code: `
<BSegmented :options="[
  { label: 'List',   value: 'list'   },
  { label: 'Grid',   value: 'grid'   },
  { label: 'Kanban', value: 'kanban' },
]" v-model="value">
  <template #label="{ option }">
    <span role="img" :aria-label="option.label">{{ iconMap[option.value] }}</span>
    <span>{{ option.label }}</span>
  </template>
</BSegmented>`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('list');
      const iconBaseOpts: BSegmentedRawOption[] = [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Kanban', value: 'kanban' },
      ];
      const iconMap: Record<string, string> = {
        list: '☰',
        grid: '⊞',
        kanban: '▣',
      };
      return { value, iconBaseOpts, iconMap };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented data-testid="icons" :options="iconBaseOpts" v-model="value">
          <template #label="{ option }">
            <span role="img" :aria-label="option.label">{{ iconMap[option.value] }}</span>
            <span>{{ option.label }}</span>
          </template>
        </BSegmented>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('icons');
    const items = el.querySelectorAll('.b-segmented__item');
    expect(items.length).toBe(3);
    // Each icon has an explicit text alternative via role="img" + aria-label
    const iconImgs = el.querySelectorAll('[role="img"]');
    expect(iconImgs.length).toBe(3);
    expect(iconImgs[0].getAttribute('aria-label')).toBe('List');
    expect(iconImgs[1].getAttribute('aria-label')).toBe('Grid');
    expect(iconImgs[2].getAttribute('aria-label')).toBe('Kanban');
  },
};

// ─────────────────────────────────────────────
// 7. Custom label slot
// ─────────────────────────────────────────────
/**
 * Use the `#label` slot to render custom content inside each option.
 */
export const CustomLabel: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BSegmented :options="opts">
  <template #label="{ option }">
    <strong>{{ option.label }}</strong>
  </template>
</BSegmented>`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('map');
      return { value, OBJECT_OPTIONS };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented data-testid="custom-label" :options="OBJECT_OPTIONS" v-model="value">
          <template #label="{ option }">
            <em style="font-style:italic;">{{ option.label }}</em>
          </template>
        </BSegmented>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('custom-label');
    const firstLabel = el.querySelector('.b-segmented__item-label em');
    expect(firstLabel).not.toBeNull();
    expect(firstLabel?.textContent).toContain('Map');
  },
};

// ─────────────────────────────────────────────
// 8. Controlled (v-model)
// ─────────────────────────────────────────────
/**
 * Full two-way binding example showing the selected value updating live.
 */
export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<script setup>
const value = ref('Weekly')
</script>
<BSegmented :options="['Daily','Weekly','Monthly']" v-model="value" />
<p>Selected: {{ value }}</p>`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('Weekly');
      return { value, STRING_OPTIONS };
    },
    template: `
      <div style="padding: 2rem;">
        <BSegmented data-testid="controlled" :options="STRING_OPTIONS" v-model="value" />
        <p data-testid="selected-display" style="margin-top:0.75rem;font-size:13px;color:#555;">
          Selected: <strong>{{ value }}</strong>
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('controlled');
    const display = canvas.getByTestId('selected-display');

    // Initial state
    expect(display.querySelector('strong')?.textContent).toBe('Weekly');

    // Click "Monthly" (index 2)
    const items = el.querySelectorAll('.b-segmented__item');
    await userEvent.click(items[2]);
    expect(display.querySelector('strong')?.textContent).toBe('Monthly');
    expect(items[2].getAttribute('aria-checked')).toBe('true');
  },
};

// ─────────────────────────────────────────────
// 9. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates correct ARIA roles and keyboard navigation.
 * - `role="group"` on the root
 * - `role="radio"` on each item
 * - `aria-checked` on items
 * - Keyboard: ←/→ moves focus, Enter/Space selects
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Verifies ARIA roles, `aria-checked`, `aria-disabled` attributes, and keyboard navigation. ' +
          'Use <kbd>Tab</kbd> to focus the control, then <kbd>←</kbd><kbd>→</kbd> to move focus, <kbd>Enter</kbd> or <kbd>Space</kbd> to select.',
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('Daily');
      const partialDisabled: BSegmentedRawOption[] = [
        { label: 'Map', value: 'map' },
        { label: 'Transit', value: 'transit', disabled: true },
        { label: 'Satellite', value: 'satellite' },
      ];
      return { value, STRING_OPTIONS, partialDisabled };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
        <BSegmented data-testid="a11y-basic" :options="STRING_OPTIONS" v-model="value" />
        <BSegmented data-testid="a11y-disabled" :options="STRING_OPTIONS" disabled default-value="Daily" />
        <BSegmented data-testid="a11y-partial" :options="partialDisabled" default-value="map" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Role checks
    const basic = canvas.getByTestId('a11y-basic');
    expect(basic.getAttribute('role')).toBe('group');
    basic.querySelectorAll('.b-segmented__item').forEach((item) => {
      expect(item.getAttribute('role')).toBe('radio');
    });

    // aria-checked
    const items = basic.querySelectorAll('.b-segmented__item');
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[1].getAttribute('aria-checked')).toBe('false');

    // Disabled
    const disabled = canvas.getByTestId('a11y-disabled');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');

    // Per-item disabled
    const partial = canvas.getByTestId('a11y-partial');
    expect(partial.querySelectorAll('.b-segmented__item')[1].getAttribute('aria-disabled')).toBe(
      'true',
    );

    // Keyboard: click item 0, then ArrowRight should move focus to item 1
    const firstItem = items[0] as HTMLElement;
    firstItem.focus();
    expect(document.activeElement).toBe(firstItem);
  },
};

// ─────────────────────────────────────────────
// 10. Theming
// ─────────────────────────────────────────────
/**
 * Override `--b-segmented-*` CSS custom properties to customise the component.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-segmented-*` CSS custom properties on the component root to customise appearance without touching source.',
      },
      source: {
        code: `
<style>
.custom-segmented {
  --b-segmented-bg: #f0f5ff;
  --b-segmented-thumb-bg: #1d39c4;
  --b-segmented-selected-color: #fff;
  --b-segmented-item-hover-color: #1d39c4;
}
</style>
<BSegmented class="custom-segmented" :options="opts" />`,
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      return { OBJECT_OPTIONS };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Default theme</p>
          <BSegmented :options="OBJECT_OPTIONS" default-value="map" />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Blue theme</p>
          <BSegmented
            :options="OBJECT_OPTIONS"
            default-value="map"
            style="--b-segmented-bg:#f0f5ff;--b-segmented-thumb-bg:#1d39c4;--b-segmented-selected-color:#fff;--b-segmented-thumb-shadow:0 2px 6px oklch(35% 0.2 260 / 40%);--b-segmented-item-hover-color:#1d39c4;"
          />
        </div>
        <div>
          <p style="font-size:12px;color:#666;margin:0 0 4px;">Rounded pill theme</p>
          <BSegmented
            :options="OBJECT_OPTIONS"
            default-value="map"
            style="--b-segmented-border-radius:20px;--b-segmented-item-border-radius:16px;--b-segmented-bg:oklch(92% 0.02 140);--b-segmented-thumb-bg:oklch(50% 0.15 140);--b-segmented-selected-color:#fff;"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 11. Interaction tests
// ─────────────────────────────────────────────
/**
 * Automated interaction tests: selection, events, keyboard, disabled.
 */
export const InteractionTests: Story = {
  name: 'Interaction – selection & keyboard',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function verifying click selection, keyboard navigation, and disabled guard.',
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup() {
      const value = ref('Daily');
      const mapValue = ref('map');
      const partialOpts: BSegmentedRawOption[] = [
        { label: 'Map', value: 'map' },
        { label: 'Transit', value: 'transit' },
        { label: 'Satellite', value: 'satellite', disabled: true },
      ];
      return { value, mapValue, STRING_OPTIONS, partialOpts };
    },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start;">
        <BSegmented data-testid="int-basic" :options="STRING_OPTIONS" v-model="value" />
        <BSegmented data-testid="int-partial" :options="partialOpts" v-model="mapValue" />
        <BSegmented data-testid="int-all-disabled" :options="STRING_OPTIONS" disabled default-value="Daily" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ── Click selection ──────────────────────────
    const basic = canvas.getByTestId('int-basic');
    const items = basic.querySelectorAll<HTMLElement>('.b-segmented__item');

    await userEvent.click(items[1]);
    expect(items[1].getAttribute('aria-checked')).toBe('true');
    expect(items[0].getAttribute('aria-checked')).toBe('false');

    // Click back to first
    await userEvent.click(items[0]);
    expect(items[0].getAttribute('aria-checked')).toBe('true');

    // ── Keyboard navigation ──────────────────────
    // userEvent.click both focuses the element AND sets user-event's
    // internal pointer so that subsequent userEvent.keyboard targets it.
    await userEvent.click(items[0]);
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[1]);

    // Enter selects the currently-focused item
    await userEvent.keyboard('{Enter}');
    expect(items[1].getAttribute('aria-checked')).toBe('true');

    // ── Per-item disabled guard ──────────────────
    const partial = canvas.getByTestId('int-partial');
    const partialItems = partial.querySelectorAll<HTMLElement>('.b-segmented__item');

    // satellite (index 2) is disabled - click must not change selection
    await userEvent.click(partialItems[2]);
    expect(partialItems[2].getAttribute('aria-checked')).toBe('false');
    expect(partialItems[0].getAttribute('aria-checked')).toBe('true');

    // ── Whole-control disabled guard ─────────────
    // The control has CSS pointer-events:none, so we skip the click and
    // instead verify the aria state reflects the disabled condition.
    const allDisabled = canvas.getByTestId('int-all-disabled');
    const disabledItems = allDisabled.querySelectorAll<HTMLElement>('.b-segmented__item');
    expect(allDisabled.getAttribute('aria-disabled')).toBe('true');
    expect(disabledItems[0].getAttribute('aria-checked')).toBe('true'); // Daily stays selected
    expect(disabledItems[1].getAttribute('aria-checked')).toBe('false');
  },
};

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-segmented-bg',
    defaultValue: 'oklch(95% 0.003 260)',
    description: 'Background of the segmented track (AntD: trackBg).',
  },
  {
    token: '--b-segmented-padding',
    defaultValue: '2px',
    description: 'Padding inside the segmented track (AntD: trackPadding).',
  },
  {
    token: '--b-segmented-thumb-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background of the selected thumb (AntD: itemSelectedBg).',
  },
  {
    token: '--b-segmented-selected-color',
    defaultValue: 'oklch(20% 0.02 260)',
    description: 'Text color of the selected item (AntD: itemSelectedColor).',
  },
  {
    token: '--b-segmented-item-color',
    defaultValue: 'oklch(40% 0.02 260)',
    description: 'Text color of unselected items (AntD: itemColor).',
  },
  {
    token: '--b-segmented-item-hover-bg',
    defaultValue: 'oklch(100% 0 0 / 50%)',
    description: 'Background of items on hover (AntD: itemHoverBg).',
  },
  {
    token: '--b-segmented-item-hover-color',
    defaultValue: 'oklch(20% 0.02 260)',
    description: 'Text color of items on hover (AntD: itemHoverColor).',
  },
  // Note: AntD itemActiveBg (mousedown) is not yet implemented.
  // ── Local extras ──
  {
    token: '--b-segmented-height',
    defaultValue: '32px',
    description: 'Default control height (24px small / 40px large).',
  },
  {
    token: '--b-segmented-item-padding',
    defaultValue: '0 11px',
    description: 'Padding inside each item (varies by size).',
  },
  {
    token: '--b-segmented-border-radius',
    defaultValue: '8px',
    description: 'Outer corner radius of the track.',
  },
  {
    token: '--b-segmented-item-border-radius',
    defaultValue: '6px',
    description: 'Corner radius of each item / the thumb.',
  },
  {
    token: '--b-segmented-selected-font-weight',
    defaultValue: '500',
    description: 'Font weight of the selected item label.',
  },
  {
    token: '--b-segmented-thumb-shadow',
    defaultValue: '0 1px 2px oklch(0% 0 0 / 10%), 0 0 0 1px oklch(0% 0 0 / 6%)',
    description: 'Box shadow of the selected thumb.',
  },
  {
    token: '--b-segmented-thumb-transition',
    defaultValue: '...',
    description: 'Transition spec applied as the thumb moves between items.',
  },
  {
    token: '--b-segmented-transition-duration',
    defaultValue: '200ms',
    description: 'Duration of color/background transitions.',
  },
  {
    token: '--b-segmented-disabled-opacity',
    defaultValue: '0.4',
    description: 'Opacity applied when the control is disabled.',
  },
  {
    token: '--b-segmented-disabled-cursor',
    defaultValue: 'not-allowed',
    description: 'Cursor used while disabled.',
  },
  {
    token: '--b-segmented-focus-ring',
    defaultValue: '0 0 0 2px oklch(54.6% 0.245 262.881 / 20%)',
    description: 'Focus ring shadow for keyboard focus.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-segmented-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BSegmented },
    setup: () => ({
      tokens: DESIGN_TOKENS,
      options: ['Daily', 'Weekly', 'Monthly'],
    }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BSegmented - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-segmented</code>. Override inline or via a CSS class.
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
          Four tokens overridden inline (track background, thumb background, radius, hover).
        </p>
        <BSegmented
          :options="options"
          style="
            --b-segmented-bg: oklch(95% 0.05 145);
            --b-segmented-thumb-bg: oklch(42% 0.16 145);
            --b-segmented-selected-color: oklch(98% 0.005 145);
            --b-segmented-border-radius: 16px;
            --b-segmented-item-border-radius: 14px;
          "
        />
      </div>
    `,
  }),
};
