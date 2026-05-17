export interface BSliderMarks {
  [key: number]: string | { style?: Record<string, string>; label: string };
}

export interface BSliderTooltip {
  /** Whether to auto-adjust tooltip position when overflowing. */
  autoAdjustOverflow?: boolean;
  /** Force tooltip open state. undefined = follow hover. */
  open?: boolean;
  /** Tooltip placement relative to handle. */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom formatter for tooltip text. Return null to hide. */
  formatter?: ((value: number) => string | null) | null;
}

export interface BSliderRange {
  /** Whether the track between two handles can be dragged. */
  draggableTrack?: boolean;
}
