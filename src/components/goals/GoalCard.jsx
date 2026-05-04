import { Target, CheckCircle2, Pause, Sparkles, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import moment from 'moment';

const statusConfig = {
  active: { icon: Target, color: 'text-primary', bg: 'bg-accent' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  paused: { icon: Pause, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export default function GoalCard({ goal, taskCount, onUpdate, onGenerate }) {
  const config = statusConfig[goal.status] || statusConfig.active;
  const StatusIcon = config.icon;

  const cycleStatus = async () => {
    const next = goal.status === 'active' ? 'completed' : goal.status === 'completed' ? 'paused' : 'active';
    try {
      await base44.entities.Goal.update(goal.id, { status: next });
    } catch (err) {
      console.error('Failed to update goal status:', err);
      const localGoals = JSON.parse(localStorage.getItem('local_goals') || '[]');
      const updatedGoals = localGoals.map((g) => g.id === goal.id ? { ...g, status: next } : g);
      localStorage.setItem('local_goals', JSON.stringify(updatedGoals));
    }
    onUpdate?.();
  };

  const deleteGoal = async (e) => {
    e.stopPropagation();
    try {
      await base44.entities.Goal.delete(goal.id);
    } catch (err) {
      console.error('Failed to delete goal:', err);
      const localGoals = JSON.parse(localStorage.getItem('local_goals') || '[]');
      const filteredGoals = localGoals.filter((g) => g.id !== goal.id);
      localStorage.setItem('local_goals', JSON.stringify(filteredGoals));
    }
    onUpdate?.();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', config.bg)} onClick={cycleStatus}>
          <StatusIcon className={cn('h-5 w-5 cursor-pointer', config.color)} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={deleteGoal}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-base mb-1">{goal.title}</h3>
      {goal.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {goal.target_date && <span>Due {moment(goal.target_date).format('MMM D')}</span>}
          <span>{taskCount} tasks</span>
        </div>
        {goal.status === 'active' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-primary hover:text-primary"
            onClick={() => onGenerate?.(goal)}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Generate Tasks
          </Button>
        )}
      </div>
    </div>
  );
}