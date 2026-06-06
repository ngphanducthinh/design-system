# Storybook Story Format Guide

This document defines the canonical structure for every `*.stories.ts` file under `src/stories/`. The format is modelled after [Nuxt UI v3](https://ui.nuxt.com/docs/components) — every prop and recipe gets its own preview-with-snippet, plus an *Examples* section for composed real-world patterns.

It exists so that:

1. **Consumers** can scan the docs panel of any component and see one focused example per feature, with a copy-pasteable code snippet right next to it.
2. **Contributors** know exactly where new stories belong when adding a feature.

## File anatomy

```
default export (meta)
  argTypes — every prop, grouped via table.category:
    "Props" | "Two-Way Binding Props" | "Slots" | "Events"
  parameters.docs.description.component — overview + when-to-use

# Usage section — one story per prop / state, each with parameters.docs.source.code
  Default
  <Prop1>            (e.g. Color, Size, Variant — granular, one prop each)
  <Prop2>
  ...
  Disabled / Loading / etc. — each its own story
  WithIcon / WithSlot — slot demos when applicable

# Examples section — composed recipes
  AsLink                  (e.g. button rendered as anchor)
  InsideForm              (form integration)
  ControlledVsUncontrolled
  WithOtherComponent      (e.g. Modal with Tooltip trigger)

# Accessibility — keyboard + ARIA play function
  Accessibility           (with play function using @storybook/test)

# Theming — override CSS vars demo (>= 3 vars)
  Theming

# Design Tokens — full token table (LAST story, name: 'Design Tokens')
  DesignTokens
```

## Required for every story

```ts
parameters: {
  docs: {
    source: {
      code: `<BFoo prop="value">…</BFoo>`,  // clean, copy-pasteable, no test scaffolding
    },
  },
},
```

The `code` snippet should be **exactly** what a consumer would paste into their own `<template>`. Drop `setup()` boilerplate, `const args =`, etc. — those belong in `render()`, not in the documented snippet.

## argTypes — category buckets

Every prop, slot, and event in `argTypes` gets a `table.category`:

```ts
argTypes: {
  // Props (default)
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
    description: 'Size of the component.',
    table: { category: 'Props', defaultValue: { summary: 'md' } },
  },

  // Two-Way Binding Props — modelValue, modelModifiers, etc.
  modelValue: {
    control: 'text',
    description: 'The bound value.',
    table: { category: 'Two-Way Binding Props', defaultValue: { summary: 'undefined' } },
  },

  // Slots — defined as argTypes only when documenting them
  default: {
    description: 'Main content slot.',
    table: { category: 'Slots' },
  },

  // Events
  'onChange': {
    description: 'Emitted when the value changes.',
    table: { category: 'Events' },
  },
},
```

The mandatory categories are exactly those four strings (case-sensitive). Storybook v10's autodocs renders one collapsible group per category.

## When to split a clustered story

Use judgment, not a mechanical rule:

- **Split** when each value of a prop has visibly distinct meaning a consumer would copy in isolation.
  - `BButton`'s 6 colors → 6 stories (`Primary`, `Secondary`, `Success`, …) ✅
  - `BAlert`'s 4 types (info/success/warning/error) → 4 stories ✅
  - `BTag`'s `variant` (solid/outlined) → 2 stories ✅
- **Combine** when values differ only in a single visual attribute and the comparison is the point.
  - `Sizes` story showing sm/md/lg side by side is more useful than 3 single-size stories ✅
  - `Disabled` is one story showing the disabled state — not separate `DisabledPrimary`/`DisabledSecondary` ✅

If unsure, lean toward splitting. Each story renders fast, and granular stories are easier to deep-link from prose docs.

## The Examples section

Every component file should have **2-4 recipe stories** under an `Examples` heading-style group. These are composed real-world patterns, not single-prop demos. Examples that work well:

| Component | Recipe |
|---|---|
| `BButton` | `AsLink` (`href`/`to`), `WithIcon`, `IconOnly`, `LoadingState` |
| `BInput` | `WithPrefixSlot`, `PasswordWithToggle`, `InsideForm`, `WithCharacterCount` |
| `BSelect` | `Multiple`, `Searchable`, `InsideFormWithValidation`, `Async` |
| `BModal` | `OpenedFromButton`, `WithFooterActions`, `Confirmation`, `LongScrollableContent` |
| `BForm` | `LoginForm`, `WithZodSchema`, `HorizontalLayout`, `DynamicFields` |

When a recipe references another `B*` component, only use components that already exist in this lib. Cross-component recipes are good — they show how the pieces fit together.

## Accessibility story

Every component file has an `Accessibility` story that:

1. Renders a representative instance.
2. Has a `play(context)` function using `@storybook/test`'s `userEvent`, `within`, `expect`, `waitFor`.
3. Asserts at least:
   - The component's documented ARIA role / `role` attribute.
   - Keyboard interactions (Tab order, Enter / Space / Escape behavior where applicable).
   - Focus is moved/returned correctly for overlay components.

Never use `await new Promise(r => setTimeout(r, ...))` — use `vi.useFakeTimers()` patterns with `waitFor`.

## Theming story

Demonstrates **at least three** scoped CSS variables being overridden. The override is applied to the component root via inline `style` (most readable) or a wrapping `<div>`. The story description explains *which* tokens are being overridden and what they control.

For components with no scoped `--b-{component}-*` vars (e.g. `BButton`, which uses Tailwind utilities against the global `--color-*` family), keep a "global tokens" treatment that overrides at least three of the global theme tokens the component consumes.

## Design Tokens story (LAST)

```ts
export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BFoo</code>. Override on the component root or any ancestor selector.',
      },
    },
  },
  render: () => ({ /* table rendering each token row */ }),
};
```

Render a `<table>` with three columns: `CSS Variable`, `Default`, `Description`. The data is a `const DESIGN_TOKENS: TokenRow[]` defined above the story. See `src/stories/General/BButton.stories.ts` for the canonical pattern (note BButton is a special case because it has no scoped vars; it documents the global tokens it consumes).

This story **must be the last export** in the file. Tooling and consumer expectations rely on this.

## Worked example skeleton

```ts
import { BFoo } from '@/components';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from '@storybook/test';

const meta = {
  title: 'Category/Foo',
  component: BFoo,
  tags: ['autodocs'],
  argTypes: {
    size:        { control: 'select', options: ['sm', 'md', 'lg'], table: { category: 'Props' } },
    color:       { control: 'select', options: ['primary', 'secondary'], table: { category: 'Props' } },
    modelValue:  { control: 'text', table: { category: 'Two-Way Binding Props' } },
    default:     { description: 'Main content slot.', table: { category: 'Slots' } },
    onChange:    { description: 'Fires on value change.', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      description: {
        component: '<code>BFoo</code> is a foo component used for foo-ing.',
      },
    },
  },
} satisfies Meta<typeof BFoo>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Usage ──
export const Default: Story = {
  args: { color: 'primary', size: 'md' },
  parameters: { docs: { source: { code: `<BFoo color="primary">Hello</BFoo>` } } },
  render: (args) => ({
    components: { BFoo },
    setup: () => ({ args }),
    template: `<BFoo v-bind="args">Hello</BFoo>`,
  }),
};

export const Primary: Story = {
  parameters: { docs: { source: { code: `<BFoo color="primary">Primary</BFoo>` } } },
  render: () => ({
    components: { BFoo },
    template: `<BFoo color="primary">Primary</BFoo>`,
  }),
};

// … one story per granular prop value …

// ── Examples ──
export const InsideForm: Story = {
  parameters: { docs: { source: { code: `<BForm><BFormItem><BFoo /></BFormItem></BForm>` } } },
  render: () => ({ /* … */ }),
};

// ── Accessibility ──
export const Accessibility: Story = {
  render: () => ({ components: { BFoo }, template: `<BFoo aria-label="example">x</BFoo>` }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const el = c.getByRole('button');
    await expect(el).toHaveAttribute('aria-label', 'example');
  },
};

// ── Theming ──
export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Override <code>--b-foo-bg</code>, <code>--b-foo-fg</code>, and <code>--b-foo-radius</code> on the component root.',
      },
      source: {
        code: `
<BFoo style="--b-foo-bg: #fee; --b-foo-fg: #900; --b-foo-radius: 999px;">
  Themed
</BFoo>
        `,
      },
    },
  },
  render: () => ({
    components: { BFoo },
    template: `
      <BFoo style="--b-foo-bg: oklch(95% 0.05 30); --b-foo-fg: oklch(40% 0.2 30); --b-foo-radius: 999px;">
        Themed
      </BFoo>
    `,
  }),
};

// ── Design Tokens (LAST) ──
type TokenRow = { token: string; defaultValue: string; description: string };
const DESIGN_TOKENS: TokenRow[] = [
  { token: '--b-foo-bg',     defaultValue: 'transparent',          description: 'Background color.' },
  { token: '--b-foo-fg',     defaultValue: 'currentColor',         description: 'Text color.' },
  { token: '--b-foo-radius', defaultValue: '0.375rem',             description: 'Border radius.' },
];

export const DesignTokens: Story = {
  name: 'Design Tokens',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'All scoped CSS variables exposed by <code>BFoo</code>.',
      },
    },
  },
  render: () => ({
    setup: () => ({ tokens: DESIGN_TOKENS }),
    template: `
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:oklch(96% 0.002 260);">
            <th style="text-align:left;padding:10px 12px;">CSS Variable</th>
            <th style="text-align:left;padding:10px 12px;">Default</th>
            <th style="text-align:left;padding:10px 12px;">Description</th>
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
    `,
  }),
};
```

## Reference exemplar

The fully-converted exemplar is [src/stories/General/BButton.stories.ts](../src/stories/General/BButton.stories.ts). When in doubt, copy it.
