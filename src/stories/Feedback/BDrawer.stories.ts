import { BButton, BDrawer } from '@/components';
import { BDrawerPlacement, BDrawerSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
          'It supports four placements — <strong>top</strong>, <strong>right</strong>, <strong>bottom</strong>, <strong>left</strong> — with focus trapping, keyboard navigation, and full accessibility.',
      },
    },
  },
} satisfies Meta<typeof BDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground — tweak all props via the Controls panel.
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
        <p>You can put anything here — forms, lists, details…</p>
      </BDrawer>
    `,
  }),
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

// ─────────────────────────────────────────────
// 6. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates ARIA roles and keyboard interaction.
 * - Drawer has `role="dialog"` and `aria-modal="true"`.
 * - Escape key closes the drawer.
 * - Focus is trapped inside the drawer panel.
 * - Close button has `aria-label`.
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The drawer uses `role="dialog"` with `aria-modal="true"`. ' +
          'Focus is trapped within the panel. Escape closes the drawer. ' +
          'The close button carries `aria-label="Close drawer"`. ' +
          'The mask is `aria-hidden`.',
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

    // Wait for drawer to appear
    await waitFor(() => {
      const dialog = document.querySelector('.b-drawer');
      expect(dialog).toBeTruthy();
    });

    const dialog = document.querySelector('.b-drawer')!;

    // Verify ARIA attributes
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();

    // Verify close button accessibility
    const closeBtn = dialog.querySelector('.b-drawer__close');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn!.getAttribute('aria-label')).toBe('Close drawer');

    // Verify mask is aria-hidden
    const mask = document.querySelector('.b-drawer__mask');
    expect(mask).toBeTruthy();
    expect(mask!.getAttribute('aria-hidden')).toBe('true');

    // Close with Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 7. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override the CSS custom properties to customise the appearance.
 * Every token is prefixed `--b-drawer-*`.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-drawer-*` CSS custom properties on the `.b-drawer-root` or `.b-drawer` element ' +
          'to customise colours without touching the component source.',
      },
      source: {
        code: `
<style>
.my-custom-drawer .b-drawer {
  --b-drawer-bg: #1a1a2e;
  --b-drawer-color: #eaeaea;
  --b-drawer-border-color: #e94560;
  --b-drawer-close-color: #aaa;
  --b-drawer-close-hover-color: #eaeaea;
}
</style>
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

// ─────────────────────────────────────────────
// 8. Interaction test – open/close flow
// ─────────────────────────────────────────────
/**
 * Automated interaction test: opens the drawer, verifies visibility, ARIA,
 * focus, then closes it.
 */
export const InteractionOpenClose: Story = {
  name: 'Interaction – open/close flow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: clicks the trigger to open the drawer, ' +
          'asserts visibility and ARIA attributes, then closes via the close button.',
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

