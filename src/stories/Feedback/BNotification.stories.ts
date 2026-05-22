import { BNotification } from '@/components';
import { BNotificationPlacement, BNotificationType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────
const meta = {
  title: 'Feedback/Notification',
  component: BNotification,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(BNotificationType),
      description: 'Notification severity / status type.',
      table: { defaultValue: { summary: BNotificationType.Info } },
    },
    message: {
      control: 'text',
      description: 'Short title / heading of the notification.',
    },
    description: {
      control: 'text',
      description: 'Optional detailed description below the title.',
    },
    placement: {
      control: 'select',
      options: Object.values(BNotificationPlacement),
      description: 'Placement of the notification on the viewport.',
      table: { defaultValue: { summary: BNotificationPlacement.TopRight } },
    },
    duration: {
      control: 'number',
      description: 'Time (seconds) before auto-close. Set to `0` to disable auto-close.',
      table: { defaultValue: { summary: '4.5' } },
    },
    closable: {
      control: 'boolean',
      description: 'Show the close button.',
      table: { defaultValue: { summary: 'true' } },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show the built-in status icon when `type` is set.',
      table: { defaultValue: { summary: 'true' } },
    },
    modelValue: {
      control: 'boolean',
      description:
        'Controlled visibility (bind with v-model). Notifications are closed by default and must be opened explicitly.',
      table: {
        category: 'Two-Way Binding Props',
        defaultValue: { summary: 'false' },
      },
    },
    // Prop-only (no control - raw HTML / slot content)
    icon: { control: false },
    closeIcon: { control: false },
    btn: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BNotification</code> component displays a floating notification card in a corner of the viewport.<br><br>' +
          'It supports four types - <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, and <strong>error</strong> - defaulting to <strong>info</strong>.<br>' +
          'Notifications are <strong>closed by default</strong> and must be opened explicitly via <code>v-model</code> or the exposed <code>open()</code> method.<br>' +
          'They auto-close after a configurable duration (default 4.5 s), pause on mouse hover, and can be dismissed with the close button or the <kbd>Escape</kbd> key.<br>' +
          'The component teleports to <code>&lt;body&gt;</code> for correct stacking.',
      },
    },
  },
} satisfies Meta<typeof BNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Shared button style
// ─────────────────────────────────────────────
const btnStyle =
  'padding:0.375rem 0.875rem;border:1px solid #d0d0d0;border-radius:0.375rem;cursor:pointer;background:#fff;font-size:0.875rem;';

// ─────────────────────────────────────────────
// 1. Playground (all controls)
// ─────────────────────────────────────────────
/**
 * Interactive playground - tweak all props via the Controls panel.
 * Click **"Show Notification"** to open it. It starts closed by default.
 */
export const Playground: Story = {
  args: {
    type: BNotificationType.Info,
    message: 'Notification Title',
    description: 'This is the notification description with additional detail.',
    placement: BNotificationPlacement.TopRight,
    duration: 4.5,
    closable: true,
    showIcon: true,
  },
  render: (args) => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { args, visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="visible = true">Show Notification</button>
        <BNotification v-model="visible" v-bind="args" />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 2. All types / variants
// ─────────────────────────────────────────────
/**
 * Click each button to trigger the corresponding notification type.
 */
export const AllTypes: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BNotification v-model="visible" type="success" message="Success" description="Operation completed." />
<BNotification v-model="visible" type="info"    message="Info"    description="Here is some information." />
<BNotification v-model="visible" type="warning" message="Warning" description="Please review the input." />
<BNotification v-model="visible" type="error"   message="Error"   description="Something went wrong." />
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const types = Object.values(BNotificationType) as string[];
      const descriptions: Record<string, string> = {
        success: 'Operation completed successfully.',
        info: 'Here is some useful information.',
        warning: 'Please review the input values.',
        error: 'Something went wrong. Please try again.',
      };
      const visibleMap = Object.fromEntries(types.map((t) => [t, ref(false)]));
      function show(type: string) {
        visibleMap[type].value = true;
      }
      return { types, descriptions, visibleMap, show, btnStyle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start;">
        <div v-for="t in types" :key="t" style="display:flex;align-items:center;gap:0.5rem;">
          <button :style="btnStyle" @click="show(t)">
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
          <BNotification
            v-model="visibleMap[t].value"
            :type="t"
            :message="t.charAt(0).toUpperCase() + t.slice(1)"
            :description="descriptions[t]"
            :duration="0"
            style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 3. All placements
// ─────────────────────────────────────────────
/**
 * Four placement options - click each button to see the notification appear
 * in the corresponding corner of the viewport.
 */
export const AllPlacements: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BNotification
  v-model="visible"
  placement="top-right"
  message="Top Right"
  description="Notification in the top-right corner."
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const placements = Object.values(BNotificationPlacement);
      const visibleMap = Object.fromEntries(placements.map((p) => [p, ref(false)]));
      function show(placement: string) {
        visibleMap[placement].value = true;
      }
      return { placements, visibleMap, show, btnStyle };
    },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
        <div v-for="p in placements" :key="p">
          <button :style="btnStyle" @click="show(p)">{{ p }}</button>
          <BNotification
            v-model="visibleMap[p].value"
            :placement="p"
            type="info"
            :message="p"
            description="Click the × or wait for auto-close."
            :duration="4.5"
          />
        </div>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 4. Controlled (v-model)
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
const visible = ref(false);
</script>
<template>
  <button @click="visible = !visible">Toggle</button>
  <BNotification
    v-model="visible"
    type="info"
    message="Controlled"
    description="Controlled via v-model."
    :duration="0"
  />
</template>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="toggle-btn" @click="visible = !visible">
          {{ visible ? 'Hide' : 'Show' }} notification
        </button>
        <BNotification
          v-model="visible"
          type="info"
          message="Controlled Notification"
          description="This notification is controlled via v-model (duration=0)."
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 6. With action button slot
// ─────────────────────────────────────────────
/**
 * Custom action buttons can be placed below the description using the `btn` slot.
 */
export const WithAction: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BNotification v-model="visible" type="success" message="Success" description="File uploaded.">
  <template #btn>
    <button @click="visible = false">Dismiss</button>
    <button @click="doSomething">View File</button>
  </template>
</BNotification>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="visible = true">Show with Action</button>
        <BNotification
          v-model="visible"
          type="success"
          message="File Uploaded"
          description="Your file has been uploaded successfully."
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        >
          <template #btn>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
              <button :style="btnStyle" @click="visible = false">Dismiss</button>
              <button :style="btnStyle" style="color:oklch(62.3% 0.214 259.815);">View File</button>
            </div>
          </template>
        </BNotification>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 7. Custom icon slot
// ─────────────────────────────────────────────
/**
 * Override the built-in type icon with a custom one via the `icon` slot.
 */
export const CustomIcon: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `
<BNotification v-model="visible" message="Custom Icon">
  <template #icon>
    <span style="font-size:1.5rem;">🎉</span>
  </template>
</BNotification>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="visible = true">Show Custom Icon</button>
        <BNotification
          v-model="visible"
          message="Custom Icon Notification"
          description="The icon has been overridden via the icon slot."
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        >
          <template #icon>
            <span style="font-size:1.5rem;line-height:1;" aria-hidden="true">🎉</span>
          </template>
        </BNotification>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 8. Without icon
// ─────────────────────────────────────────────
/**
 * Set `showIcon=false` to suppress the built-in status icon even when `type` is set.
 */
export const WithoutIcon: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      source: {
        code: `<BNotification v-model="visible" type="info" message="No Icon" :show-icon="false" />`,
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" @click="visible = true">Show (no icon)</button>
        <BNotification
          v-model="visible"
          type="info"
          message="Notification without icon"
          description="showIcon=false suppresses the built-in icon."
          :show-icon="false"
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        />
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// 9. Accessibility story
// ─────────────────────────────────────────────
/**
 * Demonstrates ARIA roles, live regions, focus management, and keyboard navigation.
 * - `error` and `warning` → `role="alert"` (assertive live region)
 * - `info` and `success` → `role="status"` (polite live region)
 * - Close button: `aria-label="Close notification"`, focusable
 * - Press **Escape** to dismiss a focused notification
 */
export const Accessibility: Story = {
  name: 'Accessibility (roles, keyboard & focus)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Click **"Show All"** to trigger every type. ' +
          'Error and warning use `role="alert"` with `aria-live="assertive"`, ' +
          'while info and success use `role="status"` with `aria-live="polite"`. ' +
          'The close button is labelled `aria-label="Close notification"` and receives focus when the notification opens. ' +
          'Press <kbd>Escape</kbd> to dismiss.',
      },
    },
  },
  render: () => ({
    components: { BNotification },
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
      return { visError, visWarning, visInfo, visSuccess, showAll, btnStyle };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;">
        <button :style="btnStyle" data-testid="show-all-btn" @click="showAll">Show All</button>
        <BNotification v-model="visError"   type="error"   message="Error"   description="Error (role=alert, assertive)"   :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visWarning" type="warning" message="Warning" description="Warning (role=alert, assertive)" :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visInfo"    type="info"    message="Info"    description="Info (role=status, polite)"       :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
        <BNotification v-model="visSuccess" type="success" message="Success" description="Success (role=status, polite)"    :duration="0" style="position:relative;top:auto;right:auto;bottom:auto;left:auto;" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially no notifications are visible
    expect(document.querySelectorAll('.b-notification').length).toBe(0);

    // Click "Show All"
    const showAllBtn = canvas.getByTestId('show-all-btn');
    await userEvent.click(showAllBtn);

    await waitFor(() => {
      expect(document.querySelectorAll('.b-notification').length).toBe(4);
    });

    const notifications = document.querySelectorAll('.b-notification');

    // Verify ARIA roles
    expect(notifications[0].getAttribute('role')).toBe('alert'); // error
    expect(notifications[1].getAttribute('role')).toBe('alert'); // warning
    expect(notifications[2].getAttribute('role')).toBe('status'); // info
    expect(notifications[3].getAttribute('role')).toBe('status'); // success

    // Verify aria-live
    expect(notifications[0].getAttribute('aria-live')).toBe('assertive');
    expect(notifications[1].getAttribute('aria-live')).toBe('assertive');
    expect(notifications[2].getAttribute('aria-live')).toBe('polite');
    expect(notifications[3].getAttribute('aria-live')).toBe('polite');

    // Verify aria-atomic
    for (const n of notifications) {
      expect(n.getAttribute('aria-atomic')).toBe('true');
    }

    // Verify icons are aria-hidden (decorative)
    const icons = document.querySelectorAll('.b-notification__icon');
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }

    // Verify icon SVGs have focusable=false
    const svgs = document.querySelectorAll('.b-notification__icon-svg');
    for (const svg of svgs) {
      expect(svg.getAttribute('focusable')).toBe('false');
    }

    // Verify close buttons are labelled
    const closeBtns = document.querySelectorAll('.b-notification__close');
    for (const btn of closeBtns) {
      expect(btn.getAttribute('aria-label')).toBe('Close notification');
      expect(btn.getAttribute('type')).toBe('button');
    }

    // Verify aria-labelledby links to message element
    for (const n of notifications) {
      const labelledby = n.getAttribute('aria-labelledby');
      expect(labelledby).toBeTruthy();
      const titleEl = n.querySelector('.b-notification__message');
      expect(titleEl?.id).toBe(labelledby);
    }

    // Verify aria-describedby links to description element
    for (const n of notifications) {
      const describedby = n.getAttribute('aria-describedby');
      expect(describedby).toBeTruthy();
      const descEl = n.querySelector('.b-notification__description');
      expect(descEl?.id).toBe(describedby);
    }

    // Keyboard: press Escape on first notification to close it
    const firstNotif = notifications[0] as HTMLElement;
    firstNotif.focus();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(document.querySelectorAll('.b-notification').length).toBe(3);
    });
  },
};

// ─────────────────────────────────────────────
// 10. Theming (CSS vars override)
// ─────────────────────────────────────────────
/**
 * Override `--b-notification-*` CSS custom properties to customise
 * the appearance without touching component source.
 */
export const Theming: Story = {
  name: 'Theming (CSS vars)',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Override `--b-notification-*` CSS custom properties on the `.b-notification` element ' +
          '(or any ancestor) to customise colours without touching component source.',
      },
      source: {
        code: `
<style>
.my-custom-notification {
  --b-notification-bg: #1a1a2e;
  --b-notification-title-color: #eaeaea;
  --b-notification-desc-color: #a0a0c0;
  --b-notification-icon-color: #e94560;
  --b-notification-shadow: 0 4px 16px rgba(233, 69, 96, 0.3);
}
</style>

<BNotification
  v-model="visible"
  class="my-custom-notification"
  type="error"
  message="Custom Theme"
  description="Override CSS vars to brand this component."
  :duration="0"
/>
        `,
      },
    },
  },
  render: () => ({
    components: { BNotification },
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
        <button :style="btnStyle" @click="showBoth">Show Themed Notifications</button>

        <!-- Default theme -->
        <BNotification
          v-model="visDefault"
          type="info"
          message="Default Theme"
          description="This uses the built-in CSS variable defaults."
          :duration="0"
          style="position:relative;top:auto;right:auto;bottom:auto;left:auto;"
        />

        <!-- Custom theme via inline CSS vars -->
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
// 11. Interaction – toggle flow
// ─────────────────────────────────────────────
/**
 * Automated interaction test: toggles the notification via button click.
 */
export const InteractionToggle: Story = {
  name: 'Interaction – toggle flow',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: clicks the toggle button to show a controlled notification, ' +
          'verifies it appears with correct ARIA attributes, then hides it.',
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="toggle-btn" @click="visible = !visible">
          {{ visible ? 'Hide' : 'Show' }}
        </button>
        <BNotification
          v-model="visible"
          type="success"
          message="Toggled"
          description="Notification controlled via v-model."
          :duration="0"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially closed
    expect(document.querySelector('.b-notification')).toBeNull();

    // Click to show
    const toggleBtn = canvas.getByTestId('toggle-btn');
    await userEvent.click(toggleBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-notification')).toBeTruthy();
    });

    // Verify ARIA attributes
    const notif = document.querySelector('.b-notification')!;
    expect(notif.getAttribute('role')).toBe('status');
    expect(notif.getAttribute('aria-live')).toBe('polite');
    expect(notif.getAttribute('aria-atomic')).toBe('true');
    expect(notif.getAttribute('aria-labelledby')).toBeTruthy();

    // Click to hide
    await userEvent.click(toggleBtn);
    await waitFor(() => {
      expect(document.querySelector('.b-notification')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 12. Interaction – close button
// ─────────────────────────────────────────────
/**
 * Automated interaction test: opens a notification, then closes it via the ✕ button.
 */
export const InteractionClose: Story = {
  name: 'Interaction – close button',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Automated play function: opens a notification and dismisses it using the close button.',
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="open-btn" @click="visible = true">
          Open
        </button>
        <BNotification
          v-model="visible"
          type="warning"
          message="Close Me"
          description="Use the × button to dismiss."
          :duration="0"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open notification
    const openBtn = canvas.getByTestId('open-btn');
    await userEvent.click(openBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-notification')).toBeTruthy();
    });

    const notif = document.querySelector('.b-notification')!;
    expect(notif.getAttribute('role')).toBe('alert');
    expect(notif.getAttribute('aria-live')).toBe('assertive');

    // Find and click close button
    const closeBtn = notif.querySelector('.b-notification__close') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close notification');

    await userEvent.click(closeBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-notification')).toBeNull();
    });
  },
};

// ─────────────────────────────────────────────
// 13. Interaction – hover pause
// ─────────────────────────────────────────────
/**
 * Opens a notification and verifies it appears with correct attributes.
 * (Timer pause is verified in unit tests with fake timers.)
 */
export const InteractionHoverPause: Story = {
  name: 'Interaction – hover pause',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Click the button to show a notification that auto-closes in 30 s. ' +
          'Hovering over it pauses the timer; leaving resumes it.',
      },
    },
  },
  render: () => ({
    components: { BNotification },
    setup() {
      const visible = ref(false);
      return { visible, btnStyle };
    },
    template: `
      <div>
        <button :style="btnStyle" data-testid="show-btn" @click="visible = true">
          Show (hover to pause)
        </button>
        <BNotification
          v-model="visible"
          type="info"
          message="Hover to Pause"
          description="Hovering pauses the 30-second auto-close timer."
          :duration="30"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(document.querySelector('.b-notification')).toBeNull();

    const showBtn = canvas.getByTestId('show-btn');
    await userEvent.click(showBtn);

    await waitFor(() => {
      expect(document.querySelector('.b-notification')).toBeTruthy();
    });

    const notif = document.querySelector('.b-notification')!;
    expect(notif.classList.contains('b-notification--info')).toBe(true);
    expect(notif.getAttribute('role')).toBe('status');

    // Hover over the notification (timer should pause)
    await userEvent.hover(notif as HTMLElement);
    expect(document.querySelector('.b-notification')).toBeTruthy();

    // Unhover
    await userEvent.unhover(notif as HTMLElement);
    expect(document.querySelector('.b-notification')).toBeTruthy();
  },
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

const DESIGN_TOKENS: TokenRow[] = [
  // ── AntD-aligned tokens ──
  {
    token: '--b-notification-width',
    defaultValue: '24rem',
    description: 'Width of a single notification (AntD: width).',
  },
  {
    token: '--b-notification-z-index',
    defaultValue: '2050',
    description: 'z-index of the notification stack (AntD: zIndexPopup).',
  },
  // Note: AntD colorErrorBg / colorInfoBg / colorSuccessBg / colorWarningBg / progressBg
  // are not yet implemented as dedicated vars (we use single --b-notification-bg with type variants).
  // ── Local extras ──
  {
    token: '--b-notification-bg',
    defaultValue: 'oklch(100% 0 0)',
    description: 'Background color of the notification container.',
  },
  {
    token: '--b-notification-border-color',
    defaultValue: 'oklch(92% 0.005 260)',
    description: 'Border color of the notification container.',
  },
  {
    token: '--b-notification-border-radius',
    defaultValue: '0.5rem',
    description: 'Corner radius of the notification.',
  },
  {
    token: '--b-notification-shadow',
    defaultValue: '0 6px 16px 0 oklch(0% 0 0 / 8%)',
    description: 'Box shadow under the notification.',
  },
  {
    token: '--b-notification-padding-h',
    defaultValue: '1.5rem',
    description: 'Horizontal padding of the notification.',
  },
  {
    token: '--b-notification-padding-v',
    defaultValue: '1rem',
    description: 'Vertical padding of the notification.',
  },
  {
    token: '--b-notification-gap',
    defaultValue: '0.75rem',
    description: 'Gap between icon, content, and close button.',
  },
  {
    token: '--b-notification-title-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Color of the notification title text.',
  },
  {
    token: '--b-notification-desc-color',
    defaultValue: 'oklch(20% 0.005 260 / 65%)',
    description: 'Color of the notification description text.',
  },
  {
    token: '--b-notification-font-size-title',
    defaultValue: '1rem',
    description: 'Font size of the title.',
  },
  {
    token: '--b-notification-font-size-desc',
    defaultValue: '0.875rem',
    description: 'Font size of the description.',
  },
  {
    token: '--b-notification-line-height',
    defaultValue: '1.5',
    description: 'Line height of notification text.',
  },
  {
    token: '--b-notification-icon-color',
    defaultValue: 'oklch(62.3% 0.214 259.815)',
    description: 'Color of the leading status icon (varies per type).',
  },
  {
    token: '--b-notification-icon-size',
    defaultValue: '1.5rem',
    description: 'Size of the leading status icon.',
  },
  {
    token: '--b-notification-close-color',
    defaultValue: 'oklch(50% 0.005 260)',
    description: 'Color of the close button icon.',
  },
  {
    token: '--b-notification-close-hover-color',
    defaultValue: 'oklch(20% 0.005 260 / 88%)',
    description: 'Hover color of the close button icon.',
  },
  {
    token: '--b-notification-close-size',
    defaultValue: '1rem',
    description: 'Size of the close button icon.',
  },
  {
    token: '--b-notification-offset',
    defaultValue: '1.5rem',
    description: 'Distance from the viewport edge.',
  },
  {
    token: '--b-notification-transition-duration',
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
          'Reference table of every <code>--b-notification-*</code> CSS custom property ' +
          'consumers can override to retheme the component.',
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

        <h3 style="margin:32px 0 12px;">Override example</h3>
        <p style="margin:0 0 12px;color:#595959;font-size:13px;">
          Apply tokens via a global CSS class on <code>:root</code> or a wrapping element to retheme notifications.
        </p>
        <pre style="background:oklch(96% 0.002 260);padding:12px;border-radius:6px;font-size:12px;overflow:auto;"><code>:root {
  --b-notification-bg: oklch(96% 0.04 290);
  --b-notification-title-color: oklch(35% 0.18 290);
  --b-notification-border-color: oklch(80% 0.14 290);
  --b-notification-shadow: 0 12px 32px oklch(40% 0.18 290 / 25%);
}</code></pre>
      </div>
    `,
  }),
};
