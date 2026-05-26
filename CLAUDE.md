# Design System — Claude Code Context

## Project Identity

- **`@7pmlabs/design-system`** — Vue 3 component library (Ant Design–inspired), published to NPM
- **`@7pmlabs/design-system-nuxt`** — sibling Nuxt 4 module: auto-imports every `B*` component, registers `useValidationForm` / `useValidationField`, injects the stylesheet
- **`@7pmlabs/design-system/vite`** — opt-in Vite plugin required in consumer configs so `BIcon` SVGs are served in dev and inlined / copied at build time

## Repository Layout

Bun workspace; main lib at root, Nuxt module as a sibling package.

```
design-system/
├── src/
│   ├── components/                     # B* components
│   ├── composables/                    # useValidationForm, useValidationField, ...
│   └── vite/                           # @7pmlabs/design-system/vite plugin
├── packages/design-system-nuxt/
│   ├── src/module.ts                   # defineNuxtModule entry — wires the Vite plugin + Nitro asset route
│   ├── src/components.ts               # COMPONENT_NAMES + COMPOSABLE_NAMES (auto-import lists)
│   ├── playground/                     # minimal Nuxt 4 app for manual verification
│   └── build.config.ts
├── tsconfig.vite-plugin.json           # tsc config for src/vite/ → dist/vite/
└── scripts/
    ├── test-integration.ts             # consumes lib from a fresh Vue app via tarball (incl. preview + icon URL fetch)
    └── test-integration-nuxt.ts        # consumes both packages from a fresh Nuxt 4 app via tarball
```

Bun workspaces don't allow the root package as a workspace member, so the module declares `"@7pmlabs/design-system": "file:../.."` instead of `workspace:*`. The Nuxt integration test rewrites that to `"*"` before packing for portability.

## Tech Stack

Vue 3.5 (`<script setup>` only) · TS 5.9 strict · Tailwind 4 with `b:` prefix · Vite 8 + Rolldown (library mode, `preserveModules`) · Vitest + Playwright + Storybook v10.4 vitest addon · ESLint 9 flat + oxlint · Prettier · Bun · Zod (optional peer dep)

---

## Component Structure

```
src/components/<BComponentName>/
├── BComponentName.vue        # SFC, script setup, no scoped style
├── BComponentName.spec.ts    # Vitest unit tests
├── types.ts                  # if needed
├── index.ts                  # named exports
└── BSubComponent.vue         # sub-components if needed
```

Stories: `src/stories/<Category>/BComponentName.stories.ts`.

## Naming

| Element | Pattern | Example |
|---|---|---|
| Components | PascalCase + `B` | `BButton`, `BTree` |
| Props/Emits | camelCase | `defaultExpandedKeys` |
| CSS classes | kebab + `b-` | `.b-button` |
| CSS vars | `--b-{component}-{token}` | `--b-timeline-item-dot-color` |
| Tailwind | `b:` prefix | `b:flex` |

## Component Authoring Rules

1. `<script setup>` only — no Options API, no `defineComponent()`.
2. Destructure props with inline defaults: `const { size = 'md' } = defineProps<{...}>()`.
3. JSDoc every prop (purpose, values, default).
4. **No `<style scoped>`** — Tailwind utilities + scoped CSS vars on `.b-{component}` root (never `:root`).
5. CSS-first animations; JS only for logic. Respect `prefers-reduced-motion`.
6. Theme: light/dark/follow-system via `[data-prefers-color='dark']` on `<html>`.
7. Accessibility: ARIA, keyboard nav, focus management. Use `useComponentId()` for ARIA IDs.
8. Provide/inject via `PIKey` symbols defined per-composable.
9. Support both controlled (`v-model`) and uncontrolled patterns.

## Styling

- **Theme** (`src/assets/tailwind.css`): OKLCH, 6 families (`primary`, `secondary`, `success`, `failure`, `warning`, `info`) × 3 variants (base, `-hover`, `-hover-light`).
- **Component tokens:** scoped CSS vars on the component root.

---

## Commands

```bash
bun run dev              # Vite dev server
bun run build            # lint → build:lib → build:types
bun run storybook        # Storybook (port 6006)
bun run test:unit        # Vitest unit tests
bun run test:storybook   # Storybook browser/a11y tests
bun run test:e2e         # Playwright
bun run test:int         # Pack & consume lib from a fresh Vue app
bun run test:int:nuxt    # Pack & consume both packages from a fresh Nuxt 4 app
bun run lint-all         # ESLint + oxlint + type-check
bun run type-check       # vue-tsc
```

In `packages/design-system-nuxt/`:

```bash
bun run dev:prepare      # build module stubs + prepare playground
bun run dev              # nuxi dev playground
bun run build            # nuxt-module-build → dist/module.mjs + types
bun run dev:build        # nuxi build playground
```

## Mandatory Verification (MUST follow)

Before reporting any component work done, ALL must pass:

1. `bun run test:unit` (or `-- src/components/BComponentName` for fast feedback)
2. `bun run test:storybook` (play functions + axe-core)
3. `bun run type-check` — zero errors
4. `bun run lint-all` — zero errors

Pre-existing failures: report them; ensure no NEW failures. Update `.spec.ts` and storybook `play` functions when behavior changes.

---

## Key Patterns

- **Library entry:** `src/index.ts` re-exports `./components`, `./types`, composables; imports CSS.
- **Global types/enums:** `src/types.ts` (`BCommonSize`, `BCommonColor`, `BButtonVariant`, …)
- **Constants:** `src/constants.ts` (`BIconSizeMap`)
- **Composables:** `src/composables/` — `useComponentId`, `useValidation` (Zod-based, dirty/touched)

## BIcon Architecture (`src/vite/`)

`BIcon` ships ~30k SVGs — too many to bundle, but a runtime fetch needs *something* serving the URL. The plugin handles this end-to-end; consumers add one line, the Nuxt module wires it automatically.

- **Sentinel literal** in `BIcon.vue`: `Object.freeze({ __BICON_STATIC_ICONS_PLACEHOLDER__: '' })` — inert at runtime, ships unchanged.
- **`buildStart`** AST-scans the consumer's `src/` for static `<BIcon icon="…" />` usages. **`transform`** finds the sentinel in any module and replaces it with a populated `Object.freeze({ 'regular/check': '<svg…>', … })` map. Static icons render in the first frame, no fetch.
- **Self-build guard:** both hooks early-return when `viteConfig.build.lib` is set, so the lib's own build keeps the sentinel intact in the published `BIcon` module — otherwise consumers' plugins would find it already replaced and silently fail.
- **Runtime fallback** (default on): dev/preview middleware on `/_design-system/icons/*` + `closeBundle` copies icons into `outDir` for dynamic `:icon` bindings. Pass `runtimeFallback: false` if you only use static icon names.
- **Nuxt:** the module registers the icons folder as a Nitro `publicAssets` entry (Nuxt assembles `.output/public/` via Nitro, not Vite's `outDir`).

Icon-delivery changes are gated by `test:int` / `test:int:nuxt` — they build a real consumer app, serve it, and `fetch()` the icon URL. Unit tests can't catch URL regressions (no static server in jsdom).

## Build pipeline

`bun run build:lib` chains:

1. `vite build` → `dist/design-system*.js` (preserveModules, ES). Plugin's `transform` is a no-op when `build.lib` is set, so the sentinel survives in the published bundle.
2. `tsc -p tsconfig.vite-plugin.json` → `dist/vite/index.js` (pure Node, no Vue bundling).
3. `vue-tsc --declaration` → `dist/types/` including `dist/types/vite/index.d.ts`.

`package.json` exports: `.` → `dist/design-system.js`, `./vite` → `dist/vite/index.js`.

---

## Nuxt Module

### Options (`designSystem` config key)

- `components` (default `true`) — auto-register all `B*` components
- `composables` (default `true`) — auto-import `useValidationForm` / `useValidationField`
- `css` (default `true`) — inject `@7pmlabs/design-system/style.css`
- `prefix` (default `''`) — prepend to every component name
- `tailwind` (default `true`) — register `@tailwindcss/vite`. Disable if the app wires Tailwind itself.
- `icons` (default `true`) — wire the `designSystem()` Vite plugin AND register Nitro `publicAssets` for production. Disabling without manual wiring leaves `BIcon` empty.

### When adding to the main lib

- **New component** → export from `src/components/<Name>/index.ts` + `src/components/index.ts`, then add to `COMPONENT_NAMES` in `packages/design-system-nuxt/src/components.ts` (sub-components too, e.g. `BFormItem`, `BModalHeader`).
- **New composable** → export from `src/index.ts`, then add to `COMPOSABLE_NAMES` in the same file.

### Verifying the module

1. `cd packages/design-system-nuxt && bun run dev` — playground renders, no console errors, components in `view-source` (SSR).
2. `bun run test:int:nuxt` (from root) — closest signal to a real consumer; runs `nuxi prepare` → `typecheck` → `build`.

### Releasing

Replace `"@7pmlabs/design-system": "file:../.."` with a real version range (`^x.y.z`) before publishing. The integration test demonstrates this rewrite. Main lib must be published first.
