import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './codeHighlight.css';

const languageAlias = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
};

export function detectLanguage(code, hint) {
  if (hint) {
    const h = hint.toLowerCase().replace(/^\./, '');
    return languageAlias[h] || h;
  }
  return 'text';
}

export function CodeBlock({ language, code, className = '' }) {
  const lang = detectLanguage(code, language);
  return (
    <div className={`code-block-wrapper rounded-lg overflow-hidden my-2 ${className}`}>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        showLineNumbers={code.split('\n').length > 5}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          background: '#0d1117',
        }}
        codeTagProps={{ style: { fontFamily: 'JetBrains Mono, monospace' } }}
      >
        {code.trimEnd()}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;
