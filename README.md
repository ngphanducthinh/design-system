# @7pmlabs/design-system

A Vue 3 component library built with TypeScript, Tailwind CSS 4, and Ant Design inspiration.

## Installation

```sh
npm install @7pmlabs/design-system
# or
bun add @7pmlabs/design-system
```

## Usage

```ts
import { BButton, BInput, BModal } from '@7pmlabs/design-system'
import '@7pmlabs/design-system/style.css'
```

## Tech Stack

- **Framework:** Vue 3.5 (Composition API, `<script setup>`)
- **Language:** TypeScript 5.9 (strict)
- **Styling:** Tailwind CSS 4 with `b:` prefix + scoped CSS custom properties
- **Build:** Vite 8 + Rolldown (library mode, ES modules)
- **Testing:** Vitest, Playwright, Storybook vitest addon
- **Storybook:** v10.3

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
```

## Build

```sh
bun run build            # Lint + build library + generate types
bun run build-storybook  # Build static Storybook
```

## Linting & Formatting

```sh
bun run lint-all   # ESLint + oxlint + type-check
bun run format     # Prettier
```

## License

MIT
