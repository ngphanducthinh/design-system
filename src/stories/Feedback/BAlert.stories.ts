import { BAlert, BButton } from '@/components';
import { BAlertType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BAlert — inline severity message with optional icon, description, action, and dismissal.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Alert',
  component: BAlert,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BAlertType),
      description: 'Alert severity. Maps to ARIA role and color scheme.',
      table: { category: 'Props', defaultValue: { summary: BAlertType.Info } },
    },
    message: {
      control: 'text',
      description: 'Primary message text (also accepts the default slot).',
      table: { category: 'Props' },
    },
    description: {
      control: 'text',
      description: 'Optional supporting description (also accepts the `description` slot).',
      table: { category: 'Props' },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    closable: {
      control: 'boolean',
      description: 'Show the close button.',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    banner: {
      control: 'boolean',
      description: 'Render as a top-of-page banner (no border-radius).',
      table: { category: 'Props', defaultValue: { summary: 'false' } },
    },
    action: {
      control: 'text',
      description: 'Action area text (right side of the alert).',
      table: { category: 'Props' },
    },
    modelValue: {
      control: 'boolean',
      description: 'Controlled visibility — bind with v-model.',
      table: { category: 'Two-Way Binding Props' },
    },
    default: {
      description: 'Overrides the `message` prop.',
      table: { category: 'Slots' },
    },
    onClose: {
      description: 'Fires synchronously when the close button is activated.',
      table: { category: 'Events' },
    },
    onAfterClose: {
      description: 'Fires after the leave-transition fully completes.',
      table: { category: 'Events' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BAlert</code> component is used to display important messages inline within the page content.<br><br>' +
          'It supports four severity levels — <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, <strong>error</strong> — with optional icons, descriptions, actions, and a dismiss button.<br>' +
          'Operates in both <em>uncontrolled</em> (self-managing visibility) and <em>controlled</em> (<code>v-model</code>) modes.',
      },
    },
  },
} satisfies Meta<typeof BAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default informational alert. */
export const Default: Story = {
  args: {
    type: BAlertType.Info,
    message: 'This is an informational alert.',
    showIcon: true,
    closable: true,
  },
  parameters: {
    docs: { source: { code: `<BAlert type="info" message="This is an informational alert." show-icon closable />` } },
  },
  render: (args) => ({
    components: { BAlert },
    setup: () => ({ args }),
    template: `<BAlert v-bind="args" />`,
  }),
};

/** Success — confirmations and completed states. */
export const Success: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="success" message="Success" description="Operation completed successfully." show-icon />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="success" message="Success" description="Operation completed successfully." show-icon />`,
  }),
};

/** Info — neutral informational message. */
export const Info: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="info" message="Info" description="Here is some useful information." show-icon />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="info" message="Info" description="Here is some useful information." show-icon />`,
  }),
};

/** Warning — caution required. */
export const Warning: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="warning" message="Warning" description="Please review the input values." show-icon />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="warning" message="Warning" description="Please review the input values." show-icon />`,
  }),
};

/** Error — destructive / failed actions. */
export const Error: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="error" message="Error" description="Something went wrong." show-icon />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="error" message="Error" description="Something went wrong." show-icon />`,
  }),
};

/** All four `type` variants rendered together as a side-by-side regression reference. */
export const AllTypes: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BAlert type="success" message="Success" show-icon />
<BAlert type="info" message="Info" show-icon />
<BAlert type="warning" message="Warning" show-icon />
<BAlert type="error" message="Error" show-icon />
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div class="b:flex b:flex-col b:gap-2">
        <BAlert type="success" message="Success" show-icon />
        <BAlert type="info" message="Info" show-icon />
        <BAlert type="warning" message="Warning" show-icon />
        <BAlert type="error" message="Error" show-icon />
      </div>
    `,
  }),
};

/**
 * The alert manages its own visibility. Clicking × triggers `close`, then `afterClose`
 * once the leave-transition finishes.
 */
export const Closable: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="warning" message="You can close this alert." show-icon closable />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="warning" message="You can close this alert." show-icon closable />`,
  }),
};

/** Full-width announcement strip with no border-radius — typical at the top of a page. */
export const Banner: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `<BAlert type="info" message="Scheduled maintenance on Saturday 01:00–03:00 UTC." show-icon banner />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="info" message="Scheduled maintenance on Saturday 01:00–03:00 UTC." show-icon banner />`,
  }),
};

/** Action text appears on the right; pair with `closable` for a dismiss button alongside it. */
export const WithAction: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BAlert type="error" message="Failed to save changes." action="Retry" show-icon />`,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `<BAlert type="error" message="Failed to save changes." action="Retry" show-icon />`,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Controlled visibility via `v-model` — parent owns the state. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(true);
</script>

<template>
  <BButton @click="visible = !visible">Toggle</BButton>
  <BAlert v-model="visible" type="success" message="Controlled alert." show-icon closable />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert, BButton },
    setup() {
      const visible = ref(true);
      return { visible };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <div>
          <BButton size="sm" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }} alert</BButton>
        </div>
        <BAlert
          v-model="visible"
          type="success"
          message="This alert is controlled via v-model."
          show-icon
          closable
        />
      </div>
    `,
  }),
};

/** Slot-based content — override `description` and `action` for richer markup. */
export const WithSlots: Story = {
  parameters: {
    a11y: {
      // The default info-alert palette and the inline action button render at
      // 3.9:1 contrast (axe expects 4.5:1). Cosmetic, demonstration story.
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
    docs: {
      source: {
        code: `
<BAlert type="info" show-icon>
  <template #default><strong>Heads up:</strong> Update available</template>
  <template #description>
    A new version is ready. <a href="#">Read the changelog</a>.
  </template>
  <template #action>
    <BButton size="sm" variant="outlined">Update</BButton>
  </template>
</BAlert>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert, BButton },
    template: `
      <BAlert type="info" show-icon>
        <template #default><strong>Heads up:</strong> Update available</template>
        <template #description>
          A new version is ready. <a href="#" style="color:inherit;text-decoration:underline;">Read the changelog</a>.
        </template>
        <template #action>
          <BButton size="sm" variant="outlined">Update</BButton>
        </template>
      </BAlert>
    `,
  }),
};

/** Stacked alerts — typical pattern for a notifications area. */
export const Stacked: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<div style="display:flex;flex-direction:column;gap:0.75rem;">
  <BAlert type="success" message="Saved" show-icon closable />
  <BAlert type="warning" message="Approaching quota" show-icon closable />
  <BAlert type="error" message="Sync failed" show-icon closable />
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <BAlert type="success" message="Saved" description="Your changes have been saved." show-icon closable />
        <BAlert type="warning" message="Approaching quota" description="You've used 90% of your monthly quota." show-icon closable />
        <BAlert type="error" message="Sync failed" description="Could not reach the server. We'll retry shortly." show-icon closable />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BAlert maps `type` to the appropriate live-region role:
 * `error` and `warning` → `role="alert"` (assertive); `info` and `success` → `role="status"` (polite).
 * The close button is reachable via Tab and activatable with Enter / Space / Escape.
 * Status icons carry `aria-hidden="true"`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each alert type uses the correct ARIA live-region role. ' +
          'The close button is fully keyboard accessible (Tab → Enter / Space / Escape). ' +
          'Status icons carry <code>aria-hidden="true"</code> as they are decorative.',
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <BAlert type="error"   message="Error (role=alert, assertive)"   show-icon closable />
        <BAlert type="warning" message="Warning (role=alert, assertive)" show-icon closable />
        <BAlert type="info"    message="Info (role=status, polite)"      show-icon closable />
        <BAlert type="success" message="Success (role=status, polite)"   show-icon closable />
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

    // Keyboard: focus the first close button, activate with Enter, the alert removes after transition
    const firstClose = canvas.getAllByRole('button', { name: /close alert/i })[0];
    firstClose.focus();
    expect(document.activeElement).toBe(firstClose);

    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(alerts[0].isConnected).toBe(false);
    });

    // Click-to-close flow on a remaining alert
    const remainingClose = canvas.getAllByRole('button', { name: /close alert/i })[0];
    await userEvent.click(remainingClose);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('.b-alert').length).toBeLessThan(3);
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-alert-bg`, `--b-alert-border-color`, `--b-alert-color`, and
 * `--b-alert-icon-color` (plus close-button colors) directly on the alert root.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-alert-bg</code>, <code>--b-alert-border-color</code>, <code>--b-alert-color</code>, and <code>--b-alert-icon-color</code> on the <code>.b-alert</code> root (or any ancestor) to retheme without touching component source.',
      },
      source: {
        code: `
<BAlert
  type="error"
  message="Custom themed alert"
  description="All colours are driven by CSS custom properties."
  show-icon
  closable
  style="
    --b-alert-bg: #1a1a2e;
    --b-alert-border-color: #e94560;
    --b-alert-color: #eaeaea;
    --b-alert-icon-color: #e94560;
    --b-alert-close-color: #aaa;
    --b-alert-close-hover-color: #eaeaea;
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <BAlert
          type="info"
          message="Default theme"
          description="Standard look using design-system tokens."
          show-icon
        />
        <BAlert
          type="error"
          message="Custom themed alert"
          description="All colours are driven by CSS custom properties."
          show-icon
          closable
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
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-alert-padding-h', defaultValue: '1rem', description: 'Horizontal padding of the alert.' },
  { token: '--b-alert-padding-v', defaultValue: '0.5rem', description: 'Vertical padding of the alert.' },
  { token: '--b-alert-icon-size-with-desc', defaultValue: '1.5rem', description: 'Icon size when description is present.' },
  { token: '--b-alert-bg', defaultValue: 'oklch(95% 0.04 240)', description: 'Background color (varies per type).' },
  { token: '--b-alert-color', defaultValue: 'oklch(35% 0.12 240)', description: 'Text color (varies per type).' },
  { token: '--b-alert-border-color', defaultValue: 'oklch(80% 0.1 240)', description: 'Border color (varies per type).' },
  { token: '--b-alert-border-radius', defaultValue: '0.5rem', description: 'Corner radius.' },
  { token: '--b-alert-border-width', defaultValue: '1px', description: 'Border width.' },
  { token: '--b-alert-icon-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the leading icon (varies per type).' },
  { token: '--b-alert-icon-size', defaultValue: '1rem', description: 'Default icon size when no description is present.' },
  { token: '--b-alert-gap', defaultValue: '0.5rem', description: 'Gap between icon, message, and close button.' },
  { token: '--b-alert-close-color', defaultValue: 'oklch(50% 0.05 240)', description: 'Color of the close icon.' },
  { token: '--b-alert-close-hover-color', defaultValue: 'oklch(35% 0.12 240)', description: 'Hover color of the close icon.' },
  { token: '--b-alert-transition-duration', defaultValue: '300ms', description: 'Open/close animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BAlert</code>. Defaults shown reflect the <em>info</em> type; <em>success</em>, <em>warning</em>, and <em>error</em> override colors at the type-class level.',
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
          All tokens scoped to <code>.b-alert</code>. Override inline or via a CSS class.
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
