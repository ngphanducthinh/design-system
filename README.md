# 7pmlabs-design-system

Require `7pmlabs-icons` package installed or using CDN: https://unpkg.com/7pmlabs-icons/dist/style.css

DON'T NEED to import `@import 'tailwindcss/base';` (https://tailwindcss.com/docs/installation) if you also use Tailwind CSS in your project unless it causes broken styles.

## Getting started

```
npm i 7pmlabs-design-system
```

## Usage

Import CSS & plugin in main.ts:

```
import '7pmlabs-design-system/style.css';

const app = createApp(App);
...
app.use(ds, { i18n });
```

Import & use component:

```
import { BButton } from '7pmlabs-design-system';

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
