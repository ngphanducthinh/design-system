import { viVN } from '@/index';

type LocaleMessageType = typeof viVN;

// https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends LocaleMessageType {}
}
