import { BAlert } from '@/components';
import { BAlertType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Feedback/Alert',
  component: BAlert,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BAlertType),
      description: 'Alert severity type.',
      table: { defaultValue: { summary: BAlertType.Info } },
    },
    message: {
      control: 'text',
      description: 'Primary message text.',
    },
    description: {
      control: 'text',
      description: 'Optional supporting description.',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon.',
      table: { defaultValue: { summary: 'false' } },
    },
    closable: {
      control: 'boolean',
      description: 'Show close button.',
      table: { defaultValue: { summary: 'false' } },
    },
    banner: {
      control: 'boolean',
      description: 'Render as a top-of-page banner (no border-radius).',
      table: { defaultValue: { summary: 'false' } },
    },
    action: {
      control: 'text',
      description: 'Action area text (right side of the alert).',
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
          'The <code>BAlert</code> component is used to display important messages inline within the page content.<br><br>' +
          'It supports four severity levels - <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, and <strong>error</strong> - with optional icons, descriptions, actions and a dismiss button.<br>' +
          'It operates in both <em>uncontrolled</em> (self-managing visibility) and <em>controlled</em> (<code>v-model</code>) modes.',
      },
    },
  },
} satisfies Meta<typeof BAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 */
export const Playground: Story = {
  args: {
    type: BAlertType.Info,
    message: 'This is an informational alert.',
    description: '',
    showIcon: true,
    closable: true,
    banner: false,
    action: '',
  },
  render: (args) => ({
    components: { BAlert },
    setup() {
      return { args };
    },
    template: `<BAlert v-bind="args" />`,
  }),
};

// ─────────────────────────────────────────────
// 2. All types / variants
// ─────────────────────────────────────────────
/**
 * Demonstrates all four alert types side-by-side with icon and description.
 */
export const AllTypes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BAlert type="success" message="Success" description="Operation completed successfully." show-icon />
<BAlert type="info"    message="Info"    description="Here is some useful information."  show-icon />
<BAlert type="warning" message="Warning" description="Please review the input values."   show-icon />
<BAlert type="error"   message="Error"   description="Something went wrong."             show-icon />
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <BAlert type="success" message="Success" description="Operation completed successfully." :show-icon="true" />
        <BAlert type="info"    message="Info"    description="Here is some useful information."  :show-icon="true" />
        <BAlert type="warning" message="Warning" description="Please review the input values."   :show-icon="true" />
        <BAlert type="error"   message="Error"   description="Something went wrong."             :show-icon="true" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. With close button (uncontrolled)
// ─────────────────────────────────────────────
/**
 * The alert manages its own visibility. Clicking the × button triggers
 * the `close` event and hides the alert; after the leave-transition
 * `afterClose` fires.
 */
export const Closable: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BAlert type="warning" message="You can close this alert." :closable="true" :show-icon="true" />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    setup() {
      function onClose() {
        console.log('close fired');
      }
      function onAfterClose() {
        console.log('afterClose fired');
      }
      return { onClose, onAfterClose };
    },
    template: `
      <BAlert
        type="warning"
        message="You can close this alert."
        :closable="true"
        :show-icon="true"
        @close="onClose"
        @after-close="onAfterClose"
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Banner mode
// ─────────────────────────────────────────────
/**
 * Banner variant stretches full-width with no border-radius, suitable for
 * top-of-page announcements.
 */
export const Banner: Story = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      source: {
        code: `<BAlert type="info" message="Scheduled maintenance on Saturday 01:00–03:00 UTC." :banner="true" :show-icon="true" />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <BAlert
        type="info"
        message="Scheduled maintenance on Saturday 01:00–03:00 UTC."
        :banner="true"
        :show-icon="true"
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. With action
// ─────────────────────────────────────────────
/**
 * An action element displayed on the right side of the alert.
 */
export const WithAction: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BAlert type="error" message="Failed to save changes." action="Retry" :show-icon="true" />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <BAlert
        type="error"
        message="Failed to save changes."
        action="Retry"
        :show-icon="true"
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Controlled (v-model)
// ─────────────────────────────────────────────
/**
 * Controlled visibility via `v-model`. The parent owns the visible state.
 */
export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(true);
</script>

<template>
  <button @click="visible = !visible">Toggle</button>
  <BAlert v-model="visible" type="success" message="Controlled alert." :closable="true" :show-icon="true" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    setup() {
      const visible = ref(true);
      return { visible };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div style="display:flex;gap:0.5rem;">
          <button
            style="padding:0.25rem 0.75rem;border:1px solid #ccc;border-radius:0.375rem;cursor:pointer;"
            @click="visible = !visible"
          >
            {{ visible ? 'Hide' : 'Show' }} alert
          </button>
        </div>
        <BAlert
          v-model="visible"
          type="success"
          message="This alert is controlled via v-model."
          :closable="true"
          :show-icon="true"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates ARIA roles and keyboard interaction.
 * - `error` and `warning` → `role="alert"` (assertive live region)
 * - `info` and `success`  → `role="status"` (polite live region)
 * - Close button is reachable via Tab and activatable via Enter / Space / Escape.
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & keyboard)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Each alert type uses the correct ARIA live-region role. ' +
          'The close button is fully keyboard accessible (Tab → Enter / Space / Escape). ' +
          'Status icons carry `aria-hidden="true"` as they are decorative.',
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <BAlert type="error"   message="Error (role=alert, assertive)"   :show-icon="true" :closable="true" />
        <BAlert type="warning" message="Warning (role=alert, assertive)" :show-icon="true" :closable="true" />
        <BAlert type="info"    message="Info (role=status, polite)"      :show-icon="true" :closable="true" />
        <BAlert type="success" message="Success (role=status, polite)"   :show-icon="true" :closable="true" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify ARIA roles
    const alerts = canvasElement.querySelectorAll('.b-alert');
    expect(alerts[0].getAttribute('role')).toBe('alert');
    expect(alerts[1].getAttribute('role')).toBe('alert');
    expect(alerts[2].getAttribute('role')).toBe('status');
    expect(alerts[3].getAttribute('role')).toBe('status');

    // Keyboard: focus the first (error) close button and activate with Enter
    const firstClose = canvas.getAllByRole('button', { name: /close alert/i })[0];
    firstClose.focus();
    expect(document.activeElement).toBe(firstClose);

    await userEvent.keyboard('{Enter}');
    // The Vue <Transition> leave animation keeps the element in the DOM briefly.
    // waitFor polls until v-if fully unmounts it after @after-leave fires.
    await waitFor(() => {
      expect(alerts[0].isConnected).toBe(false);
    });
  },
};

// ─────────────────────────────────────────────
// 8. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override the CSS custom properties to customise the appearance.
 * Every token is prefixed `--b-alert-*`.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-alert-*` CSS custom properties on the `.b-alert` element ' +
          '(or any ancestor) to customise colours without touching the component source.',
      },
      source: {
        code: `
<style>
.my-custom-alert {
  --b-alert-bg: #1a1a2e;
  --b-alert-border-color: #e94560;
  --b-alert-color: #eaeaea;
  --b-alert-icon-color: #e94560;
  --b-alert-close-color: #aaa;
  --b-alert-close-hover-color: #eaeaea;
}
</style>

<BAlert
  class="my-custom-alert"
  type="error"
  message="Custom themed alert"
  description="All colours are driven by CSS custom properties."
  :show-icon="true"
  :closable="true"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <!-- Default -->
        <BAlert
          type="info"
          message="Default theme"
          description="Standard look using design-system tokens."
          :show-icon="true"
        />

        <!-- Custom theme via inline CSS vars -->
        <BAlert
          type="error"
          message="Custom themed alert"
          description="All colours are driven by CSS custom properties."
          :show-icon="true"
          :closable="true"
          style="
            --b-alert-bg: #1a1a2e;
            --b-alert-border-color: #e94560;
            --b-alert-color: #eaeaea;
            --b-alert-icon-color: #e94560;
            --b-alert-close-color: #aaa;
            --b-alert-close-hover-color: #eaeaea;
          "
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Interaction test – close flow
// ─────────────────────────────────────────────
/**
 * Automated interaction test: verifies the full close flow (click → dismiss).
 */
export const InteractionClose: Story = {
  name: 'Interaction – close flow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Automated play function: clicks the close button and asserts the alert is removed.',
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <BAlert
        data-testid="alert"
        type="warning"
        message="This alert will be closed by the interaction test."
        :closable="true"
        :show-icon="true"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Alert is visible
    expect(canvasElement.querySelector('.b-alert')).toBeTruthy();

    // Close button is accessible by label
    const closeBtn = canvas.getByRole('button', { name: /close alert/i });
    expect(closeBtn).toBeTruthy();

    // Click the close button
    await userEvent.click(closeBtn);

    // The Vue <Transition> leave animation keeps the element in the DOM briefly.
    // waitFor polls until the element is fully removed (v-if unmounts after @after-leave).
    await waitFor(() => {
      expect(canvasElement.querySelector('.b-alert')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-alert-padding-h',
    defaultValue: '1rem',
    description: 'Horizontal padding of the alert (AntD: defaultPadding inline).',
  },
  {
    token: '--b-alert-padding-v',
    defaultValue: '0.5rem',
    description: 'Vertical padding of the alert (AntD: defaultPadding block).',
  },
  {
    token: '--b-alert-icon-size-with-desc',
    defaultValue: '1.5rem',
    description: 'Icon size when description is present (AntD: withDescriptionIconSize).',
  },
  // Note: AntD withDescriptionPadding is not yet implemented as a dedicated var.
  // ── Local extras ──
  {
    token: '--b-alert-bg',
    defaultValue: 'oklch(95% 0.04 240)',
    description: 'Background color of the alert (varies per type).',
  },
  {
    token: '--b-alert-color',
    defaultValue: 'oklch(35% 0.12 240)',
    description: 'Text color of the alert (varies per type).',
  },
  {
    token: '--b-alert-border-color',
    defaultValue: 'oklch(80% 0.1 240)',
    description: 'Border color of the alert (varies per type).',
  },
  {
    token: '--b-alert-border-radius',
    defaultValue: '0.5rem',
    description: 'Corner radius of the alert.',
  },
  {
    token: '--b-alert-border-width',
    defaultValue: '1px',
    description: 'Border width of the alert.',
  },
  {
    token: '--b-alert-icon-color',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Color of the leading icon (varies per type).',
  },
  {
    token: '--b-alert-icon-size',
    defaultValue: '1rem',
    description: 'Default icon size when no description is present.',
  },
  {
    token: '--b-alert-gap',
    defaultValue: '0.5rem',
    description: 'Gap between icon, message, and close button.',
  },
  {
    token: '--b-alert-close-color',
    defaultValue: 'oklch(50% 0.05 240)',
    description: 'Color of the close icon.',
  },
  {
    token: '--b-alert-close-hover-color',
    defaultValue: 'oklch(35% 0.12 240)',
    description: 'Hover color of the close icon.',
  },
  {
    token: '--b-alert-transition-duration',
    defaultValue: '300ms',
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
          'Reference table of every <code>--b-alert-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
      },
    },
  },
  render: () => ({
    components: { BAlert },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BAlert — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-alert</code>. Override inline or via a CSS class. The default values listed reflect the <em>info</em> type; <em>success</em>, <em>warning</em>, and <em>error</em> override colors at the type-class level.
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
          Four tokens overridden inline (background, color, border, radius).
        </p>
        <BAlert
          message="Themed alert"
          description="Override --b-alert-* tokens to retheme."
          style="
            --b-alert-bg: oklch(96% 0.04 290);
            --b-alert-color: oklch(35% 0.18 290);
            --b-alert-border-color: oklch(80% 0.14 290);
            --b-alert-border-radius: 16px;
          "
        />
      </div>
    `,
  }),
};
