import { BTour } from '@/components';
import { BTourPlacement, BTourType, type BTourStep } from '@/components/BTour/types.ts';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

// ─────────────────────────────────────────────
// Shared UI shell styles (inlined so stories are
// self-contained without relying on Tailwind utils)
// ─────────────────────────────────────────────

const UI = {
  page: `
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    color: #374151;
  `,
  toolbar: `
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  `,
  btn: `
    padding: 0.375rem 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: #fff;
    color: #374151;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
  `,
  btnPrimary: `
    padding: 0.375rem 0.875rem;
    border: none;
    border-radius: 0.375rem;
    background: oklch(55% 0.169 237.323);
    color: #fff;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
  `,
  card: `
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.875rem 1rem;
  `,
  label: `
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  divider: `height: 1px; background: #e5e7eb; margin: 0.25rem 0;`,
};

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────

const meta = {
  title: 'Feedback/Tour',
  component: BTour,
  tags: ['autodocs'],
  argTypes: {
    // ── Two-Way Binding Props ──────────────────
    open: {
      control: 'boolean',
      description: 'Controlled open state.',
      table: { category: 'Two-Way Binding Props' },
    },
    current: {
      control: 'number',
      description: 'Controlled current step index.',
      table: { category: 'Two-Way Binding Props' },
    },
    // ── Props ─────────────────────────────────
    type: {
      control: 'select',
      options: Object.values(BTourType),
      description: 'Visual variant.',
    },
    placement: {
      control: 'select',
      options: Object.values(BTourPlacement),
      description: 'Default popup placement (step-level overrides).',
    },
    mask: {
      control: 'boolean',
      description: 'Show a mask overlay with spotlight cutout.',
    },
    arrow: {
      control: 'boolean',
      description: 'Show the directional arrow.',
    },
    keyboard: {
      control: 'boolean',
      description: 'Enable keyboard navigation.',
    },
    zIndex: {
      control: 'number',
      description: 'z-index of the popup and mask.',
    },
    closeIcon: {
      control: 'boolean',
      description: 'Show the close button.',
    },
    disabledInteraction: {
      control: 'boolean',
      description: 'Disable pointer interaction on highlighted region.',
    },
    // ── Events ────────────────────────────────
    onChange: { action: 'change' },
    onClose: { action: 'close' },
    onFinish: { action: 'finish' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The <code>BTour</code> component guides users through a product with step-by-step popups. ' +
          'It supports both controlled and uncontrolled modes, keyboard navigation, SVG spotlight masking, ' +
          'and full dark-mode theming.',
      },
    },
  },
} satisfies Meta<typeof BTour>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─────────────────────────────────────────────
// Playground
// ─────────────────────────────────────────────

export const Playground: Story = {
  args: {
    open: false,
    type: BTourType.Default,
    placement: BTourPlacement.Bottom,
    mask: true,
    arrow: true,
    keyboard: true,
    zIndex: 1070,
    closeIcon: true,
    disabledInteraction: false,
  },
  render: (args) => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const currentStep = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'New Document',
          description: 'Create a new file or folder to get started.',
          target: () => document.getElementById('pg-new') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Upload Files',
          description: 'Drag & drop or click to upload files from your device.',
          target: () => document.getElementById('pg-upload') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Search',
          description: 'Quickly find any file by name, tag, or content.',
          target: () => document.getElementById('pg-search') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Share & Collaborate',
          description: 'Invite teammates and control their access level.',
          target: () => document.getElementById('pg-share') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
      ];

      return { args, isOpen, currentStep, steps };
    },
    template: `
      <div :style="UI.page">
        <!-- Toolbar -->
        <div :style="UI.toolbar">
          <button id="pg-new"    type="button" :style="UI.btnPrimary">+ New</button>
          <button id="pg-upload" type="button" :style="UI.btn">↑ Upload</button>
          <div :style="UI.divider + '; width:1px; height:1.25rem; margin:0 0.25rem;'" />
          <input
            id="pg-search"
            type="search"
            placeholder="Search files…"
            style="flex:1; padding:0.3125rem 0.625rem; border:1px solid #d1d5db; border-radius:0.375rem; font-size:0.8125rem; background:#fff; color:#374151;"
          />
          <div :style="UI.divider + '; width:1px; height:1.25rem; margin:0 0.25rem;'" />
          <button id="pg-share"  type="button" :style="UI.btn">⇒ Share</button>
        </div>

        <!-- File list placeholder -->
        <div :style="UI.card" style="min-height:6rem; display:flex; align-items:center; justify-content:center; color:#6b7280;" aria-hidden="true">
          Your files will appear here
        </div>

        <!-- Launch button -->
        <div>
          <button
            type="button"
            :style="UI.btnPrimary"
            @click="isOpen = true; currentStep = 0"
          >
            Start Tour
          </button>
        </div>

        <BTour
          v-bind="args"
          :steps="steps"
          v-model:open="isOpen"
          v-model:current="currentStep"
        />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
};

// ─────────────────────────────────────────────
// Default - file manager toolbar
// ─────────────────────────────────────────────

export const Default: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'New Document',
          description: 'Create a blank document, spreadsheet, or presentation in one click.',
          target: () => document.getElementById('def-new') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Upload Files',
          description: 'Drag & drop or browse your device to upload files up to 2 GB.',
          target: () => document.getElementById('def-upload') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Filter & Sort',
          description: 'Narrow results by type, owner, or date modified.',
          target: () => document.getElementById('def-filter') as HTMLElement,
          placement: BTourPlacement.BottomLeft,
        },
        {
          title: 'Share',
          description: 'Invite teammates with view or edit access.',
          target: () => document.getElementById('def-share') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page">
        <div :style="UI.toolbar">
          <button id="def-new"    type="button" :style="UI.btnPrimary">+ New</button>
          <button id="def-upload" type="button" :style="UI.btn">↑ Upload</button>
          <span style="flex:1" />
          <button id="def-filter" type="button" :style="UI.btn">⇅ Filter</button>
          <button id="def-share"  type="button" :style="UI.btn">⇒ Share</button>
        </div>

        <div :style="UI.card" style="display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem;" aria-hidden="true">
          <div v-for="n in 8" :key="n" style="background:#f3f4f6; border-radius:0.375rem; padding:0.75rem; font-size:0.8125rem; color:#4b5563;">
            Document {{ n }}.docx
          </div>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Begin Tour
          </button>
        </div>

        <BTour :steps="steps" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Default type with four toolbar targets - New, Upload, Filter, and Share.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Primary type - dashboard onboarding
// ─────────────────────────────────────────────

export const Primary: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Overview Panel',
          description: 'Your key metrics at a glance - visits, conversions, and revenue.',
          target: () => document.getElementById('pri-overview') as HTMLElement,
          placement: BTourPlacement.Bottom,
          type: BTourType.Primary,
        },
        {
          title: 'Activity Feed',
          description: 'A real-time stream of team actions and system events.',
          target: () => document.getElementById('pri-activity') as HTMLElement,
          placement: BTourPlacement.Left,
          type: BTourType.Primary,
        },
        {
          title: 'Quick Actions',
          description: 'Run frequent tasks without leaving the dashboard.',
          target: () => document.getElementById('pri-actions') as HTMLElement,
          placement: BTourPlacement.Top,
          type: BTourType.Primary,
        },
        {
          title: 'User Menu',
          description: 'Access your profile, settings, and sign-out options.',
          target: () => document.getElementById('pri-user') as HTMLElement,
          placement: BTourPlacement.BottomRight,
          type: BTourType.Primary,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <!-- Top bar -->
        <div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0.75rem; background:#fff; border:1px solid #e5e7eb; border-radius:0.5rem;">
          <span style="font-weight:700; color:oklch(55% 0.169 237.323);">● MyApp</span>
          <span style="flex:1;" />
          <button id="pri-actions" type="button" :style="UI.btn">⚡ Actions</button>
          <button id="pri-user"    type="button" :style="UI.btn">👤 Admin</button>
        </div>

        <!-- Body -->
        <div style="display:grid; grid-template-columns:1fr 280px; gap:0.75rem;">
          <!-- Overview card -->
          <div id="pri-overview" :style="UI.card">
            <div :style="UI.label" style="margin-bottom:0.5rem;">Overview</div>
            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem;" aria-hidden="true">
              <div v-for="(m, i) in [{label:'Visits',val:'12 k'},{label:'Conv.',val:'3.4 %'},{label:'Revenue',val:'$8.2 k'}]" :key="i"
                style="background:#f3f4f6; border-radius:0.375rem; padding:0.625rem; text-align:center;">
                <div style="font-size:1.125rem; font-weight:700; color:#111827;">{{ m.val }}</div>
                <div style="font-size:0.75rem; color:#4b5563;">{{ m.label }}</div>
              </div>
            </div>
          </div>

          <!-- Activity feed -->
          <div id="pri-activity" :style="UI.card">
            <div :style="UI.label" style="margin-bottom:0.5rem;">Activity</div>
            <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.375rem;">
              <li v-for="(a, i) in ['Alice uploaded report.pdf','Bob commented on Q3','Deployment succeeded']" :key="i"
                style="font-size:0.8125rem; color:#6b7280; padding:0.25rem 0; border-bottom:1px solid #f3f4f6;">
                {{ a }}
              </li>
            </ul>
          </div>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Start Primary Tour
          </button>
        </div>

        <BTour :steps="steps" type="primary" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Primary type spotlighting four dashboard regions - overview panel, activity feed, quick actions, and user menu.',
      },
      source: {
        code: `<BTour :steps="steps" type="primary" v-model:open="open" v-model:current="current" />`,
      },
    },
  },
};

// ─────────────────────────────────────────────
// With cover image - onboarding wizard
// ─────────────────────────────────────────────

const COVER_IMG =
  'https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png';

export const WithCover: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Welcome to CloudDrive',
          description: 'A quick tour of the features that help you store, share, and collaborate.',
          cover: COVER_IMG,
          target: () => document.getElementById('cov-logo') as HTMLElement,
          placement: BTourPlacement.BottomLeft,
        },
        {
          title: 'Your Storage',
          description: 'See how much space you have used and upgrade at any time.',
          cover: COVER_IMG,
          target: () => document.getElementById('cov-storage') as HTMLElement,
          placement: BTourPlacement.Right,
        },
        {
          title: 'Recent Files',
          description: 'Jump back into documents you recently opened or edited.',
          cover: COVER_IMG,
          target: () => document.getElementById('cov-recent') as HTMLElement,
          placement: BTourPlacement.Top,
        },
        {
          title: 'Notifications',
          description: 'Stay informed about comments, shares, and system alerts.',
          cover: COVER_IMG,
          target: () => document.getElementById('cov-bell') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <!-- Header -->
        <div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0.75rem; background:#fff; border:1px solid #e5e7eb; border-radius:0.5rem;">
          <span id="cov-logo" style="font-weight:700; font-size:1rem; color:oklch(55% 0.169 237.323); padding:0.25rem 0.5rem; border:2px solid oklch(80% 0.1 237); border-radius:0.375rem;">☁ CloudDrive</span>
          <span style="flex:1;" />
          <button id="cov-bell" type="button" :style="UI.btn">🔔 3</button>
          <button type="button" :style="UI.btn">👤</button>
        </div>

        <!-- Body -->
        <div style="display:grid; grid-template-columns:220px 1fr; gap:0.75rem; min-height:10rem;">
          <!-- Sidebar -->
          <div :style="UI.card" style="display:flex; flex-direction:column; gap:0.5rem;">
            <div id="cov-storage">
              <div :style="UI.label" style="margin-bottom:0.375rem;">Storage</div>
              <div style="background:#e5e7eb; border-radius:9999px; height:6px;">
                <div style="background:oklch(55% 0.169 237.323); width:62%; height:100%; border-radius:9999px;"></div>
              </div>
              <div style="font-size:0.75rem; color:#6b7280; margin-top:0.25rem;">6.2 GB of 10 GB used</div>
            </div>
            <div :style="UI.divider" />
            <nav style="display:flex; flex-direction:column; gap:0.25rem;">
              <a v-for="item in ['My Drive','Shared','Starred','Trash']" :key="item"
                href="#" style="font-size:0.8125rem; color:#374151; padding:0.25rem 0.5rem; border-radius:0.25rem; text-decoration:none;">
                {{ item }}
              </a>
            </nav>
          </div>

          <!-- Recent files -->
          <div id="cov-recent" :style="UI.card">
            <div :style="UI.label" style="margin-bottom:0.5rem;">Recent Files</div>
            <div style="display:flex; flex-direction:column; gap:0.375rem;">
              <div v-for="f in ['Q3 Report.pdf','Budget 2025.xlsx','Presentation.pptx','Notes.md']" :key="f"
                style="display:flex; align-items:center; gap:0.5rem; padding:0.375rem; border-radius:0.375rem; background:#f9fafb; font-size:0.8125rem;">
                <span style="color:#6b7280;">📄</span> {{ f }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Open With Cover
          </button>
        </div>

        <BTour :steps="steps" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Each step includes a cover image above the title. The tour spotlights logo, storage bar, recent files, and notifications.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// No mask - settings page walkthrough
// ─────────────────────────────────────────────

export const NoMask: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Profile',
          description: 'Update your display name, avatar, and contact details.',
          target: () => document.getElementById('nm-profile') as HTMLElement,
          placement: BTourPlacement.Right,
        },
        {
          title: 'Notifications',
          description: 'Choose which events trigger email or push notifications.',
          target: () => document.getElementById('nm-notif') as HTMLElement,
          placement: BTourPlacement.Right,
        },
        {
          title: 'Security',
          description: 'Enable two-factor authentication and review active sessions.',
          target: () => document.getElementById('nm-security') as HTMLElement,
          placement: BTourPlacement.Right,
        },
        {
          title: 'Billing',
          description: 'Manage your subscription, invoices, and payment methods.',
          target: () => document.getElementById('nm-billing') as HTMLElement,
          placement: BTourPlacement.Right,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <div style="display:flex; gap:1rem;">
          <!-- Sidebar nav -->
          <nav style="width:160px; display:flex; flex-direction:column; gap:0.25rem; flex-shrink:0;">
            <div
              v-for="item in [
                { id:'nm-profile',  icon:'👤', label:'Profile' },
                { id:'nm-notif',    icon:'🔔', label:'Notifications' },
                { id:'nm-security', icon:'🔒', label:'Security' },
                { id:'nm-billing',  icon:'💳', label:'Billing' },
              ]"
              :key="item.id"
              :id="item.id"
              style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.75rem; border-radius:0.375rem; border:1px solid #e5e7eb; background:#fff; cursor:pointer; font-size:0.8125rem;"
            >
              {{ item.icon }} {{ item.label }}
            </div>
          </nav>

          <!-- Content area -->
          <div :style="UI.card" style="flex:1; min-height:12rem;">
            <div :style="UI.label" style="margin-bottom:0.5rem;">Select a section</div>
            <p style="color:#6b7280; font-size:0.8125rem;">Click any menu item on the left, or start the tour to get oriented.</p>
          </div>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            No Mask Tour
          </button>
        </div>

        <BTour :steps="steps" :mask="false" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`mask=false` - the overlay is removed so users can still interact with the page while the tour runs.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// WithTargets - code editor toolbar
// ─────────────────────────────────────────────

export const WithTargets: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Run Code',
          description: 'Execute the current file and see output in the panel below.',
          target: () => document.getElementById('wt-run') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Format',
          description: 'Auto-format your code with Prettier on save or on demand.',
          target: () => document.getElementById('wt-format') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Terminal',
          description: 'Open an integrated terminal pane at the bottom of the editor.',
          target: () => document.getElementById('wt-terminal') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Extensions',
          description: 'Browse and install plugins to extend editor functionality.',
          target: () => document.getElementById('wt-ext') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
        {
          title: 'Settings',
          description: 'Customise keybindings, themes, and editor preferences.',
          target: () => document.getElementById('wt-settings') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <!-- Editor chrome -->
        <div style="background:#1e1e2e; border-radius:0.5rem; overflow:hidden;">
          <!-- Title bar - decorative chrome, aria-hidden -->
          <div style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem 0.75rem; background:#181825; border-bottom:1px solid #313244;" aria-hidden="true">
            <span style="display:flex; gap:0.375rem;">
              <span style="width:0.75rem; height:0.75rem; border-radius:50%; background:#ff5f57; display:inline-block;"></span>
              <span style="width:0.75rem; height:0.75rem; border-radius:50%; background:#ffbd2e; display:inline-block;"></span>
              <span style="width:0.75rem; height:0.75rem; border-radius:50%; background:#28c840; display:inline-block;"></span>
            </span>
            <span style="flex:1; text-align:center; font-size:0.75rem; color:#a6adc8;">main.ts - MyProject</span>
          </div>

          <!-- Toolbar -->
          <div style="display:flex; align-items:center; gap:0.25rem; padding:0.375rem 0.75rem; background:#181825; border-bottom:1px solid #313244;">
            <button id="wt-run"      type="button" style="padding:0.3rem 0.75rem; border:none; border-radius:0.25rem; background:#277513; color:#fff; font-size:0.75rem; cursor:pointer;">▶ Run</button>
            <button id="wt-format"   type="button" style="padding:0.3rem 0.75rem; border:1px solid #45475a; border-radius:0.25rem; background:transparent; color:#cdd6f4; font-size:0.75rem; cursor:pointer;">⇆ Format</button>
            <button id="wt-terminal" type="button" style="padding:0.3rem 0.75rem; border:1px solid #45475a; border-radius:0.25rem; background:transparent; color:#cdd6f4; font-size:0.75rem; cursor:pointer;">$ Terminal</button>
            <span style="flex:1;" />
            <button id="wt-ext"      type="button" style="padding:0.3rem 0.5rem; border:1px solid #45475a; border-radius:0.25rem; background:transparent; color:#cdd6f4; font-size:0.75rem; cursor:pointer;">⧉ Ext</button>
            <button id="wt-settings" type="button" aria-label="Settings" style="padding:0.3rem 0.5rem; border:1px solid #45475a; border-radius:0.25rem; background:transparent; color:#cdd6f4; font-size:0.75rem; cursor:pointer;">⚙</button>
          </div>

          <!-- Fake code area - decorative, aria-hidden -->
          <pre style="margin:0; padding:1rem; font-size:0.8125rem; color:#cdd6f4; font-family:monospace; line-height:1.6; min-height:6rem; overflow:auto;" aria-hidden="true"><code><span style="color:#89b4fa;">import</span> <span style="color:#cdd6f4;">{ ref } </span><span style="color:#89b4fa;">from</span> <span style="color:#a6e3a1;">'vue'</span>
<span style="color:#89b4fa;">const</span> <span style="color:#cba6f7;">count</span> <span style="color:#89dceb;">=</span> <span style="color:#89b4fa;">ref</span>(<span style="color:#fab387;">0</span>)</code></pre>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Begin Guided Tour
          </button>
        </div>

        <BTour :steps="steps" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Five targeted steps across a code-editor toolbar - Run, Format, Terminal, Extensions, and Settings.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Custom indicators - e-commerce checkout
// ─────────────────────────────────────────────

export const CustomIndicators: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Cart Summary',
          description: 'Review your items, quantities, and individual prices here.',
          target: () => document.getElementById('ci-cart') as HTMLElement,
          placement: BTourPlacement.Left,
        },
        {
          title: 'Promo Code',
          description: 'Enter a discount code to reduce your total at checkout.',
          target: () => document.getElementById('ci-promo') as HTMLElement,
          placement: BTourPlacement.Top,
        },
        {
          title: 'Shipping Options',
          description: 'Choose between standard, express, or same-day delivery.',
          target: () => document.getElementById('ci-shipping') as HTMLElement,
          placement: BTourPlacement.Top,
        },
        {
          title: 'Place Order',
          description: 'Confirm your order once you are happy with everything.',
          target: () => document.getElementById('ci-order') as HTMLElement,
          placement: BTourPlacement.Top,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <div style="display:grid; grid-template-columns:1fr 280px; gap:0.75rem;">
          <!-- Order form -->
          <div :style="UI.card" style="display:flex; flex-direction:column; gap:0.75rem;">
            <!-- Promo -->
            <div id="ci-promo">
              <label :style="UI.label" style="display:block; margin-bottom:0.375rem;">Promo Code</label>
              <div style="display:flex; gap:0.5rem;">
                <input type="text" placeholder="e.g. SAVE20" style="flex:1; padding:0.375rem 0.625rem; border:1px solid #d1d5db; border-radius:0.375rem; font-size:0.8125rem;" />
                <button type="button" :style="UI.btn">Apply</button>
              </div>
            </div>

            <!-- Shipping -->
            <div id="ci-shipping">
              <div :style="UI.label" style="margin-bottom:0.375rem;">Shipping</div>
              <div style="display:flex; flex-direction:column; gap:0.375rem;">
                <label v-for="(opt, i) in [{label:'Standard (3-5 days)', price:'Free'},{label:'Express (1-2 days)', price:'$9.99'},{label:'Same-day', price:'$19.99'}]" :key="i"
                  style="display:flex; align-items:center; gap:0.5rem; font-size:0.8125rem; cursor:pointer;">
                  <input type="radio" name="shipping" :checked="i===0" style="accent-color:oklch(55% 0.169 237.323);" />
                  <span>{{ opt.label }}</span>
                  <span style="margin-left:auto; color:#6b7280;">{{ opt.price }}</span>
                </label>
              </div>
            </div>

            <!-- Place order -->
            <div id="ci-order" style="margin-top:auto;">
              <button type="button" style="width:100%; padding:0.625rem; border:none; border-radius:0.375rem; background:oklch(55% 0.169 237.323); color:#fff; font-size:0.875rem; font-weight:600; cursor:pointer;">
                Place Order · $84.97
              </button>
            </div>
          </div>

          <!-- Cart summary -->
          <div id="ci-cart" :style="UI.card" style="display:flex; flex-direction:column; gap:0.5rem;">
            <div :style="UI.label" style="margin-bottom:0.25rem;">Order Summary</div>
            <div v-for="item in [{name:'Wireless Mouse',qty:1,price:'$29.99'},{name:'USB-C Hub',qty:2,price:'$44.98'},{name:'Cable Set',qty:1,price:'$10.00'}]" :key="item.name"
              style="display:flex; justify-content:space-between; font-size:0.8125rem; padding:0.25rem 0; border-bottom:1px solid #f3f4f6;">
              <span>{{ item.name }} ×{{ item.qty }}</span>
              <span style="color:#374151;">{{ item.price }}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:600; font-size:0.875rem; margin-top:0.25rem;">
              <span>Total</span><span>$84.97</span>
            </div>
          </div>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Custom Indicators Tour
          </button>
        </div>

        <BTour :steps="steps" v-model:open="isOpen" v-model:current="step">
          <template #indicatorsRender="{ current, total }">
            <span style="font-size:0.75rem; color:inherit; opacity:0.75; font-variant-numeric:tabular-nums;">
              {{ current + 1 }} / {{ total }}
            </span>
          </template>
        </BTour>
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The `indicatorsRender` slot replaces dots with a "current / total" counter. Tour targets a checkout page.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Accessibility - admin table
// ─────────────────────────────────────────────

export const Accessibility: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Invite Members',
          description: 'Add new team members by email and assign them a role.',
          target: () => document.getElementById('a11y-invite') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Role Filter',
          description: 'Filter the list to show only Admins, Editors, or Viewers.',
          target: () => document.getElementById('a11y-filter') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Bulk Actions',
          description: 'Select multiple rows then apply actions like Remove or Change Role.',
          target: () => document.getElementById('a11y-bulk') as HTMLElement,
          placement: BTourPlacement.BottomLeft,
        },
        {
          title: 'Export',
          description: 'Download the full member list as a CSV file.',
          target: () => document.getElementById('a11y-export') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <p style="font-size:0.8125rem; color:#6b7280; margin:0;" aria-hidden="true">
          Tour popup: <code>role="dialog"</code> + <code>aria-modal="true"</code>. Navigate with
          <kbd style="padding:0.1rem 0.3rem; border:1px solid #d1d5db; border-radius:0.25rem; font-size:0.75rem;">Up</kbd>
          <kbd style="padding:0.1rem 0.3rem; border:1px solid #d1d5db; border-radius:0.25rem; font-size:0.75rem;">Down</kbd>
          arrow keys, <kbd style="padding:0.1rem 0.3rem; border:1px solid #d1d5db; border-radius:0.25rem; font-size:0.75rem;">Tab</kbd>
          within popup, <kbd style="padding:0.1rem 0.3rem; border:1px solid #d1d5db; border-radius:0.25rem; font-size:0.75rem;">Esc</kbd> to close.
        </p>

        <!-- Toolbar -->
        <div :style="UI.toolbar">
          <button id="a11y-invite" type="button" :style="UI.btnPrimary">+ Invite</button>
          <select id="a11y-filter" aria-label="Filter by role" style="padding:0.3125rem 0.625rem; border:1px solid #d1d5db; border-radius:0.375rem; font-size:0.8125rem; background:#fff;">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
          <span style="flex:1;" />
          <button id="a11y-bulk"   type="button" :style="UI.btn">☰ Bulk</button>
          <button id="a11y-export" type="button" :style="UI.btn">↓ Export</button>
        </div>

        <!-- Member table -->
        <div :style="UI.card" style="overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.8125rem;">
            <thead>
              <tr style="border-bottom:1px solid #e5e7eb; color:#6b7280;">
                <th style="padding:0.375rem 0.5rem; text-align:left; font-weight:600;">Name</th>
                <th style="padding:0.375rem 0.5rem; text-align:left; font-weight:600;">Email</th>
                <th style="padding:0.375rem 0.5rem; text-align:left; font-weight:600;">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in [{name:'Alice',email:'alice@co.io',role:'Admin'},{name:'Bob',email:'bob@co.io',role:'Editor'},{name:'Carol',email:'carol@co.io',role:'Viewer'}]" :key="m.name"
                style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:0.5rem;">{{ m.name }}</td>
                <td style="padding:0.5rem; color:#6b7280;">{{ m.email }}</td>
                <td style="padding:0.5rem;">
                  <span style="padding:0.125rem 0.5rem; border-radius:9999px; background:#f3f4f6; font-size:0.75rem;">{{ m.role }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <button type="button" :style="UI.btnPrimary" @click="isOpen = true; step = 0">
            Start Accessible Tour
          </button>
        </div>

        <BTour :steps="steps" :keyboard="true" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  play: async ({ canvasElement }) => {
    // BTour uses <Teleport to="body"> - popup lives outside canvasElement.
    // Scope trigger-button queries to canvasElement; scope popup queries to
    // the teleported popup node to avoid collisions with canvas buttons.
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // ── 1. Tour is closed on mount ────────────────────────────────────────
    expect(document.body.querySelector('.b-tour__popup')).toBeNull();

    // ── 2. Open the tour ──────────────────────────────────────────────────
    await user.click(canvas.getByRole('button', { name: /start accessible tour/i }));

    // Vue's scheduler is async - wait until the popup is in the DOM.
    await waitFor(() => expect(document.body.querySelector('.b-tour__popup')).not.toBeNull());

    const popup = document.body.querySelector<HTMLElement>('.b-tour__popup')!;
    const withinPopup = within(popup);

    // ── 3. ARIA: dialog role + aria-modal ─────────────────────────────────
    const dialog = document.body.querySelector('[role="dialog"]')!;
    expect(dialog).toBeTruthy();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // ── 4. ARIA: aria-label reflects the current step title ───────────────
    expect(dialog).toHaveAttribute('aria-label', 'Invite Members');

    // ── 5. Close button has accessible name ──────────────────────────────
    expect(withinPopup.getByRole('button', { name: /close tour/i })).toBeTruthy();

    // ── 6. Next button has accessible name ───────────────────────────────
    const nextBtn = withinPopup.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeTruthy();

    // ── 7. First indicator is active and carries aria-current="step" ─────
    const activeIndicator = popup.querySelector('.b-tour__indicator--active');
    expect(activeIndicator).toBeTruthy();
    expect(activeIndicator).toHaveAttribute('aria-current', 'step');

    // ── 8. Navigate to step 2 - wait for Vue re-render, then check ────────
    await user.click(nextBtn);
    await waitFor(() =>
      expect(document.body.querySelector('[role="dialog"]')).toHaveAttribute(
        'aria-label',
        'Role Filter',
      ),
    );

    // Re-query popup after navigation to avoid stale reference
    const popup2 = document.body.querySelector<HTMLElement>('.b-tour__popup')!;

    // Second indicator is now active; first is not
    const dots = popup2.querySelectorAll('.b-tour__indicator');
    expect(dots[0]).not.toHaveAttribute('aria-current');
    expect(dots[1]).toHaveAttribute('aria-current', 'step');

    // ── 9. Escape closes the tour ─────────────────────────────────────────
    // fireEvent targets the element directly - no focus-tracking side-effects.
    // The @keydown listener is on .b-tour__popup, so dispatch there.
    fireEvent.keyDown(popup2, { key: 'Escape', code: 'Escape', bubbles: true });
    await waitFor(() => expect(document.body.querySelector('.b-tour__popup')).toBeNull());
  },
  parameters: {
    docs: {
      description: {
        story:
          'Targets four toolbar controls on a team management table. Interaction test verifies `role`, `aria-modal`, button labels, and `aria-current`.',
      },
    },
  },
};

// ─────────────────────────────────────────────
// Theming - analytics dashboard
// ─────────────────────────────────────────────

export const Theming: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Date Range',
          description: 'Select a custom date range to scope all charts and metrics.',
          target: () => document.getElementById('th-date') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'KPI Cards',
          description: 'High-level numbers updated in real time from your data source.',
          target: () => document.getElementById('th-kpis') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Chart Area',
          description: 'Visualise trends over time. Hover a point to see exact values.',
          target: () => document.getElementById('th-chart') as HTMLElement,
          placement: BTourPlacement.Top,
        },
        {
          title: 'Export Report',
          description: 'Download a PDF or CSV snapshot of the current view.',
          target: () => document.getElementById('th-export') as HTMLElement,
          placement: BTourPlacement.BottomRight,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div
        style="
          --b-tour-popup-bg: oklch(30% 0.05 300);
          --b-tour-title-color: oklch(95% 0.05 300);
          --b-tour-description-color: oklch(80% 0.04 300);
          --b-tour-next-btn-bg: oklch(70% 0.2 300);
          --b-tour-next-btn-hover-bg: oklch(62% 0.2 300);
          --b-tour-indicator-active-bg: oklch(70% 0.2 300);
          --b-tour-arrow-bg: oklch(30% 0.05 300);
          --b-tour-close-color: oklch(75% 0.04 300);
          --b-tour-mask-bg: rgba(20, 0, 40, 0.7);
        "
      >
        <div :style="UI.page" style="gap:0.75rem;">
          <!-- Header -->
          <div :style="UI.toolbar">
            <span style="font-weight:600;">Analytics</span>
            <span style="flex:1;" />
            <button id="th-date"   type="button" :style="UI.btn">📅 Last 30 days</button>
            <button id="th-export" type="button" :style="UI.btn">↓ Export</button>
          </div>

          <!-- KPI row -->
          <div id="th-kpis" style="display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem;">
            <div v-for="kpi in [{label:'Sessions',val:'48.2k',delta:'+12%'},{label:'Bounce',val:'34.1%',delta:'-3%'},{label:'Conv.',val:'5.8%',delta:'+0.9%'},{label:'Revenue',val:'$31.4k',delta:'+18%'}]" :key="kpi.label"
              :style="UI.card" style="text-align:center;">
              <div style="font-size:1.125rem; font-weight:700; color:#111827;">{{ kpi.val }}</div>
              <div style="font-size:0.75rem; color:#6b7280;">{{ kpi.label }}</div>
              <div style="font-size:0.75rem; color:oklch(50% 0.15 149);">{{ kpi.delta }}</div>
            </div>
          </div>

          <!-- Chart placeholder - decorative bars, aria-hidden -->
          <div id="th-chart" :style="UI.card" role="img" aria-label="Bar chart showing session trends" style="min-height:8rem; display:flex; align-items:flex-end; gap:0.375rem; padding-bottom:1rem;">
            <div v-for="(h, i) in [40,65,50,80,70,90,60,75,85,55,95,72]" :key="i"
              aria-hidden="true"
              style="flex:1; border-radius:0.25rem 0.25rem 0 0; background:oklch(55% 0.2 300); opacity:0.85; transition:opacity 0.15s;"
              :style="{ height: h + '%' }"
            />
          </div>

          <div>
            <button type="button"
              style="padding:0.375rem 0.875rem; border:none; border-radius:0.375rem; background:oklch(50% 0.2 300); color:#fff; font-size:0.8125rem; cursor:pointer;"
              @click="isOpen = true; step = 0"
            >
              Open Themed Tour
            </button>
          </div>

          <BTour :steps="steps" v-model:open="isOpen" v-model:current="step" />
        </div>
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Overrides `--b-tour-popup-bg`, `--b-tour-title-color`, `--b-tour-next-btn-bg`, `--b-tour-indicator-active-bg`, and `--b-tour-mask-bg`. Tour targets an analytics dashboard.',
      },
      source: {
        code: `<div style="
  --b-tour-popup-bg: oklch(30% 0.05 300);
  --b-tour-title-color: oklch(95% 0.05 300);
  --b-tour-next-btn-bg: oklch(70% 0.2 300);
  --b-tour-indicator-active-bg: oklch(70% 0.2 300);
  --b-tour-mask-bg: rgba(20, 0, 40, 0.7);
">
  <BTour :steps="steps" v-model:open="open" v-model:current="current" />
</div>`,
      },
    },
  },
};

// ─────────────────────────────────────────────
// Interaction test - full navigation flow
// ─────────────────────────────────────────────

export const InteractionFlow: Story = {
  render: () => ({
    components: { BTour },
    setup() {
      const isOpen = ref(false);
      const step = ref(0);

      const steps: BTourStep[] = [
        {
          title: 'Upload File',
          description: 'Put your files here to start the upload process.',
          target: () => document.getElementById('if-upload') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Save to Local Drive',
          description: 'Save your files to a local drive for backup.',
          target: () => document.getElementById('if-save') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
        {
          title: 'Share',
          description: 'Share your files with friends and colleagues.',
          target: () => document.getElementById('if-share') as HTMLElement,
          placement: BTourPlacement.Bottom,
        },
      ];

      return { steps, isOpen, step };
    },
    template: `
      <div :style="UI.page" style="gap:0.75rem;">
        <div :style="UI.toolbar">
          <button id="if-upload" type="button" :style="UI.btnPrimary">↑ Upload</button>
          <button id="if-save"   type="button" :style="UI.btn">💾 Save</button>
          <span style="flex:1;" />
          <button id="if-share"  type="button" :style="UI.btn">⇒ Share</button>
        </div>

        <div :style="UI.card" style="min-height:5rem; display:flex; align-items:center; justify-content:center; color:#6b7280;" aria-hidden="true">
          Drop files here or use the toolbar above
        </div>

        <div>
          <button
            id="if-start"
            type="button"
            :style="UI.btnPrimary"
            @click="isOpen = true; step = 0"
          >
            Start Tour
          </button>
        </div>

        <BTour :steps="steps" v-model:open="isOpen" v-model:current="step" />
      </div>
    `,
    data() {
      return { UI };
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    // 1. Tour is initially closed
    expect(document.body.querySelector('.b-tour__popup')).toBeNull();

    // 2. Open tour (trigger lives in canvasElement, popup teleports to body)
    await user.click(canvas.getByRole('button', { name: /start tour/i }));
    await waitFor(() => expect(document.body.querySelector('.b-tour__popup')).not.toBeNull());

    // 3. Step 1 visible - re-query popup each time to avoid stale refs after Vue re-renders
    await waitFor(() =>
      expect(
        document.body.querySelector('.b-tour__popup .b-tour__title')?.textContent?.trim(),
      ).toBe('Upload File'),
    );

    // 4. No prev on step 0
    expect(document.body.querySelector('.b-tour__popup .b-tour__btn--prev')).toBeNull();

    // 5. Next → step 2
    await user.click(
      within(document.body.querySelector<HTMLElement>('.b-tour__popup')!).getByRole('button', {
        name: /next/i,
      }),
    );
    await waitFor(() =>
      expect(
        document.body.querySelector('.b-tour__popup .b-tour__title')?.textContent?.trim(),
      ).toBe('Save to Local Drive'),
    );
    expect(document.body.querySelector('.b-tour__popup .b-tour__btn--prev')).toBeTruthy();

    // 6. Next → step 3 (last - button label changes to "Finish")
    await user.click(
      within(document.body.querySelector<HTMLElement>('.b-tour__popup')!).getByRole('button', {
        name: /next/i,
      }),
    );
    await waitFor(() =>
      expect(
        document.body.querySelector('.b-tour__popup .b-tour__title')?.textContent?.trim(),
      ).toBe('Share'),
    );
    expect(
      document.body.querySelector('.b-tour__popup .b-tour__btn--next')?.textContent?.trim(),
    ).toBe('Finish');

    // 7. Finish closes the tour
    await user.click(
      within(document.body.querySelector<HTMLElement>('.b-tour__popup')!).getByRole('button', {
        name: /finish/i,
      }),
    );
    await waitFor(() => expect(document.body.querySelector('.b-tour__popup')).toBeNull());
  },
  parameters: {
    docs: {
      description: {
        story:
          'Automated interaction test: open → step through Upload / Save / Share → Finish → verify closed.',
      },
    },
  },
};
