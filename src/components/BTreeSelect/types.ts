export enum BTreeSelectVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export enum BTreeSelectStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BTreeSelectPlacement {
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
}

export type BTreeSelectExpandAction = 'click' | 'doubleClick' | false;

export type BTreeSelectValue = string | number;

export interface BTreeSelectLabeledValue {
  value: BTreeSelectValue;
  label: string;
}

export type BTreeSelectModelValue =
  | BTreeSelectValue
  | BTreeSelectLabeledValue
  | BTreeSelectValue[]
  | BTreeSelectLabeledValue[]
  | null
  | undefined;

export interface BTreeSelectNode {
  /** The node's display title. */
  title?: string;
  /** Unique identification value. */
  value: BTreeSelectValue;
  /** Optional unique key. Falls back to `value` when omitted. */
  key?: BTreeSelectValue;
  /** Children nodes. */
  children?: BTreeSelectNode[];
  /** Whether this node is disabled. */
  disabled?: boolean;
  /** Whether to disable just the checkbox (treeCheckable mode). */
  disableCheckbox?: boolean;
  /** Whether the node can be selected (single mode). */
  selectable?: boolean;
  /** Whether the node is a leaf (used with loadData). */
  isLeaf?: boolean;
  /** Whether to show a checkbox for this node (treeCheckable mode). */
  checkable?: boolean;
  /** Arbitrary extra data passed through. */
  [key: string]: unknown;
}

export interface BTreeSelectFieldNames {
  /** Custom field for label/title. Default: 'title' */
  label?: string;
  /** Custom field for value. Default: 'value' */
  value?: string;
  /** Custom field for children. Default: 'children' */
  children?: string;
}

export interface BTreeSelectShowSearchConfig {
  /** Custom filter function. Returns true if a node matches. */
  filter?: (input: string, node: BTreeSelectNode) => boolean;
}

export interface BTreeSelectChangeExtra {
  /** Whether selection was triggered by a check/uncheck or a single select. */
  triggerValue?: BTreeSelectValue;
  /** The node that triggered the change. */
  triggerNode?: BTreeSelectNode;
  /** Whether the change came from a "select" or "deselect". */
  preValue?: BTreeSelectValue[];
  /** Whether currently checked (treeCheckable mode). */
  checked?: boolean;
  /** Whether currently selected. */
  selected?: boolean;
}

export interface BTreeSelectFlatNode {
  key: BTreeSelectValue;
  value: BTreeSelectValue;
  data: BTreeSelectNode;
  depth: number;
  visible: boolean;
  parents: BTreeSelectValue[];
}
