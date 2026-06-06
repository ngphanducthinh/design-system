import { BButton, BMessage } from '@/components';
import { BMessageType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BMessage — lightweight feedback shown at the top of the viewport.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Message',
  component: BMessage,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BMessageType),
      description: 'Message severity / status type.',
      table: { category: 'Props', defaultValue: { summary: BMessageType.Info } },
    },
    content: {
      control: 'text',
      description: 'The message content text.',
      table: { category: 'Props' },
    },
    duration: {
      control: 'number',
      description: 'Time (seconds) before auto-close. Set to `0` to disable auto-close.',
      table: { category: 'Props', defaultValue: { summary: '3' } },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon.',
      table: { category: 'Props', defaultValue: { summary: 'true' } },
    },
    modelValue: {
      control: 'boolean',
      description:
        'Controlled visibility. Messages are closed by default and must be opened explicitly via v-model.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'false' } },
    },
    onClose: { description: 'Fires when the message starts to close.', table: { category: 'Events' } },
    onAfterClose: { description: 'Fires after the leave-transition completes.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BMessage</code> component provides lightweight feedback displayed at the top of the viewport.<br><br>' +
          'It supports five types — <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, <strong>error</strong>, <strong>loading</strong>.<br>' +
          'Messages are <strong>closed by default</strong> and must be opened explicitly via <code>v-model</code>.<br>' +
          'They auto-close after a configurable duration (default 3s) and pause on hover. Renders in a portal at <code>&lt;body&gt;</code>.',
      },
    },
  },
} satisfies Meta<typeof BMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — tweak via the Controls panel and click "Show" to display. */
export const Default: Story = {
  args: {
    type: BMessageType.Info,
    content: 'This is an informational message.',
    duration: 3,
    showIcon: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<BButton @click="visible = true">Show</BButton>
<BMessage v-model="visible" type="info" content="This is an informational message." />
        `,
      },
    },
  },
  render: (args) => ({
    components: { BMessage, BButton },
    setup() {
      const visible = ref(false);
      return { args, visible };
    },
    template: `
      <BButton size="sm" @click="visible = true">Show Message</BButton>
      <BMessage v-model="visible" v-bind="args" />
    `,
  }),
};

/** Success — completed actions. */
export const Success: Story = {
  parameters: {
    docs: {
      source: { code: `<BMessage v-model="visible" type="success" content="Operation completed successfully." />` },
    },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Success</BButton>
      <BMessage v-model="visible" type="success" content="Operation completed successfully." />
    `,
  }),
};

/** Info — neutral messages. */
export const Info: Story = {
  parameters: {
    docs: { source: { code: `<BMessage v-model="visible" type="info" content="Here is some information." />` } },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Info</BButton>
      <BMessage v-model="visible" type="info" content="Here is some useful information." />
    `,
  }),
};

/** Warning — caution. */
export const Warning: Story = {
  parameters: {
    docs: { source: { code: `<BMessage v-model="visible" type="warning" content="Please review the input." />` } },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Warning</BButton>
      <BMessage v-model="visible" type="warning" content="Please review the input values." />
    `,
  }),
};

/** Error — destructive / failed actions. */
export const Error: Story = {
  parameters: {
    docs: { source: { code: `<BMessage v-model="visible" type="error" content="Something went wrong." />` } },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Error</BButton>
      <BMessage v-model="visible" type="error" content="Something went wrong." />
    `,
  }),
};

/** Loading — async operation in progress. The icon is an animated spinner. */
export const Loading: Story = {
  parameters: {
    docs: { source: { code: `<BMessage v-model="visible" type="loading" content="Loading…" :duration="0" />` } },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show Loading</BButton>
      <BMessage v-model="visible" type="loading" content="Loading data…" :duration="0" />
    `,
  }),
};

/** Suppress the leading status icon entirely. */
export const WithoutIcon: Story = {
  parameters: {
    docs: { source: { code: `<BMessage v-model="visible" type="info" content="No icon" :show-icon="false" />` } },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = true">Show (no icon)</BButton>
      <BMessage v-model="visible" type="info" content="This message has no icon." :show-icon="false" />
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Persistent message — set `:duration="0"` and toggle via v-model. */
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
  <BMessage v-model="visible" type="info" content="Persistent message." :duration="0" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup: () => ({ visible: ref(false) }),
    template: `
      <BButton size="sm" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }} message</BButton>
      <BMessage v-model="visible" type="info" content="Persistent message (duration=0)." :duration="0" />
    `,
  }),
};

/** Sequential success after an async action. */
export const SaveFlow: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BButton @click="save">Save</BButton>
<BMessage v-model="loading" type="loading" content="Saving…" :duration="0" />
<BMessage v-model="success" type="success" content="Saved!" :duration="2" />
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup() {
      const loading = ref(false);
      const success = ref(false);
      function save() {
        loading.value = true;
        setTimeout(() => {
          loading.value = false;
          success.value = true;
        }, 1500);
      }
      return { loading, success, save };
    },
    template: `
      <BButton size="sm" @click="save">Save</BButton>
      <BMessage v-model="loading" type="loading" content="Saving…" :duration="0" />
      <BMessage v-model="success" type="success" content="Saved successfully!" :duration="2" />
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * Each message type maps to the correct ARIA live-region role:
 * `error` and `warning` use `role="alert"` (assertive); `info`, `success`, and `loading`
 * use `role="status"` (polite). All status icons carry `aria-hidden="true"`.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Click "Show All" to trigger every type. Error and warning use <code>role="alert"</code> with <code>aria-live="assertive"</code>; info, success, and loading use <code>role="status"</code> with <code>aria-live="polite"</code>.',
      },
    },
  },
  render: () => ({
    components: { BMessage, BButton },
    setup() {
      const visError = ref(false);
      const visWarning = ref(false);
      const visInfo = ref(false);
      const visSuccess = ref(false);
      const visLoading = ref(false);
      function showAll() {
        visError.value = true;
        visWarning.value = true;
        visInfo.value = true;
        visSuccess.value = true;
        visLoading.value = true;
      }
      return { visError, visWarning, visInfo, visSuccess, visLoading, showAll };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <BButton size="sm" data-testid="show-all-btn" @click="showAll">Show All</BButton>
        <BMessage v-model="visError"   type="error"   content="Error (role=alert, assertive)"   :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visWarning" type="warning" content="Warning (role=alert, assertive)" :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visInfo"    type="info"    content="Info (role=status, polite)"      :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visSuccess" type="success" content="Success (role=status, polite)"   :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visLoading" type="loading" content="Loading (role=status, polite)"   :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const showAllBtn = canvas.getByTestId('show-all-btn');
    await userEvent.click(showAllBtn);

    await waitFor(() => {
      expect(document.querySelectorAll('.b-message').length).toBe(5);
    });

    const messages = document.querySelectorAll('.b-message');

    expect(messages[0].getAttribute('role')).toBe('alert');
    expect(messages[1].getAttribute('role')).toBe('alert');
    expect(messages[2].getAttribute('role')).toBe('status');
    expect(messages[3].getAttribute('role')).toBe('status');
    expect(messages[4].getAttribute('role')).toBe('status');

    expect(messages[0].getAttribute('aria-live')).toBe('assertive');
    expect(messages[1].getAttribute('aria-live')).toBe('assertive');
    expect(messages[2].getAttribute('aria-live')).toBe('polite');
    expect(messages[3].getAttribute('aria-live')).toBe('polite');
    expect(messages[4].getAttribute('aria-live')).toBe('polite');

    for (const msg of messages) {
      expect(msg.getAttribute('aria-atomic')).toBe('true');
    }

    const icons = document.querySelectorAll('.b-message__icon');
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }

    const svgs = document.querySelectorAll('.b-message__icon-svg');
    for (const svg of svgs) {
      expect(svg.getAttribute('focusable')).toBe('false');
    }
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * Override `--b-message-bg`, `--b-message-color`, `--b-message-icon-color`, and
 * `--b-message-shadow` on the `.b-message` element (or any ancestor) to retheme.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Override <code>--b-message-bg</code>, <code>--b-message-color</code>, <code>--b-message-icon-color</code>, and <code>--b-message-shadow</code> to retheme.',
      },
      source: {
        code: `
<BMessage
  v-model="visible"
  type="error"
  content="Custom themed message"
  :duration="0"
  style="
    --b-message-bg: #1a1a2e;
    --b-message-color: #eaeaea;
    --b-message-icon-color: #e94560;
    --b-message-shadow: 0 4px 12px rgba(233,69,96,0.3);
  "
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage, BButton },
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
        <BButton size="sm" @click="showBoth">Show Themed Messages</BButton>
        <BMessage
          v-model="visDefault"
          type="info"
          content="Default theme"
          :duration="0"
          style="position:relative;top:auto;left:auto;transform:none;"
        />
        <BMessage
          v-model="visCustom"
          type="error"
          content="Custom themed message"
          :duration="0"
          style="
            position:relative;top:auto;left:auto;transform:none;
            --b-message-bg: #1a1a2e;
            --b-message-color: #eaeaea;
            --b-message-icon-color: #e94560;
            --b-message-shadow: 0 4px 12px rgba(233,69,96,0.3);
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
  { token: '--b-message-bg', defaultValue: 'oklch(100% 0 0)', description: 'Background color of the message container.' },
  { token: '--b-message-padding-h', defaultValue: '1rem', description: 'Horizontal padding of the message.' },
  { token: '--b-message-padding-v', defaultValue: '0.625rem', description: 'Vertical padding of the message.' },
  { token: '--b-message-color', defaultValue: 'oklch(20% 0.005 260 / 88%)', description: 'Primary text color.' },
  { token: '--b-message-border-color', defaultValue: 'oklch(92% 0.005 260)', description: 'Border color around the container.' },
  { token: '--b-message-border-radius', defaultValue: '0.5rem', description: 'Corner radius.' },
  { token: '--b-message-shadow', defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)', description: 'Box shadow.' },
  { token: '--b-message-font-size', defaultValue: '0.875rem', description: 'Font size of the message text.' },
  { token: '--b-message-icon-color', defaultValue: 'oklch(62.3% 0.214 259.815)', description: 'Color of the leading icon (varies per type).' },
  { token: '--b-message-icon-size', defaultValue: '1rem', description: 'Size of the leading icon.' },
  { token: '--b-message-gap', defaultValue: '0.5rem', description: 'Gap between icon and message text.' },
  { token: '--b-message-max-width', defaultValue: '32rem', description: 'Maximum width of a single message.' },
  { token: '--b-message-top', defaultValue: '1rem', description: 'Distance from the top of the viewport.' },
  { token: '--b-message-transition-duration', defaultValue: '300ms', description: 'Enter/leave animation duration.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'All scoped CSS variables exposed by <code>BMessage</code>. Override on any ancestor (messages render in a body portal).',
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BMessage — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          All tokens scoped to <code>.b-message</code>. Messages render in a portal at the top of the viewport.
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
