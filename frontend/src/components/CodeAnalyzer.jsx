import React, { useState } from 'react';
import { chat } from '../services/ollamaService';
import { getSettings } from '../utils/storage';
import MarkdownMessage from './MarkdownMessage';

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Other'];

export default function CodeAnalyzer({ onBack, onOpenChat }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const settings = getSettings();

  const analyze = async () => {
    if (!code.trim()) return;
    setError('');
    setResult('');
    setLoading(true);
    const prompt = `You are a code reviewer. Analyze the following ${language} code and provide:
1. A brief summary of what the code does
2. Code review and suggestions for improvement
3. Potential bugs or edge cases
4. Performance improvements if applicable
5. Security considerations if relevant
6. Best practices recommendations

Format your response in clear sections with markdown. Be concise but thorough.`;
    try {
      const response = await chat(
        [
          { role: 'user', content: prompt },
          { role: 'user', content: `Language: ${language}\n\nCode:\n\`\`\`\n${code.trim()}\n\`\`\`` },
        ],
        settings.model
      );
      setResult(response);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const openInChat = () => {
    onOpenChat?.({
      messages: [
        { role: 'user', content: `Analyze this ${language} code:\n\`\`\`\n${code.trim()}\n\`\`\`` },
        ...(result ? [{ role: 'assistant', content: result }] : []),
      ],
      title: 'Code analysis follow-up',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
        <h1 className="font-display font-semibold text-mentor-400">Analyze Code</h1>
      </header>

      <main className="flex-1 overflow-auto p-4 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-4 w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <label className="block text-sm text-slate-400 mb-2">Paste your code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste or type code here..."
              className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={analyze}
              disabled={loading || !code.trim()}
              className="mt-4 px-5 py-2.5 rounded-lg bg-mentor-600 hover:bg-mentor-500 disabled:opacity-50 text-white font-medium transition"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Analysis</label>
            <div className="min-h-64 rounded-lg bg-slate-900 border border-slate-700 p-4 overflow-auto">
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              {loading && !result && (
                <p className="text-slate-500">Analyzing your code...</p>
              )}
              {result && (
                <>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownMessage content={result} />
                  </div>
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={openInChat}
                      className="mt-4 text-sm text-mentor-400 hover:text-mentor-300"
                    >
                      Continue in Chat →
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
