# Design System — Claude Code Context

## Project Identity

- **Package:** `@7pmlabs/design-system` (v0.0.117)
- **Type:** Vue 3 component library published to NPM
- **Purpose:** Custom design system inspired by Ant Design, built from scratch

## Tech Stack

Vue 3.5 (`<script setup>` only) · TypeScript 5.9 strict · Tailwind CSS 4 with `prefix('b')` · Vite 8 + Rolldown (library mode, `preserveModules: true`) · Vitest + Playwright + Storybook vitest addon · ESLint 9 flat + oxlint · Prettier with `prettier-plugin-tailwindcss` · Bun (primary) · Storybook v10.4 · Zod (optional peer dep for validation)

---

## Component Structure Convention

Every component lives in `src/components/<BComponentName>/`:

```
BComponentName/
├── BComponentName.vue        # SFC - script setup + template (no scoped style)
├── BComponentName.spec.ts    # Vitest unit tests
├── types.ts                  # Component-specific types (if needed)
├── index.ts                  # Named exports: component + types
└── BSubComponent.vue         # Sub-components when needed
```

Stories live in `src/stories/<Category>/BComponentName.stories.ts`.

---

## Naming Conventions

| Element | Pattern | Example |
|---|---|---|
| Components | PascalCase + `B` prefix | `BButton`, `BTree` |
| Props/Emits | camelCase | `checkable`, `defaultExpandedKeys` |
| CSS classes | kebab-case + `b-` prefix | `.b-button`, `.b-tree-item` |
| CSS vars | `--b-{component}-{token}` | `--b-timeline-item-dot-color` |
| Tailwind | `b:` prefix | `b:flex`, `b:bg-primary` |

---

## Component Authoring Rules

1. Always `<script setup>` — no Options API, no `defineComponent()`.
2. Destructure props with inline defaults: `const { size = 'md' } = defineProps<{...}>()`.
3. JSDoc every prop (purpose, values, default).
4. **No `<style scoped>`** — Tailwind utilities + CSS custom properties only.
5. CSS-first animations — JS only for logic.
6. Scoped CSS vars on `.b-{component}` root — never `:root`.
7. Theme support: light/dark/follow-system — style dark mode via `[data-prefers-color='dark']` selector.
8. Accessibility first — ARIA roles, keyboard nav, focus management.
9. Use `useComponentId()` for ARIA relationship IDs.
10. Provide/inject via `PIKey` symbols for component hierarchies (defined per-composable, e.g. `src/composables/useValidation.ts`).
11. Support both controlled (`v-model`) and uncontrolled patterns.

---

## Styling Architecture

- **Tailwind theme** (`src/assets/tailwind.css`): OKLCH colors, 6 families (`primary`, `secondary`, `success`, `failure`, `warning`, `info`) × 3 variants (base, `-hover`, `-hover-light`), all `b:` prefixed.
- **Component tokens:** Scoped CSS vars on component root class.
- **Theme modes:** Light / Dark / Follow System (like Ant Design). Controlled via `[data-prefers-color='light' | 'dark']` on `<html>`; when set to "follow system", rely on `@media (prefers-color-scheme: dark)`.
- **Motion:** Respect `prefers-reduced-motion`.

---

## Commands

```bash
bun run dev              # Vite dev server
bun run build            # lint → build:lib → build:types
bun run storybook        # Storybook dev (port 6006)
bun run test:unit        # Vitest unit tests
bun run test:storybook   # Storybook browser/a11y tests
bun run test:e2e         # Playwright e2e
bun run lint-all         # ESLint + oxlint + type-check
bun run type-check       # vue-tsc
bun run format           # Prettier
```

---

## Mandatory Verification (MUST follow)

**After any component work, ALL must pass before reporting done:**

1. `bun run test:unit` (or `-- src/components/BComponentName` for fast feedback)
2. `bun run test:storybook` (play functions + axe-core a11y)
3. `bun run type-check` — zero errors
4. `bun run lint-all` — zero errors

**Rules:**
- Do NOT skip. Do NOT report complete if anything fails.
- Pre-existing failures: inform the user which and why, but ensure no NEW failures.
- Update `.spec.ts` and storybook `play` functions when behavior changes — no stale assertions.

---

## Key Patterns

- **Library entry:** `src/index.ts` → imports CSS, re-exports from `./components` barrel, `./types`, and composables (`useValidationForm`, `useValidationField`)
- **Global types/enums:** `src/types.ts` (`BCommonSize`, `BCommonColor`, `BButtonVariant`, etc.)
- **Constants:** `src/constants.ts` (`BIconSizeMap`)
- **Composables:** `src/composables/` — `useComponentId.ts`, `useValidation.ts` (Zod-based form/field validation with dirty/touched tracking)
- **Component barrel:** `src/components/index.ts`
- **Design tokens:** `src/assets/tailwind.css`
