// ─────────────────────────────────────────────
// BCalendar types
// ─────────────────────────────────────────────

/** Display mode of the calendar panel. */
export type BCalendarMode = 'month' | 'year';

/** Source of a `select` event. */
export type BCalendarSelectSource = 'date' | 'month' | 'year' | 'customize';

/** Payload for the `select` event. */
export interface BCalendarSelectInfo {
  source: BCalendarSelectSource;
}

/** Scope passed to `cellRender` / `fullCellRender`. */
export type BCalendarCellRenderType = 'date' | 'month';

/** Slot scope shared by all cell-render slots. */
export interface BCalendarCellSlotScope {
  /** The Date represented by this cell. */
  date: Date;
  /** Whether this cell is the currently selected date. */
  selected: boolean;
  /** Whether this cell is "today". */
  today: boolean;
  /** Whether this cell falls outside the current panel month/year. */
  outside: boolean;
  /** Whether the cell is disabled (out of validRange or disabledDate). */
  disabled: boolean;
}

/** Slot scope passed to `header` for custom header rendering. */
export interface BCalendarHeaderSlotScope {
  /** Currently displayed panel date. */
  value: Date;
  /** Currently displayed mode. */
  mode: BCalendarMode;
  /** Update the panel mode. */
  onTypeChange: (mode: BCalendarMode) => void;
  /** Update the panel value (does not select). */
  onChange: (value: Date) => void;
}

/** Visual variant for an event marker. */
export type BCalendarEventType = 'success' | 'info' | 'warning' | 'error' | 'default';

/** A user-supplied event attached to a date. */
export interface BCalendarEvent {
  /** Short event title rendered inside the cell and modal. */
  title: string;
  /** Optional longer description shown in the details modal. */
  description?: string;
  /** Visual badge color. Defaults to `'default'`. */
  type?: BCalendarEventType;
}

/** Slot scope for the `eventDetails` slot (modal content customization). */
export interface BCalendarEventDetailsSlotScope {
  /** The date the modal is opened for. */
  date: Date;
  /** Events for that date. */
  events: BCalendarEvent[];
  /** Programmatically close the modal. */
  close: () => void;
}
