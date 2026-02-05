import { Router } from 'express';

const router = Router();
const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const CHAT_TIMEOUT_MS = Number(process.env.OLLAMA_CHAT_TIMEOUT_MS) || 120000; // 2 min
const DEFAULT_NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT) || 2048;

/**
 * Sanitize user input: limit length and strip dangerous patterns
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.slice(0, 50000).replace(/\0/g, '');
}

/**
 * POST /api/chat
 * Proxy chat completion to Ollama (streaming or non-streaming)
 */
router.post('/chat', async (req, res) => {
  const { messages, model = DEFAULT_MODEL, stream = true, options: clientOptions } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const sanitized = messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: sanitizeInput(m.content || ''),
  }));

  const options = {
    num_predict: DEFAULT_NUM_PREDICT,
    ...(clientOptions && typeof clientOptions === 'object' ? clientOptions : {}),
  };

  const body = {
    model: sanitizeInput(model) || DEFAULT_MODEL,
    messages: sanitized,
    stream,
    options,
  };

  const controller = new AbortController();
  let timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return res.status(ollamaRes.status).json({
        error: errText || `Ollama error: ${ollamaRes.status}`,
      });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const reader = ollamaRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const raw = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
          if (raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw);
            const content = parsed.message?.content ?? parsed.response;
            if (content !== undefined) {
              res.write(`data: ${JSON.stringify({ message: { content } })}\n\n`);
            }
          } catch (_) {}
        }
      }
      if (buffer.trim()) {
        try {
          const raw = buffer.trim().startsWith('data: ') ? buffer.trim().slice(6) : buffer.trim();
          const parsed = JSON.parse(raw);
          const content = parsed.message?.content ?? parsed.response;
          if (content !== undefined) {
            res.write(`data: ${JSON.stringify({ message: { content } })}\n\n`);
          }
        } catch (_) {}
      }
      res.end();
      return;
    }

    const data = await ollamaRes.json();
    res.json(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'Ollama took too long to respond. Try a smaller model or shorter prompt.',
      });
    }
    console.error('Ollama proxy error:', err.message);
    res.status(502).json({
      error: 'Cannot reach Ollama. Is it running at ' + OLLAMA_BASE + '?',
    });
  }
});

/**
 * GET /api/models
 * List available Ollama models
 */
router.get('/models', async (req, res) => {
  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/tags`);
    if (!ollamaRes.ok) {
      return res.status(ollamaRes.status).json({
        error: await ollamaRes.text() || 'Failed to list models',
      });
    }
    const data = await ollamaRes.json();
    res.json(data);
  } catch (err) {
    console.error('Ollama models error:', err.message);
    res.status(502).json({
      error: 'Cannot reach Ollama. Is it running at ' + OLLAMA_BASE + '?',
    });
  }
});

export default router;
