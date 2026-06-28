import { useState, type FormEvent } from 'react';
import { CheckSquare, Plus, X } from 'lucide-react';
import { useWidgetStorage } from '../../hooks/useWidgetStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WidgetShell from './WidgetShell';
import type { TodoItem, TodoEntry } from '../../types';

interface Props {
  item: TodoItem;
  onDelete: (id: string) => void;
  isEditing: boolean;
}

const TodoWidget = ({ item, onDelete, isEditing }: Readonly<Props>) => {
  const [todos, saveTodos] = useWidgetStorage<TodoEntry[]>(`todo-widget-${item.id}`, []);
  const [newTask, setNewTask] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    saveTodos((current) => [...current, { id: Date.now(), text, completed: false }]);
    setNewTask("");
  };

  const toggleTodo = (id: number) => {
    saveTodos((current) => current.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    saveTodos((current) => current.filter(t => t.id !== id));
  };

  return (
    <WidgetShell icon={CheckSquare} title={item.title || 'Todos'} isEditing={isEditing} onDelete={() => onDelete(item.id)}>
      <ul className="flex-1 overflow-y-auto p-1 space-y-0.5 list-none">
        {todos.length === 0 && (
          <li className="text-xs text-muted-foreground text-center mt-4">No tasks yet.</li>
        )}
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-white/5 rounded group/item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              className="accent-primary cursor-pointer w-3 h-3 shrink-0"
            />
            <span className={`text-xs leading-snug flex-1 min-w-0 break-words ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {todo.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => deleteTodo(todo.id)}
              title="Delete Task"
              className="h-5 w-5 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-transparent transition-opacity shrink-0"
            >
              <X size={14} />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="p-1.5 border-t border-border shrink-0 bg-gray-50/50 dark:bg-black/10 rounded-b-xl">
        <div className="relative">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            aria-label="New task"
            className="h-7 w-full bg-gray-100 dark:bg-white/5 border-none rounded-sm pl-2.5 pr-8 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!newTask.trim()}
            title="Add Task"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50"
          >
            <Plus size={14} />
          </Button>
        </div>
      </form>
    </WidgetShell>
  );
};

export default TodoWidget;
