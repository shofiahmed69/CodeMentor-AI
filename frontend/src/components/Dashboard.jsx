import React, { useState, useEffect } from 'react';
import { getConversations, getSettings, saveSettings } from '../utils/storage';
import { health, listModels } from '../services/ollamaService';

const cards = [
  { id: 'chat', title: 'Chat AI', desc: 'Ask coding questions', icon: '💬', path: 'chat' },
  { id: 'analyze', title: 'Analyze Code', desc: 'Review & suggestions', icon: '🔍', path: 'analyze' },
  { id: 'generate', title: 'Generate Code', desc: 'Describe, get code', icon: '✨', path: 'generate' },
  { id: 'debug', title: 'Debug Helper', desc: 'Paste errors, get fixes', icon: '🐛', path: 'debug' },
  { id: 'learn', title: 'Learn Mode', desc: 'Concepts & tutorials', icon: '📚', path: 'learn' },
];

export default function Dashboard({ onNavigate, onOpenChat }) {
  const [conversations, setConversations] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const [models, setModels] = useState([]);
  const [ollamaOk, setOllamaOk] = useState(false);

  useEffect(() => {
    setConversations(getConversations());
  }, []);

  useEffect(() => {
    health()
      .then(() => setOllamaOk(true))
      .catch(() => setOllamaOk(false));
    listModels().then(setModels).catch(() => setModels([]));
  }, []);

  const handleSaveSettings = (next) => {
    const saved = saveSettings(next);
    setSettings(saved);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-display">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-mentor-400">CodeMentor AI</h1>
          <button
            type="button"
            onClick={() => setSettingsOpen((s) => !s)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Settings"
          >
            🔧 Settings
          </button>
        </div>
        {settingsOpen && (
          <div className="max-w-4xl mx-auto px-4 pb-4 border-t border-slate-800 pt-4">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Model</span>
                <select
                  value={settings.model}
                  onChange={(e) => handleSaveSettings({ model: e.target.value })}
                  className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
                >
                  {models.length ? models.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  )) : (
                    <option value="llama3.2">llama3.2</option>
                  )}
                </select>
              </label>
              <span className={`text-sm ${ollamaOk ? 'text-green-400' : 'text-amber-400'}`}>
                {ollamaOk ? '● Ollama connected' : '○ Ollama not detected'}
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onNavigate(card.path)}
              className="flex flex-col items-start p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-mentor-500/50 hover:bg-slate-800/50 transition text-left"
            >
              <span className="text-2xl mb-2">{card.icon}</span>
              <h2 className="font-semibold text-white mb-1">{card.title}</h2>
              <p className="text-sm text-slate-400">{card.desc}</p>
            </button>
          ))}
        </div>

        <section className="mt-10">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Conversations</h3>
          <ul className="space-y-2">
            {conversations.length === 0 ? (
              <li className="text-slate-500 text-sm">No recent conversations yet.</li>
            ) : (
              conversations.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => (onOpenChat ? onOpenChat(c) : onNavigate('chat'))}
                    className="text-sm text-slate-300 hover:text-mentor-400 transition truncate block w-full text-left"
                  >
                    • {c.title}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
