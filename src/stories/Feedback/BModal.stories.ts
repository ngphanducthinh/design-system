import { BButton, BModal, BModalBody, BModalFooter, BModalHeader } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

/**
 * BModal — native `<dialog>`-based modal with header / body / footer subcomponents.
 *
 * Story file follows `docs/STORY_FORMAT.md`:
 *   Default → per-prop Usage → Examples → Accessibility → Theming → Design Tokens (LAST).
 */
const meta = {
  title: 'Feedback/Modal',
  component: BModal,
  tags: ['autodocs'],
  argTypes: {
    modelValue: {
      control: 'boolean',
      description: 'Controls modal visibility — bind with v-model.',
      table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'false' } },
    },
    default: { description: 'Modal contents — typically `BModalHeader`, `BModalBody`, `BModalFooter`.', table: { category: 'Slots' } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BModal</code> component is a versatile modal dialog that displays content in a layer above the main application.<br><br>' +
          'It is built on the native HTML <code>&lt;dialog&gt;</code> element and uses CSS <code>@starting-style</code> for entry/exit animation.<br>' +
          'Compose with <code>BModalHeader</code>, <code>BModalBody</code>, and <code>BModalFooter</code> to structure the content.',
      },
    },
  },
} satisfies Meta<typeof BModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────

/** Default — header + body + footer composition triggered by a button. */
export const Default: Story = {
  args: { modelValue: false },
  parameters: {
    docs: {
      source: {
        code: `
<script setup lang="ts">
import { ref } from 'vue';
const open = ref(false);
</script>

<template>
  <BButton @click="open = true">Open Modal</BButton>

  <BModal v-model="open" class="b:w-[400px]">
    <BModalHeader title="My modal title" />
    <BModalBody>This is the modal body.</BModalBody>
    <BModalFooter @cancel="open = false" @ok="open = false" />
  </BModal>
</template>
        `,
      },
    },
  },
  render: (args: any) => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup() {
      const open = ref(args.modelValue);
      const close = () => {
        open.value = false;
      };
      return { args, open, close };
    },
    template: `
      <BButton @click="open = true">Open Modal</BButton>
      <BModal v-bind="args" v-model="open" class="b:w-[400px]">
        <BModalHeader title="My modal title" />
        <BModalBody>This is the modal body.</BModalBody>
        <BModalFooter @cancel="close" @ok="close" />
      </BModal>
    `,
  }),
};

/** Modal with only header + body — no footer when there are no actions. */
export const HeaderAndBody: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BModal v-model="open" class="b:w-[400px]">
  <BModalHeader title="Information" />
  <BModalBody>Read-only content. Close via the × button.</BModalBody>
</BModal>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Open</BButton>
      <BModal v-model="open" class="b:w-[400px]">
        <BModalHeader title="Information" />
        <BModalBody>Read-only content. Close via the × button.</BModalBody>
      </BModal>
    `,
  }),
};

/** `BModalFooter` exposes `cancelText`, `okText`, `hideCancel`, `hideOk` props for quick customization. */
export const CustomFooterText: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BModal v-model="open">
  <BModalHeader title="Discard changes?" />
  <BModalBody>Unsaved changes will be lost.</BModalBody>
  <BModalFooter
    cancel-text="Keep editing"
    ok-text="Discard"
    @cancel="open = false"
    @ok="open = false"
  />
</BModal>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Discard changes…</BButton>
      <BModal v-model="open" class="b:w-[400px]">
        <BModalHeader title="Discard changes?" />
        <BModalBody>Unsaved changes will be lost.</BModalBody>
        <BModalFooter
          cancel-text="Keep editing"
          ok-text="Discard"
          @cancel="open = false"
          @ok="open = false"
        />
      </BModal>
    `,
  }),
};

// ─────────────────────────────────────────────
// Examples
// ─────────────────────────────────────────────

/** Confirmation modal with a destructive primary action. */
export const Confirmation: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BModal v-model="open">
  <BModalHeader title="Delete project?" />
  <BModalBody>This action cannot be undone. Type the project name to confirm.</BModalBody>
  <BModalFooter ok-text="Delete" @cancel="open = false" @ok="onDelete" />
</BModal>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup() {
      const open = ref(false);
      const onDelete = () => {
        open.value = false;
      };
      return { open, onDelete };
    },
    template: `
      <BButton color="failure" @click="open = true">Delete project…</BButton>
      <BModal v-model="open" class="b:w-[420px]">
        <BModalHeader title="Delete project?" />
        <BModalBody>This action cannot be undone. Type the project name to confirm.</BModalBody>
        <BModalFooter ok-text="Delete" @cancel="open = false" @ok="onDelete" />
      </BModal>
    `,
  }),
};

/** Long-content modal — body scrolls within the dialog while header / footer stay fixed by composition. */
export const ScrollableContent: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BModal v-model="open">
  <BModalHeader title="Terms of Service" />
  <BModalBody>
    <div style="max-height:300px;overflow:auto;">… long content …</div>
  </BModalBody>
  <BModalFooter ok-text="Accept" @cancel="open = false" @ok="open = false" />
</BModal>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton @click="open = true">Read terms…</BButton>
      <BModal v-model="open" class="b:w-[480px]">
        <BModalHeader title="Terms of Service" />
        <BModalBody>
          <div style="max-height:300px;overflow:auto;line-height:1.5;">
            <p v-for="i in 12" :key="i">
              Section {{ i }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </BModalBody>
        <BModalFooter ok-text="Accept" @cancel="open = false" @ok="open = false" />
      </BModal>
    `,
  }),
};

// ─────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────

/**
 * BModal renders a native `<dialog>` opened with `showModal()`, so the browser:
 * - exposes `role="dialog"` and `aria-modal="true"` automatically
 * - blocks interaction with elements outside the modal (inert)
 * - responds to Escape to close
 * - returns focus to the trigger when closed
 *
 * The header's close button (× icon) carries `autofocus` so it receives initial focus.
 */
export const Accessibility: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The native <code>&lt;dialog&gt;</code> element provides built-in modal semantics (<code>role="dialog"</code>, <code>aria-modal</code>, focus trap, Escape-to-close). The header close button uses <code>autofocus</code> for initial focus.',
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup: () => ({ open: ref(false) }),
    template: `
      <BButton data-testid="open-trigger" @click="open = true">Open Modal</BButton>
      <BModal v-model="open" class="b:w-[400px]">
        <BModalHeader title="Accessible modal" />
        <BModalBody>Press Escape to close. Tab is trapped inside the dialog.</BModalBody>
        <BModalFooter @cancel="open = false" @ok="open = false" />
      </BModal>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('open-trigger');
    await userEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('dialog.b-modal')).toBeTruthy();
    });

    const dialog = document.querySelector('dialog.b-modal') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    // Native <dialog> reports role="dialog" implicitly; the open attribute is set when modal is shown.
    expect(dialog.hasAttribute('open')).toBe(true);

    // Escape closes the dialog. Pause briefly so the transition (0.7s) and
    // the watcher-driven close() call have time to remove the `[open]` attr.
    await userEvent.keyboard('{Escape}');
    await waitFor(
      () => {
        expect(document.querySelector('dialog.b-modal[open]')).toBeNull();
      },
      { timeout: 3000 },
    );
  },
};

// ─────────────────────────────────────────────
// Theming
// ─────────────────────────────────────────────

/**
 * BModal has no component-scoped `--b-modal-*` tokens — the panel is styled with Tailwind
 * utility classes (`b:rounded-lg b:bg-white b:px-5 b:py-4`). To retheme, override the
 * global `--color-*` family that Tailwind consumes, OR pass a `class`/`style` to override
 * the panel directly.
 */
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BModal uses Tailwind utilities against the global theme tokens. Override <code>--color-*</code> tokens on an ancestor to retheme buttons inside, or pass a <code>class</code>/<code>style</code> for direct panel styling.',
      },
      source: {
        code: `
<div
  style="
    --color-primary: oklch(50% 0.18 290);
    --color-primary-hover: oklch(42% 0.2 290);
    --color-primary-hover-light: oklch(90% 0.06 290);
  "
>
  <BModal v-model="open" class="b:w-[420px]" style="background: oklch(96% 0.04 290);">
    <BModalHeader title="Themed modal" />
    <BModalBody>Background and primary buttons retheme together.</BModalBody>
    <BModalFooter @cancel="open = false" @ok="open = false" />
  </BModal>
</div>
        `,
      },
    },
  },
  render: () => ({
    components: { BButton, BModal, BModalHeader, BModalBody, BModalFooter },
    setup: () => ({ open: ref(false) }),
    template: `
      <div
        style="
          --color-primary: oklch(50% 0.18 290);
          --color-primary-hover: oklch(42% 0.2 290);
          --color-primary-hover-light: oklch(90% 0.06 290);
        "
      >
        <BButton @click="open = true">Open themed modal</BButton>
        <BModal v-model="open" class="b:w-[420px]" style="background: oklch(96% 0.04 290);">
          <BModalHeader title="Themed modal" />
          <BModalBody style="color: oklch(35% 0.18 290);">
            Background and primary buttons retheme together via global <code>--color-*</code> tokens.
          </BModalBody>
          <BModalFooter @cancel="open = false" @ok="open = false" />
        </BModal>
      </div>
    `,
  }),
};

// ─────────────────────────────────────────────
// Design Tokens — MUST be the LAST story
// ─────────────────────────────────────────────
type TokenRow = { token: string; defaultValue: string; description: string };

// Note: BModal has no `--b-modal-*` CSS vars. The panel is styled with Tailwind utilities
// (`b:rounded-lg b:bg-white b:px-5 b:py-4`) and a single internal `--duration` for the
// open/close transition. The themable surface is therefore the global Tailwind tokens
// + `--duration`.
const DESIGN_TOKENS: TokenRow[] = [
  { token: '--duration', defaultValue: '0.7s', description: 'Open/close transition duration on `.b-modal`. Override directly on the modal element.' },
  { token: '--color-primary', defaultValue: 'oklch(55% 0.169 237.323)', description: 'Solid bg / outline color for primary buttons inside the footer.' },
  { token: '--color-primary-hover', defaultValue: 'oklch(48% 0.158 241.966)', description: 'Hover color for primary buttons inside the footer.' },
  { token: '--color-secondary', defaultValue: 'oklch(92% 0.004 286.32)', description: 'Outline / text color for secondary (cancel) buttons in the footer.' },
  { token: '--color-secondary-hover', defaultValue: 'oklch(87.1% 0.006 286.286)', description: 'Hover color for secondary buttons in the footer.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'BModal has <strong>no component-scoped <code>--b-modal-*</code> CSS variables</strong>. ' +
          'The panel is styled with Tailwind utility classes and a single <code>--duration</code> token controls the open/close transition. ' +
          'The footer uses <code>BButton</code>, which consumes the global <code>--color-*</code> theme tokens.',
      },
    },
  },
  render: () => ({
    components: { BModal },
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <div style="font-family:sans-serif;padding:1rem;max-width:1100px;margin:0 auto;">
        <h2 style="margin:0 0 8px;">BModal — Design Tokens</h2>
        <p style="margin:0 0 24px;color:#595959;">
          BModal has no component-scoped vars; the panel uses Tailwind utility classes plus a single
          <code>--duration</code> for animation. Footer buttons consume the global <code>--color-*</code>
          tokens defined in <code>src/assets/tailwind.css</code>.
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
