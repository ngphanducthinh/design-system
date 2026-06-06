import { BButton, BPopconfirm } from '@/components';
import { BPopconfirmPlacement, BPopconfirmTrigger } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref, toRef, watch } from 'vue';

/**
 * BPopconfirm — inline confirmation popover anchored to a trigger element.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Popconfirm',
  component: BPopconfirm,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The confirmation question or text.',
      table: { category: 'Props' },
    },
    description: {
      control: 'text',
      description: 'Additional description below the title.',
      table: { category: 'Props' },
    },
    okText: {
      control: 'text',
      description: 'Text of the confirm button.',
      table: { category: 'Props', defaultValue: { summary: 'Yes' } },
    },
    cancelText: {
      control: 'text',
      description: 'Text of the cancel button.',
      table: { category: 'Props', defaultValue: { summary: 'No' } },
    },
    okType: {
      control: 'select',
      options: ['primary', 'default', 'dashed', 'text', 'link'],
      description: 'Variant of the confirm button.',
      table: { category: 'Props', defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the popconfirm — clicks pass through.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    showCancel: {
      control: 'boolean',
      description: 'Whether to show the cancel button.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    trigger: {
      control: 'select',
      options: Object.values(BPopconfirmTrigger),
      description: 'The event that opens the popconfirm.',
      table: { category: 'Props', defaultValue: { summary: BPopconfirmTrigger.Click } },
    },
    placement: {
      control: 'select',
      options: Object.values(BPopconfirmPlacement),
      description: 'Placement relative to the trigger.',
      table: { category: 'Props', defaultValue: { summary: BPopconfirmPlacement.TopCenter } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to render the directional arrow.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    mouseEnterDelay: {
      control: 'number',
      description: 'Delay (ms) before showing on mouseenter (hover trigger).',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    mouseLeaveDelay: {
      control: 'number',
      description: 'Delay (ms) before hiding on mouseleave (hover trigger).',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    destroyTooltipOnHide: {
      control: 'boolean',
      description: 'Destroy popconfirm DOM when hidden.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the popconfirm.',
      table: { category: 'Props', defaultValue: { summary: '1060' } },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled visibility — bind with v-model.',
      table: { category: 'Two-Way Binding Props' },
    },
    default: { description: 'Trigger element the popconfirm is anchored to.', table: { category: 'Slots' } },
    onConfirm: { description: 'Fires when the confirm button is clicked.', table: { category: 'Events' } },
    onCancel: { description: 'Fires when the cancel button is clicked.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPopconfirm</code> component displays a confirmation popup before executing an action.<br><br>' +
          'It uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning for overlay management.<br>' +
          'Supports 12 placements, three trigger modes, customizable buttons, focus trapping, and full accessibility.',
      },
    },
  },
} satisfies Meta<typeof BPopconfirm>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — interactive playground for all props. */
export const Default: Story = {
  args: {
    title: 'Are you sure you want to delete this?',
    description: 'This action cannot be undone.',
    okText: 'Yes',
    cancelText: 'No',
    okType: 'primary' as const,
    trigger: 'click' as const,
    placement: 'top-center' as const,
    arrow: true,
    disabled: false,
    showCancel: true,
    destroyTooltipOnHide: false,
    zIndex: 1060,
  },
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BPopconfirm title="Are you sure?" description="This cannot be undone." @confirm="onConfirm">
  <BButton>Delete</BButton>
</BPopconfirm>
        `,
      },
    },
  },
  render: (args: any) => ({
    components: { BButton, BPopconfirm },
    setup() {
      const open = ref(args.modelValue ?? undefined);
      const argsRef = toRef(() => args.modelValue);
      watch(argsRef, (v) => {
        open.value = v;
      });
      return { args, open };
    },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopconfirm v-bind="args" v-model="open">
          <BButton>Delete</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
};

/** Optional description below the title. */
export const WithDescription: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BPopconfirm title="Delete this file?" description="This action cannot be undone."><BButton>Delete</BButton></BPopconfirm>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopconfirm title="Delete this file?" description="This action cannot be undone. The file will be permanently removed.">
          <BButton>Delete File</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
};

/** Customize button text via `okText` / `cancelText`, or hide the cancel button entirely. */
export const CustomButtonText: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BPopconfirm title="Discard changes?" ok-text="Discard" cancel-text="Keep Editing"><BButton>Close Editor</BButton></BPopconfirm>
<BPopconfirm title="Submit form?"     ok-text="Submit"  :show-cancel="false"><BButton>Quick Submit</BButton></BPopconfirm>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopconfirm title="Discard changes?" ok-text="Discard" cancel-text="Keep Editing">
          <BButton>Close Editor</BButton>
        </BPopconfirm>
        <BPopconfirm title="Submit form?" ok-text="Submit" :show-cancel="false">
          <BButton>Quick Submit</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
};

/** Confirm-button variant via `okType`. */
export const ButtonVariants: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BPopconfirm title="Delete?" ok-type="primary"><BButton>Primary</BButton></BPopconfirm>
<BPopconfirm title="Delete?" ok-type="default"><BButton>Default</BButton></BPopconfirm>
<BPopconfirm title="Delete?" ok-type="dashed"><BButton>Dashed</BButton></BPopconfirm>
<BPopconfirm title="Delete?" ok-type="text"><BButton>Text</BButton></BPopconfirm>
<BPopconfirm title="Delete?" ok-type="link"><BButton>Link</BButton></BPopconfirm>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
        <BPopconfirm title="Delete?" ok-type="primary"><BButton>Primary</BButton></BPopconfirm>
        <BPopconfirm title="Delete?" ok-type="default"><BButton>Default</BButton></BPopconfirm>
        <BPopconfirm title="Delete?" ok-type="dashed"><BButton>Dashed</BButton></BPopconfirm>
        <BPopconfirm title="Delete?" ok-type="text"><BButton>Text</BButton></BPopconfirm>
        <BPopconfirm title="Delete?" ok-type="link"><BButton>Link</BButton></BPopconfirm>
      </div>
    `,
  }),
};

/** All 12 placements relative to the trigger. */
export const AllPlacements: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BPopconfirm title="Confirm?" placement="top-center"><BButton>TC</BButton></BPopconfirm>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 8rem 4rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; justify-items: center;">
        <BPopconfirm title="Top Left?" placement="top-left"><BButton>Top Left</BButton></BPopconfirm>
        <BPopconfirm title="Top Center?" placement="top-center"><BButton>Top Center</BButton></BPopconfirm>
        <BPopconfirm title="Top Right?" placement="top-right"><BButton>Top Right</BButton></BPopconfirm>
        <div></div>

        <BPopconfirm title="Left Top?" placement="left-top"><BButton>Left Top</BButton></BPopconfirm>
        <div></div>
        <div></div>
        <BPopconfirm title="Right Top?" placement="right-top"><BButton>Right Top</BButton></BPopconfirm>

        <BPopconfirm title="Left Center?" placement="left-center"><BButton>Left Center</BButton></BPopconfirm>
        <div></div>
        <div></div>
        <BPopconfirm title="Right Center?" placement="right-center"><BButton>Right Center</BButton></BPopconfirm>

        <BPopconfirm title="Left Bottom?" placement="left-bottom"><BButton>Left Bottom</BButton></BPopconfirm>
        <div></div>
        <div></div>
        <BPopconfirm title="Right Bottom?" placement="right-bottom"><BButton>Right Bottom</BButton></BPopconfirm>

        <div></div>
        <BPopconfirm title="Bottom Left?" placement="bottom-left"><BButton>Bottom Left</BButton></BPopconfirm>
        <BPopconfirm title="Bottom Center?" placement="bottom-center"><BButton>Bottom Center</BButton></BPopconfirm>
        <BPopconfirm title="Bottom Right?" placement="bottom-right"><BButton>Bottom Right</BButton></BPopconfirm>
      </div>
    `,
  }),
};

/** Disabled — clicks pass through to the trigger; no popconfirm appears. */
export const Disabled: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BPopconfirm title="Delete?" :disabled="true"><BButton>Disabled</BButton></BPopconfirm>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopconfirm title="Delete?" :disabled="true">
          <BButton>Disabled Popconfirm</BButton>
        </BPopconfirm>
        <BPopconfirm title="Delete?" :disabled="false">
          <BButton>Enabled Popconfirm</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Confirm/cancel flow wired to handlers — typical usage in a list-row delete action. */
export const ConfirmFlow: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BPopconfirm title="Delete row?" @confirm="onConfirm" @cancel="onCancel">
  <BButton color="failure" prepend-icon="trash">Delete</BButton>
</BPopconfirm>
<span>{{ status }}</span>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    setup() {
      const status = ref('idle');
      function onConfirm() {
        status.value = 'confirmed';
      }
      function onCancel() {
        status.value = 'cancelled';
      }
      return { status, onConfirm, onCancel };
    },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; align-items: center;">
        <BPopconfirm title="Delete row?" @confirm="onConfirm" @cancel="onCancel">
          <BButton data-testid="confirm-trigger" color="failure">Delete</BButton>
        </BPopconfirm>
        <span data-testid="status">Status: {{ status }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('confirm-trigger');

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content[role="dialog"]')).toBeTruthy();
    });

    // Click confirm (Yes button — the second action button)
    const buttons = document.querySelectorAll('.b-popconfirm__btn');
    await userEvent.click(buttons[1]);

    await waitFor(() => {
      expect(canvas.getByTestId('status').textContent).toContain('confirmed');
    });
  },
};

/** Externally controlled visibility via v-model. */
export const Controlled: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BButton @click="open = !open">{{ open ? 'Hide' : 'Show' }}</BButton>
<BPopconfirm v-model="open" title="Controlled popconfirm?"><span>Target</span></BPopconfirm>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; align-items: center;">
        <BButton @click="open = !open" data-testid="external-toggle">
          {{ open ? 'Hide' : 'Show' }} Popconfirm
        </BButton>
        <BPopconfirm v-model="open" title="Controlled popconfirm?">
          <span style="padding: 0.5rem; border: 1px dashed #ccc; border-radius: 0.25rem;">Target</span>
        </BPopconfirm>
        <span>Open: {{ open }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const externalToggle = canvas.getByTestId('external-toggle');

    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content[role="dialog"]')).toBeTruthy();
    });

    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content:popover-open')).toBeNull();
    });
  },
};

/** Long content wraps within `--b-popconfirm-max-width`. */
export const LongContent: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BPopconfirm title="Long question…" description="Long description…"><BButton>Open</BButton></BPopconfirm>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopconfirm
          title="Are you sure you want to permanently delete all selected items from the database including all associated metadata and references?"
          description="This is an extremely long description that is meant to test how the popconfirm handles overflow and wrapping of text content. It should wrap properly within the max-width constraint."
        >
          <BButton>Long Content</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Popconfirm uses `role="dialog"` with `aria-labelledby` → title and `aria-describedby` → description.
 * Focus is trapped within the action buttons. Icon and arrow are `aria-hidden="true"`.
 * Escape closes the popconfirm and returns focus to the trigger.
 */
export const Accessibility: Story = {
  parameters: {
    a11y: {
      test: 'error',
      context: { include: ['.b-popconfirm__toggle', '.b-popconfirm__content'] },
    },
    docs: {
      description: {
        story:
          'The popconfirm uses <code>role="dialog"</code> with <code>aria-labelledby</code> → title and <code>aria-describedby</code> → description. Focus is trapped, Escape dismisses and returns focus.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopconfirm
          title="Delete this item?"
          description="This action is irreversible."
          data-testid="a11y-popconfirm"
        >
          <BButton data-testid="a11y-trigger">Delete</BButton>
        </BPopconfirm>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('a11y-trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      const dialog = document.querySelector('.b-popconfirm__content[role="dialog"]');
      expect(dialog).toBeTruthy();
    });

    const dialogEl = document.querySelector('.b-popconfirm__content[role="dialog"]')!;

    expect(dialogEl.getAttribute('role')).toBe('dialog');
    expect(dialogEl.getAttribute('aria-modal')).toBe('false');

    const labelledBy = dialogEl.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl!.textContent).toBe('Delete this item?');

    const describedBy = dialogEl.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl!.textContent).toBe('This action is irreversible.');

    const icon = dialogEl.querySelector('.b-popconfirm__icon');
    expect(icon!.getAttribute('aria-hidden')).toBe('true');

    const arrow = dialogEl.querySelector('.b-popconfirm__arrow');
    if (arrow) {
      expect(arrow.getAttribute('aria-hidden')).toBe('true');
    }

    const buttons = dialogEl.querySelectorAll('.b-popconfirm__btn');
    expect(buttons.length).toBe(2);

    // Cancel via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content:popover-open')).toBeNull();
    });

    // Re-open for axe-core scan
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content[role="dialog"]')).toBeTruthy();
    });

    // Cancel-button click closes too
    const buttons2 = document.querySelectorAll('.b-popconfirm__btn');
    await userEvent.click(buttons2[0]);
    await waitFor(() => {
      expect(document.querySelector('.b-popconfirm__content:popover-open')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-popconfirm-bg`, `--b-popconfirm-color`, `--b-popconfirm-border-radius`,
 * `--b-popconfirm-icon-color`, and `--b-popconfirm-btn-primary-bg` to retheme.
 */
export const Theming: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Override <code>--b-popconfirm-bg</code>, <code>--b-popconfirm-color</code>, <code>--b-popconfirm-border-radius</code>, <code>--b-popconfirm-icon-color</code>, and <code>--b-popconfirm-btn-primary-bg</code> on a wrapper to retheme.',
      },
      source: {
        code: `
<div style="
  --b-popconfirm-bg: #1a1a2e;
  --b-popconfirm-color: #eaeaea;
  --b-popconfirm-arrow-color: #1a1a2e;
  --b-popconfirm-border-radius: 1rem;
  --b-popconfirm-btn-primary-bg: #e74c3c;
  --b-popconfirm-icon-color: #faad14;
">
  <BPopconfirm title="Custom theme. Delete?"><BButton>Custom</BButton></BPopconfirm>
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopconfirm },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopconfirm title="Default theme. Delete?">
          <BButton>Default</BButton>
        </BPopconfirm>
        <div style="--b-popconfirm-bg: #1a1a2e; --b-popconfirm-color: #eaeaea; --b-popconfirm-arrow-color: #1a1a2e; --b-popconfirm-border-radius: 1rem; --b-popconfirm-btn-primary-bg: #e74c3c; --b-popconfirm-icon-color: #faad14;">
          <BPopconfirm title="Custom theme. Delete?">
            <BButton>Custom</BButton>
          </BPopconfirm>
        </div>
        <div style="--b-popconfirm-border-radius: 999px; --b-popconfirm-padding-x: 1.25rem; --b-popconfirm-btn-border-radius: 999px;">
          <BPopconfirm title="Rounded. Delete?">
            <BButton>Pill</BButton>
          </BPopconfirm>
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
  { token: '--b-popconfirm-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the container.' },
  { token: '--b-popconfirm-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Primary text/title color.' },
  { token: '--b-popconfirm-description-color', defaultValue: 'oklch(20% 0.005 260 / 65%)', description: 'Description text color.' },
  { token: '--b-popconfirm-icon-color', defaultValue: 'oklch(75% 0.18 80)', description: 'Color of the leading warning icon.' },
  { token: '--b-popconfirm-arrow-color', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the arrow (matches popup bg).' },
  { token: '--b-popconfirm-arrow-size', defaultValue: '0.5rem', description: 'Size of the directional arrow.' },
  { token: '--b-popconfirm-shadow', defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)', description: 'Box shadow.' },
  { token: '--b-popconfirm-border-radius', defaultValue: '0.5rem', description: 'Corner radius of the popup container.' },
  { token: '--b-popconfirm-padding-x', defaultValue: '1rem', description: 'Horizontal padding of the popup.' },
  { token: '--b-popconfirm-padding-y', defaultValue: '0.75rem', description: 'Vertical padding of the popup.' },
  { token: '--b-popconfirm-gap', defaultValue: '0.5rem', description: 'Gap between icon, content, and buttons.' },
  { token: '--b-popconfirm-font-size', defaultValue: '0.875rem', description: 'Base font size inside the popup.' },
  { token: '--b-popconfirm-line-height', defaultValue: '1.5', description: 'Line height of popup text.' },
  { token: '--b-popconfirm-title-font-weight', defaultValue: '600', description: 'Font weight of the title.' },
  { token: '--b-popconfirm-max-width', defaultValue: '20rem', description: 'Maximum width of the popup.' },
  { token: '--b-popconfirm-btn-font-size', defaultValue: '0.75rem', description: 'Font size of the action buttons.' },
  { token: '--b-popconfirm-btn-padding-x', defaultValue: '0.5rem', description: 'Horizontal padding of action buttons.' },
  { token: '--b-popconfirm-btn-padding-y', defaultValue: '0.25rem', description: 'Vertical padding of action buttons.' },
  { token: '--b-popconfirm-btn-border-radius', defaultValue: '0.375rem', description: 'Corner radius of action buttons.' },
  { token: '--b-popconfirm-btn-default-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background of the cancel button.' },
  { token: '--b-popconfirm-btn-default-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Text color of the cancel button.' },
  { token: '--b-popconfirm-btn-default-border', defaultValue: 'oklch(85% 0.005 260)', description: 'Border color of the cancel button.' },
  { token: '--b-popconfirm-btn-primary-bg', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Background of the primary (confirm) button.' },
  { token: '--b-popconfirm-btn-primary-color', defaultValue: 'oklch(100% 0 0)', description: 'Text color of the primary (confirm) button.' },
  { token: '--b-popconfirm-transition-duration', defaultValue: '200ms', description: 'Open/close animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BPopconfirm</code>. Override on the trigger element or any ancestor.',
      },
    },
  },
  render: () => ({
    components: { BPopconfirm, BButton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BPopconfirm — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-popconfirm</code>. Override inline on the trigger element or via a CSS class.
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
