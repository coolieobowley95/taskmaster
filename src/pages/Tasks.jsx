import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadTasks = async () => {
    try {
      setError(null);
      const data = await base44.entities.Task.list('-created_date', 100);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      // Fallback to local storage for local development
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      setTasks(localTasks);
      setError('Using local storage - API not available');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'active') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return t.category === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage and track your tasks</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <TaskForm onCreated={loadTasks} />
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-muted rounded-xl h-10">
          <TabsTrigger value="all" className="rounded-lg text-xs">All ({tasks.length})</TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg text-xs">Active ({tasks.filter(t => t.status !== 'done').length})</TabsTrigger>
          <TabsTrigger value="done" className="rounded-lg text-xs">Done ({tasks.filter(t => t.status === 'done').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No tasks found. Add your first task above!</p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskItem key={task.id} task={task} onUpdate={loadTasks} />
          ))
        )}
      </div>
    </div>
  );
}