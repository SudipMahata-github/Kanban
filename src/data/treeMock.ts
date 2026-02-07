import type { TreeNode } from '../types/tree';

/** Simulates lazy-loading children (e.g. from an API). */
export function fetchChildrenFor(parentId: string): Promise<TreeNode[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: `${parentId}-c1`, label: 'Level A', isExpanded: false },
        { id: `${parentId}-c2`, label: 'Level A', isExpanded: false },
      ]);
    }, 600);
  });
}

const root: TreeNode = {
  id: 'root',
  label: 'Level A',
  isExpanded: true,
  children: [
    {
      id: 'b1',
      label: 'Level A',
      isExpanded: true,
      children: [
        {
          id: 'c1',
          label: 'Level A',
          isExpanded: true,
          children: [
            { id: 'd1', label: 'Level A', isExpanded: false },
          ],
        },
        { id: 'c2', label: 'Level A', isExpanded: false },
        { id: 'c3', label: 'Level A', isExpanded: false },
      ],
    },
    { id: 'b2', label: 'Level A', isExpanded: false }, // children lazy-loaded on expand
  ],
};

/** Deep clone for initial state. Node b2 has no children until lazy-loaded on first expand. */
export function getInitialTree(): TreeNode {
  return JSON.parse(JSON.stringify(root)) as TreeNode;
}
