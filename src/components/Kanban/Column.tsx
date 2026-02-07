import { useDroppable } from '@dnd-kit/core';
import type { Column as ColumnType } from '../../types/kanban';
import { Card } from './Card';
import './KanbanBoard.css';

const COLUMN_COLORS: Record<string, 'todo' | 'in-progress' | 'done'> = {
  todo: 'todo',
  'in-progress': 'in-progress',
  done: 'done',
};

type ColumnProps = {
  column: ColumnType;
  onAddCard: () => void;
  onRemoveCard: (cardId: string) => void;
  onCardTitleChange: (cardId: string, title: string) => void;
};

export function Column({ column, onAddCard, onRemoveCard, onCardTitleChange }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const color = COLUMN_COLORS[column.id] ?? 'todo';

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column kanban-column-${color} ${isOver ? 'kanban-column-over' : ''}`}
    >
      <div className="kanban-column-header">
        <span className="kanban-column-title">{column.title}</span>
        <span className="kanban-column-count">{column.cards.length}</span>
        <button
          type="button"
          className="kanban-column-add-icon"
          onClick={onAddCard}
          aria-label="Add card"
        >
          +
        </button>
      </div>
      <button type="button" className="kanban-add-card" onClick={onAddCard}>
        <span className="kanban-add-card-icon">+</span>
        Add Card
      </button>
      <div className="kanban-column-cards">
        {column.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            columnColor={color}
            onTitleChange={onCardTitleChange}
            onRemove={onRemoveCard}
          />
        ))}
      </div>
    </div>
  );
}
