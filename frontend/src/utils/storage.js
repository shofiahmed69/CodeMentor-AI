const KEY_CONVOS = 'codementor_conversations';
const KEY_SETTINGS = 'codementor_settings';

export function getConversations() {
  try {
    const raw = localStorage.getItem(KEY_CONVOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversation({ id, title, messages, updatedAt }) {
  const list = getConversations();
  const existing = list.findIndex((c) => c.id === id);
  const entry = {
    id: id || crypto.randomUUID(),
    title: title || 'New chat',
    messages: messages || [],
    updatedAt: updatedAt || new Date().toISOString(),
  };
  if (existing >= 0) {
    list[existing] = entry;
  } else {
    list.unshift(entry);
  }
  localStorage.setItem(KEY_CONVOS, JSON.stringify(list.slice(0, 50)));
  return entry;
}

export function deleteConversation(id) {
  const list = getConversations().filter((c) => c.id !== id);
  localStorage.setItem(KEY_CONVOS, JSON.stringify(list));
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? JSON.parse(raw) : { model: 'llama3.2', theme: 'dark' };
  } catch {
    return { model: 'llama3.2', theme: 'dark' };
  }
}

export function saveSettings(settings) {
  const current = getSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(next));
  return next;
}
