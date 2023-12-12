# @7pmlabs/design-system

Documentation (Storybook): https://ngphanducthinh.github.io/7pmlabs-design-system

In case, you also use Tailwind CSS in your project, do not import `@import 'tailwindcss/base';` (https://tailwindcss.com/docs/installation) unless it causes broken styles.

## Getting started

```
npm i @7pmlabs/design-system
```

## Usage

Import CSS & plugin in main.ts:

```
import '@7pmlabs/design-system/style.css';

const app = createApp(App);
...
app.use(ds, { i18n });
```

Import & use component:

```
import { BButton } from '@7pmlabs/design-system';

<BButton>Click me!</BButton>
```

## Color Customization

CSS Variables:

```
--ds-colors-primary-f: 6 182 212; // #06b6d4
--ds-colors-primary-t: 59 130 246; // #3b82f6
--ds-colors-focus: 86 221 214; // #56ddd6

--ds-colors-primary-f-stop: 0%;
--ds-colors-primary-t-stop: 100%;
```
