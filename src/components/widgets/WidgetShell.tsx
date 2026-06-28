import type { ReactNode } from 'react';
import { Trash2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  icon: LucideIcon;
  title: string;
  isEditing: boolean;
  onDelete: () => void;
  children: ReactNode;
}

/**
 * Shared chrome for the standard list-style widgets (Todo, Timer, Reminders):
 * the card surface, the draggable title header with icon, the edit-mode delete
 * button, and the full-card drag overlay. Markup is identical to the inlined
 * versions these widgets previously carried — only the icon, title and body vary.
 */
export default function WidgetShell({ icon: Icon, title, isEditing, onDelete, children }: Readonly<Props>) {
  return (
    <article className="card-base w-full h-full relative group overflow-hidden flex flex-col bg-card/65 backdrop-blur-md">
      <header className={`flex items-center justify-between px-2 border-b border-border bg-gray-50/50 dark:bg-black/10 shrink-0 rounded-t-xl ${isEditing ? 'py-1 drag-handle cursor-grab active:cursor-grabbing' : 'py-0.5'}`}>
        <div className="flex items-center gap-1.5">
          <Icon size={isEditing ? 12 : 10} className="text-primary" aria-hidden="true" />
          <h3 className={`font-medium text-foreground pointer-events-none ${isEditing ? 'text-xs' : 'text-2xs'}`}>{title}</h3>
        </div>
        {isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 relative z-20"
            title="Delete Widget"
          >
            <Trash2 size={13} />
          </Button>
        )}
      </header>

      {isEditing && <div className="absolute inset-x-0 bottom-0 top-[48px] z-10 bg-transparent cursor-grab drag-handle" />}

      {children}
    </article>
  );
}
