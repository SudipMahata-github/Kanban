import { useCallback } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useKanbanState } from '../../hooks/useKanbanState';
import { Column } from './Column';
import './KanbanBoard.css';

export function KanbanBoard() {
  const { columns, addCard, removeCard, updateCardTitle, moveCard } = useKanbanState();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const data = active.data.current;
      if (data?.type !== 'card') return;
      const cardId = active.id as string;
      const fromColumnId = data.columnId as string;

      const overId = over.id as string;
      const isColumn = columns.some((c) => c.id === overId);

      if (isColumn) {
        const col = columns.find((c) => c.id === overId)!;
        moveCard(cardId, fromColumnId, overId, col.cards.length);
        return;
      }

      for (const col of columns) {
        const idx = col.cards.findIndex((c) => c.id === overId);
        if (idx >= 0) {
          moveCard(cardId, fromColumnId, col.id, idx);
          return;
        }
      }
    },
    [columns, moveCard]
  );

  return (
    <div className="kanban-board">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddCard={() => addCard(column.id)}
              onRemoveCard={(cardId) => removeCard(column.id, cardId)}
              onCardTitleChange={(cardId, title) =>
                updateCardTitle(column.id, cardId, title)
              }
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
