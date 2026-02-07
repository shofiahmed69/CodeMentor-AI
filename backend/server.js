import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import ollamaRoutes from './routes/ollama.js';

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

// Rate limiting: 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use(limiter);
app.use(helmet());

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ollama: OLLAMA_BASE });
});

app.use('/api', ollamaRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'An unexpected error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`CodeMentor AI backend running on http://localhost:${PORT}`);
  console.log(`Ollama proxy target: ${OLLAMA_BASE}`);
});
