# @7pmlabs/design-system

A Vue 3 component library built with TypeScript, Tailwind CSS 4, and Ant Design inspiration. 63 components covering general, layout, forms, data display, feedback, and navigation.

📖 **Documentation:** https://ngphanducthinh.github.io/7pmlabs-design-system/

## Packages

| Package | Path | Use it for |
|---|---|---|
| [`@7pmlabs/design-system`](.) | repo root | Any Vue 3 app — Vite, Vue CLI, Nuxt-without-the-module, etc. |
| [`@7pmlabs/design-system-nuxt`](packages/design-system-nuxt/) | `packages/design-system-nuxt/` | Nuxt 4 apps — auto-imports every component, composable, and the stylesheet |

## Installation

```sh
npm install @7pmlabs/design-system
# or
bun add @7pmlabs/design-system
```

## Usage

### Vue 3

```ts
import { BButton, BInput, BModal } from '@7pmlabs/design-system'
import '@7pmlabs/design-system/style.css'
```

Add the Vite plugin so `BIcon` SVGs are served in dev and copied/inlined into your build output:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { designSystem } from '@7pmlabs/design-system/vite';

export default defineConfig({
  plugins: [vue(), designSystem()],
});
```

What it does: scans your `src/` for static `<BIcon icon="..." />` usages and inlines those SVGs into the bundle (no network roundtrip), serves them via middleware in `vite dev` / `vite preview`, and copies the icon set into your `dist/` so dynamic `<BIcon :icon="..." />` bindings still resolve in production. Without this plugin, `BIcon` will render empty spans in any built app.

If you never use dynamic `:icon` bindings, you can opt out of the asset copy with `designSystem({ runtimeFallback: false })` to keep your `dist/` slim.

### Nuxt 4

Install the companion module — components, composables, and the stylesheet are wired up automatically:

```sh
bun add @7pmlabs/design-system @7pmlabs/design-system-nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@7pmlabs/design-system-nuxt'],
})
```

Then use components and composables anywhere — no `import` needed:

```vue
<script setup>
const form = useValidationForm()
</script>

<template>
  <BButton variant="solid" color="primary">Click me</BButton>
</template>
```

See [`packages/design-system-nuxt/README.md`](packages/design-system-nuxt/README.md) for module options.

## Components

### General

`BButton` · `BFloatButton` · `BIcon` · `BLink`

### Layout

`BDivider` · `BMasonry` · `BSplitter`

### Form

`BAutoComplete` · `BCascader` · `BCheckbox` · `BColorPicker` · `BDatePicker` · `BForm` · `BInput` · `BInputNumber` · `BInputTags` · `BListbox` · `BMentions` · `BPinInput` · `BRadio` · `BRate` · `BSelect` · `BSlider` · `BSwitch` · `BTextarea` · `BTimePicker` · `BTreeSelect` · `BUpload`

### Data Display

`BAvatar` · `BBadge` · `BCalendar` · `BCard` · `BCarousel` · `BCollapse` · `BDescriptions` · `BEmpty` · `BImage` · `BPopover` · `BSegmented` · `BStatistic` · `BTable` · `BTag` · `BTimeline` · `BTooltip` · `BTour` · `BTree`

### Feedback

`BAlert` · `BDrawer` · `BMessage` · `BModal` · `BNotification` · `BPopconfirm` · `BProgress` · `BSkeleton` · `BSpin`

### Navigation

`BAnchor` · `BBreadcrumb` · `BContextMenu` · `BDropdown` · `BMenu` · `BPagination` · `BSteps` · `BTabs`

## Tech Stack

- **Framework:** Vue 3.5 (Composition API, `<script setup>`)
- **Language:** TypeScript 5.9 (strict)
- **Styling:** Tailwind CSS 4 with `b:` prefix + scoped CSS custom properties
- **Build:** Vite 8 + Rolldown (library mode, ES modules)
- **Testing:** Vitest, Playwright, Storybook vitest addon
- **Storybook:** v10.4

## Development

```sh
bun install          # Install dependencies
bun run dev          # Vite dev server
bun run storybook    # Storybook dev server (port 6006)
```

## Testing

```sh
bun run test:unit       # Unit tests (Vitest)
bun run test:storybook  # Storybook interaction & a11y tests
bun run test:e2e        # End-to-end tests (Playwright)
bun run test:int        # Pack & consume the lib from a fresh Vue app
bun run test:int:nuxt   # Pack & consume both packages from a fresh Nuxt 4 app
```

## Build

```sh
bun run build            # Lint + build library + generate types
bun run build-storybook  # Build static Storybook
```

The Nuxt module (`packages/design-system-nuxt/`) builds separately:

```sh
cd packages/design-system-nuxt
bun run build            # @nuxt/module-builder → dist/module.mjs + types
```

## Linting & Formatting

```sh
bun run lint-all   # ESLint + oxlint + type-check
bun run format     # Prettier
```

## License

MIT
