# @7pmlabs/design-system

A Vue 3 component library built with TypeScript, Tailwind CSS 4, and Ant Design inspiration. 57 components covering general, layout, forms, data display, feedback, and navigation.

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

`BButton` · `BFloatButton` · `BIcon`

### Layout

`BDivider` · `BMasonry` · `BSplitter`

### Form

`BAutoComplete` · `BCascader` · `BCheckbox` · `BColorPicker` · `BDatePicker` · `BForm` · `BInput` · `BInputNumber` · `BMentions` · `BRadio` · `BRate` · `BSelect` · `BSlider` · `BSwitch` · `BTimePicker` · `BTreeSelect` · `BUpload`

### Data Display

`BAvatar` · `BBadge` · `BCalendar` · `BCard` · `BCarousel` · `BCollapse` · `BDescriptions` · `BEmpty` · `BImage` · `BPopover` · `BSegmented` · `BStatistic` · `BTable` · `BTag` · `BTimeline` · `BTooltip` · `BTour` · `BTree`

### Feedback

`BAlert` · `BDrawer` · `BMessage` · `BModal` · `BNotification` · `BPopconfirm` · `BProgress` · `BSkeleton` · `BSpin`

### Navigation

`BAnchor` · `BBreadcrumb` · `BDropdown` · `BMenu` · `BPagination` · `BSteps` · `BTabs`

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
