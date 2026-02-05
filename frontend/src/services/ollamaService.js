const API_BASE = '/api';

/**
 * Send chat messages to Ollama (streaming).
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} messages
 * @param {string} model
 * @param {(chunk: string) => void} onChunk
 * @param {{ num_predict?: number, temperature?: number }} opts - optional Ollama options (e.g. num_predict for max tokens)
 * @returns {Promise<string>} Full response text
 */
export async function chatStream(messages, model, onChunk, opts = {}) {
  const body = { messages, model, stream: true };
  if (opts && typeof opts === 'object' && Object.keys(opts).length) body.options = opts;
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const raw = line.slice(6);
        if (raw === '[DONE]') continue;
        try {
          const data = JSON.parse(raw);
          const content = data.message?.content ?? '';
          if (content) {
            full += content;
            onChunk?.(content);
          }
        } catch (_) {}
      }
    }
  }
  return full;
}

/**
 * Send chat messages to Ollama (non-streaming).
 * @param {{ num_predict?: number }} opts - optional; use num_predict to cap response length for faster replies. Default 1024 for tool-style calls.
 */
export async function chat(messages, model = 'llama3.2', opts = {}) {
  const options = { num_predict: 1024, ...opts };
  const body = { messages, model, stream: false, options };
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.message?.content ?? '';
}

/**
 * List available Ollama models.
 */
export async function listModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to list models');
  const data = await res.json();
  return data.models ?? [];
}

/**
 * Check backend and Ollama health.
 */
export async function health() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend unhealthy');
  return res.json();
}
