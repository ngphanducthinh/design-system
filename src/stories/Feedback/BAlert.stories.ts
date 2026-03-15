import { BAlert } from '@/components';
import { BAlertType } from '@/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
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
          'It supports four severity levels — <strong>success</strong>, <strong>info</strong>, <strong>warning</strong>, and <strong>error</strong> — with optional icons, descriptions, actions and a dismiss button.<br>' +
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
 * Interactive playground — tweak all props via the Controls panel.
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

    // Keyboard: focus and close the first (error) alert
    const firstClose = canvas.getAllByRole('button', { name: /close alert/i })[0];
    await userEvent.tab();
    firstClose.focus();
    expect(document.activeElement).toBe(firstClose);

    await userEvent.keyboard('{Enter}');
    // After close the element should be gone from DOM
    expect(alerts[0].isConnected).toBe(false);
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
    const alertEl = canvasElement.querySelector('.b-alert');
    expect(alertEl).toBeTruthy();

    // Close button is accessible by label
    const closeBtn = canvas.getByRole('button', { name: /close alert/i });
    expect(closeBtn).toBeTruthy();

    // Click the close button
    await userEvent.click(closeBtn);

    // Alert is removed from DOM
    expect(canvasElement.querySelector('.b-alert')).toBeNull();
  },
};
