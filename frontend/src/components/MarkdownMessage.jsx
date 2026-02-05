import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function MarkdownMessage({ content }) {
  const handleCopy = useCallback((code) => {
    copyToClipboard(code);
  }, []);

  return (
    <div className="markdown-body prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            if (!inline && match) {
              return (
                <div className="relative group my-2 rounded-lg overflow-hidden bg-[#0d1117]">
                  <div className="flex justify-between items-center px-3 py-1.5 bg-slate-800/80 border-b border-slate-700">
                    <span className="text-xs text-slate-400">{match[1]}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(code)}
                      className="text-xs text-mentor-400 hover:text-mentor-300 transition"
                    >
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
                    codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace' } }}
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-mentor-300 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
