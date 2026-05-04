import { CheckCircle2, Circle, Clock, Trash2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import moment from 'moment';

const statusIcons = { todo: Circle, in_progress: Clock, done: CheckCircle2 };
const priorityStyles = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-success',
};
const categoryLabels = {
  work: '💼 Work',
  health: '💪 Health',
  learning: '📚 Learning',
  personal: '🏠 Personal',
  habit: '🔄 Habit',
};

export default function TaskItem({ task, onUpdate }) {
  const StatusIcon = statusIcons[task.status] || Circle;

  const cycleStatus = async () => {
    const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    try {
      await base44.entities.Task.update(task.id, { status: next });
    } catch (err) {
      console.error('Failed to update task via API:', err);
      // Fallback to local storage
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      const updatedTasks = localTasks.map(t => t.id === task.id ? { ...t, status: next } : t);
      localStorage.setItem('local_tasks', JSON.stringify(updatedTasks));
    }
    onUpdate?.();
  };

  const deleteTask = async (e) => {
    e.stopPropagation();
    try {
      await base44.entities.Task.delete(task.id);
    } catch (err) {
      console.error('Failed to delete task via API:', err);
      // Fallback to local storage
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      const filteredTasks = localTasks.filter(t => t.id !== task.id);
      localStorage.setItem('local_tasks', JSON.stringify(filteredTasks));
    }
    onUpdate?.();
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-4 rounded-xl bg-card border border-border border-l-4 hover:shadow-sm transition-all duration-200 cursor-pointer',
        priorityStyles[task.priority]
      )}
      onClick={cycleStatus}
    >
      <StatusIcon
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-colors',
          task.status === 'done' ? 'text-success' : task.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          {task.ai_generated && <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{categoryLabels[task.category] || task.category}</span>
          {task.due_date && (
            <span className="text-xs text-muted-foreground">· Due {moment(task.due_date).format('MMM D')}</span>
          )}
        </div>
      </div>
      <button
        onClick={deleteTask}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}