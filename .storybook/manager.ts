import { addons } from 'storybook/manager-api';
import theming from './theming';

addons.setConfig({
    theme: theming,
});