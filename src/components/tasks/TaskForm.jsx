import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export default function TaskForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      priority,
      category,
      status: 'todo',
      created_date: new Date().toISOString()
    };
    
    try {
      await base44.entities.Task.create({ title: title.trim(), priority, category, status: 'todo' });
    } catch (err) {
      console.error('Failed to create task via API:', err);
      // Fallback to local storage
      const localTasks = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      localTasks.push(newTask);
      localStorage.setItem('local_tasks', JSON.stringify(localTasks));
    }
    
    setTitle('');
    setPriority('medium');
    setCategory('personal');
    setCreating(false);
    onCreated?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 h-11 rounded-xl bg-background"
      />
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-full sm:w-32 h-11 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-36 h-11 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="learning">Learning</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="habit">Habit</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={creating || !title.trim()} className="h-11 rounded-xl px-5">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </form>
  );
}