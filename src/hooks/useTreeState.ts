import { useCallback, useState } from 'react';
import type { TreeNode } from '../types/tree';
import { getInitialTree } from '../data/treeMock';
import { v4 as uuidv4 } from 'uuid';

function cloneNode(n: TreeNode): TreeNode {
  return {
    ...n,
    children: n.children?.map(cloneNode),
  };
}

function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const found = findNode(c, id);
    if (found) return found;
  }
  return null;
}

function findParent(root: TreeNode, id: string): { parent: TreeNode; index: number } | null {
  const children = root.children ?? [];
  const i = children.findIndex((c) => c.id === id);
  if (i >= 0) return { parent: root, index: i };
  for (const c of children) {
    const out = findParent(c, id);
    if (out) return out;
  }
  return null;
}

function removeNode(root: TreeNode, id: string): TreeNode {
  if (root.id === id) return root; // shouldn't remove root
  const children = root.children ?? [];
  const next = children.filter((c) => c.id !== id).map((c) => removeNode(c, id));
  return { ...root, children: next.length ? next : undefined };
}

function setNodeChildren(root: TreeNode, id: string, children: TreeNode[]): TreeNode {
  if (root.id === id) return { ...root, children: children.length ? children : undefined };
  return {
    ...root,
    children: (root.children ?? []).map((c) => setNodeChildren(c, id, children)),
  };
}

function setNodeLabel(root: TreeNode, id: string, label: string): TreeNode {
  if (root.id === id) return { ...root, label };
  return { ...root, children: (root.children ?? []).map((c) => setNodeLabel(c, id, label)) };
}

function setNodeExpanded(root: TreeNode, id: string, isExpanded: boolean): TreeNode {
  if (root.id === id) return { ...root, isExpanded };
  return { ...root, children: (root.children ?? []).map((c) => setNodeExpanded(c, id, isExpanded)) };
}

function setNodeLoading(root: TreeNode, id: string, isLoading: boolean): TreeNode {
  if (root.id === id) return { ...root, isLoading };
  return { ...root, children: (root.children ?? []).map((c) => setNodeLoading(c, id, isLoading)) };
}

/** Extract a node (and its subtree) from the tree; returns new root and the extracted node or null. */
function extractNode(root: TreeNode, nodeId: string): { newRoot: TreeNode; node: TreeNode | null } {
  const loc = findParent(root, nodeId);
  if (!loc) return { newRoot: root, node: root.id === nodeId ? cloneNode(root) : null };
  const { parent, index } = loc;
  const children = parent.children ?? [];
  const node = cloneNode(children[index]);
  const newChildren = [...children.slice(0, index), ...children.slice(index + 1)];
  const newRoot = setNodeChildren(root, parent.id, newChildren);
  return { newRoot, node };
}

/** Insert node as child of parentId at index. */
function insertAsChild(root: TreeNode, parentId: string, index: number, node: TreeNode): TreeNode {
  const parent = findNode(root, parentId);
  if (!parent) return root;
  const siblings = parent.children ?? [];
  const next = [...siblings.slice(0, index), node, ...siblings.slice(index)];
  return setNodeChildren(root, parentId, next);
}

/** Move node (by id) to new parent and index. Returns new root. */
function moveNode(
  root: TreeNode,
  nodeId: string,
  targetParentId: string,
  targetIndex: number
): TreeNode {
  const { newRoot, node } = extractNode(root, nodeId);
  if (!node) return root;
  return insertAsChild(newRoot, targetParentId, targetIndex, node);
}

const LEVEL_LABELS = ['A', 'B', 'C', 'D'] as const;

export function getLevelLabel(depth: number): string {
  return LEVEL_LABELS[Math.min(depth, LEVEL_LABELS.length - 1)] ?? 'D';
}

export function useTreeState(initial?: TreeNode) {
  const [tree, setTree] = useState<TreeNode>(() => initial ?? getInitialTree());

  const toggleExpand = useCallback((id: string) => {
    setTree((prev) => setNodeExpanded(prev, id, !findNode(prev, id)?.isExpanded));
  }, []);

  const addChild = useCallback((parentId: string) => {
    const newChild: TreeNode = {
      id: uuidv4(),
      label: 'New node',
      isExpanded: false,
    };
    setTree((prev) => {
      const parent = findNode(prev, parentId);
      const siblings = parent?.children ?? [];
      return insertAsChild(prev, parentId, siblings.length, newChild);
    });
  }, []);

  const removeNodeById = useCallback((id: string) => {
    setTree((prev) => removeNode(prev, id));
  }, []);

  const setLabel = useCallback((id: string, label: string) => {
    setTree((prev) => setNodeLabel(prev, id, label));
  }, []);

  const moveNodeTo = useCallback((nodeId: string, targetParentId: string, targetIndex: number) => {
    setTree((prev) => moveNode(prev, nodeId, targetParentId, targetIndex));
  }, []);

  const setChildren = useCallback((parentId: string, children: TreeNode[]) => {
    setTree((prev) => setNodeChildren(prev, parentId, children));
  }, []);

  const setLoading = useCallback((id: string, isLoading: boolean) => {
    setTree((prev) => setNodeLoading(prev, id, isLoading));
  }, []);

  const resetTree = useCallback(() => {
    setTree(getInitialTree());
  }, []);

  return {
    tree,
    toggleExpand,
    addChild,
    removeNodeById,
    setLabel,
    moveNodeTo,
    setChildren,
    setLoading,
    setTree,
    findNode: (id: string) => findNode(tree, id),
    findParent: (id: string) => findParent(tree, id),
    resetTree,
  };
}
