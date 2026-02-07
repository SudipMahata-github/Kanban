import { useRef, useState, useEffect } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../../types/kanban';
import './KanbanBoard.css';

type CardProps = {
  card: CardType;
  columnId: string;
  columnColor: 'todo' | 'in-progress' | 'done';
  onTitleChange: (cardId: string, title: string) => void;
  onRemove: (cardId: string) => void;
};

export function Card({ card, columnId, columnColor, onTitleChange, onRemove }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(card.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: { type: 'card', card, columnId },
  });

  const { setNodeRef: setDropRef } = useDroppable({ id: card.id });

  const setRefs = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  useEffect(() => {
    setEditValue(card.title);
  }, [card.title]);

  const handleBlur = () => {
    if (editing && editValue.trim()) onTitleChange(card.id, editValue.trim());
    setEditing(false);
  };

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.6 : 1 }
    : undefined;

  return (
    <div
      ref={setRefs}
      className={`kanban-card kanban-card-${columnColor} ${isDragging ? 'kanban-card-dragging' : ''}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="kanban-card-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="kanban-card-title"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          title="Double-click to edit"
        >
          {card.title}
        </span>
      )}
      <button
        type="button"
        className="kanban-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(card.id);
        }}
        aria-label="Delete card"
        title="Delete"
      >
        🗑
      </button>
    </div>
  );
}
