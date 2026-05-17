export interface BInputNumberFocusOptions {
  preventScroll?: boolean;
  cursor?: 'start' | 'end' | 'all';
}

export interface BInputNumberStepInfo {
  offset: number;
  type: 'up' | 'down';
}
