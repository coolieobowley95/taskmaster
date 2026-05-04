import ReactMarkdown from 'react-markdown';
import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div className={cn('max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-card border border-border rounded-bl-md'
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}