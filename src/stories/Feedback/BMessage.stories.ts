import { BMessage } from '@/components';
import { BMessageType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Feedback/Message',
  component: BMessage,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BMessageType),
      description: 'Message severity / status type.',
      table: { defaultValue: { summary: BMessageType.Info } },
    },
    content: {
      control: 'text',
      description: 'The message content text.',
    },
    duration: {
      control: 'number',
      description: 'Time (seconds) before auto-close. Set to `0` to disable auto-close.',
      table: { defaultValue: { summary: '3' } },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon.',
      table: { defaultValue: { summary: 'true' } },
    },
    modelValue: {
      control: 'boolean',
      description:
        'Controlled visibility (bind with v-model). Messages are closed by default and must be opened explicitly.',
      table: {
        category: 'Two-Way Binding Props',
        defaultValue: { summary: 'false' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BMessage</code> component provides lightweight feedback displayed at the top of the viewport.<br><br>' +
          'It supports five types - <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, <strong>error</strong>, and <strong>loading</strong>.<br>' +
          'Messages are <strong>closed by default</strong> and must be opened explicitly via <code>v-model</code> or the exposed <code>open()</code> method.<br>' +
          'They auto-close after a configurable duration (default 3 s) and pause on mouse hover.<br>' +
          'The component teleports to <code>&lt;body&gt;</code> for proper stacking.',
      },
    },
  },
} satisfies Meta<typeof BMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Shared button style (keeps templates tidy)
// ─────────────────────────────────────────────
const btnStyle =
  'padding:0.375rem 0.875rem;border:1px solid #d0d0d0;border-radius:0.375rem;cursor:pointer;background:#fff;font-size:0.875rem;';

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 * Click **"Show Message"** to open it. It starts closed by default.
 */
export const Playground: Story = {
  args: {
    type: BMessageType.Info,
    content: 'This is an informational message.',
    duration: 3,
    showIcon: true,
  },
  render: (args) => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      function show() {
        visible.value = true;
      }
      return { args, visible, show, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="show">Show Message</button>
        <BMessage v-model="visible" v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. All types / variants
// ─────────────────────────────────────────────
/**
 * Click each button to trigger the corresponding message type.
 */
export const AllTypes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(false);
</script>
<button @click="visible = true">Show</button>
<BMessage v-model="visible" type="success" content="Operation completed." />
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const types = Object.values(BMessageType) as string[];
      const labels: Record<string, string> = {
        success: 'Operation completed successfully.',
        info: 'Here is some useful information.',
        warning: 'Please review the input values.',
        error: 'Something went wrong.',
        loading: 'Loading data…',
      };
      const visibleMap = Object.fromEntries(types.map((t) => [t, ref(false)]));
      function show(type: string) {
        visibleMap[type].value = true;
      }
      return { types, labels, visibleMap, show, btnStyle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start;">
        <div v-for="t in types" :key="t" style="display:flex;align-items:center;gap:0.5rem;">
          <button :style="btnStyle" @click="show(t)">
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
          <BMessage
            v-model="visibleMap[t].value"
            :type="t"
            :content="labels[t]"
            :duration="3"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. Auto-close with configurable duration
// ─────────────────────────────────────────────
/**
 * Click the button to show a message that auto-closes after 3 seconds.
 */
export const AutoClose: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(false);
</script>
<template>
  <button @click="visible = true">Show Message</button>
  <BMessage v-model="visible" type="success" content="Saved!" :duration="3" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      function show() {
        visible.value = true;
      }
      return { visible, show, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="show-btn" @click="show">
          Show Message (auto-close 3 s)
        </button>
        <BMessage
          v-model="visible"
          type="success"
          content="This message will auto-close in 3 seconds."
          :duration="3"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Controlled (v-model)
// ─────────────────────────────────────────────
/**
 * Controlled visibility via `v-model`. The parent owns the visible state.
 * Message starts closed and can be toggled with the button.
 */
export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<script setup>
const visible = ref(false);
</script>
<template>
  <button @click="visible = !visible">Toggle</button>
  <BMessage v-model="visible" type="info" content="Controlled message." :duration="0" />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="toggle-btn" @click="visible = !visible">
          {{ visible ? 'Hide' : 'Show' }} message
        </button>
        <BMessage
          v-model="visible"
          type="info"
          content="This message is controlled via v-model (duration=0, persistent)."
          :duration="0"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 5. Without icon
// ─────────────────────────────────────────────
/**
 * Messages can render without a status icon.
 */
export const WithoutIcon: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BMessage v-model="visible" type="info" content="No icon message." :show-icon="false" />`,
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      function show() {
        visible.value = true;
      }
      return { visible, show, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="show">Show Message (no icon)</button>
        <BMessage
          v-model="visible"
          type="info"
          content="This message has no icon."
          :show-icon="false"
          :duration="3"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates ARIA roles and live regions.
 * Click "Show All" to trigger all five message types.
 * - `error` and `warning` → `role="alert"` (assertive live region)
 * - `info`, `success`, and `loading` → `role="status"` (polite live region)
 * - Status icons carry `aria-hidden="true"` as they are decorative.
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles & live regions)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Click **"Show All"** to trigger every message type. ' +
          'Error and warning use `role="alert"` with `aria-live="assertive"`, ' +
          'while info, success, and loading use `role="status"` with `aria-live="polite"`. ' +
          'Status icons carry `aria-hidden="true"` as they are decorative.',
      },
    },
  },
  render: () => ({
    components: { BMessage },
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
      return { visError, visWarning, visInfo, visSuccess, visLoading, showAll, btnStyle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <button :style="btnStyle" data-testid="show-all-btn" @click="showAll">Show All</button>
        <BMessage v-model="visError"   type="error"   content="Error (role=alert, assertive)"   :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visWarning" type="warning" content="Warning (role=alert, assertive)" :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visInfo"    type="info"    content="Info (role=status, polite)"       :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visSuccess" type="success" content="Success (role=status, polite)"    :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
        <BMessage v-model="visLoading" type="loading" content="Loading (role=status, polite)"    :duration="0" style="position:relative;top:auto;left:auto;transform:none;" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click the button to show all messages
    const showAllBtn = canvas.getByTestId('show-all-btn');
    await userEvent.click(showAllBtn);

    // BMessage teleports to <body>, so query document - not canvasElement
    await waitFor(() => {
      expect(document.querySelectorAll('.b-message').length).toBe(5);
    });

    const messages = document.querySelectorAll('.b-message');

    // Verify ARIA roles
    expect(messages[0].getAttribute('role')).toBe('alert'); // error
    expect(messages[1].getAttribute('role')).toBe('alert'); // warning
    expect(messages[2].getAttribute('role')).toBe('status'); // info
    expect(messages[3].getAttribute('role')).toBe('status'); // success
    expect(messages[4].getAttribute('role')).toBe('status'); // loading

    // Verify aria-live attributes
    expect(messages[0].getAttribute('aria-live')).toBe('assertive');
    expect(messages[1].getAttribute('aria-live')).toBe('assertive');
    expect(messages[2].getAttribute('aria-live')).toBe('polite');
    expect(messages[3].getAttribute('aria-live')).toBe('polite');
    expect(messages[4].getAttribute('aria-live')).toBe('polite');

    // Verify aria-atomic
    for (const msg of messages) {
      expect(msg.getAttribute('aria-atomic')).toBe('true');
    }

    // Verify icons are aria-hidden
    const icons = document.querySelectorAll('.b-message__icon');
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }

    // Verify icon SVGs have focusable=false
    const svgs = document.querySelectorAll('.b-message__icon-svg');
    for (const svg of svgs) {
      expect(svg.getAttribute('focusable')).toBe('false');
    }
  },
};

// ─────────────────────────────────────────────
// 7. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override the CSS custom properties to customise the appearance.
 * Every token is prefixed `--b-message-*`.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-message-*` CSS custom properties on the `.b-message` element ' +
          '(or any ancestor) to customise colours without touching the component source.',
      },
      source: {
        code: `
<style>
.my-custom-message {
  --b-message-bg: #1a1a2e;
  --b-message-color: #eaeaea;
  --b-message-icon-color: #e94560;
  --b-message-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}
</style>

<BMessage
  v-model="visible"
  class="my-custom-message"
  type="error"
  content="Custom themed message"
  :duration="0"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visDefault = ref(false);
      const visCustom = ref(false);
      function showBoth() {
        visDefault.value = true;
        visCustom.value = true;
      }
      return { visDefault, visCustom, showBoth, btnStyle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <button :style="btnStyle" @click="showBoth">Show Themed Messages</button>

        <!-- Default -->
        <BMessage
          v-model="visDefault"
          type="info"
          content="Default theme"
          :duration="0"
          style="position:relative;top:auto;left:auto;transform:none;"
        />

        <!-- Custom theme via inline CSS vars -->
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
            --b-message-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
          "
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Interaction test – toggle flow
// ─────────────────────────────────────────────
/**
 * Automated interaction test: shows a message via button click and
 * verifies it appears and can be toggled.
 */
export const InteractionToggle: Story = {
  name: 'Interaction – toggle flow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: clicks the toggle button to show a controlled message, ' +
          'verifies it appears, and toggles it off.',
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="toggle-btn" @click="visible = !visible">
          {{ visible ? 'Hide' : 'Show' }}
        </button>
        <BMessage
          v-model="visible"
          type="success"
          content="Toggled message"
          :duration="0"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially no message (default is closed)
    expect(document.querySelector('.b-message')).toBeNull();

    // Click to show
    const toggleBtn = canvas.getByTestId('toggle-btn');
    await userEvent.click(toggleBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-message')).toBeTruthy();
    });

    // Verify it has proper aria attributes
    const msg = document.querySelector('.b-message')!;
    expect(msg.getAttribute('role')).toBe('status');
    expect(msg.getAttribute('aria-live')).toBe('polite');

    // Click to hide
    await userEvent.click(toggleBtn);
    await waitFor(() => {
      expect(document.querySelector('.b-message')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 9. Interaction test – hover pause
// ─────────────────────────────────────────────
/**
 * Automated interaction test: shows a message via button click and
 * verifies the message appears with correct attributes.
 */
export const InteractionHoverPause: Story = {
  name: 'Interaction – hover pause',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Click the button to show a message that auto-closes in 10 s. ' +
          'Hovering over it pauses the timer.',
      },
    },
  },
  render: () => ({
    components: { BMessage },
    setup() {
      const visible = ref(false);
      function show() {
        visible.value = true;
      }
      return { visible, show, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="show-btn" @click="show">
          Show Message (hover to pause)
        </button>
        <BMessage
          v-model="visible"
          type="warning"
          content="Hover over me to pause auto-close (10s)"
          :duration="10"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially no message
    expect(document.querySelector('.b-message')).toBeNull();

    // Click to show
    const showBtn = canvas.getByTestId('show-btn');
    await userEvent.click(showBtn);

    // Message should appear (teleported to body)
    await waitFor(() => {
      expect(document.querySelector('.b-message')).toBeTruthy();
    });

    const msg = document.querySelector('.b-message')!;

    // Verify the message is a warning type
    expect(msg.classList.contains('b-message--warning')).toBe(true);
    expect(msg.getAttribute('role')).toBe('alert');
    expect(msg.getAttribute('aria-live')).toBe('assertive');
  },
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-message-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background color of the message container (AntD: contentBg).',
  },
  {
    token: '--b-message-padding-h',
    defaultValue: '1rem',
    description: 'Horizontal padding of the message (AntD: contentPadding inline).',
  },
  {
    token: '--b-message-padding-v',
    defaultValue: '0.625rem',
    description: 'Vertical padding of the message (AntD: contentPadding block).',
  },
  // Note: AntD zIndexPopup is not yet implemented as a dedicated var.
  // ── Local extras ──
  {
    token: '--b-message-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Primary text color of the message.',
  },
  {
    token: '--b-message-border-color',
    defaultValue: 'oklch(92% 0.005 260)',
    description: 'Border color around the message container.',
  },
  {
    token: '--b-message-border-radius',
    defaultValue: '0.5rem',
    description: 'Corner radius of the message container.',
  },
  {
    token: '--b-message-shadow',
    defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)',
    description: 'Box shadow under the message.',
  },
  {
    token: '--b-message-font-size',
    defaultValue: '0.875rem',
    description: 'Font size of the message text.',
  },
  {
    token: '--b-message-icon-color',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Color of the leading status icon (varies per type).',
  },
  {
    token: '--b-message-icon-size',
    defaultValue: '1rem',
    description: 'Size of the leading icon.',
  },
  {
    token: '--b-message-gap',
    defaultValue: '0.5rem',
    description: 'Gap between icon and message text.',
  },
  {
    token: '--b-message-max-width',
    defaultValue: '32rem',
    description: 'Maximum width of a single message.',
  },
  {
    token: '--b-message-top',
    defaultValue: '1rem',
    description: 'Distance from the top of the viewport.',
  },
  {
    token: '--b-message-transition-duration',
    defaultValue: '300ms',
    description: 'Enter/leave animation duration.',
  },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Reference table of every <code>--b-message-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Apply tokens via a global CSS class on <code>:root</code> or a wrapping element to retheme messages.
        </p>
        <pre style="background:oklch(96% 0.002 260);padding:12px;border-radius:6px;font-size:12px;overflow:auto;"><code>:root {
  --b-message-bg: oklch(96% 0.04 290);
  --b-message-color: oklch(35% 0.18 290);
  --b-message-border-color: oklch(80% 0.14 290);
  --b-message-shadow: 0 8px 24px oklch(40% 0.18 290 / 25%);
}</code></pre>
      </div>
    `,
  }),
};
