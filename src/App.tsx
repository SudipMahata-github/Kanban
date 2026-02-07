import { useState } from 'react';
import { TreeView } from './components/TreeView/TreeView';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import './App.css';

type Tab = 'tree' | 'kanban';

export default function App() {
  const [tab, setTab] = useState<Tab>('tree');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tree View & Kanban Board</h1>
        <nav className="app-tabs">
          <button
            type="button"
            className={tab === 'tree' ? 'active' : ''}
            onClick={() => setTab('tree')}
          >
            Tree View
          </button>
          <button
            type="button"
            className={tab === 'kanban' ? 'active' : ''}
            onClick={() => setTab('kanban')}
          >
            Kanban Board
          </button>
        </nav>
      </header>
      <main className="app-main">
        {tab === 'tree' && <TreeView />}
        {tab === 'kanban' && <KanbanBoard />}
      </main>
    </div>
  );
}
