import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const priorityColors = {
  high: 'text-destructive',
  medium: 'text-warning',
  low: 'text-success',
};

export default function RecentTasks({ tasks, onToggle }) {
  if (!tasks.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No tasks yet. Create your first task!</p>
      </div>
    );
  }

  const handleToggle = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await base44.entities.Task.update(task.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle recent task:', err);
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      const updatedTasks = localTasks.map((t) => t.id === task.id ? { ...t, status: newStatus } : t);
      localStorage.setItem('local_tasks', JSON.stringify(updatedTasks));
    }
    onToggle?.();
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const StatusIcon = statusIcons[task.status] || Circle;
        return (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer"
            onClick={() => handleToggle(task)}
          >
            <StatusIcon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                task.status === 'done' ? 'text-success' : 'text-muted-foreground group-hover:text-primary'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                task.status === 'done' && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </p>
            </div>
            <span className={cn('text-xs font-medium', priorityColors[task.priority])}>
              {task.priority}
            </span>
          </div>
        );
      })}
    </div>
  );
}