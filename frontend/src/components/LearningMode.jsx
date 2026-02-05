import React, { useState } from 'react';
import { chat } from '../services/ollamaService';
import { getSettings } from '../utils/storage';
import MarkdownMessage from './MarkdownMessage';

const TOPICS = [
  'React Hooks (useState, useEffect)',
  'Async/Await and Promises',
  'Array methods (map, filter, reduce)',
  'REST APIs and Fetch',
  'Object-oriented programming basics',
  'Recursion',
  'Sorting algorithms',
  'Data structures (arrays, objects, maps)',
  'Error handling (try/catch)',
  'CSS Flexbox and Grid',
  'SQL basics',
  'Git basics',
];

export default function LearningMode({ onBack, onOpenChat }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const settings = getSettings();

  const selectedTopic = customTopic.trim() || topic;

  const learn = async () => {
    if (!selectedTopic) return;
    setError('');
    setResult('');
    setLoading(true);
    const prompt = `You are a patient programming tutor. The user wants to learn about: "${selectedTopic}".

Provide:
1. A clear, concise explanation of the concept (2-4 short paragraphs)
2. A simple code example with comments
3. One or two "key takeaway" bullets
4. Optional: one practice idea they can try

Use markdown. Keep the tone friendly and avoid overwhelming detail.`;
    try {
      const response = await chat(
        [{ role: 'user', content: prompt }],
        settings.model
      );
      setResult(response);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const openInChat = () => {
    onOpenChat?.({
      messages: [
        { role: 'user', content: `Explain: ${selectedTopic}` },
        ...(result ? [{ role: 'assistant', content: result }] : []),
      ],
      title: `Learning: ${selectedTopic.slice(0, 40)}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
        <h1 className="font-display font-semibold text-mentor-400">Learn Mode</h1>
      </header>

      <main className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Choose a topic</label>
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setCustomTopic(''); }}
              className="w-full mb-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Or type your own topic..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
            />
          </div>
          <button
            type="button"
            onClick={learn}
            disabled={loading || !selectedTopic}
            className="px-5 py-2.5 rounded-lg bg-mentor-600 hover:bg-mentor-500 disabled:opacity-50 text-white font-medium transition"
          >
            {loading ? 'Explaining...' : 'Explain topic'}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {result && (
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 mt-4">
              <MarkdownMessage content={result} />
              {onOpenChat && (
                <button
                  type="button"
                  onClick={openInChat}
                  className="mt-4 text-sm text-mentor-400 hover:text-mentor-300"
                >
                  Continue in Chat →
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
