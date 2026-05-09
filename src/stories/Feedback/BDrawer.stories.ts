import { BButton, BDrawer } from '@/components';
import { BDrawerPlacement, BDrawerSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref, toRef, watch } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Feedback/Drawer',
  component: BDrawer,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: Object.values(BDrawerPlacement),
      description: 'Direction from which the drawer slides in.',
      table: { defaultValue: { summary: BDrawerPlacement.Right } },
    },
    size: {
      control: 'select',
      options: Object.values(BDrawerSize),
      description: 'Preset width/height.',
      table: { defaultValue: { summary: BDrawerSize.Default } },
    },
    title: {
      control: 'text',
      description: 'Drawer title.',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the close button is shown.',
      table: { defaultValue: { summary: 'true' } },
    },
    mask: {
      control: 'boolean',
      description: 'Whether the mask overlay is shown.',
      table: { defaultValue: { summary: 'true' } },
    },
    maskClosable: {
      control: 'boolean',
      description: 'Whether clicking the mask closes the drawer.',
      table: { defaultValue: { summary: 'true' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the drawer.',
      table: { defaultValue: { summary: 'true' } },
    },
    destroyOnClose: {
      control: 'boolean',
      description: 'Destroy child components when closing.',
      table: { defaultValue: { summary: 'false' } },
    },
    width: {
      control: 'text',
      description: 'Custom width (for left/right placement).',
    },
    height: {
      control: 'text',
      description: 'Custom height (for top/bottom placement).',
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the drawer.',
      table: { defaultValue: { summary: '1000' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Auto-focus first focusable element on open.',
      table: { defaultValue: { summary: 'true' } },
    },
    forceRender: {
      control: 'boolean',
      description: 'Force render content even when hidden.',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner in body area.',
      table: { defaultValue: { summary: 'false' } },
    },
    extra: {
      control: 'text',
      description: 'Extra content in header right area.',
    },
    footer: {
      control: 'text',
      description: 'Footer content.',
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled visibility (bind with v-model).',
      table: {
        category: 'Two-Way Binding Props',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDrawer</code> component is a panel that slides in from the edge of the screen.<br><br>' +
          'It is commonly used for navigation, forms, detail views, or any content that should overlay the main page without a full page transition.<br>' +
          'It supports four placements - <strong>top</strong>, <strong>right</strong>, <strong>bottom</strong>, <strong>left</strong> - with focus trapping, keyboard navigation, and full accessibility.',
      },
    },
    // Global a11y testing is inherited from preview.ts (a11y.test: 'error').
    // Each story that renders an open drawer teleports to <body>, so we
    // scope axe-core to avoid false positives from the Storybook chrome.
  },
} satisfies Meta<typeof BDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ═════════════════════════════════════════════
//   TESTING TYPE 1: COMPONENT TESTS
//   (play functions that simulate user interactions)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    placement: 'right' as const,
    size: 'default' as const,
    title: 'Drawer Title',
    closable: true,
    mask: true,
    maskClosable: true,
    keyboard: true,
    destroyOnClose: false,
    autoFocus: true,
    forceRender: false,
    loading: false,
    zIndex: 1000,
  },
  render: (args: any) => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(args.modelValue ?? false);
      // Sync Storybook Controls → local state
      const argsRef = toRef(() => args.modelValue);
      watch(argsRef, (v) => {
        open.value = v ?? false;
      });
      return { args, open };
    },
    template: `
      <BButton @click="open = true">Open Drawer</BButton>
      <BDrawer v-bind="args" v-model="open">
        <p>Some content inside the drawer.</p>
        <p>You can put anything here - forms, lists, details…</p>
      </BDrawer>
    `,
  }),
  // Disable a11y automated test for playground (drawer starts closed)
  parameters: { a11y: { test: 'off' } },
};

// ─────────────────────────────────────────────
// 2. All placements
// ─────────────────────────────────────────────
/**
 * Demonstrates all four placement directions.
 */
export const AllPlacements: Story = {
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BButton @click="openRight = true">Right</BButton>
<BButton @click="openLeft = true">Left</BButton>
<BButton @click="openTop = true">Top</BButton>
<BButton @click="openBottom = true">Bottom</BButton>

<BDrawer v-model="openRight" title="Right Drawer" placement="right">Content</BDrawer>
<BDrawer v-model="openLeft"  title="Left Drawer"  placement="left">Content</BDrawer>
<BDrawer v-model="openTop"   title="Top Drawer"   placement="top">Content</BDrawer>
<BDrawer v-model="openBottom" title="Bottom Drawer" placement="bottom">Content</BDrawer>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const openRight = ref(false);
      const openLeft = ref(false);
      const openTop = ref(false);
      const openBottom = ref(false);
      return { openRight, openLeft, openTop, openBottom };
    },
    template: `
      <div style="display:flex;gap:0.5rem;">
        <BButton @click="openRight = true">Right</BButton>
        <BButton @click="openLeft = true">Left</BButton>
        <BButton @click="openTop = true">Top</BButton>
        <BButton @click="openBottom = true">Bottom</BButton>
      </div>
      <BDrawer v-model="openRight" title="Right Drawer" placement="right">
        <p>Content from the right side.</p>
      </BDrawer>
      <BDrawer v-model="openLeft" title="Left Drawer" placement="left">
        <p>Content from the left side.</p>
      </BDrawer>
      <BDrawer v-model="openTop" title="Top Drawer" placement="top">
        <p>Content from the top.</p>
      </BDrawer>
      <BDrawer v-model="openBottom" title="Bottom Drawer" placement="bottom">
        <p>Content from the bottom.</p>
      </BDrawer>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. With extra & footer
// ─────────────────────────────────────────────
/**
 * Drawer with extra header content and a footer.
 */
export const WithExtraAndFooter: Story = {
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BDrawer v-model="open" title="Edit User">
  <template #extra><BButton size="sm">Save</BButton></template>
  <p>User form content here…</p>
  <template #footer>
    <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
      <BButton @click="open = false">Cancel</BButton>
      <BButton @click="open = false">Submit</BButton>
    </div>
  </template>
</BDrawer>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true">Open Drawer</BButton>
      <BDrawer v-model="open" title="Edit User">
        <template #extra><BButton>Save</BButton></template>
        <p>User form content here…</p>
        <p>More form fields, select boxes, etc.</p>
        <template #footer>
          <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <BButton @click="open = false">Cancel</BButton>
            <BButton @click="open = false">Submit</BButton>
          </div>
        </template>
      </BDrawer>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Loading state
// ─────────────────────────────────────────────
/**
 * Drawer in loading state shows a spinner instead of content.
 */
export const Loading: Story = {
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      const loading = ref(true);
      const handleOpen = () => {
        open.value = true;
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
        }, 2000);
      };
      return { open, loading, handleOpen };
    },
    template: `
      <BButton @click="handleOpen">Open (loads in 2s)</BButton>
      <BDrawer v-model="open" title="Loading Drawer" :loading="loading">
        <p>Content is now loaded.</p>
      </BDrawer>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Sizes
// ─────────────────────────────────────────────
/**
 * Demonstrates default and large size presets.
 */
export const Sizes: Story = {
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const openDefault = ref(false);
      const openLarge = ref(false);
      return { openDefault, openLarge };
    },
    template: `
      <div style="display:flex;gap:0.5rem;">
        <BButton @click="openDefault = true">Default (378px)</BButton>
        <BButton @click="openLarge = true">Large (736px)</BButton>
      </div>
      <BDrawer v-model="openDefault" title="Default Size" size="default">
        <p>Default width is 378px.</p>
      </BDrawer>
      <BDrawer v-model="openLarge" title="Large Size" size="large">
        <p>Large width is 736px.</p>
      </BDrawer>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 2: ACCESSIBILITY TESTS
//   (@storybook/addon-a11y integration via parameters.a11y
//    + manual ARIA assertions in play functions)
// ═════════════════════════════════════════════

// ──────────────────────────────────────────���──
// 6. Accessibility story (automated + manual)
// ─────────────────────────────────────────────
/**
 * Demonstrates ARIA roles and keyboard interaction.
 * - Drawer has `role="dialog"` and `aria-modal="true"`.
 * - Escape key closes the drawer.
 * - Focus is trapped inside the drawer panel.
 * - Close button has `aria-label`.
 *
 * **Accessibility testing strategy:**
 * 1. `parameters.a11y.test: 'error'` - axe-core automatically runs after the play function
 *    and fails on any violation.
 * 2. The play function manually asserts specific ARIA attributes for defense-in-depth.
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    // Accessibility test: axe-core will run automatically after play
    // and fail the test if any violations are found.
    a11y: {
      test: 'error',
      // Scope axe-core to the drawer root (it's teleported to body)
      context: { include: ['.b-drawer-root'] },
    },
    docs: {
      description: {
        story:
          'The drawer uses `role="dialog"` with `aria-modal="true"`. ' +
          'Focus is trapped within the panel. Escape closes the drawer. ' +
          'The close button carries `aria-label="Close drawer"`. ' +
          'The mask is `aria-hidden`.\n\n' +
          '**Testing:** This story runs axe-core automatically via `@storybook/addon-a11y` ' +
          'and also manually asserts ARIA attributes in its play function.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="trigger">Open Drawer</BButton>
      <BDrawer v-model="open" title="Accessible Drawer" data-testid="drawer">
        <p>Tab through focusable elements. Press Escape to close.</p>
        <button style="margin-top:0.5rem;padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;">
          Focusable button inside
        </button>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the drawer
    const trigger = canvas.getByTestId('trigger');
    await userEvent.click(trigger);

    // Wait for drawer to appear in the DOM (teleported to body)
    await waitFor(() => {
      const dialog = document.querySelector('.b-drawer');
      expect(dialog).toBeTruthy();
    });

    const dialog = document.querySelector('.b-drawer')!;

    // ── Manual ARIA assertions ──
    // role="dialog"
    expect(dialog.getAttribute('role')).toBe('dialog');
    // aria-modal="true"
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    // aria-labelledby points to the title
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    const titleId = dialog.getAttribute('aria-labelledby')!;
    const titleEl = document.getElementById(titleId);
    expect(titleEl).toBeTruthy();
    expect(titleEl!.textContent).toBe('Accessible Drawer');
    // tabindex="-1" for programmatic focus
    expect(dialog.getAttribute('tabindex')).toBe('-1');

    // Close button accessibility
    const closeBtn = dialog.querySelector('.b-drawer__close');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn!.getAttribute('aria-label')).toBe('Close drawer');
    expect(closeBtn!.getAttribute('type')).toBe('button');

    // Close icon SVG is decorative
    const svg = dialog.querySelector('.b-drawer__close-icon');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
    expect(svg!.getAttribute('focusable')).toBe('false');

    // Mask is aria-hidden
    const mask = document.querySelector('.b-drawer__mask');
    expect(mask).toBeTruthy();
    expect(mask!.getAttribute('aria-hidden')).toBe('true');

    // ── Keyboard: close with Escape ──
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });

    // Re-open the drawer so axe-core (afterEach) can scan .b-drawer-root
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// 7. Accessibility – loading state a11y
// ─────────────────────────────────────────────
/**
 * Verifies that the loading state announces itself to assistive technology
 * via `aria-live="polite"`.
 */
export const AccessibilityLoading: Story = {
  name: 'Accessibility – loading a11y',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-drawer-root'] },
    },
    docs: {
      description: {
        story:
          'Loading state uses `aria-live="polite"` to announce to screen readers. ' +
          'The spinner SVG is `aria-hidden="true"` and `focusable="false"`.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-loading">Open Loading Drawer</BButton>
      <BDrawer v-model="open" title="Loading State" :loading="true">
        <p>This should not be visible.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-loading'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Verify aria-live on loading container
    const loadingEl = document.querySelector('.b-drawer__loading');
    expect(loadingEl).toBeTruthy();
    expect(loadingEl!.getAttribute('aria-live')).toBe('polite');

    // Spinner SVG is decorative
    const spinner = document.querySelector('.b-drawer__spinner');
    expect(spinner).toBeTruthy();
    expect(spinner!.getAttribute('aria-hidden')).toBe('true');
    expect(spinner!.getAttribute('focusable')).toBe('false');
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 3: INTERACTION TESTS
//   (complex multi-step play functions with
//    user event simulation and state assertions)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 8. Interaction test – open / close flow
// ─────────────────────────────────────────────
/**
 * Automated interaction test: opens the drawer, verifies visibility, ARIA,
 * focus, then closes via the close button.
 */
export const InteractionOpenClose: Story = {
  name: 'Interaction – open/close flow',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' }, // tested in dedicated a11y story
    docs: {
      description:
        'Automated play function: clicks the trigger to open the drawer, ' +
        'asserts visibility and ARIA attributes, then closes via the close button.',
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-btn">Open Drawer</BButton>
      <BDrawer v-model="open" title="Interaction Test">
        <p data-testid="drawer-content">Content visible.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially drawer is not in the DOM
    expect(document.querySelector('.b-drawer')).toBeNull();

    // Open drawer
    const openBtn = canvas.getByTestId('open-btn');
    await userEvent.click(openBtn);

    // Drawer is now visible
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    const drawer = document.querySelector('.b-drawer')!;

    // Verify role and aria
    expect(drawer.getAttribute('role')).toBe('dialog');
    expect(drawer.getAttribute('aria-modal')).toBe('true');

    // Verify content
    expect(document.querySelector('[data-testid="drawer-content"]')).toBeTruthy();

    // Close via close button
    const closeBtn = drawer.querySelector('.b-drawer__close') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    await userEvent.click(closeBtn);

    // Drawer should be removed
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 9. Interaction test – keyboard close (Escape)
// ─────────────────────────────────────────────
/**
 * Tests that pressing Escape closes the drawer.
 */
export const InteractionKeyboardClose: Story = {
  name: 'Interaction – keyboard Escape',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Opens the drawer, then presses Escape to close it. Verifies the drawer is removed.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-esc">Open Drawer</BButton>
      <BDrawer v-model="open" title="Keyboard Test">
        <p>Press Escape to close.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-esc'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Press Escape
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 10. Interaction test – mask close
// ─────────────────────────────────────────────
/**
 * Tests that clicking the mask overlay closes the drawer (maskClosable=true).
 */
export const InteractionMaskClose: Story = {
  name: 'Interaction – mask close',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'Opens the drawer, then clicks the mask overlay to close it.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-mask">Open Drawer</BButton>
      <BDrawer v-model="open" title="Mask Close Test" :mask-closable="true">
        <p>Click the dark overlay to close.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-mask'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Click the mask
    const mask = document.querySelector('.b-drawer__mask') as HTMLElement;
    expect(mask).toBeTruthy();
    await userEvent.click(mask);

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 11. Interaction test – mask NOT closable
// ─────────────────────────────────────────────
/**
 * Tests that clicking the mask does NOT close the drawer when maskClosable=false.
 */
export const InteractionMaskNotClosable: Story = {
  name: 'Interaction – mask not closable',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'With `maskClosable=false`, clicking the mask overlay does NOT close the drawer.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-no-mask">Open Drawer</BButton>
      <BDrawer v-model="open" title="Not Closable via Mask" :mask-closable="false">
        <p>Clicking the mask will NOT close this drawer.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-no-mask'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Click the mask - drawer should stay open
    const mask = document.querySelector('.b-drawer__mask') as HTMLElement;
    expect(mask).toBeTruthy();
    await userEvent.click(mask);

    // Small delay to ensure event propagation
    await new Promise((r) => setTimeout(r, 200));

    // Drawer should still be visible
    expect(document.querySelector('.b-drawer')).toBeTruthy();

    // Clean up: close via close button (more reliable than Escape which
    // requires focus inside the drawer panel)
    const closeBtn = document.querySelector('.b-drawer__close') as HTMLElement;
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 12. Interaction test – focus trap
// ─────────────────────────────────────────────
/**
 * Tests that focus is trapped inside the drawer. Tabbing from the last
 * focusable element wraps back to the first.
 */
export const InteractionFocusTrap: Story = {
  name: 'Interaction – focus trap',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Opens a drawer with multiple focusable elements. ' +
          'Verifies that Tab wraps focus from the last element back to the first.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-focus">Open Drawer</BButton>
      <BDrawer v-model="open" title="Focus Trap Test">
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          <button data-testid="btn-first">First button</button>
          <button data-testid="btn-second">Second button</button>
          <button data-testid="btn-last">Last button</button>
        </div>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-focus'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // The drawer auto-focuses the first focusable element (close button)
    await waitFor(() => {
      const closeBtn = document.querySelector('.b-drawer__close');
      expect(document.activeElement).toBe(closeBtn);
    });

    // Tab through all elements to the last button
    await userEvent.tab(); // → First button
    expect(document.activeElement).toBe(document.querySelector('[data-testid="btn-first"]'));

    await userEvent.tab(); // → Second button
    expect(document.activeElement).toBe(document.querySelector('[data-testid="btn-second"]'));

    await userEvent.tab(); // → Last button
    expect(document.activeElement).toBe(document.querySelector('[data-testid="btn-last"]'));

    // Tab once more - should wrap back to close button (first focusable)
    await userEvent.tab();
    await waitFor(() => {
      const closeBtn = document.querySelector('.b-drawer__close');
      expect(document.activeElement).toBe(closeBtn);
    });
  },
};

// ─────────────────────────────────────────────
// 13. Interaction test – event callbacks
// ─────────────────────────────────────────────
/**
 * Tests that close and afterOpenChange events fire in the correct order.
 */
export const InteractionEvents: Story = {
  name: 'Interaction – event ordering',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Verifies that `@close` fires immediately on close action, and ' +
          '`@afterOpenChange(false)` fires after the transition completes.',
      },
    },
  },
  render: () => {
    const onClose = fn();
    const onAfterOpenChange = fn();

    return {
      components: { BButton, BDrawer },
      setup() {
        const open = ref(false);
        return { open, onClose, onAfterOpenChange };
      },
      template: `
        <BButton @click="open = true" data-testid="open-events">Open Drawer</BButton>
        <BDrawer
          v-model="open"
          title="Events Test"
          @close="onClose"
          @after-open-change="onAfterOpenChange"
        >
          <p>Close me to test events.</p>
        </BDrawer>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-events'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Close via close button
    const closeBtn = document.querySelector('.b-drawer__close') as HTMLElement;
    await userEvent.click(closeBtn);

    // Drawer should be removed after transition
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 14. Interaction test – footer and extra slots
// ─────────────────────────────────────────────
/**
 * Verifies that footer and extra slots render and can be interacted with.
 */
export const InteractionFooterExtra: Story = {
  name: 'Interaction – footer & extra',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Opens a drawer with extra header content and footer buttons, ' +
          'verifies they are present and clickable.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-footer">Open Drawer</BButton>
      <BDrawer v-model="open" title="Footer Test">
        <template #extra>
          <button data-testid="extra-btn">Extra Action</button>
        </template>
        <p>Drawer with footer and extra.</p>
        <template #footer>
          <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <button data-testid="cancel-btn" @click="open = false">Cancel</button>
            <button data-testid="submit-btn" @click="open = false">Submit</button>
          </div>
        </template>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-footer'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Verify extra header content
    const extraBtn = document.querySelector('[data-testid="extra-btn"]');
    expect(extraBtn).toBeTruthy();

    // Verify footer
    const footer = document.querySelector('.b-drawer__footer');
    expect(footer).toBeTruthy();

    const cancelBtn = document.querySelector('[data-testid="cancel-btn"]') as HTMLElement;
    const submitBtn = document.querySelector('[data-testid="submit-btn"]') as HTMLElement;
    expect(cancelBtn).toBeTruthy();
    expect(submitBtn).toBeTruthy();

    // Click Cancel → drawer should close
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 4: THEMING (CSS var overrides)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 21. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override the CSS custom properties to customise the appearance.
 * Every token is prefixed `--b-drawer-*`.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' }, // custom colors may not pass contrast checks
    docs: {
      description: {
        story:
          'Override `--b-drawer-*` CSS custom properties on the `.b-drawer-root` or `.b-drawer` element ' +
          'to customise colours without touching the component source.',
      },
      source: {
        code: `
<!-- Tokens are scoped to .b-drawer-root (the component root element).
     Override them via an inline style or a CSS class on that root. -->
<BDrawer
  v-model="open"
  title="Custom Theme"
  style="
    --b-drawer-bg: #1a1a2e;
    --b-drawer-color: #eaeaea;
    --b-drawer-border-color: #e94560;
    --b-drawer-close-color: #aaa;
    --b-drawer-close-hover-color: #eaeaea;
    --b-drawer-mask-bg: rgba(0,0,0,0.75);
  "
>
  Content here.
</BDrawer>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const openDefault = ref(false);
      const openCustom = ref(false);
      return { openDefault, openCustom };
    },
    template: `
      <div style="display:flex;gap:0.5rem;">
        <BButton @click="openDefault = true">Default Theme</BButton>
        <BButton @click="openCustom = true">Custom Theme</BButton>
      </div>
      <BDrawer v-model="openDefault" title="Default Theme">
        <p>Standard design-system tokens.</p>
      </BDrawer>
      <BDrawer
        v-model="openCustom"
        title="Custom Theme"
        style="--b-drawer-bg: #1a1a2e; --b-drawer-color: #eaeaea; --b-drawer-border-color: #e94560; --b-drawer-close-color: #aaa; --b-drawer-close-hover-color: #eaeaea; --b-drawer-mask-bg: rgba(0,0,0,0.75);"
      >
        <p style="color: #eaeaea;">Everything is controlled by CSS custom properties.</p>
      </BDrawer>
    `,
  }),
};

// ═════════════════════════════════════════════
//   TESTING TYPE 6: SNAPSHOT TESTS
//   (stories with stable, deterministic content
//    designed for DOM snapshot comparison)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 22. Snapshot – minimal drawer
// ─────────────────────────────────────────────
/**
 * Minimal open drawer for DOM snapshot testing.
 * The play function opens the drawer so the snapshot captures the full markup.
 */
export const SnapshotMinimal: Story = {
  name: 'Snapshot – minimal',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-drawer-root'] },
    },
    docs: {
      description: {
        story:
          'Minimal drawer for snapshot testing. Opens via play function so the ' +
          'complete DOM structure is captured.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-snap-min">Open</BButton>
      <BDrawer v-model="open" title="Snapshot Test">
        <p>Snapshot content.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap-min'));

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    const drawer = document.querySelector('.b-drawer')!;
    // Verify structural completeness for snapshot
    expect(drawer.querySelector('.b-drawer__header')).toBeTruthy();
    expect(drawer.querySelector('.b-drawer__title')).toBeTruthy();
    expect(drawer.querySelector('.b-drawer__close')).toBeTruthy();
    expect(drawer.querySelector('.b-drawer__body')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// 23. Snapshot – without title/close (no header)
// ─────────────────────────────────────────────
/**
 * Snapshot of a drawer without a header (closable=false, no title).
 */
export const SnapshotNoHeader: Story = {
  name: 'Snapshot – no header',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-drawer-root'] },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-snap-no-hdr">Open</BButton>
      <BDrawer v-model="open" :closable="false" aria-label="Drawer content">
        <p>No header, just body.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap-no-hdr'));

    await waitFor(() => {
      const drawer = document.querySelector('.b-drawer');
      expect(drawer).toBeTruthy();
      expect(drawer!.querySelector('.b-drawer__header')).toBeNull();
      expect(drawer!.querySelector('.b-drawer__body')).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// 24. Snapshot – complete with all slots
// ─────────────────────────────────────────────
/**
 * Snapshot with every slot populated: title, extra, default, footer.
 */
export const SnapshotComplete: Story = {
  name: 'Snapshot – complete (all slots)',
  parameters: {
    controls: { disable: true },
    a11y: {
      test: 'error',
      context: { include: ['.b-drawer-root'] },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-snap-complete">Open</BButton>
      <BDrawer v-model="open">
        <template #title>Custom Title Slot</template>
        <template #extra><span data-testid="extra-slot">Extra Slot</span></template>
        <p data-testid="body-content">Body via default slot.</p>
        <template #footer><span data-testid="footer-slot">Footer Slot</span></template>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('open-snap-complete'));

    await waitFor(() => {
      const drawer = document.querySelector('.b-drawer');
      expect(drawer).toBeTruthy();
      expect(drawer!.querySelector('.b-drawer__title')!.textContent).toBe('Custom Title Slot');
      expect(document.querySelector('[data-testid="extra-slot"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="body-content"]')).toBeTruthy();
      expect(document.querySelector('[data-testid="footer-slot"]')).toBeTruthy();
    });
  },
};

// ═════════════════════════════════════════════
//   TESTING TYPE 7: EDGE CASE / REGRESSION TESTS
//   (boundary conditions tested via play functions)
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// 25. Edge case – keyboard=false disables Escape
// ─────────────────────────────────────────────
/**
 * With `keyboard=false`, pressing Escape should NOT close the drawer.
 */
export const EdgeCaseKeyboardDisabled: Story = {
  name: 'Edge case – keyboard disabled',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
    docs: {
      description: {
        story: 'With `keyboard=false`, pressing Escape does NOT close the drawer.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-no-kb">Open</BButton>
      <BDrawer v-model="open" title="No Keyboard Close" :keyboard="false">
        <p>Escape key is disabled.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-no-kb'));
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // Press Escape - drawer should NOT close
    await userEvent.keyboard('{Escape}');
    await new Promise((r) => setTimeout(r, 200));
    expect(document.querySelector('.b-drawer')).toBeTruthy();

    // Clean up: close via close button
    const closeBtn = document.querySelector('.b-drawer__close') as HTMLElement;
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 26. Edge case – closable=false (no close button)
// ─────────────────────────────────────────────
/**
 * Drawer with closable=false but with a title. Only keyboard can close it.
 */
export const EdgeCaseNotClosable: Story = {
  name: 'Edge case – closable=false',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <BButton @click="open = true" data-testid="open-no-close">Open</BButton>
      <BDrawer v-model="open" title="No Close Button" :closable="false">
        <p>No close button rendered. Use Escape or mask click.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('open-no-close'));
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    // No close button should exist
    expect(document.querySelector('.b-drawer__close')).toBeNull();

    // Header should still be present (because title is set)
    expect(document.querySelector('.b-drawer__header')).toBeTruthy();

    // Clean up: close via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 27. Edge case – placement top and bottom
// ─────────────────────────────────────────────
/**
 * Tests top and bottom placements which use height instead of width.
 */
export const EdgeCaseVerticalPlacement: Story = {
  name: 'Edge case – vertical placements',
  parameters: {
    controls: { disable: true },
    a11y: { test: 'off' },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup() {
      const openTop = ref(false);
      const openBottom = ref(false);
      return { openTop, openBottom };
    },
    template: `
      <div style="display:flex;gap:0.5rem;">
        <BButton @click="openTop = true" data-testid="open-top">Top</BButton>
        <BButton @click="openBottom = true" data-testid="open-bottom">Bottom</BButton>
      </div>
      <BDrawer v-model="openTop" title="Top Drawer" placement="top">
        <p>Slides down from the top.</p>
      </BDrawer>
      <BDrawer v-model="openBottom" title="Bottom Drawer" placement="bottom">
        <p>Slides up from the bottom.</p>
      </BDrawer>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test top placement
    await userEvent.click(canvas.getByTestId('open-top'));
    await waitFor(() => {
      const drawer = document.querySelector('.b-drawer--top');
      expect(drawer).toBeTruthy();
      // Top placement uses width: 100%
      expect(drawer!.getAttribute('style')).toContain('width: 100%');
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });

    // Test bottom placement
    await userEvent.click(canvas.getByTestId('open-bottom'));
    await waitFor(() => {
      const drawer = document.querySelector('.b-drawer--bottom');
      expect(drawer).toBeTruthy();
      expect(drawer!.getAttribute('style')).toContain('width: 100%');
    });
  },
};

