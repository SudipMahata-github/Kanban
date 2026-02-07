import { useState, useCallback } from 'react';
import type { Column } from '../types/kanban';
import { initialColumns } from '../data/kanbanMock';
import { v4 as uuidv4 } from 'uuid';

export function useKanbanState() {
  const [columns, setColumns] = useState<Column[]>(() =>
    JSON.parse(JSON.stringify(initialColumns))
  );

  const addCard = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: [...col.cards, { id: uuidv4(), title: 'New card' }],
            }
          : col
      )
    );
  }, []);

  const removeCard = useCallback((columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      )
    );
  }, []);

  const updateCardTitle = useCallback((columnId: string, cardId: string, title: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map((c) => (c.id === cardId ? { ...c, title } : c)),
            }
          : col
      )
    );
  }, []);

  const moveCard = useCallback(
    (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
      setColumns((prev) => {
        const fromCol = prev.find((c) => c.id === fromColumnId);
        const card = fromCol?.cards.find((c) => c.id === cardId);
        if (!card) return prev;
        const withoutCard = prev.map((col) =>
          col.id === fromColumnId
            ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
            : col
        );
        return withoutCard.map((col) => {
          if (col.id !== toColumnId) return col;
          const list = [...col.cards];
          list.splice(toIndex, 0, card);
          return { ...col, cards: list };
        });
      });
    },
    []
  );

  return { columns, setColumns, addCard, removeCard, updateCardTitle, moveCard };
}
