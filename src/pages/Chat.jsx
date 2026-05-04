import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInput from '../components/chat/ChatInput';
import SuggestionChips from '../components/chat/SuggestionChips';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.ChatMessage.list('created_date', 50);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
        // Fallback to local storage
        const localMessages = JSON.parse(localStorage.getItem('local_messages') || '[]');
        setMessages(localMessages);
      } finally {
        setInitialLoad(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content) => {
    const userMsg = { 
      id: Date.now().toString(),
      role: 'user', 
      content, 
      session_id: 'main',
      created_date: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    
    try {
      await base44.entities.ChatMessage.create(userMsg);
    } catch (err) {
      console.error('Failed to save user message:', err);
      // Store locally
      const localMessages = JSON.parse(localStorage.getItem('local_messages') || '[]');
      localMessages.push(userMsg);
      localStorage.setItem('local_messages', JSON.stringify(localMessages));
    }
    
    setLoading(true);

    // Mock AI response for local development
    const mockResponse = `Thanks for your message: "${content}". This is a local development mode response. For full AI functionality, connect to a Base44 backend.`;
    
    const assistantMsg = { 
      id: (Date.now() + 1).toString(),
      role: 'assistant', 
      content: mockResponse, 
      session_id: 'main',
      created_date: new Date().toISOString()
    };
    
    setTimeout(() => {
      setMessages((prev) => [...prev, assistantMsg]);
      try {
        base44.entities.ChatMessage.create(assistantMsg);
      } catch (err) {
        console.error('Failed to save assistant message:', err);
        // Store locally
        const localMessages = JSON.parse(localStorage.getItem('local_messages') || '[]');
        localMessages.push(assistantMsg);
        localStorage.setItem('local_messages', JSON.stringify(localMessages));
      }
      setLoading(false);
    }, 1000);
  };

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="px-4 md:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold">FlowMind AI</h1>
            <p className="text-xs text-muted-foreground">Your productivity assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                I can help you plan your day, suggest habits, generate tasks, and boost your productivity.
              </p>
              <SuggestionChips onSelect={sendMessage} />
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}