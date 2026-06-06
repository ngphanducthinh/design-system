import BFloatButton from '@/components/BFloatButton/BFloatButton.vue';
import BFloatButtonBackTop from '@/components/BFloatButton/BFloatButtonBackTop.vue';
import BFloatButtonGroup from '@/components/BFloatButton/BFloatButtonGroup.vue';
import { BFloatButtonShape, BFloatButtonType } from '@/components/BFloatButton/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BFloatButton — floating action button anchored to a viewport corner.
 *
 * Story file follows the canonical format described in `docs/STORY_FORMAT.md`:
 *   Usage  → one story per prop value (granular, copy-pasteable)
 *   Examples → composed real-world recipes
 *   Accessibility → roles + keyboard play tests
 *   Theming → CSS-token override demo
 *   Design Tokens → reference table (LAST story)
 */
const meta = {
  title: 'General/FloatButton',
  component: BFloatButton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BFloatButtonType),
      description: 'Visual type — `default` (light surface) or `primary` (brand color).',
      table: { category: 'Props', defaultValue: { summary: 'default' } },
    },
    shape: {
      control: 'select',
      options: Object.values(BFloatButtonShape),
      description: 'Outer shape — `circle` (icon-only) or `square` (supports description).',
      table: { category: 'Props', defaultValue: { summary: 'circle' } },
    },
    icon: {
      control: 'text',
      description: 'Icon name rendered inside the button.',
      table: { category: 'Props' },
    },
    description: {
      control: 'text',
      description: 'Description label shown below the icon (only visible in `square` shape).',
      table: { category: 'Props' },
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text shown on hover.',
      table: { category: 'Props' },
    },
    href: {
      control: 'text',
      description: 'When set, renders the button as an `<a>` element with this href.',
      table: { category: 'Props' },
    },
    target: {
      control: 'text',
      description: 'Anchor target attribute (only applied when `href` is set).',
      table: { category: 'Props', defaultValue: { summary: '_blank' } },
    },
    htmlType: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'Native `type` attribute when rendered as a `<button>`.',
      table: { category: 'Props', defaultValue: { summary: 'button' } },
    },
    badge: {
      control: 'object',
      description:
        'Badge configuration (`{ count, dot, overflowCount, showZero, color }`) shown in the top-right corner.',
      table: { category: 'Props' },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled visual.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label — required when there is no visible text content.',
      table: { category: 'Props' },
    },
    icon_slot: {
      name: 'icon',
      description: 'Custom icon content (overrides the default plus icon and the `icon` prop).',
      table: { category: 'Slots' },
    },
    description_slot: {
      name: 'description',
      description: 'Custom description content (only visible in `square` shape).',
      table: { category: 'Slots' },
    },
    tooltip_slot: {
      name: 'tooltip',
      description: 'Custom tooltip content.',
      table: { category: 'Slots' },
    },
    onClick: {
      action: 'click',
      description: 'Emitted when the float button is clicked (no-op when disabled).',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BFloatButton</code> component is a floating action button fixed in the viewport corner. ' +
          'It supports circle and square shapes, primary/default types, tooltips, badges, ' +
          'grouped menus with expand/collapse triggers, and a back-to-top variant.',
      },
    },
    layout: 'centered',
  },
} satisfies Meta<typeof BFloatButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** The default float button — circle shape, default type. */
export const Default: Story = {
  args: {
    type: BFloatButtonType.Default,
    shape: BFloatButtonShape.Circle,
    tooltip: 'Float Button',
    disabled: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<BFloatButton tooltip="Float Button" />`,
      },
    },
  },
  render: (args) => ({
    components: { BFloatButton },
    setup: () => ({ args }),
    template: `
      <div style="position:relative; width:300px; height:200px; border:1px dashed #ccc; border-radius:8px; padding:1rem;">
        <p style="color:#767676;font-size:0.875rem;">Float button is positioned at bottom-right</p>
        <div style="position:absolute; bottom:1.5rem; right:1.5rem;">
          <BFloatButton v-bind="args" @click="args.onClick" />
        </div>
      </div>
    `,
  }),
};

/** Default type — neutral light surface for tertiary floating actions. */
export const TypeDefault: Story = {
  name: 'Type: Default',
  parameters: {
    docs: {
      source: { code: `<BFloatButton type="default" tooltip="Default" />` },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `<BFloatButton type="default" tooltip="Default" />`,
  }),
};

/** Primary type — for the most prominent floating action on the page. */
export const TypePrimary: Story = {
  name: 'Type: Primary',
  parameters: {
    docs: {
      source: { code: `<BFloatButton type="primary" tooltip="Primary" />` },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `<BFloatButton type="primary" tooltip="Primary" />`,
  }),
};

/** Circle shape — icon-only, the default. */
export const ShapeCircle: Story = {
  name: 'Shape: Circle',
  parameters: {
    docs: {
      source: { code: `<BFloatButton shape="circle" tooltip="Circle" />` },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `<BFloatButton shape="circle" tooltip="Circle" />`,
  }),
};

/** Square shape — accommodates an additional `description` label below the icon. */
export const ShapeSquare: Story = {
  name: 'Shape: Square',
  parameters: {
    docs: {
      source: {
        code: `<BFloatButton shape="square" description="Help" tooltip="Square with description" />`,
      },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `<BFloatButton shape="square" description="Help" tooltip="Square with description" />`,
  }),
};

/** Disabled buttons receive reduced opacity and `cursor: not-allowed`. */
export const Disabled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButton tooltip="Disabled default" disabled />
<BFloatButton type="primary" tooltip="Disabled primary" disabled />
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `
      <div style="display:flex; gap:1.5rem; align-items:center; padding:1rem;">
        <BFloatButton tooltip="Enabled default" />
        <BFloatButton tooltip="Disabled default" :disabled="true" />
        <BFloatButton type="primary" tooltip="Enabled primary" />
        <BFloatButton type="primary" tooltip="Disabled primary" :disabled="true" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/**
 * Badge configurations — count, overflow, dot, and zero-display.
 * The badge is positioned in the top-right corner of the float button.
 */
export const WithBadge: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButton :badge="{ count: 5 }" tooltip="5 items" />
<BFloatButton :badge="{ count: 150, overflowCount: 99 }" tooltip="Many items" />
<BFloatButton :badge="{ dot: true }" tooltip="Notification dot" />
<BFloatButton :badge="{ count: 0, showZero: true }" tooltip="Zero count" />
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `
      <div style="display:flex; gap:1.5rem; align-items:flex-end; padding:1.5rem 1rem;">
        <div style="text-align:center">
          <BFloatButton :badge="{ count: 5 }" tooltip="5 items" />
          <p style="font-size:0.7rem; color:#767676; margin-top:0.5rem">count: 5</p>
        </div>
        <div style="text-align:center">
          <BFloatButton :badge="{ count: 150, overflowCount: 99 }" tooltip="Many items" />
          <p style="font-size:0.7rem; color:#767676; margin-top:0.5rem">overflow: 99+</p>
        </div>
        <div style="text-align:center">
          <BFloatButton :badge="{ dot: true }" tooltip="Notification dot" />
          <p style="font-size:0.7rem; color:#767676; margin-top:0.5rem">dot</p>
        </div>
        <div style="text-align:center">
          <BFloatButton :badge="{ count: 0, showZero: true }" tooltip="Zero count" />
          <p style="font-size:0.7rem; color:#767676; margin-top:0.5rem">showZero</p>
        </div>
      </div>
    `,
  }),
};

/** `BFloatButtonGroup` without a trigger arranges its children vertically. */
export const GroupStatic: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButtonGroup>
  <BFloatButton tooltip="Share" />
  <BFloatButton tooltip="Edit" />
  <BFloatButton type="primary" tooltip="Add" />
</BFloatButtonGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton, BFloatButtonGroup },
    template: `
      <BFloatButtonGroup style="display:inline-flex;">
        <BFloatButton tooltip="Share" />
        <BFloatButton tooltip="Edit" />
        <BFloatButton type="primary" tooltip="Add" />
      </BFloatButtonGroup>
    `,
  }),
};

/**
 * `BFloatButtonGroup` with a click trigger expands and collapses its child
 * buttons. Supports controlled usage via `v-model:open`.
 */
export const GroupWithTrigger: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButtonGroup v-model:open="open" trigger="click" placement="top">
  <BFloatButton tooltip="Share" />
  <BFloatButton tooltip="Edit" />
  <BFloatButton tooltip="Delete" type="primary" />
</BFloatButtonGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton, BFloatButtonGroup },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="position:relative; height:300px; width:200px; display:flex; align-items:flex-end; justify-content:flex-end;">
        <BFloatButtonGroup
          v-model:open="open"
          trigger="click"
          placement="top"
          style="position:absolute; bottom:1.5rem; right:1.5rem;"
        >
          <BFloatButton tooltip="Share" />
          <BFloatButton tooltip="Edit" />
          <BFloatButton tooltip="Delete" type="primary" />
        </BFloatButtonGroup>
      </div>
      <p style="font-size:0.875rem; color:#767676;">Group is {{ open ? 'open' : 'closed' }}</p>
    `,
  }),
};

/**
 * `BFloatButtonGroup` supports four placements — `top`, `bottom`, `left`,
 * `right` — controlling the direction children expand from the trigger.
 */
export const GroupPlacements: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButtonGroup trigger="click" placement="top">…</BFloatButtonGroup>
<BFloatButtonGroup trigger="click" placement="bottom">…</BFloatButtonGroup>
<BFloatButtonGroup trigger="click" placement="left">…</BFloatButtonGroup>
<BFloatButtonGroup trigger="click" placement="right">…</BFloatButtonGroup>
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton, BFloatButtonGroup },
    // Each cell wraps the group in a fixed-size spacer that pre-allocates room
    // for the fully-expanded state, anchoring the trigger at the edge opposite
    // the expansion direction. This keeps the Storybook card stable when users
    // toggle the group open/closed.
    template: `
      <div style="display:flex; gap:3rem; flex-wrap:wrap; padding:3rem; align-items:flex-start;">
        <div style="text-align:center;">
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem;">top</p>
          <div style="min-width:2.75rem; min-height:12rem; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;">
            <BFloatButtonGroup trigger="click" placement="top" style="display:inline-flex;">
              <BFloatButton tooltip="A" />
              <BFloatButton tooltip="B" />
            </BFloatButtonGroup>
          </div>
        </div>
        <div style="text-align:center;">
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem;">bottom</p>
          <div style="min-width:2.75rem; min-height:12rem; display:flex; flex-direction:column; align-items:center; justify-content:flex-start;">
            <BFloatButtonGroup trigger="click" placement="bottom" style="display:inline-flex;">
              <BFloatButton tooltip="A" />
              <BFloatButton tooltip="B" />
            </BFloatButtonGroup>
          </div>
        </div>
        <div style="text-align:center;">
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem;">left</p>
          <div style="min-width:12rem; min-height:2.75rem; display:flex; flex-direction:row; align-items:center; justify-content:flex-end;">
            <BFloatButtonGroup trigger="click" placement="left" style="display:inline-flex;">
              <BFloatButton tooltip="A" />
              <BFloatButton tooltip="B" />
            </BFloatButtonGroup>
          </div>
        </div>
        <div style="text-align:center;">
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem;">right</p>
          <div style="min-width:12rem; min-height:2.75rem; display:flex; flex-direction:row; align-items:center; justify-content:flex-start;">
            <BFloatButtonGroup trigger="click" placement="right" style="display:inline-flex;">
              <BFloatButton tooltip="A" />
              <BFloatButton tooltip="B" />
            </BFloatButtonGroup>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * `BFloatButtonBackTop` listens to the scroll position of its `target` and
 * appears once the user scrolls past `visibilityHeight`. Clicking it scrolls
 * the target smoothly back to the top.
 */
export const BackTop: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BFloatButtonBackTop :target="() => containerRef" :visibilityHeight="100" />
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButtonBackTop },
    setup() {
      const containerRef = ref<HTMLElement | null>(null);
      return { containerRef };
    },
    template: `
      <div
        ref="containerRef"
        tabindex="0"
        style="height:300px; overflow-y:auto; border:1px dashed #ccc; border-radius:8px; padding:1rem; position:relative;"
      >
        <div style="height:1200px;">
          <p style="color:#767676; font-size:0.875rem;">Scroll down to reveal the back-to-top button.</p>
        </div>
        <BFloatButtonBackTop
          :target="() => containerRef"
          :visibilityHeight="100"
          style="position:absolute; bottom:1.5rem; right:1.5rem;"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BFloatButton renders a native `<button>` (or `<a>` when `href` is set), so
 * it is keyboard-reachable via Tab. Group triggers expose `aria-expanded` and
 * an `aria-label` that toggles between "Expand button group" and "Collapse
 * button group" as the group opens and closes.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies ARIA roles, labels, focus order, and the group trigger ' +
          '<code>aria-expanded</code> toggle on click.',
      },
    },
  },
  render: () => ({
    components: { BFloatButton, BFloatButtonGroup },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; padding:1rem;" data-testid="a11y-root">
        <BFloatButton tooltip="Scroll to top" aria-label="Scroll to top" data-testid="solo-btn" />
        <BFloatButtonGroup trigger="click" data-testid="group">
          <BFloatButton tooltip="Action 1" aria-label="Action 1" />
          <BFloatButton tooltip="Action 2" aria-label="Action 2" />
        </BFloatButtonGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Solo button accessible
    const soloBtn = canvas.getByRole('button', { name: /scroll to top/i });
    expect(soloBtn).toBeTruthy();

    // Group trigger button accessible
    const triggerBtn = canvas.getByRole('button', { name: /expand button group/i });
    expect(triggerBtn).toBeTruthy();
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'false');

    // Click trigger to expand
    await userEvent.click(triggerBtn);
    expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    // Trigger aria-label changes
    const collapseTrigger = canvas.getByRole('button', { name: /collapse button group/i });
    expect(collapseTrigger).toBeTruthy();

    // Close group
    await userEvent.click(collapseTrigger);
    expect(canvas.getByRole('button', { name: /expand button group/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override scoped CSS variables on the component root for custom theming.
 * This story demonstrates four overrides — `--b-float-button-bg`,
 * `--b-float-button-color`, `--b-float-button-bg-hover`,
 * `--b-float-button-size`, `--b-float-button-icon-size`,
 * and `--b-float-button-shadow`.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-float-button-bg</code>, <code>--b-float-button-color</code>, ' +
          '<code>--b-float-button-bg-hover</code>, <code>--b-float-button-size</code>, ' +
          '<code>--b-float-button-icon-size</code>, and <code>--b-float-button-shadow</code> ' +
          'on the component root to retheme an instance.',
      },
      source: {
        code: `
<BFloatButton
  tooltip="Custom background"
  style="
    --b-float-button-bg: oklch(75% 0.18 30);
    --b-float-button-color: #fff;
    --b-float-button-bg-hover: oklch(65% 0.18 30);
  "
/>

<BFloatButton
  tooltip="Larger button"
  style="
    --b-float-button-size: 56px;
    --b-float-button-icon-size: 1.75rem;
  "
/>

<BFloatButton
  type="primary"
  tooltip="Colored shadow"
  style="--b-float-button-shadow: 0 8px 24px 0 rgba(99, 102, 241, 0.5);"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BFloatButton },
    template: `
      <div style="display:flex; gap:2rem; align-items:center; padding:2rem; flex-wrap:wrap;">
        <div>
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem; text-align:center;">Default</p>
          <BFloatButton tooltip="Default theme" />
        </div>

        <div>
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem; text-align:center;">Custom bg</p>
          <BFloatButton
            tooltip="Custom background"
            style="--b-float-button-bg: oklch(75% 0.18 30); --b-float-button-color: #fff; --b-float-button-bg-hover: oklch(65% 0.18 30);"
          />
        </div>

        <div>
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem; text-align:center;">Large size</p>
          <BFloatButton
            tooltip="Larger button"
            style="--b-float-button-size: 56px; --b-float-button-icon-size: 1.75rem;"
          />
        </div>

        <div>
          <p style="font-size:0.75rem; color:#767676; margin-bottom:0.5rem; text-align:center;">Custom shadow</p>
          <BFloatButton
            tooltip="Colored shadow"
            type="primary"
            style="--b-float-button-shadow: 0 8px 24px 0 rgba(99, 102, 241, 0.5);"
          />
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
  // Note: AntD FloatButton primarily uses global tokens; we expose dedicated --b-float-button-* vars instead.
  // ── Local extras ──
  {
    token: '--b-float-button-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background color of the default float button.',
  },
  {
    token: '--b-float-button-bg-hover',
    defaultValue: 'oklch(96% 0.002 260)',
    description: 'Hover background color of the default float button.',
  },
  {
    token: '--b-float-button-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Icon/text color of the default float button.',
  },
  {
    token: '--b-float-button-primary-bg',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Background color of the primary float button.',
  },
  {
    token: '--b-float-button-primary-bg-hover',
    defaultValue: 'oklch(55% 0.22 259.815)',
    description: 'Hover background color of the primary float button.',
  },
  {
    token: '--b-float-button-primary-color',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Icon/text color of the primary float button.',
  },
  {
    token: '--b-float-button-size',
    defaultValue: '2.75rem',
    description: 'Size of the float button (AntD: controlHeightLG).',
  },
  {
    token: '--b-float-button-icon-size',
    defaultValue: '1rem',
    description: 'Size of the leading icon.',
  },
  {
    token: '--b-float-button-border-radius-circle',
    defaultValue: '50%',
    description: 'Corner radius for the circle shape.',
  },
  {
    token: '--b-float-button-border-radius-square',
    defaultValue: '0.5rem',
    description: 'Corner radius for the square shape.',
  },
  {
    token: '--b-float-button-shadow',
    defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)',
    description: 'Box shadow under the float button.',
  },
  {
    token: '--b-float-button-description-font-size',
    defaultValue: '0.75rem',
    description: 'Font size of the description label inside the button.',
  },
  {
    token: '--b-float-button-tooltip-bg',
    defaultValue: 'oklch(20% 0.005 260)',
    description: 'Background color of the tooltip.',
  },
  {
    token: '--b-float-button-tooltip-color',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Text color of the tooltip.',
  },
  {
    token: '--b-float-button-badge-bg',
    defaultValue: 'oklch(60% 0.22 25)',
    description: 'Background color of the corner badge.',
  },
  {
    token: '--b-float-button-badge-color',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Text color of the corner badge.',
  },
  {
    token: '--b-float-button-badge-font-size',
    defaultValue: '0.75rem',
    description: 'Font size of the corner badge.',
  },
  {
    token: '--b-float-button-inset-block-end',
    defaultValue: '3rem',
    description: 'Distance from the bottom of the viewport.',
  },
  {
    token: '--b-float-button-inset-inline-end',
    defaultValue: '1.5rem',
    description: 'Distance from the right of the viewport.',
  },
  {
    token: '--b-float-button-z-index',
    defaultValue: '1000',
    description: 'z-index of the float button (AntD: zIndexPopupBase).',
  },
  {
    token: '--b-float-button-transition-duration',
    defaultValue: '200ms',
    description: 'Hover/press animation duration.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-float-button-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BFloatButton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BFloatButton - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-float-button</code>. Override inline or via a CSS class.
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
          Four tokens overridden inline (primary bg, primary hover bg, size, border-radius-square).
        </p>
        <div style="position:relative; min-height:140px;">
          <BFloatButton
            type="primary"
            shape="square"
            tooltip="Themed"
            description="GO"
            style="
              --b-float-button-primary-bg: oklch(50% 0.18 290);
              --b-float-button-primary-bg-hover: oklch(45% 0.2 290);
              --b-float-button-size: 3rem;
              --b-float-button-border-radius-square: 1rem;
              position: static;
            "
          />
        </div>
      </div>
    `,
  }),
};
