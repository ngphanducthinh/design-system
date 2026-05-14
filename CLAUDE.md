# Design System - Project Context for Claude

## Project Identity

- **Package:** `@7pmlabs/design-system`
- **Version:** `0.0.117`
- **Type:** Vue 3 component library published to NPM
- **Purpose:** Custom design system inspired by Ant Design, built from scratch

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Vue 3.5 (Composition API, `<script setup>` only - no Options API) |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 4 with `prefix('b')` + scoped CSS custom properties |
| Build | Vite 8 + Rolldown (library mode, ES modules, `preserveModules: true`) |
| Testing | Vitest (unit), Playwright (e2e), Storybook vitest addon (browser) |
| Linting | ESLint 9 flat config + oxlint; Prettier with `prettier-plugin-tailwindcss` |
| Package manager | Bun (primary), npm fallback |
| Storybook | v10.3 with Vue3-Vite, a11y addon, vitest addon, autodocs |

---

## Repository Structure

```
src/
├── assets/
│   ├── main.css          # Global style entry (imports reset + tailwind)
│   ├── resetUAS.css      # User-agent style resets
│   └── tailwind.css      # Tailwind @theme with design tokens (OKLCH colors)
├── components/           # All Vue components (one folder per component)
├── composables/          # Vue composables (e.g., useComponentId.ts)
├── utils/                # Helper functions (e.g., debounce.ts)
├── stories/              # Storybook stories (General / DataDisplay / Feedback / Navigation)
├── index.ts              # Library entry: re-exports components + types + imports CSS
├── types.ts              # Global enums & interfaces (~317 lines)
└── constants.ts          # BIconSizeMap, PIKey injection symbols
```



---

## Component Structure Convention

Every component lives in `src/components/<ComponentName>/` and contains:

```
BComponentName/
├── BComponentName.vue        # Main SFC - script setup + template (no scoped style block)
├── BComponentName.spec.ts    # Vitest unit tests
├── types.ts                  # Component-specific TypeScript types (if needed)
├── index.ts                  # Named exports: component + types
└── BSubComponent.vue         # Sub-components when needed (e.g., BTimelineItem)
```

Stories live separately in `src/stories/<Category>/BComponentName.stories.ts`.

---

## Naming Conventions

- **Components:** PascalCase with `B` prefix - `BButton`, `BTree`, `BTimeline`
- **Props:** camelCase - `checkable`, `treeData`, `defaultExpandedKeys`
- **Emits:** camelCase - `check`, `expand`, `select`
- **CSS classes:** kebab-case with `b-` prefix - `.b-button`, `.b-tree-item`
- **CSS vars:** `--b-{component}-{token}` - `--b-timeline-item-dot-color`
- **Tailwind classes:** prefixed with `b:` - `b:flex`, `b:bg-primary`, `b:hover:not-disabled:bg-primary-hover`

---

## Component Authoring Rules

1. **Always use `<script setup>`** - no Options API, no `defineComponent()` wrapper.
2. **Destructure props with inline defaults** - `const { size = 'md', disabled = false } = defineProps<{...}>()`.
3. **JSDoc every prop** - describe purpose, accepted values, default, example.
4. **No `<style scoped>` block** - use Tailwind utilities + CSS custom properties only.
5. **CSS-first animations** - transitions, hover states, and layout done in CSS; JS only for logic.
6. **Scoped CSS vars on component root** - never on `:root`; scope to `.b-{component}`.
7. **Dark mode** - reassign CSS vars under `[data-prefers-color='dark']` selector.
8. **Accessibility first** - proper ARIA roles, `aria-label`, keyboard navigation, focus management.
9. **Use `useComponentId()`** for generating unique IDs needed for ARIA relationships.
10. **Provide/inject for hierarchies** - use `PIKey` symbols from `constants.ts`.
11. **Helper functions for conditional classes** - `isSize()`, `isVariant()`, `isColor()` etc.
12. **Controlled + uncontrolled** - support both `v-model` binding and prop-driven patterns.

---

## Styling Architecture

- **Reset layer:** `resetUAS.css`
- **Tailwind theme** (`src/assets/tailwind.css`):
  - Color space: OKLCH (perceptually uniform)
  - 6 color families: `primary`, `secondary`, `success`, `failure`, `warning`, `info`
  - 3 variants each: base, `-hover`, `-hover-light`
  - All prefixed `b:` to prevent host-app style collisions
- **Component tokens:** Scoped CSS vars on the component's root class (e.g., `.b-tree { --b-tree-indent: 1.5rem; }`)
- **Dark mode:** `[data-prefers-color='dark']` on `<html>` (plus `@media prefers-color-scheme: dark`)
- **Motion:** Respect `prefers-reduced-motion` in transitions

---

## Export Strategy

```
src/index.ts
  └── import './assets/main.css'
  └── export * from './components'     (barrel via src/components/index.ts)
  └── export * from './types'

dist/
  ├── design-system.js        # ESM bundle (peer dep: vue excluded)
  ├── design-system.css       # All styles
  └── types/index.d.ts        # TypeScript declarations
```

Package `exports` field maps `"."` → JS + types, `"./style.css"` → CSS.

---

## Testing Conventions

**Unit tests (Vitest + @vue/test-utils):**
```typescript
describe('BComponent', () => {
  it('renders with default props', () => {
    const wrapper = mount(BComponent, { props: {...} });
    expect(wrapper.classes()).toContain('b-component');
  });
  // Cover: variants, sizes, states, emits, slots, keyboard nav, a11y attributes
});
```

**Storybook stories:**
```typescript
const meta = { title: 'Category/BComponent', component: BComponent, tags: ['autodocs'] } satisfies Meta<...>;
export const Playground: Story = { args: {...} };
export const Accessibility: Story = { play: async ({ canvasElement }) => { /* axe + interactions */ } };
```

**Run commands:**
- `bun run test:unit` - Vitest unit tests
- `bun run test:storybook` - Storybook browser tests
- `bun run test:e2e` - Playwright e2e

---

## Mandatory Test Verification (MUST follow)

**After completing any component work (new component, rework, bug fix), you MUST run and verify ALL of the following before reporting the task as done:**

1. **Unit tests** — Run `bun run test:unit` (or target the specific component with `bun run test:unit -- src/components/BComponentName`). ALL tests must pass. If any test fails, fix the implementation or the test before proceeding.

2. **Storybook interaction & accessibility tests** — Run `bun run test:storybook`. This executes all `play` functions in stories, including accessibility checks (axe-core). ALL must pass. Fix any a11y violations or interaction failures before proceeding.

3. **Type checking** — Run `bun run type-check`. Zero errors required.

4. **Linting** — Run `bun run lint-all`. Zero errors required.

**Rules:**
- Do NOT skip these steps. Do NOT report work as complete if any test is failing.
- If a test failure is pre-existing and unrelated to your changes, explicitly inform the user which tests were already failing and why, but still ensure your changes do not introduce NEW failures.
- When writing new components or modifying existing ones, ensure the corresponding `.spec.ts` tests and storybook `play` functions still align with the updated behavior. Update tests to match new props/emits/behavior — do not leave stale assertions.
- For accessibility: verify ARIA attributes, keyboard navigation, focus management, and color contrast are correct in both the implementation and the test assertions.
- Run tests against the specific component first for fast feedback, then run the full suite to catch regressions.

---

## Build & Dev Commands

```bash
bun run dev            # Vite dev server
bun run build          # lint → build:lib (Vite) → build:types (vue-tsc)
bun run storybook      # Storybook dev server (port 6006)
bun run build-storybook
bun run lint-all       # ESLint + oxlint + type-check
bun run format         # Prettier --write src/
```

---

## CI/CD

- **deploy-storybook.yml** - On push to `main`: lint → e2e → build → deploy Storybook
- **publish-npm-{major|minor|patch}.yml** - Manual version bumps + NPM publish
- E2E test reports uploaded as GitHub Actions artifacts

---

## All Components (36)

General: `BButton`, `BDivider`, `BFloatButton`, `BIcon`, `BInput`, `BSelect`, `BSwitch`, `BTag`
Data Display: `BAvatar`, `BBadge`, `BCard`, `BCollapse`, `BDescriptions`, `BEmpty`, `BImage`, `BMasonry`, `BPagination`, `BProgress`*, `BSegmented`, `BSteps`, `BTable`, `BTabs`, `BTimeline`, `BTree`, `BTour`
Feedback: `BAlert`, `BMessage`, `BModal`, `BNotification`, `BSpin`
Navigation: `BBreadcrumb`, `BDrawer`, `BDropdown`, `BPopconfirm`, `BPopover`, `BTooltip`

*`BProgress` directory exists but is not yet registered in `src/components/index.ts`.

---

## Global Types Reference

`src/types.ts` contains all shared enums (e.g., `BCommonSize`, `BCommonColor`, `BButtonVariant`) and interfaces. Import from `'@/types'` (alias) or relatively.

`src/constants.ts` contains `BIconSizeMap` (enum → rem values) and `PIKey` provide/inject symbols.

---

## Key Files Quick Reference

| Purpose | File |
|---|---|
| Library entry | [src/index.ts](src/index.ts) |
| Global types & enums | [src/types.ts](src/types.ts) |
| Global constants | [src/constants.ts](src/constants.ts) |
| Tailwind design tokens | [src/assets/tailwind.css](src/assets/tailwind.css) |
| Component barrel export | [src/components/index.ts](src/components/index.ts) |
| Vite build config | [vite.config.ts](vite.config.ts) |
| Storybook main config | [.storybook/main.ts](.storybook/main.ts) |
| Storybook preview config | [.storybook/preview.ts](.storybook/preview.ts) |
