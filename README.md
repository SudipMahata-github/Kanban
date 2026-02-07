# Tree View & Kanban Board

React + TypeScript implementation.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Use the tabs to switch between **Tree View** and **Kanban Board**.

## Build & preview

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── TreeView/
│   │   ├── TreeView.tsx    # Tree container, DnD context, modal
│   │   ├── TreeNode.tsx    # Single node (expand, add, remove, edit, drag/drop)
│   │   └── TreeView.css
│   └── Kanban/
│       ├── KanbanBoard.tsx # Board + DnD context
│       ├── Column.tsx      # Column + droppable
│       ├── Card.tsx        # Card (draggable, droppable, edit, delete)
│       └── KanbanBoard.css
├── hooks/
│   ├── useTreeState.ts     # Tree CRUD, move, lazy-load helpers
│   └── useKanbanState.ts   # Columns/cards state
├── types/
│   ├── tree.ts             # TreeNode
│   └── kanban.ts           # Column, Card
├── data/
│   ├── treeMock.ts         # Initial tree + lazy-load simulation
│   └── kanbanMock.ts       # Initial columns/cards
└── App.tsx
```

## Tree View

- **Expand / collapse** — Chevron toggles; icon reflects state.
- **Add node** — “+” on a node adds a child (inline).
- **Remove node** — “✕” opens a confirmation modal, then removes node and subtree.
- **Drag & drop** — Drag a node onto another to add as child, or onto the slot above a node to insert as sibling; hierarchy is preserved.
- **Lazy loading** — Expand the second root child (“b2”) to load children after a short simulated delay.
- **Edit name** — Double-click the label to edit inline; Enter or blur saves.

## Kanban Board

- **Add card** — “Add Card” or “+” in the column header.
- **Delete card** — Trash icon on each card.
- **Move cards** — Drag a card onto another column or onto another card to reorder.
- **Edit title** — Double-click the card title to edit inline.

## Tech stack

- React 19 + TypeScript
- Vite
- @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (drag and drop)
- uuid (ids for new nodes/cards)


