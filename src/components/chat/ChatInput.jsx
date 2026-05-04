import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything about productivity..."
        disabled={disabled}
        className="flex-1 h-11 px-4 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
      <Button
        type="submit"
        disabled={disabled || !input.trim()}
        size="icon"
        className="h-11 w-11 rounded-xl"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}