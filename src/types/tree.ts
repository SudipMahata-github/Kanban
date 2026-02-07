export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

export type TreeDropTarget =
  | { type: 'child'; parentId: string }
  | { type: 'sibling'; parentId: string; index: number };
