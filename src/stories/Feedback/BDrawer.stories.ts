import { BButton, BDrawer } from '@/components';
import { BDrawerPlacement, BDrawerSize } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref, toRef, watch } from 'vue';

/**
 * BDrawer — slide-in panel for navigation, forms, or detail views.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Drawer',
  component: BDrawer,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: Object.values(BDrawerPlacement),
      description: 'Direction the drawer slides in from.',
      table: { category: 'Props', defaultValue: { summary: BDrawerPlacement.Right } },
    },
    size: {
      control: 'select',
      options: Object.values(BDrawerSize),
      description: 'Preset width (left/right) or height (top/bottom).',
      table: { category: 'Props', defaultValue: { summary: BDrawerSize.Default } },
    },
    title: {
      control: 'text',
      description: 'Drawer title shown in the header.',
      table: { category: 'Props' },
    },
    closable: {
      control: 'boolean',
      description: 'Whether the close button is shown.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    mask: {
      control: 'boolean',
      description: 'Whether the mask overlay is shown.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    maskClosable: {
      control: 'boolean',
      description: 'Whether clicking the mask closes the drawer.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    keyboard: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the drawer.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    destroyOnClose: {
      control: 'boolean',
      description: 'Destroy child components when closing.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    width: {
      control: 'text',
      description: 'Custom width (left/right placement).',
      table: { category: 'Props' },
    },
    height: {
      control: 'text',
      description: 'Custom height (top/bottom placement).',
      table: { category: 'Props' },
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the drawer.',
      table: { category: 'Props', defaultValue: { summary: '1000' } },
    },
    autoFocus: {
      control: 'boolean',
      description: 'Auto-focus first focusable element on open.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    forceRender: {
      control: 'boolean',
      description: 'Force render content even when hidden.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner in body area.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    extra: {
      control: 'text',
      description: 'Extra content in header right area.',
      table: { category: 'Props' },
    },
    footer: {
      control: 'text',
      description: 'Footer content.',
      table: { category: 'Props' },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled visibility — bind with v-model.',
      table: { category: 'Two-Way Binding Props' },
    },
    default: { description: 'Body content of the drawer.', table: { category: 'Slots' } },
    onClose: { description: 'Fired when the close button is activated.', table: { category: 'Events' } },
    onAfterOpenChange: { description: 'Fired after open/close transition completes.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BDrawer</code> component is a panel that slides in from the edge of the screen.<br><br>' +
          'It is commonly used for navigation, forms, detail views, or any content that should overlay the main page without a full page transition.<br>' +
          'Supports four placements — <strong>top</strong>, <strong>right</strong>, <strong>bottom</strong>, <strong>left</strong> — with focus trapping, keyboard navigation, and full accessibility.',
      },
    },
  },
} satisfies Meta<typeof BDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Interactive default — tweak all props via the Controls panel. */
export const Default: Story = {
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
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BButton @click="open = true">Open Drawer</BButton>
<BDrawer v-model="open" title="Drawer Title">
  <p>Some content inside the drawer.</p>
</BDrawer>
        `,
      },
    },
  },
  render: (args: any) => ({
    components: { BButton, BDrawer },
    setup() {
      const open = ref(args.modelValue ?? false);
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

/** Slides in from the right (default). */
export const PlacementRight: Story = {
  name: 'Placement: Right',
  parameters: {
    a11y: { test: 'off' },
    docs: { source: { code: `<BDrawer v-model="open" title="Right Drawer" placement="right">Content</BDrawer>` } },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open Right Drawer</BButton>
      <BDrawer v-model="open" title="Right Drawer" placement="right">
        <p>Content from the right side.</p>
      </BDrawer>
    `,
  }),
};

/** Slides in from the left. */
export const PlacementLeft: Story = {
  name: 'Placement: Left',
  parameters: {
    a11y: { test: 'off' },
    docs: { source: { code: `<BDrawer v-model="open" title="Left Drawer" placement="left">Content</BDrawer>` } },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open Left Drawer</BButton>
      <BDrawer v-model="open" title="Left Drawer" placement="left">
        <p>Content from the left side.</p>
      </BDrawer>
    `,
  }),
};

/** Slides down from the top. */
export const PlacementTop: Story = {
  name: 'Placement: Top',
  parameters: {
    a11y: { test: 'off' },
    docs: { source: { code: `<BDrawer v-model="open" title="Top Drawer" placement="top">Content</BDrawer>` } },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open Top Drawer</BButton>
      <BDrawer v-model="open" title="Top Drawer" placement="top">
        <p>Content from the top.</p>
      </BDrawer>
    `,
  }),
};

/** Slides up from the bottom. */
export const PlacementBottom: Story = {
  name: 'Placement: Bottom',
  parameters: {
    a11y: { test: 'off' },
    docs: { source: { code: `<BDrawer v-model="open" title="Bottom Drawer" placement="bottom">Content</BDrawer>` } },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open Bottom Drawer</BButton>
      <BDrawer v-model="open" title="Bottom Drawer" placement="bottom">
        <p>Content from the bottom.</p>
      </BDrawer>
    `,
  }),
};

/** Default 378px and large 736px presets for left/right placement. */
export const Sizes: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BDrawer v-model="openDefault" title="Default Size" size="default">…</BDrawer>
<BDrawer v-model="openLarge"   title="Large Size"   size="large">…</BDrawer>
        `,
      },
    },
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

/** Body shows a spinner while content loads. */
export const Loading: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BDrawer v-model="open" title="Loading Drawer" :loading="loading">Content</BDrawer>`,
      },
    },
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
// Examples
// ─────────────────────────────────────────────

/** Edit-record pattern: header `extra` action, body content, footer with Cancel / Submit. */
export const EditRecord: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `
<BDrawer v-model="open" title="Edit User">
  <template #extra><BButton size="sm">Save Draft</BButton></template>
  <p>User form content here…</p>
  <template #footer>
    <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
      <BButton variant="outlined" @click="open = false">Cancel</BButton>
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
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Edit User</BButton>
      <BDrawer v-model="open" title="Edit User">
        <template #extra><BButton size="sm">Save Draft</BButton></template>
        <p>User form content here…</p>
        <p>More form fields, select boxes, etc.</p>
        <template #footer>
          <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <BButton variant="outlined" @click="open = false">Cancel</BButton>
            <BButton @click="open = false">Submit</BButton>
          </div>
        </template>
      </BDrawer>
    `,
  }),
};

/** Title-less, header-less drawer for full-bleed content. */
export const NoHeader: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BDrawer v-model="open" :closable="false" aria-label="Drawer content">…</BDrawer>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open</BButton>
      <BDrawer v-model="open" :closable="false" aria-label="Drawer content">
        <p>No header, just body. Close via mask click or Escape.</p>
      </BDrawer>
    `,
  }),
};

/** Persistent drawer — disable both keyboard and mask-close to force explicit dismissal. */
export const Persistent: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      source: {
        code: `<BDrawer v-model="open" title="Persistent" :keyboard="false" :mask-closable="false">…</BDrawer>`,
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open</BButton>
      <BDrawer v-model="open" title="Confirm before closing" :keyboard="false" :mask-closable="false">
        <p>Escape and mask click are both disabled. Use the close button.</p>
      </BDrawer>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Drawer uses `role="dialog"` with `aria-modal="true"`. Focus is trapped within the panel,
 * Escape closes it, and the close button carries `aria-label="Close drawer"`.
 * The mask is `aria-hidden`. Loading state announces via `aria-live="polite"`.
 */
export const Accessibility: Story = {
  parameters: {
    a11y: {
      test: 'error',
      context: { include: ['.b-drawer-root'] },
    },
    docs: {
      description: {
        story:
          'The drawer uses <code>role="dialog"</code> with <code>aria-modal="true"</code>. Focus is trapped, Escape closes, and the close button carries <code>aria-label="Close drawer"</code>. axe-core runs after the play function for defense-in-depth.',
      },
    },
  },
  render: () => ({
    components: { BButton, BDrawer },
    setup: () => ({ open: ref(false) }),
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

    const trigger = canvas.getByTestId('trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });

    const dialog = document.querySelector('.b-drawer')!;

    // ARIA assertions
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    const titleId = dialog.getAttribute('aria-labelledby')!;
    const titleEl = document.getElementById(titleId);
    expect(titleEl).toBeTruthy();
    expect(titleEl!.textContent).toBe('Accessible Drawer');
    expect(dialog.getAttribute('tabindex')).toBe('-1');

    // Close button
    const closeBtn = dialog.querySelector('.b-drawer__close');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn!.getAttribute('aria-label')).toBe('Close drawer');
    expect(closeBtn!.getAttribute('type')).toBe('button');

    // Decorative SVG
    const svg = dialog.querySelector('.b-drawer__close-icon');
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
    expect(svg!.getAttribute('focusable')).toBe('false');

    // Mask is decorative
    const mask = document.querySelector('.b-drawer__mask');
    expect(mask).toBeTruthy();
    expect(mask!.getAttribute('aria-hidden')).toBe('true');

    // Focus trap: drawer auto-focuses close button
    await waitFor(() => {
      expect(document.activeElement).toBe(closeBtn);
    });

    // Escape closes
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeNull();
    });

    // Re-open so axe-core can scan the mounted drawer
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('.b-drawer')).toBeTruthy();
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-drawer-bg`, `--b-drawer-color`, `--b-drawer-border-color`, and
 * `--b-drawer-mask-bg` (plus close-button colors) to retheme the drawer.
 */
export const Theming: Story = {
  parameters: {
    a11y: { test: 'off' },
    docs: {
      description: {
        story:
          'Override <code>--b-drawer-bg</code>, <code>--b-drawer-color</code>, <code>--b-drawer-border-color</code>, and <code>--b-drawer-mask-bg</code> on the <code>.b-drawer-root</code> or <code>.b-drawer</code> element to retheme without touching component source.',
      },
      source: {
        code: `
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

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-drawer-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the drawer body.' },
  { token: '--b-drawer-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Primary text color inside the drawer.' },
  { token: '--b-drawer-border-color', defaultValue: 'oklch(92% 0.005 260)', description: 'Border color separating header/footer from body.' },
  { token: '--b-drawer-mask-bg', defaultValue: 'oklch(0% 0 0 / 45%)', description: 'Background color of the overlay mask.' },
  { token: '--b-drawer-shadow', defaultValue: '0 9px 28px 8px oklch(0% 0 0 / 5%)', description: 'Box shadow of the drawer panel.' },
  { token: '--b-drawer-header-padding', defaultValue: '1rem 1.5rem', description: 'Padding of the header area.' },
  { token: '--b-drawer-body-padding', defaultValue: '1.5rem', description: 'Padding of the body content area.' },
  { token: '--b-drawer-footer-padding', defaultValue: '0.5rem 1rem', description: 'Padding of the footer area.' },
  { token: '--b-drawer-title-font-size', defaultValue: '1rem', description: 'Font size of the drawer title.' },
  { token: '--b-drawer-title-font-weight', defaultValue: '600', description: 'Font weight of the drawer title.' },
  { token: '--b-drawer-title-line-height', defaultValue: '1.5', description: 'Line height of the drawer title.' },
  { token: '--b-drawer-close-color', defaultValue: 'oklch(50% 0.005 260)', description: 'Color of the close button icon.' },
  { token: '--b-drawer-close-hover-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Hover color of the close button icon.' },
  { token: '--b-drawer-transition-duration', defaultValue: '300ms', description: 'Open/close animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BDrawer</code>. Override on <code>.b-drawer-root</code>, <code>.b-drawer</code>, or any ancestor.',
      },
    },
  },
  render: () => ({
    components: { BDrawer, BButton },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BDrawer — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-drawer</code>. Override inline or via a CSS class.
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
