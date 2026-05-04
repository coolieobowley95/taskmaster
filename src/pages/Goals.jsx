import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import GoalCard from '../components/goals/GoalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'personal', target_date: '' });

  const loadData = async () => {
    try {
      const [goalData, taskData] = await Promise.all([
        base44.entities.Goal.list('-created_date', 50),
        base44.entities.Task.list('-created_date', 200),
      ]);
      setGoals(goalData);
      setTasks(taskData);
    } catch (err) {
      console.error('Failed to load data:', err);
      // Fallback to local storage
      const localGoals = JSON.parse(localStorage.getItem('local_goals') || '[]');
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      setGoals(localGoals);
      setTasks(localTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const createGoal = async () => {
    if (!form.title.trim()) return;
    
    const newGoal = {
      id: Date.now().toString(),
      ...form,
      created_date: new Date().toISOString()
    };
    
    try {
      await base44.entities.Goal.create(form);
    } catch (err) {
      console.error('Failed to create goal via API:', err);
      // Fallback to local storage
      const localGoals = JSON.parse(localStorage.getItem('local_goals') || '[]');
      localGoals.push(newGoal);
      localStorage.setItem('local_goals', JSON.stringify(localGoals));
    }
    
    setForm({ title: '', description: '', category: 'personal', target_date: '' });
    setDialogOpen(false);
    loadData();
  };

  const generateTasks = async (goal) => {
    setGenerating(true);
    let result = null;

    try {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a productivity expert. Given this goal, generate 5-7 specific, actionable tasks that will help achieve it. 
Goal: "${goal.title}"
Description: "${goal.description || 'No additional description'}"
Category: ${goal.category}
Target date: ${goal.target_date || 'No specific deadline'}

Generate tasks that are specific, measurable, and achievable. Each task should be a clear action step.`,
        response_json_schema: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  category: { type: 'string', enum: ['work', 'health', 'learning', 'personal', 'habit'] },
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.error('AI generation failed:', err);
    }

    const generatedTasks = result?.tasks?.length > 0 ? result.tasks : [
      { title: `Start working on ${goal.title}`, priority: 'medium', category: goal.category },
      { title: `Review progress for ${goal.title}`, priority: 'low', category: goal.category },
      { title: `Plan next steps for ${goal.title}`, priority: 'medium', category: goal.category },
    ];

    const taskData = generatedTasks.map((t) => ({
      ...t,
      id: Date.now().toString() + Math.random().toFixed(4),
      status: 'todo',
      goal_id: goal.id,
      ai_generated: true,
      created_date: new Date().toISOString(),
    }));

    try {
      await base44.entities.Task.bulkCreate(taskData);
    } catch (err) {
      console.error('Failed to bulk create generated tasks:', err);
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      localTasks.push(...taskData);
      localStorage.setItem('local_tasks', JSON.stringify(localTasks));
    }

    toast.success(`Generated ${taskData.length} tasks for "${goal.title}"`);
    loadData();
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">Set goals and let AI generate tasks for you</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11">
              <Plus className="h-4 w-4 mr-1" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="Goal title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-11 rounded-xl"
              />
              <Textarea
                placeholder="Describe your goal..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-11 rounded-xl flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  className="h-11 rounded-xl flex-1"
                />
              </div>
              <Button onClick={createGoal} disabled={!form.title.trim()} className="w-full h-11 rounded-xl">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {generating && (
        <div className="bg-accent rounded-2xl border border-border p-4 mb-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">AI is generating tasks for your goal...</span>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">No goals yet. Create your first goal to get started!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              taskCount={tasks.filter((t) => t.goal_id === goal.id).length}
              onUpdate={loadData}
              onGenerate={generateTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}