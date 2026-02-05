# CodeMentor AI

An AI-powered coding assistant that helps you learn, debug, and improve code. It talks to **Ollama** on your machine—no cloud APIs, no sending your code to third parties.

## Features

- **Chat AI** – Ask coding questions with streaming replies and syntax-highlighted code
- **Analyze Code** – Paste code and get review, bugs, performance tips, and best practices
- **Generate Code** – Describe what you need in plain English and get code in your chosen language
- **Debug Helper** – Paste errors (and optional code) and get explanations and fixes
- **Learn Mode** – Get explanations and examples for topics (e.g. React Hooks, async/await)

Conversation history is stored in your browser (localStorage). You can copy code from responses with one click.

## Prerequisites

1. **Node.js** (v18+)
2. **Ollama** with at least one model (e.g. `llama3.2` or `mistral`)

```bash
# Install Ollama from https://ollama.com then pull a model:
ollama pull llama3.2
```

## Quick Start

### 1. Start Ollama (if not already running)

Ollama should be available at **http://localhost:11434**. Start it however you usually do (e.g. desktop app or `ollama serve`).

### 2. Backend (API proxy)

```bash
cd codemantor-ai/backend
npm install
npm start
```

Runs on **http://localhost:3001** and proxies requests to Ollama. To use another Ollama URL:

```bash
OLLAMA_URL=http://localhost:11434 npm start
```

### 3. Frontend

```bash
cd codemantor-ai/frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The frontend is configured to proxy `/api` to the backend (port 3001).

## Project structure

```
codemantor-ai/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/  # Dashboard, Chat, CodeAnalyzer, etc.
│       ├── services/    # ollamaService.js
│       └── utils/      # storage, code highlight
├── backend/           # Express proxy to Ollama
│   ├── server.js
│   └── routes/ollama.js
└── README.md
```

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, react-markdown, react-syntax-highlighter
- **Backend:** Node.js, Express, proxy to Ollama at `http://localhost:11434`
- **AI:** Ollama (local models; no API keys)

## License

MIT
