import React, { useState } from 'react';
import { chat } from '../services/ollamaService';
import { getSettings } from '../utils/storage';
import MarkdownMessage from './MarkdownMessage';

export default function DebugHelper({ onBack, onOpenChat }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const settings = getSettings();

  const getHelp = async () => {
    if (!errorMessage.trim()) return;
    setError('');
    setResult('');
    setLoading(true);
    const prompt = `You are a debugging assistant. The user is seeing an error and may have pasted related code.

Error message or stack trace:
\`\`\`
${errorMessage.trim()}
\`\`\`
${code.trim() ? `Related code:\n\`\`\`\n${code.trim()}\n\`\`\`` : ''}

Provide:
1. A clear explanation of what the error means
2. The most likely cause(s)
3. A concrete fix with code example if applicable
4. Step-by-step debugging tips if helpful

Use markdown and code blocks. Be concise and actionable.`;
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
        {
          role: 'user',
          content: `Error:\n\`\`\`\n${errorMessage.trim()}\n\`\`\`\n${code.trim() ? `Code:\n\`\`\`\n${code.trim()}\n\`\`\`` : ''}`,
        },
        ...(result ? [{ role: 'assistant', content: result }] : []),
      ],
      title: 'Debug follow-up',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
        <h1 className="font-display font-semibold text-mentor-400">Debug Helper</h1>
      </header>

      <main className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Paste error message or stack trace</label>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste the full error or stack trace here..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
              spellCheck={false}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Related code (optional)</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste the code that produced the error..."
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-mentor-500"
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            onClick={getHelp}
            disabled={loading || !errorMessage.trim()}
            className="px-5 py-2.5 rounded-lg bg-mentor-600 hover:bg-mentor-500 disabled:opacity-50 text-white font-medium transition"
          >
            {loading ? 'Analyzing...' : 'Get help'}
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
