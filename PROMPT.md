You are a senior Vue 3 + TypeScript engineer.

Goal
- Implement BAlert as a Vue 3 SFC that mirrors the documented UX, API, and behaviors from https://ant.design/components/alert?theme=light.
- Re-implement from scratch, Vue-idiomatic and accessibility-first.

Create/Update
- BAlert.vue
- index.ts
- BAlert.spec.ts
- BAlert.stories.ts
- Add export to the package components barrel.

Implementation must-haves
- API parity: derive props, events, slots, and defaults from https://ant.design/components/alert?theme=light. Provide a brief API Parity Table (AntD → Ours) with any adaptations.
- Structure & styling: semantic markup; stable class hooks (.b-{kebab-comp}…); styles inside the SFC; expose CSS vars (--b-{kebab-comp}-*); support dark mode; respect prefers-reduced-motion.
- Accessibility: correct roles; keyboard (Tab/Enter/Space/Escape); focus management for overlays (trap and return); live regions when meaningful; decorative icons aria-hidden.
- Behavior: match documented interactions; support controlled and uncontrolled usage (v-model when appropriate); SSR-safe.
- Performance: prefer computed properties; tree-shakeable; runtime prop validation aligned with TypeScript types.

Unit tests (Vitest)
- Defaults and variants render
- Props map to DOM and behavior
- Events order (e.g., onClose then afterClose)
- Keyboard and focus behavior
- Accessibility checks (roles and aria)
- Edge cases (long content, controlled vs uncontrolled, teleport)
- Deterministic animation tests with fake timers

Storybook
- Playground with controls and key variants/states
- Accessibility story (roles, keyboard)
- Theming story (override CSS vars)
- Interaction tests via play function (drive main flows; assert visibility, focus, aria)
- ArgTypes: place two-way binding props (e.g., modelValue) under category “Two-Way Binding Props”

Output summary in chat
- File tree and full file contents
- API Parity Table
- Token mapping (variant/status/size → CSS vars)
- Accessibility notes
- Commands: build, test, storybook, test-storybook
