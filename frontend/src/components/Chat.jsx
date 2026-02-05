import React, { useState, useRef, useEffect } from 'react';
import { chatStream } from '../services/ollamaService';
import { getSettings } from '../utils/storage';
import { saveConversation, getConversations } from '../utils/storage';
import MarkdownMessage from './MarkdownMessage';

export default function Chat({ onBack, initialContext }) {
  const [messages, setMessages] = useState(
    initialContext?.messages?.length ? initialContext.messages : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [convoId, setConvoId] = useState(initialContext?.id || null);
  const bottomRef = useRef(null);
  const settings = getSettings();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const nextMessages = [...messages, userMsg];
    let assistantContent = '';

    try {
      assistantContent = await chatStream(
        nextMessages,
        settings.model,
        (chunk) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
            }
            return [...prev, { role: 'assistant', content: chunk }];
          });
        }
      );
    } catch (err) {
      setError(err.message || 'Request failed');
      setMessages((prev) => prev.slice(0, -1));
      setLoading(false);
      return;
    }

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant') return prev;
      return [...prev, { role: 'assistant', content: assistantContent }];
    });
    setLoading(false);

    const updated = [...nextMessages, { role: 'assistant', content: assistantContent }];
    const title = messages.length === 0 ? text.slice(0, 50) : (initialContext?.title || getConversations().find((c) => c.id === convoId)?.title || 'Chat');
    const saved = saveConversation({
      id: convoId,
      title: title.length > 50 ? title.slice(0, 47) + '...' : title,
      messages: updated,
      updatedAt: new Date().toISOString(),
    });
    if (!convoId) setConvoId(saved.id);
  };

  const clearChat = () => {
    setMessages([]);
    setConvoId(null);
    setError('');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-slate-400 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>
        <button
          type="button"
          onClick={clearChat}
          className="text-sm text-slate-400 hover:text-amber-400 transition"
        >
          Clear Chat
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.length === 0 && !loading && (
          <p className="text-slate-500 text-center py-8">Type your question below. Code blocks will be syntax-highlighted.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 ${
              msg.role === 'user'
                ? 'bg-slate-800 ml-4 mr-8'
                : 'bg-slate-900/80 mr-4 ml-8 border border-slate-800'
            }`}
          >
            <div className="text-xs text-slate-500 mb-1">
              {msg.role === 'user' ? 'You' : 'AI'}
            </div>
            {msg.role === 'user' ? (
              <p className="whitespace-pre-wrap text-slate-200">{msg.content}</p>
            ) : (
              <MarkdownMessage content={msg.content} />
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="rounded-lg p-4 bg-slate-900/80 mr-4 ml-8 border border-slate-800">
            <div className="text-xs text-slate-500 mb-1">AI</div>
            <span className="text-slate-400">Thinking...</span>
          </div>
        )}
        {error && (
          <div className="rounded-lg p-4 bg-red-900/20 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/30 shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your question..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
            disabled={loading}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-lg bg-mentor-600 hover:bg-mentor-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
