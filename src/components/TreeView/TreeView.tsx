import { useState, useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { TreeNode as TreeNodeType } from '../../types/tree';
import { useTreeState } from '../../hooks/useTreeState';
import { TreeNode } from './TreeNode';
import './TreeView.css';

export function TreeView() {
  const {
    toggleExpand,
    addChild,
    removeNodeById,
    setLabel,
    moveNodeTo,
    setChildren,
    setLoading,
    findNode,
    resetTree,
  } = useTreeState();

  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const nodeId = active.id as string;
      if (nodeId === 'root') return;

      const overId = over.id as string;
      if (overId.startsWith('child:')) {
        const parentId = overId.slice(6);
        const parent = findNode(parentId);
        const count = parent?.children?.length ?? 0;
        moveNodeTo(nodeId, parentId, count);
        return;
      }
      if (overId.startsWith('slot:')) {
        const [, parentId, indexStr] = overId.split(':');
        const index = parseInt(indexStr, 10);
        moveNodeTo(nodeId, parentId, index);
      }
    },
    [findNode, moveNodeTo]
  );

  const handleLazyLoad = useCallback(
    (parentId: string, children: TreeNodeType[]) => {
      setChildren(parentId, children);
    },
    [setChildren]
  );

  const confirmRemove = useCallback((id: string) => {
    setRemoveConfirm(id);
  }, []);

  const cancelRemove = useCallback(() => {
    setRemoveConfirm(null);
  }, []);

  const doRemove = useCallback(() => {
    if (removeConfirm) {
      removeNodeById(removeConfirm);
      setRemoveConfirm(null);
    }
  }, [removeConfirm, removeNodeById]);

  const root = findNode('root');
  if (!root) return null;

  return (
    <div className="tree-view">
      <div className="tree-view-toolbar">
        <button type="button" onClick={resetTree} className="tree-view-reset">
          Reset tree
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="tree-view-root">
          <TreeNode
            node={root}
            depth={0}
            parentId="root"
            index={0}
            onToggleExpand={toggleExpand}
            onAddChild={addChild}
            onRemove={removeNodeById}
            onConfirmRemove={confirmRemove}
            onLabelChange={setLabel}
            onLazyLoad={handleLazyLoad}
            setLoading={setLoading}
          />
        </div>
      </DndContext>

      {removeConfirm && (
        <div className="tree-view-modal-overlay" onClick={cancelRemove}>
          <div className="tree-view-modal" onClick={(e) => e.stopPropagation()}>
            <p>Remove this node and all its children?</p>
            <div className="tree-view-modal-actions">
              <button type="button" onClick={doRemove} className="tree-view-modal-confirm">
                Remove
              </button>
              <button type="button" onClick={cancelRemove} className="tree-view-modal-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
