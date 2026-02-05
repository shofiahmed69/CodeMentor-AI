import React, { useState } from 'react';
import { chat } from '../services/ollamaService';
import { getSettings } from '../utils/storage';
import MarkdownMessage from './MarkdownMessage';

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'SQL'];

export default function CodeGenerator({ onBack, onOpenChat }) {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const settings = getSettings();

  const copyCode = () => {
    const match = result.match(/```[\w]*\n([\s\S]*?)```/);
    const toCopy = match ? match[1].trim() : result;
    navigator.clipboard.writeText(toCopy).then(() => {}).catch(() => {});
  };

  const generate = async () => {
    if (!description.trim()) return;
    setError('');
    setResult('');
    setLoading(true);
    const prompt = `You are a code generator. The user wants code in ${language}.

User request: ${description.trim()}

Respond with:
1. A very brief explanation of the approach (1-2 sentences).
2. Working code in a markdown code block with the correct language tag (e.g. \`\`\`python).
3. Short usage notes if helpful.

Output only the explanation and code. Be concise.`;
    try {
      const response = await chat(
        [{ role: 'user', content: prompt }],
        settings.model
      );
      setResult(response);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const openInChat = () => {
    onOpenChat?.({
      messages: [
        { role: 'user', content: `Generate ${language} code for: ${description.trim()}` },
        ...(result ? [{ role: 'assistant', content: result }] : []),
      ],
      title: 'Code generation follow-up',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
        <h1 className="font-display font-semibold text-mentor-400">Generate Code</h1>
      </header>

      <main className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Describe what you need (plain English)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A function that takes a list of numbers and returns the sum of even numbers only"
              className="w-full h-28 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={loading || !description.trim()}
            className="px-5 py-2.5 rounded-lg bg-mentor-600 hover:bg-mentor-500 disabled:opacity-50 text-white font-medium transition"
          >
            {loading ? 'Generating...' : 'Generate Code'}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {result && (
            <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Generated code</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="text-sm text-mentor-400 hover:text-mentor-300"
                >
                  Copy
                </button>
              </div>
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
