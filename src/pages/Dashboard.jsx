import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckSquare, Target, Flame, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ProgressRing from '../components/dashboard/ProgressRing';
import RecentTasks from '../components/dashboard/RecentTasks';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import moment from 'moment';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [taskData, goalData, userData] = await Promise.all([
        base44.entities.Task.list('-created_date', 50),
        base44.entities.Goal.list('-created_date', 20),
        base44.auth.me(),
      ]);
      setTasks(taskData);
      setGoals(goalData);
      setUser(userData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      const localGoals = JSON.parse(localStorage.getItem('local_goals') || '[]');
      setTasks(localTasks);
      setGoals(localGoals);
      setUser({ full_name: 'there' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const todayTasks = tasks.filter((t) => moment(t.created_date).isSame(moment(), 'day'));
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const todoTasks = tasks.filter((t) => t.status !== 'done');
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const activeGoals = goals.filter((g) => g.status === 'active');

  const streakDays = (() => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const hasDone = tasks.some(
        (t) => t.status === 'done' && moment(t.updated_date).format('YYYY-MM-DD') === day
      );
      if (hasDone) streak++;
      else if (i > 0) break;
    }
    return streak;
  })();

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your productivity overview for today
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={CheckSquare}
          label="Tasks Done"
          value={doneTasks.length}
          sublabel={`of ${tasks.length} total`}
          colorClass="bg-accent"
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={activeGoals.length}
          sublabel={`${goals.length} total`}
          colorClass="bg-accent"
        />
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={streakDays}
          sublabel="consecutive days"
          colorClass="bg-accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Today"
          value={todayTasks.length}
          sublabel="tasks created"
          colorClass="bg-accent"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-base font-semibold mb-4">Weekly Activity</h2>
            <WeeklyChart tasks={tasks} />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-base font-semibold mb-4">Recent Tasks</h2>
            <RecentTasks tasks={todoTasks.slice(0, 8)} onToggle={loadData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center">
            <h2 className="text-base font-semibold mb-4 self-start">Completion Rate</h2>
            <ProgressRing percentage={completionRate} />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-base font-semibold mb-3">Active Goals</h2>
            {activeGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active goals yet.</p>
            ) : (
              <div className="space-y-3">
                {activeGoals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{goal.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}