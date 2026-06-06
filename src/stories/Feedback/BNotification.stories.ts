import { BButton, BNotification } from '@/components';
import { BNotificationPlacement, BNotificationType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BNotification — corner-anchored floating card with type, optional description, and actions.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Notification',
  component: BNotification,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BNotificationType),
      description: 'Notification severity / status type.',
      table: { category: 'Props', defaultValue: { summary: BNotificationType.Info } },
    },
    message: {
      control: 'text',
      description: 'Short title / heading of the notification.',
      table: { category: 'Props' },
    },
    description: {
      control: 'text',
      description: 'Optional detailed description below the title.',
      table: { category: 'Props' },
    },
    placement: {
      control: 'select',
      options: Object.values(BNotificationPlacement),
      description: 'Placement of the notification on the viewport.',
      table: { category: 'Props', defaultValue: { summary: BNotificationPlacement.TopRight } },
    },
    duration: {
      control: 'number',
      description: 'Time (seconds) before auto-close. Set to `0` to disable auto-close.',
      table: { category: 'Props', defaultValue: { summary: '4.5' } },
    },
    closable: {
      control: 'boolean',
      description: 'Show the close button.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon when `type` is set.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    modelValue: {
      control: 'boolean',
      description:
        'Controlled visibility. Notifications are closed by default and must be opened explicitly.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'false' } },
    },
    icon: { control: false, description: 'Slot to override the leading icon.', table: { category: 'Slots' } },
    closeIcon: { control: false, description: 'Slot to override the close icon.', table: { category: 'Slots' } },
    btn: { control: false, description: 'Slot for action buttons below the description.', table: { category: 'Slots' } },
    onClose: { description: 'Fires when the notification starts to close.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BNotification</code> component displays a floating notification card in a corner of the viewport.<br><br>' +
          'It supports four types — <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, <strong>error</strong>.<br>' +
          'Notifications are <strong>closed by default</strong> and must be opened explicitly via <code>v-model</code>.<br>' +
          'They auto-close after a configurable duration (default 4.5s), pause on hover, and dismiss on the close button or <kbd>Escape</kbd>.',
      },
    },
  },
} satisfies Meta<typeof BNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — tweak via Controls and click "Show" to display. */
export const Default: Story = {
  args: {
    type: BNotificationType.Info,
    message: 'Notification Title',
    description: 'This is the notification description with additional detail.',
    placement: BNotificationPlacement.TopRight,
    duration: 4.5,
    closable: true,
    showIcon: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BButton @click="visible = true">Show</BButton>
<BNotification v-model="visible" type="info" message="Notification Title" description="…" />
        `,
      },
    },
  },
  render: (args) => ({
    components: { BNotification, BButton },
    setup: () => ({ args, visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Notification</BButton>
      <BNotification v-model="visible" v-bind="args" />
    `,
  }),
};

/** Success — completed actions. */
export const Success: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="success" message="Success" description="Operation completed." />`,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Success</BButton>
      <BNotification v-model="visible" type="success" message="Success" description="Operation completed successfully." />
    `,
  }),
};

/** Info — neutral informational notice. */
export const Info: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="info" message="Info" description="Here is some information." />`,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Info</BButton>
      <BNotification v-model="visible" type="info" message="Info" description="Here is some useful information." />
    `,
  }),
};

/** Warning — caution required. */
export const Warning: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="warning" message="Warning" description="Please review the input." />`,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Warning</BButton>
      <BNotification v-model="visible" type="warning" message="Warning" description="Please review the input values." />
    `,
  }),
};

/** Error — destructive / failed actions. */
export const Error: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="error" message="Error" description="Something went wrong." />`,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Error</BButton>
      <BNotification v-model="visible" type="error" message="Error" description="Something went wrong. Please try again." />
    `,
  }),
};

/** All four corner placements — pick one per notification. */
export const AllPlacements: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BNotification v-model="visible" placement="top-right"   message="Top Right" />
<BNotification v-model="visible" placement="top-left"    message="Top Left" />
<BNotification v-model="visible" placement="bottom-right" message="Bottom Right" />
<BNotification v-model="visible" placement="bottom-left"  message="Bottom Left" />
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup() {
      const placements = Object.values(BNotificationPlacement);
      const visibleMap = Object.fromEntries(placements.map((p) => [p, ref(false)]));
      function show(p: string) {
        visibleMap[p].value = true;
      }
      return { placements, visibleMap, show };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
        <BButton v-for="p in placements" :key="p" size="sm" @click="show(p)">{{ p }}</BButton>
      </div>
      <BNotification
        v-for="p in placements"
        :key="p"
        v-model="visibleMap[p].value"
        :placement="p"
        type="info"
        :message="p"
        description="Click × or wait for auto-close."
        :duration="4.5"
      />
    `,
  }),
};

/** Suppress the leading status icon. */
export const WithoutIcon: Story = {
  parameters: {
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="info" message="No Icon" :show-icon="false" />`,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show (no icon)</BButton>
      <BNotification
        v-model="visible"
        type="info"
        message="Notification without icon"
        description="showIcon=false suppresses the built-in icon."
        :show-icon="false"
        :duration="0"
      />
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Persistent notification controlled by parent state. */
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(false);
</script>
<template>
  <BButton @click="visible = !visible">Toggle</BButton>
  <BNotification v-model="visible" type="info" message="Controlled" description="Via v-model." :duration="0" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }} notification</BButton>
      <BNotification
        v-model="visible"
        type="info"
        message="Controlled Notification"
        description="This notification is controlled via v-model (duration=0)."
        :duration="0"
      />
    `,
  }),
};

/** Action buttons in the `btn` slot — typical for actionable confirmations. */
export const WithAction: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BNotification v-model="visible" type="success" message="File Uploaded" description="Your file is ready.">
  <template #btn>
    <BButton size="sm" variant="text" @click="visible = false">Dismiss</BButton>
    <BButton size="sm">View File</BButton>
  </template>
</BNotification>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show with Action</BButton>
      <BNotification
        v-model="visible"
        type="success"
        message="File Uploaded"
        description="Your file has been uploaded successfully."
        :duration="0"
      >
        <template #btn>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <BButton size="sm" variant="text" @click="visible = false">Dismiss</BButton>
            <BButton size="sm">View File</BButton>
          </div>
        </template>
      </BNotification>
    `,
  }),
};

/** Override the built-in icon via the `icon` slot. */
export const CustomIcon: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BNotification v-model="visible" message="Custom Icon">
  <template #icon><span style="font-size:1.5rem;">🎉</span></template>
</BNotification>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Custom Icon</BButton>
      <BNotification
        v-model="visible"
        message="Custom Icon Notification"
        description="The icon has been overridden via the icon slot."
        :duration="0"
      >
        <template #icon>
          <span style="font-size:1.5rem;line-height:1;" aria-hidden="true">🎉</span>
        </template>
      </BNotification>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Each notification type maps to the correct ARIA live-region role:
 * `error` and `warning` → `role="alert"` (assertive); `info` and `success` → `role="status"` (polite).
 * The close button has `aria-label="Close notification"` and Escape dismisses a focused notification.
 * `aria-labelledby` and `aria-describedby` link to the message/description elements.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Click "Show All" to trigger every type. Error / warning use <code>role="alert"</code>; info / success use <code>role="status"</code>. The close button is labelled and Escape closes a focused notification.',
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup() {
      const visError = ref(false);
      const visWarning = ref(false);
      const visInfo = ref(false);
      const visSuccess = ref(false);
      function showAll() {
        visError.value = true;
        visWarning.value = true;
        visInfo.value = true;
        visSuccess.value = true;
      }
      return { visError, visWarning, visInfo, visSuccess, showAll };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <BButton size="sm" data-testid="show-all-btn" @click="showAll">Show All</BButton>
        <BNotification v-model="visError"   type="error"   message="Error"   description="Error (role=alert, assertive)"   :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visWarning" type="warning" message="Warning" description="Warning (role=alert, assertive)" :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visInfo"    type="info"    message="Info"    description="Info (role=status, polite)"      :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visSuccess" type="success" message="Success" description="Success (role=status, polite)"   :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(document.querySelectorAll('.b-notification').length).toBe(0);

    const showAllBtn = canvas.getByTestId('show-all-btn');
    await userEvent.click(showAllBtn);

    await waitFor(() => {
      expect(document.querySelectorAll('.b-notification').length).toBe(4);
    });

    const notifications = document.querySelectorAll('.b-notification');

    expect(notifications[0].getAttribute('role')).toBe('alert');
    expect(notifications[1].getAttribute('role')).toBe('alert');
    expect(notifications[2].getAttribute('role')).toBe('status');
    expect(notifications[3].getAttribute('role')).toBe('status');

    expect(notifications[0].getAttribute('aria-live')).toBe('assertive');
    expect(notifications[1].getAttribute('aria-live')).toBe('assertive');
    expect(notifications[2].getAttribute('aria-live')).toBe('polite');
    expect(notifications[3].getAttribute('aria-live')).toBe('polite');

    for (const n of notifications) {
      expect(n.getAttribute('aria-atomic')).toBe('true');
    }

    const icons = document.querySelectorAll('.b-notification__icon');
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }

    const closeBtns = document.querySelectorAll('.b-notification__close');
    for (const btn of closeBtns) {
      expect(btn.getAttribute('aria-label')).toBe('Close notification');
      expect(btn.getAttribute('type')).toBe('button');
    }

    for (const n of notifications) {
      const labelledby = n.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      const titleEl = n.querySelector('.b-notification__message');
      expect(titleEl?.id).toBe(labelledby);
    }

    for (const n of notifications) {
      const describedby = n.getAttribute('aria-describedby');
      expect(describedby).toBeTruthy();
      const descEl = n.querySelector('.b-notification__description');
      expect(descEl?.id).toBe(describedby);
    }

    // Escape on first notification dismisses it
    const firstNotif = notifications[0] as HTMLElement;
    firstNotif.focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelectorAll('.b-notification').length).toBe(3);
    });
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-notification-bg`, `--b-notification-title-color`, `--b-notification-icon-color`,
 * and `--b-notification-shadow` to retheme.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-notification-bg</code>, <code>--b-notification-title-color</code>, <code>--b-notification-icon-color</code>, and <code>--b-notification-shadow</code> to retheme without touching component source.',
      },
      source: {
        code: `
<BNotification
  v-model="visible"
  type="error"
  message="Custom Theme"
  description="Override CSS vars to brand this component."
  :duration="0"
  style="
    --b-notification-bg: #1a1a2e;
    --b-notification-title-color: #eaeaea;
    --b-notification-desc-color: #a0a0c0;
    --b-notification-icon-color: #e94560;
    --b-notification-shadow: 0 4px 16px rgba(233,69,96,0.3);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification, BButton },
    setup() {
      const visDefault = ref(false);
      const visCustom = ref(false);
      function showBoth() {
        visDefault.value = true;
        visCustom.value = true;
      }
      return { visDefault, visCustom, showBoth };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <BButton size="sm" @click="showBoth">Show Themed Notifications</BButton>
        <BNotification
          v-model="visDefault"
          type="info"
          message="Default Theme"
          description="This uses the built-in CSS variable defaults."
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        />
        <BNotification
          v-model="visCustom"
          type="error"
          message="Custom Theme"
          description="Override --b-notification-* CSS vars for full control."
          :duration="0"
          style="
            position:relative;top:auto;right:auto;bottom:auto;left:auto;
            --b-notification-bg: #1a1a2e;
            --b-notification-title-color: #eaeaea;
            --b-notification-desc-color: #a0a0c0;
            --b-notification-icon-color: #e94560;
            --b-notification-shadow: 0 4px 16px rgba(233,69,96,0.3);
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
  { token: '--b-notification-width', defaultValue: '24rem', description: 'Width of a single notification.' },
  { token: '--b-notification-z-index', defaultValue: '2050', description: 'z-index of the notification stack.' },
  { token: '--b-notification-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the container.' },
  { token: '--b-notification-border-color', defaultValue: 'oklch(92% 0.005 260)', description: 'Border color of the container.' },
  { token: '--b-notification-border-radius', defaultValue: '0.5rem', description: 'Corner radius.' },
  { token: '--b-notification-shadow', defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)', description: 'Box shadow.' },
  { token: '--b-notification-padding-h', defaultValue: '1.5rem', description: 'Horizontal padding.' },
  { token: '--b-notification-padding-v', defaultValue: '1rem', description: 'Vertical padding.' },
  { token: '--b-notification-gap', defaultValue: '0.75rem', description: 'Gap between icon, content, and close button.' },
  { token: '--b-notification-title-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Title text color.' },
  { token: '--b-notification-desc-color', defaultValue: 'oklch(20% 0.005 260 / 65%)', description: 'Description text color.' },
  { token: '--b-notification-font-size-title', defaultValue: '1rem', description: 'Title font size.' },
  { token: '--b-notification-font-size-desc', defaultValue: '0.875rem', description: 'Description font size.' },
  { token: '--b-notification-line-height', defaultValue: '1.5', description: 'Line height.' },
  { token: '--b-notification-icon-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the leading icon (varies per type).' },
  { token: '--b-notification-icon-size', defaultValue: '1.5rem', description: 'Size of the leading icon.' },
  { token: '--b-notification-close-color', defaultValue: 'oklch(50% 0.005 260)', description: 'Close button color.' },
  { token: '--b-notification-close-hover-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Close button hover color.' },
  { token: '--b-notification-close-size', defaultValue: '1rem', description: 'Close button icon size.' },
  { token: '--b-notification-offset', defaultValue: '1.5rem', description: 'Distance from the viewport edge.' },
  { token: '--b-notification-transition-duration', defaultValue: '300ms', description: 'Enter/leave animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BNotification</code>. Override on any ancestor (notifications render in a body portal).',
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BNotification — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-notification</code>. Notifications render in a portal anchored to the viewport edge.
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
