export type BTreeFieldNames = {
  title?: string;
  key?: string;
  children?: string;
};

export type BTreeNodeKey = string | number;

export interface BTreeNodeData {
  key: BTreeNodeKey;
  title?: string;
  children?: BTreeNodeData[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  icon?: string;
  /** arbitrary extra data passed through to slot/event payloads */
  [key: string]: unknown;
}

export interface BTreeCheckedKeys {
  checked: BTreeNodeKey[];
  halfChecked: BTreeNodeKey[];
}

export interface BTreeDropInfo {
  event: DragEvent;
  node: BTreeNodeData;
  dragNode: BTreeNodeData;
  dragNodesKeys: BTreeNodeKey[];
  dropPosition: number;
  dropToGap: boolean;
}

export interface BTreeDragInfo {
  event: DragEvent;
  node: BTreeNodeData;
}

export interface BTreeLoadInfo {
  event: DragEvent;
  node: BTreeNodeData;
}

export interface BTreeSelectInfo {
  event: MouseEvent | KeyboardEvent;
  selected: boolean;
  node: BTreeNodeData;
  selectedNodes: BTreeNodeData[];
  nativeEvent: MouseEvent | KeyboardEvent;
}

export interface BTreeCheckInfo {
  event: MouseEvent | KeyboardEvent;
  node: BTreeNodeData;
  checked: boolean;
  checkedNodes: BTreeNodeData[];
  checkedNodesPositions: Array<{ node: BTreeNodeData; pos: string }>;
  halfCheckedKeys: BTreeNodeKey[];
  nativeEvent: MouseEvent | KeyboardEvent;
}

export interface BTreeExpandInfo {
  event?: MouseEvent | KeyboardEvent;
  expanded: boolean;
  node: BTreeNodeData;
  nativeEvent?: MouseEvent | KeyboardEvent;
}

export type BTreeExpandAction = 'click' | 'doubleClick' | false;

export interface BTreeScrollToOptions {
  key: BTreeNodeKey;
  align?: 'top' | 'bottom' | 'auto';
  offset?: number;
}

/** Internal flat row used for keyboard navigation */
export interface BTreeFlatNode {
  key: BTreeNodeKey;
  data: BTreeNodeData;
  depth: number;
  visible: boolean;
}
