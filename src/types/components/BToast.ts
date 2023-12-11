import type { BToastItemType } from '@/constants/Enums';

export interface BToastItemModel {
  id?: string;
  text: string;
  icon?: string;
  duration?: number;
  type?: `${BToastItemType}`;
}
