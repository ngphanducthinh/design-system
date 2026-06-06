import { BButton, BPopover } from '@/components';
import { BPopoverPlacement, BPopoverTrigger } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref, toRef, watch } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Popover',
  component: BPopover,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title shown at the top of the popover.',
      table: { category: 'Props' },
    },
    content: {
      control: 'text',
      description: 'The main content of the popover.',
      table: { category: 'Props' },
    },
    trigger: {
      control: 'select',
      options: Object.values(BPopoverTrigger),
      description: 'The event that triggers the popover.',
      table: { category: 'Props', defaultValue: { summary: BPopoverTrigger.Hover } },
    },
    placement: {
      control: 'select',
      options: Object.values(BPopoverPlacement),
      description: 'Placement of the popover relative to the target.',
      table: { category: 'Props', defaultValue: { summary: BPopoverPlacement.TopCenter } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether the popover has an arrow.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    mouseEnterDelay: {
      control: 'number',
      description: 'Delay in ms before showing on mouseenter.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    mouseLeaveDelay: {
      control: 'number',
      description: 'Delay in ms before hiding on mouseleave.',
      table: { category: 'Props', defaultValue: { summary: '100' } },
    },
    destroyTooltipOnHide: {
      control: 'boolean',
      description: 'Destroy popover DOM when hidden.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    fresh: {
      control: 'boolean',
      description: 'Force re-render when popover is shown.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the popover.',
      table: { category: 'Props', defaultValue: { summary: '1030' } },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled visibility (bind with v-model).',
      table: { category: 'Two-Way Binding Props' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BPopover</code> component displays rich content in a floating card triggered by user interaction.<br><br>' +
          'It uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning for overlay management.<br>' +
          'Supports 12 placements, three trigger modes (hover, click, focus), optional title, and full accessibility.',
      },
    },
  },
} satisfies Meta<typeof BPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
//   TESTING TYPE 1: COMPONENT TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
export const Playground: Story = {
  args: {
    title: 'Popover Title',
    content: 'This is the popover content area. You can place any information here.',
    trigger: 'hover' as const,
    placement: 'top-center' as const,
    arrow: true,
    destroyTooltipOnHide: false,
    fresh: false,
    zIndex: 1030,
  },
  render: (args: any) => ({
    components: { BButton, BPopover },
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
        <BPopover v-bind="args" v-model="open">
          <BButton>Hover me</BButton>
        </BPopover>
      </div>
    `,
  }),
  parameters: { a11y: { test: 'off' } },
};

// ─────────────────────────────────────────────
// 2. Basic – title and content
// ─────────────────────────────────────────────
export const BasicPopover: Story = {
  name: 'Basic Popover',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopover title="Title" content="Content of the popover.">
          <BButton>With Title</BButton>
        </BPopover>
        <BPopover content="Popover without a title.">
          <BButton>No Title</BButton>
        </BPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    // Hover first button
    await userEvent.hover(buttons[0]);
    await waitFor(() => {
      const popover = document.querySelector('.b-popover__content');
      expect(popover).toBeTruthy();
      expect(document.querySelector('.b-popover__title')?.textContent).toBe('Title');
      expect(document.querySelector('.b-popover__body')?.textContent).toBe(
        'Content of the popover.',
      );
    });
    await userEvent.unhover(buttons[0]);
  },
};

// ─────────────────────────────────────────────
// 3. Trigger modes
// ─────────────────────────────────────────────
export const TriggerModes: Story = {
  name: 'Trigger Modes',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopover title="Hover" content="Triggered on hover." trigger="hover">
          <BButton>Hover</BButton>
        </BPopover>
        <BPopover title="Click" content="Triggered on click." trigger="click">
          <BButton>Click</BButton>
        </BPopover>
        <BPopover title="Focus" content="Triggered on focus." trigger="focus">
          <BButton>Focus</BButton>
        </BPopover>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. All placements
// ─────────────────────────────────────────────
export const AllPlacements: Story = {
  name: 'All Placements',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BPopover title="Popover" content="Content" placement="top-left"><BButton>TL</BButton></BPopover>
<BPopover title="Popover" content="Content" placement="top-center"><BButton>TC</BButton></BPopover>
<!-- … 12 placements total -->
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 8rem 4rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; justify-items: center;">
        <BPopover title="Top Left" content="Content" placement="top-left"><BButton>Top Left</BButton></BPopover>
        <BPopover title="Top Center" content="Content" placement="top-center"><BButton>Top Center</BButton></BPopover>
        <BPopover title="Top Right" content="Content" placement="top-right"><BButton>Top Right</BButton></BPopover>
        <div></div>

        <BPopover title="Left Top" content="Content" placement="left-top"><BButton>Left Top</BButton></BPopover>
        <div></div>
        <div></div>
        <BPopover title="Right Top" content="Content" placement="right-top"><BButton>Right Top</BButton></BPopover>

        <BPopover title="Left Center" content="Content" placement="left-center"><BButton>Left Center</BButton></BPopover>
        <div></div>
        <div></div>
        <BPopover title="Right Center" content="Content" placement="right-center"><BButton>Right Center</BButton></BPopover>

        <BPopover title="Left Bottom" content="Content" placement="left-bottom"><BButton>Left Bottom</BButton></BPopover>
        <div></div>
        <div></div>
        <BPopover title="Right Bottom" content="Content" placement="right-bottom"><BButton>Right Bottom</BButton></BPopover>

        <div></div>
        <BPopover title="Bottom Left" content="Content" placement="bottom-left"><BButton>Bottom Left</BButton></BPopover>
        <BPopover title="Bottom Center" content="Content" placement="bottom-center"><BButton>Bottom Center</BButton></BPopover>
        <BPopover title="Bottom Right" content="Content" placement="bottom-right"><BButton>Bottom Right</BButton></BPopover>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Rich content via slots
// ─────────────────────────────────────────────
export const RichContent: Story = {
  name: 'Rich Content (slots)',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopover trigger="click">
          <template #title>
            <span style="color: oklch(55% 0.2 260);">Custom Title</span>
          </template>
          <template #content>
            <div>
              <p style="margin: 0 0 0.5rem;">Rich HTML content with links and formatting.</p>
              <a href="#" style="color: oklch(55% 0.2 260);">Learn more</a>
            </div>
          </template>
          <BButton>Rich Content</BButton>
        </BPopover>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 2: ACCESSIBILITY TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 6. Accessibility story
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-popover__toggle', '.b-popover__content'] },
    },
    docs: {
      description: {
        story:
          'The popover uses `role="tooltip"` with `aria-labelledby` pointing to the title. ' +
          'The arrow is `aria-hidden="true"`. ' +
          'Escape key dismisses the popover and returns focus. ' +
          'Focus trapping is active when the popover contains focusable elements.\n\n' +
          '**Testing:** axe-core runs after the play function. Manual ARIA assertions provide defense-in-depth.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopover
          title="Accessible Popover"
          content="This popover demonstrates proper accessibility."
          trigger="click"
          data-testid="a11y-popover"
        >
          <BButton data-testid="a11y-trigger">Show Popover</BButton>
        </BPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open popover via click
    const trigger = canvas.getByTestId('a11y-trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      const tooltip = document.querySelector('.b-popover__content[role="tooltip"]');
      expect(tooltip).toBeTruthy();
    });

    const tooltipEl = document.querySelector('.b-popover__content[role="tooltip"]')!;

    // role="tooltip"
    expect(tooltipEl.getAttribute('role')).toBe('tooltip');

    // aria-labelledby points to title
    const labelledBy = tooltipEl.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toBeTruthy();
    expect(titleEl!.textContent).toBe('Accessible Popover');

    // Arrow is aria-hidden
    const arrow = tooltipEl.querySelector('.b-popover__arrow');
    if (arrow) {
      expect(arrow.getAttribute('aria-hidden')).toBe('true');
    }

    // tabindex="-1" for focus management
    expect(tooltipEl.getAttribute('tabindex')).toBe('-1');

    // Keyboard: Escape closes
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content:popover-open')).toBeNull();
    });

    // Re-open for axe-core scan
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content[role="tooltip"]')).toBeTruthy();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 3: INTERACTION TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 7. Interaction – click open/close
// ─────────────────────────────────────────────
export const InteractionClickFlow: Story = {
  name: 'Interaction – click open/close',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Opens popover via click, verifies content is visible, clicks again to close.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopover title="Click Popover" content="Visible content here." trigger="click">
          <BButton data-testid="click-trigger">Toggle Popover</BButton>
        </BPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('click-trigger');

    // Open
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content[role="tooltip"]')).toBeTruthy();
      expect(document.querySelector('.b-popover__title')?.textContent).toBe('Click Popover');
      expect(document.querySelector('.b-popover__body')?.textContent).toBe('Visible content here.');
    });

    // Close
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content:popover-open')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 8. Interaction – keyboard Escape
// ─────────────────────────────────────────────
export const InteractionKeyboardEscape: Story = {
  name: 'Interaction – keyboard Escape',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Opens popover via click, then presses Escape to close it.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopover title="Escape me" content="Press Escape to close." trigger="click">
          <BButton data-testid="esc-trigger">Open Popover</BButton>
        </BPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('esc-trigger');

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content[role="tooltip"]')).toBeTruthy();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content:popover-open')).toBeNull();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 4: THEMING (CSS var overrides)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 9. Theming (CSS vars)
// ─────────────────────────────────────────────
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Override `--b-popover-*` CSS custom properties to customize the popover appearance. ' +
          'All tokens are scoped to `.b-popover__content` and can be overridden per element.',
      },
      source: {
        code: `
<style>
.my-custom-popover {
  --b-popover-bg: #1a1a2e;
  --b-popover-color: #eaeaea;
  --b-popover-border-radius: 1rem;
  --b-popover-title-color: #faad14;
}
</style>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center;">
        <BPopover title="Default theme" content="Standard popover appearance.">
          <BButton>Default</BButton>
        </BPopover>
        <div style="--b-popover-bg: #1a1a2e; --b-popover-color: #eaeaea; --b-popover-arrow-color: #1a1a2e; --b-popover-border-radius: 1rem; --b-popover-title-color: #faad14; --b-popover-body-color: #ccc; --b-popover-title-border-bottom: 1px solid #333;">
          <BPopover title="Custom theme" content="Dark custom popover.">
            <BButton>Custom</BButton>
          </BPopover>
        </div>
        <div style="--b-popover-border-radius: 999px; --b-popover-padding-x: 1.5rem; --b-popover-padding-y: 1rem;">
          <BPopover content="A pill-shaped popover without a title.">
            <BButton>Pill</BButton>
          </BPopover>
        </div>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 5: EDGE CASE / REGRESSION
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 10. Edge case – controlled v-model
// ─────────────────────────────────────────────
export const EdgeCaseControlled: Story = {
  name: 'Edge case – controlled v-model',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Popover visibility is controlled externally via v-model.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; align-items: center;">
        <BButton @click="open = !open" data-testid="external-toggle">
          {{ open ? 'Hide' : 'Show' }} Popover
        </BButton>
        <BPopover v-model="open" title="Controlled" content="This popover is controlled externally." trigger="click">
          <span style="padding: 0.5rem; border: 1px dashed #ccc; border-radius: 0.25rem;">Target</span>
        </BPopover>
        <span>Open: {{ open }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const externalToggle = canvas.getByTestId('external-toggle');

    // Open via external button
    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content[role="tooltip"]')).toBeTruthy();
    });

    // Close via external button
    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(document.querySelector('.b-popover__content:popover-open')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 11. Edge case – long content
// ─────────────────────────────────────────────
export const EdgeCaseLongContent: Story = {
  name: 'Edge case – long content',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopover
          title="Very Long Title That Extends Beyond Normal Width to Test Wrapping Behavior"
          content="This is an extremely long content string meant to test how the popover handles overflow and wrapping of text content. It should wrap properly within the max-width constraint without breaking the layout or overflowing the container. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        >
          <BButton>Long Content</BButton>
        </BPopover>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 12. Snapshot – minimal
// ─────────────────────────────────────────────
export const SnapshotMinimal: Story = {
  name: 'Snapshot – minimal',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-popover__toggle', '.b-popover__content'] },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <BPopover title="Snapshot" content="Minimal snapshot popover." trigger="click">
          <BButton data-testid="open-snap">Open</BButton>
        </BPopover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap'));

    await waitFor(() => {
      const tooltip = document.querySelector('.b-popover__content');
      expect(tooltip).toBeTruthy();
      expect(tooltip!.querySelector('.b-popover__inner')).toBeTruthy();
      expect(tooltip!.querySelector('.b-popover__arrow')).toBeTruthy();
      expect(tooltip!.querySelector('.b-popover__title')).toBeTruthy();
      expect(tooltip!.querySelector('.b-popover__body')).toBeTruthy();
      expect(tooltip!.getAttribute('role')).toBe('tooltip');
    });
  },
};

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-popover-min-width',
    defaultValue: '177px',
    description: 'Minimum width of the popover (AntD: titleMinWidth).',
  },
  // ── Local extras ──
  {
    token: '--b-popover-bg',
    defaultValue: '#fff',
    description: 'Background of the popover panel.',
  },
  {
    token: '--b-popover-color',
    defaultValue: 'oklch(25% 0 0)',
    description: 'Default text color in the popover.',
  },
  {
    token: '--b-popover-arrow-color',
    defaultValue: '#fff',
    description: 'Background color of the arrow (matches the panel).',
  },
  {
    token: '--b-popover-arrow-size',
    defaultValue: '8px',
    description: 'Size (half-width) of the arrow.',
  },
  {
    token: '--b-popover-border-radius',
    defaultValue: '0.5rem',
    description: 'Corner radius of the popover.',
  },
  {
    token: '--b-popover-shadow',
    defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%), 0 3px 6px -4px oklch(0% 0 0 / 12%)',
    description: 'Box shadow of the popover.',
  },
  {
    token: '--b-popover-padding-x',
    defaultValue: '0.75rem',
    description: 'Horizontal padding inside the popover.',
  },
  {
    token: '--b-popover-padding-y',
    defaultValue: '0.75rem',
    description: 'Vertical padding inside the popover.',
  },
  {
    token: '--b-popover-gap',
    defaultValue: '8px',
    description: 'Distance between the popover and its trigger.',
  },
  {
    token: '--b-popover-max-width',
    defaultValue: '320px',
    description: 'Maximum width of the popover.',
  },
  {
    token: '--b-popover-font-size',
    defaultValue: '0.875rem',
    description: 'Font size of the popover body.',
  },
  {
    token: '--b-popover-line-height',
    defaultValue: '1.5',
    description: 'Line height of the popover body.',
  },
  {
    token: '--b-popover-body-color',
    defaultValue: 'oklch(35% 0 0)',
    description: 'Body text color.',
  },
  {
    token: '--b-popover-title-color',
    defaultValue: 'oklch(15% 0 0)',
    description: 'Title text color.',
  },
  {
    token: '--b-popover-title-font-size',
    defaultValue: '0.875rem',
    description: 'Title font size.',
  },
  {
    token: '--b-popover-title-font-weight',
    defaultValue: '600',
    description: 'Title font weight.',
  },
  {
    token: '--b-popover-title-margin-bottom',
    defaultValue: '0.5rem',
    description: 'Margin below the title.',
  },
  {
    token: '--b-popover-title-padding-bottom',
    defaultValue: '0.5rem',
    description: 'Padding below the title (above the divider).',
  },
  {
    token: '--b-popover-title-border-bottom',
    defaultValue: '1px solid oklch(90% 0 0)',
    description: 'Divider between the title and the body.',
  },
  {
    token: '--b-popover-transition-duration',
    defaultValue: '200ms',
    description: 'Open/close animation duration.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-popover-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BButton, BPopover },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BPopover - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-popover</code>. Override inline or via a CSS class.
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
          Four tokens overridden inline (background, body color, radius, shadow).
        </p>
        <BPopover
          title="Themed popover"
          content="Override --b-popover-* tokens to retheme."
          trigger="click"
          style="
            --b-popover-bg: oklch(95% 0.05 145);
            --b-popover-body-color: oklch(25% 0.1 145);
            --b-popover-arrow-color: oklch(95% 0.05 145);
            --b-popover-border-radius: 16px;
            --b-popover-shadow: 0 6px 24px oklch(42% 0.16 145 / 18%);
          "
        >
          <BButton>Click for themed popover</BButton>
        </BPopover>
      </div>
    `,
  }),
};
