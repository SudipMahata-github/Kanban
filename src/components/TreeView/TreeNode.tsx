import { useRef, useState, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TreeNode as TreeNodeType } from '../../types/tree';
import { getLevelLabel } from '../../hooks/useTreeState';
import { fetchChildrenFor } from '../../data/treeMock';
import './TreeView.css';

type TreeNodeProps = {
  node: TreeNodeType;
  depth: number;
  parentId: string;
  index: number;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (id: string) => void;
  onConfirmRemove: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onLazyLoad: (parentId: string, children: TreeNodeType[]) => void;
  setLoading: (id: string, loading: boolean) => void;
  isDropTarget?: boolean;
};

export function TreeNode({
  node,
  depth,
  parentId,
  index,
  onToggleExpand,
  onAddChild,
  onConfirmRemove,
  onLabelChange,
  onLazyLoad,
  setLoading,
  isDropTarget,
}: TreeNodeProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const levelLetter = getLevelLabel(depth);
  const hasChildren = node.children && node.children.length > 0;
  const canExpand = hasChildren || node.children === undefined;
  const isExpanded = node.isExpanded ?? false;
  const isLoading = node.isLoading ?? false;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: node.id,
    data: { type: 'tree-node', node },
    disabled: node.id === 'root',
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `child:${node.id}`,
    data: { type: 'child', parentId: node.id },
  });

  const slotId = `slot:${parentId}:${index}`;
  const { setNodeRef: setSlotRef, isOver: isSlotOver } = useDroppable({
    id: slotId,
    data: { type: 'sibling', parentId, index },
  });

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    setEditValue(node.label);
  }, [node.label]);

  const handleExpand = () => {
    if (node.children === undefined && !node.isLoading) {
      setLoading(node.id, true);
      fetchChildrenFor(node.id).then((children) => {
        onLazyLoad(node.id, children);
        setLoading(node.id, false);
        onToggleExpand(node.id);
      });
      return;
    }
    onToggleExpand(node.id);
  };

  const handleBlur = () => {
    if (editing && editValue.trim()) onLabelChange(node.id, editValue.trim());
    setEditing(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  const setRefs = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  return (
    <div className="tree-node-wrapper" style={{ marginLeft: depth * 20 }}>
      <div
        ref={setSlotRef}
        className={`tree-drop-slot ${isSlotOver ? 'tree-drop-slot-over' : ''}`}
        data-slot={slotId}
      />

      <div
        ref={setRefs}
        className={`tree-node ${isDragging ? 'tree-node-dragging' : ''} ${isOver || isDropTarget ? 'tree-node-drop-target' : ''}`}
        style={style}
        {...(node.id !== 'root' ? { ...attributes, ...listeners } : {})}
      >
        <button
          type="button"
          className="tree-node-expand"
          onClick={(e) => {
            e.stopPropagation();
            handleExpand();
          }}
          disabled={!canExpand}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isLoading ? (
            <span className="tree-node-spinner" aria-hidden />
          ) : canExpand ? (
            <span className={`tree-node-chevron ${isExpanded ? 'expanded' : ''}`}>▸</span>
          ) : (
            <span className="tree-node-dot" />
          )}
        </button>

        <span
          className={`tree-node-level tree-node-level-${levelLetter.toLowerCase()}`}
          aria-hidden
        >
          {levelLetter}
        </span>

        {editing ? (
          <input
            ref={inputRef}
            type="text"
            className="tree-node-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="tree-node-label"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            title="Double-click to edit"
          >
            {node.label}
          </span>
        )}

        <div className="tree-node-actions">
          <button
            type="button"
            className="tree-node-add"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            aria-label="Add child"
            title="Add child"
          >
            +
          </button>
          {node.id !== 'root' && (
            <button
              type="button"
              className="tree-node-remove"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmRemove(node.id);
              }}
              aria-label="Remove"
              title="Remove node"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isExpanded && (node.children ?? []).map((child, i) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          parentId={node.id}
          index={i}
          onToggleExpand={onToggleExpand}
          onAddChild={onAddChild}
          onRemove={() => {}}
          onConfirmRemove={onConfirmRemove}
          onLabelChange={onLabelChange}
          onLazyLoad={onLazyLoad}
          setLoading={setLoading}
        />
      ))}
    </div>
  );
}
