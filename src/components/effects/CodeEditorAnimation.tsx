import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const codeSnippets = [
  `function solve() {
  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(i * 2);
  }
  return result;
}`,
  `def solve():
    result = []
    for i in range(n):
        result.append(i * 2)
    return result`,
  `public int[] solve() {
    int[] result = new int[n];
    for (int i = 0; i < n; i++) {
        result[i] = i * 2;
    }
    return result;
}`,
];

const CodeEditorAnimation = () => {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const snippet = codeSnippets[currentSnippet];
    let index = 0;
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (index < snippet.length) {
        setDisplayedCode(snippet.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        
        setTimeout(() => {
          setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
          setDisplayedCode('');
        }, 2000);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentSnippet]);

  const getLanguage = () => {
    if (codeSnippets[currentSnippet].includes('function')) return 'javascript';
    if (codeSnippets[currentSnippet].includes('def ')) return 'python';
    return 'java';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-md mx-auto lg:max-w-lg"
    >
      <div className="bg-secondary-bg border border-primary-bdr overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-bg border-b border-primary-bdr">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-redDD"></div>
            <div className="w-3 h-3 rounded-full bg-orangeDD"></div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <span className="text-white/50 text-xs ml-2 font-mono">
            {getLanguage()}.{getLanguage() === 'javascript' ? 'js' : getLanguage() === 'python' ? 'py' : 'java'}
          </span>
        </div>
        <div className="p-4 font-mono text-sm">
          <pre className="text-white/90 overflow-x-auto">
            <code>
              {displayedCode}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                  className="inline-block w-2 h-4 bg-primary ml-1"
                />
              )}
            </code>
          </pre>
        </div>
        <div className="px-4 py-2 bg-tertiary-bg border-t border-primary-bdr flex items-center justify-between">
          <span className="text-white/40 text-xs">Ln 1, Col {displayedCode.length}</span>
          <div className="flex gap-2">
            <span className="text-primary text-xs">●</span>
            <span className="text-white/40 text-xs">Ready</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CodeEditorAnimation;

