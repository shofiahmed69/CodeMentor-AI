import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import CodeAnalyzer from './components/CodeAnalyzer';
import CodeGenerator from './components/CodeGenerator';
import DebugHelper from './components/DebugHelper';
import LearningMode from './components/LearningMode';

const VIEWS = {
  dashboard: 'dashboard',
  chat: 'chat',
  analyze: 'analyze',
  generate: 'generate',
  debug: 'debug',
  learn: 'learn',
};

export default function App() {
  const [view, setView] = useState(VIEWS.dashboard);
  const [chatContext, setChatContext] = useState(null);

  const openChat = (context) => {
    setChatContext(context);
    setView(VIEWS.chat);
  };

  if (view === VIEWS.chat) {
    return (
      <Chat
        onBack={() => setView(VIEWS.dashboard)}
        initialContext={chatContext}
      />
    );
  }

  if (view === VIEWS.analyze) {
    return (
      <CodeAnalyzer
        onBack={() => setView(VIEWS.dashboard)}
        onOpenChat={openChat}
      />
    );
  }

  if (view === VIEWS.generate) {
    return (
      <CodeGenerator
        onBack={() => setView(VIEWS.dashboard)}
        onOpenChat={openChat}
      />
    );
  }

  if (view === VIEWS.debug) {
    return (
      <DebugHelper
        onBack={() => setView(VIEWS.dashboard)}
        onOpenChat={openChat}
      />
    );
  }

  if (view === VIEWS.learn) {
    return (
      <LearningMode
        onBack={() => setView(VIEWS.dashboard)}
        onOpenChat={openChat}
      />
    );
  }

  return (
    <Dashboard
      onNavigate={setView}
      onOpenChat={openChat}
    />
  );
}
