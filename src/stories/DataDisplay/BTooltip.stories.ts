import { BButton, BTooltip } from '@/components';
import { BTooltipPlacement, BTooltipTrigger } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref, toRef, watch } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Data Display/Tooltip',
  component: BTooltip,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The text shown inside the tooltip.',
      table: { category: 'Props' },
    },
    trigger: {
      control: 'select',
      options: Object.values(BTooltipTrigger),
      description: 'The event that triggers the tooltip.',
      table: { category: 'Props', defaultValue: { summary: BTooltipTrigger.Hover } },
    },
    placement: {
      control: 'select',
      options: Object.values(BTooltipPlacement),
      description: 'Placement of the tooltip relative to the target.',
      table: { category: 'Props', defaultValue: { summary: BTooltipPlacement.TopCenter } },
    },
    arrow: {
      control: 'boolean',
      description: 'Whether the tooltip has an arrow.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    color: {
      control: 'color',
      description: 'Custom background color.',
      table: { category: 'Props' },
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
      description: 'Destroy tooltip DOM when hidden.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the tooltip.',
      table: { category: 'Props', defaultValue: { summary: '1070' } },
    },
    fresh: {
      control: 'boolean',
      description: 'Force re-render when tooltip is shown.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    autoAdjustOverflow: {
      control: 'boolean',
      description: 'Auto-adjust placement on viewport overflow.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
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
          'The <code>BTooltip</code> component displays informative text when users hover over, focus on, or click an element.<br><br>' +
          'It uses the native HTML <code>popover</code> attribute and CSS Anchor Positioning for overlay management.<br>' +
          'Supports 12 placements, three trigger modes, arrow display, custom colors, and full accessibility.',
      },
    },
  },
} satisfies Meta<typeof BTooltip>;

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
    title: 'Tooltip content',
    trigger: 'hover' as const,
    placement: 'top-center' as const,
    arrow: true,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    destroyTooltipOnHide: false,
    zIndex: 1070,
    fresh: false,
  },
  render: (args: any) => ({
    components: { BButton, BTooltip },
    setup() {
      const open = ref(args.modelValue ?? undefined);
      const argsRef = toRef(() => args.modelValue);
      watch(argsRef, (v) => {
        open.value = v;
      });
      return { args, open };
    },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip v-bind="args" v-model="open">
          <BButton>Hover me</BButton>
        </BTooltip>
      </div>
    `,
  }),
  parameters: { a11y: { test: 'off' } },
};

// ─────────────────────────────────────────────
// 2. All placements
// ─────────────────────────────────────────────
export const AllPlacements: Story = {
  name: 'All Placements',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BTooltip title="Top Left" placement="top-left"><BButton>TL</BButton></BTooltip>
<BTooltip title="Top Center" placement="top-center"><BButton>TC</BButton></BTooltip>
<!-- … 12 placements total -->
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 6rem 4rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; justify-items: center;">
        <BTooltip title="Top Left" placement="top-left" trigger="click"><BButton>Top Left</BButton></BTooltip>
        <BTooltip title="Top Center" placement="top-center" trigger="click"><BButton>Top Center</BButton></BTooltip>
        <BTooltip title="Top Right" placement="top-right" trigger="click"><BButton>Top Right</BButton></BTooltip>
        <div></div>

        <BTooltip title="Left Top" placement="left-top" trigger="click"><BButton>Left Top</BButton></BTooltip>
        <div></div>
        <div></div>
        <BTooltip title="Right Top" placement="right-top" trigger="click"><BButton>Right Top</BButton></BTooltip>

        <BTooltip title="Left Center" placement="left-center" trigger="click"><BButton>Left Center</BButton></BTooltip>
        <div></div>
        <div></div>
        <BTooltip title="Right Center" placement="right-center" trigger="click"><BButton>Right Center</BButton></BTooltip>

        <BTooltip title="Left Bottom" placement="left-bottom" trigger="click"><BButton>Left Bottom</BButton></BTooltip>
        <div></div>
        <div></div>
        <BTooltip title="Right Bottom" placement="right-bottom" trigger="click"><BButton>Right Bottom</BButton></BTooltip>

        <div></div>
        <BTooltip title="Bottom Left" placement="bottom-left" trigger="click"><BButton>Bottom Left</BButton></BTooltip>
        <BTooltip title="Bottom Center" placement="bottom-center" trigger="click"><BButton>Bottom Center</BButton></BTooltip>
        <BTooltip title="Bottom Right" placement="bottom-right" trigger="click"><BButton>Bottom Right</BButton></BTooltip>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Trigger variants
// ─────────────────────────────────────────────
export const TriggerVariants: Story = {
  name: 'Trigger Variants',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <BTooltip title="Hover tooltip" trigger="hover">
          <BButton>Hover</BButton>
        </BTooltip>
        <BTooltip title="Click tooltip" trigger="click">
          <BButton>Click</BButton>
        </BTooltip>
        <BTooltip title="Focus tooltip" trigger="focus">
          <BButton>Focus (Tab)</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Custom colors
// ─────────────────────────────────────────────
export const CustomColors: Story = {
  name: 'Custom Colors',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <BTooltip title="Pink tooltip" color="#eb2f96" trigger="click">
          <BButton>Pink</BButton>
        </BTooltip>
        <BTooltip title="Green tooltip" color="#52c41a" trigger="click">
          <BButton>Green</BButton>
        </BTooltip>
        <BTooltip title="Blue tooltip" color="#1677ff" trigger="click">
          <BButton>Blue</BButton>
        </BTooltip>
        <BTooltip title="Orange tooltip" color="#fa8c16" trigger="click">
          <BButton>Orange</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. No arrow
// ─────────────────────────────────────────────
export const NoArrow: Story = {
  name: 'No Arrow',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <BTooltip title="With arrow (default)" trigger="click">
          <BButton>With Arrow</BButton>
        </BTooltip>
        <BTooltip title="No arrow" :arrow="false" trigger="click">
          <BButton>No Arrow</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Title slot (rich content)
// ─────────────────────────────────────────────
export const TitleSlot: Story = {
  name: 'Title Slot (Rich Content)',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip trigger="click">
          <template #title>
            <div>
              <strong>Rich content</strong>
              <p style="margin: 0.25rem 0 0;">With <em>HTML</em> inside the tooltip slot.</p>
            </div>
          </template>
          <BButton>Rich Tooltip</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 2: ACCESSIBILITY TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 7. Accessibility story
// ─────────────────────────────────────────────
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-tooltip__toggle', '.b-tooltip__content'] },
    },
    docs: {
      description: {
        story:
          'The tooltip uses `role="tooltip"` with a unique `id`. ' +
          'The trigger uses `aria-describedby` linking to the tooltip when open. ' +
          'The arrow is `aria-hidden="true"`. ' +
          'Escape key dismisses the tooltip.\n\n' +
          '**Testing:** axe-core runs after the play function. Manual ARIA assertions provide defense-in-depth.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip title="Accessible tooltip" trigger="click" data-testid="a11y-tooltip">
          <BButton data-testid="a11y-trigger">Show Tooltip</BButton>
        </BTooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open tooltip via click
    const trigger = canvas.getByTestId('a11y-trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      const tooltip = document.querySelector('.b-tooltip__content[role="tooltip"]');
      expect(tooltip).toBeTruthy();
    });

    const tooltipEl = document.querySelector('.b-tooltip__content[role="tooltip"]')!;

    // role="tooltip"
    expect(tooltipEl.getAttribute('role')).toBe('tooltip');

    // Has an id
    const tooltipId = tooltipEl.getAttribute('id');
    expect(tooltipId).toBeTruthy();

    // Toggle has aria-describedby pointing to tooltip
    const toggle = canvasElement.querySelector('.b-tooltip__toggle');
    expect(toggle).toBeTruthy();
    expect(toggle!.getAttribute('aria-describedby')).toBe(tooltipId);

    // Arrow is aria-hidden
    const arrow = tooltipEl.querySelector('.b-tooltip__arrow');
    if (arrow) {
      expect(arrow.getAttribute('aria-hidden')).toBe('true');
    }

    // Keyboard: Escape closes
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const toggle2 = canvasElement.querySelector('.b-tooltip__toggle');
      expect(toggle2!.getAttribute('aria-describedby')).toBeNull();
    });

    // Re-open for axe-core scan
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-tooltip__content[role="tooltip"]')).toBeTruthy();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 3: INTERACTION TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 8. Interaction – click open/close
// ─────────────────────────────────────────────
export const InteractionClickOpenClose: Story = {
  name: 'Interaction – click open/close',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Clicks the trigger to open, verifies tooltip visibility, clicks again to close.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip title="Click me" trigger="click">
          <BButton data-testid="click-trigger">Click Trigger</BButton>
        </BTooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('click-trigger');
    const toggle = canvasElement.querySelector('.b-tooltip__toggle')!;

    // Open
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeTruthy();
    });

    // Close by clicking again
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 9. Interaction – keyboard Escape
// ─────────────────────────────────────────────
export const InteractionKeyboardEscape: Story = {
  name: 'Interaction – keyboard Escape',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Opens the tooltip via click, then presses Escape to close it.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip title="Press Escape" trigger="click">
          <BButton data-testid="esc-trigger">Open Tooltip</BButton>
        </BTooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('esc-trigger');
    const toggle = canvasElement.querySelector('.b-tooltip__toggle')!;

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeTruthy();
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 10. Interaction – focus trigger
// ─────────────────────────────────────────────
export const InteractionFocusTrigger: Story = {
  name: 'Interaction – focus trigger',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Tabs into the trigger element to show tooltip, tabs out to hide.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <BButton data-testid="before-btn">Before</BButton>
        <BTooltip title="Focus tooltip" trigger="focus">
          <BButton data-testid="focus-trigger">Focus me</BButton>
        </BTooltip>
        <BButton data-testid="after-btn">After</BButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvasElement.querySelector('.b-tooltip__toggle')!;

    // Focus the "Before" button first
    canvas.getByTestId('before-btn').focus();

    // Tab to the tooltip trigger
    await userEvent.tab();
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeTruthy();
    });

    // Tab away - tooltip should hide
    await userEvent.tab();
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeNull();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 4: THEMING (CSS var overrides)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 11. Theming (CSS vars)
// ─────────────────────────────────────────────
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Override `--b-tooltip-*` CSS custom properties to customize the tooltip appearance. ' +
          'All tokens are defined on `:root` and can be scoped per element.',
      },
      source: {
        code: `
<style>
.my-custom-tooltip {
  --b-tooltip-bg: #1a1a2e;
  --b-tooltip-color: #eaeaea;
  --b-tooltip-border-radius: 1rem;
  --b-tooltip-padding-x: 1rem;
  --b-tooltip-padding-y: 0.75rem;
  --b-tooltip-arrow-color: #1a1a2e;
}
</style>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <BTooltip title="Default theme" trigger="click">
          <BButton>Default</BButton>
        </BTooltip>
        <BTooltip
          title="Custom theme"
          trigger="click"
          tooltip-class="my-custom-tooltip"
          style="--b-tooltip-bg: #1a1a2e; --b-tooltip-color: #eaeaea; --b-tooltip-border-radius: 1rem; --b-tooltip-padding-x: 1rem; --b-tooltip-padding-y: 0.75rem; --b-tooltip-arrow-color: #1a1a2e;"
        >
          <BButton>Custom</BButton>
        </BTooltip>
        <BTooltip
          title="Large rounded"
          trigger="click"
          style="--b-tooltip-border-radius: 999px; --b-tooltip-padding-x: 1.25rem; --b-tooltip-font-size: 1rem;"
        >
          <BButton>Pill</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 6: SNAPSHOT TESTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 12. Snapshot – minimal
// ─────────────────────────────────────────────
export const SnapshotMinimal: Story = {
  name: 'Snapshot – minimal',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-tooltip__toggle', '.b-tooltip__content'] },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip title="Snapshot tooltip" trigger="click">
          <BButton data-testid="open-snap">Open</BButton>
        </BTooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap'));

    await waitFor(() => {
      const tooltip = document.querySelector('.b-tooltip__content');
      expect(tooltip).toBeTruthy();
      expect(tooltip!.querySelector('.b-tooltip__inner')).toBeTruthy();
      expect(tooltip!.querySelector('.b-tooltip__arrow')).toBeTruthy();
      expect(tooltip!.getAttribute('role')).toBe('tooltip');
    });
  },
};

// ─────────────────────────────────────────────
// 13. Snapshot – no arrow
// ─────────────────────────────────────────────
export const SnapshotNoArrow: Story = {
  name: 'Snapshot – no arrow',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-tooltip__toggle', '.b-tooltip__content'] },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip title="No arrow" :arrow="false" trigger="click">
          <BButton data-testid="open-snap-no-arrow">Open</BButton>
        </BTooltip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap-no-arrow'));

    await waitFor(() => {
      const tooltip = document.querySelector('.b-tooltip__content');
      expect(tooltip).toBeTruthy();
      expect(tooltip!.querySelector('.b-tooltip__arrow')).toBeNull();
      expect(tooltip!.classList.contains('b-tooltip__content--no-arrow')).toBe(true);
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 7: EDGE CASE / REGRESSION
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 14. Edge case – controlled v-model
// ─────────────────────────────────────────────
export const EdgeCaseControlled: Story = {
  name: 'Edge case – controlled v-model',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Tooltip visibility is controlled externally via v-model.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center; align-items: center;">
        <BButton @click="open = !open" data-testid="external-toggle">
          {{ open ? 'Hide' : 'Show' }} Tooltip
        </BButton>
        <BTooltip v-model="open" title="Controlled tooltip" trigger="click">
          <span style="padding: 0.5rem; border: 1px dashed #ccc; border-radius: 0.25rem;">Target</span>
        </BTooltip>
        <span>Open: {{ open }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvasElement.querySelector('.b-tooltip__toggle')!;
    const externalToggle = canvas.getByTestId('external-toggle');

    // Open via external button
    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeTruthy();
    });

    // Close via external button
    await userEvent.click(externalToggle);
    await waitFor(() => {
      expect(toggle.getAttribute('aria-describedby')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 15. Edge case – long content wrapping
// ─────────────────────────────────────────────
export const EdgeCaseLongContent: Story = {
  name: 'Edge case – long content',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BTooltip },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <BTooltip
          title="This is a very long tooltip content that should wrap properly within the max-width constraint without breaking layout or overflowing."
          trigger="click"
        >
          <BButton>Long Content</BButton>
        </BTooltip>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens - MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-tooltip-max-width',
    defaultValue: '250px',
    description: 'Max width of the tooltip (AntD: maxWidth).',
  },
  // ── Local extras ──
  {
    token: '--b-tooltip-bg',
    defaultValue: 'oklch(20% 0 0)',
    description: 'Background of the tooltip body.',
  },
  {
    token: '--b-tooltip-color',
    defaultValue: '#fff',
    description: 'Text color of the tooltip body.',
  },
  {
    token: '--b-tooltip-arrow-color',
    defaultValue: 'oklch(20% 0 0)',
    description: 'Background color of the arrow.',
  },
  {
    token: '--b-tooltip-arrow-size',
    defaultValue: '8px',
    description: 'Size of the tooltip arrow.',
  },
  {
    token: '--b-tooltip-border-radius',
    defaultValue: '0.375rem',
    description: 'Corner radius of the tooltip.',
  },
  {
    token: '--b-tooltip-padding-x',
    defaultValue: '0.5rem',
    description: 'Horizontal padding inside the tooltip.',
  },
  {
    token: '--b-tooltip-padding-y',
    defaultValue: '0.375rem',
    description: 'Vertical padding inside the tooltip.',
  },
  {
    token: '--b-tooltip-font-size',
    defaultValue: '0.875rem',
    description: 'Font size of the tooltip text.',
  },
  {
    token: '--b-tooltip-line-height',
    defaultValue: '1.5',
    description: 'Line height of the tooltip text.',
  },
  {
    token: '--b-tooltip-gap',
    defaultValue: '8px',
    description: 'Distance between the tooltip and the trigger.',
  },
  {
    token: '--b-tooltip-shadow',
    defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%), 0 3px 6px -4px oklch(0% 0 0 / 12%)',
    description: 'Box shadow of the tooltip.',
  },
  {
    token: '--b-tooltip-transition-duration',
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
          'Reference table of every <code>--b-tooltip-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BButton, BTooltip },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BTooltip - Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-tooltip</code>. Override inline or via a CSS class.
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
          Four tokens overridden inline (background, color, radius, font size).
        </p>
        <div style="padding: 4rem; display: flex; justify-content: center;">
          <BTooltip
            title="Themed tooltip"
            trigger="click"
            style="
              --b-tooltip-bg: oklch(42% 0.16 145);
              --b-tooltip-arrow-color: oklch(42% 0.16 145);
              --b-tooltip-border-radius: 12px;
              --b-tooltip-font-size: 1rem;
            "
          >
            <BButton>Click for themed tooltip</BButton>
          </BTooltip>
        </div>
      </div>
    `,
  }),
};
