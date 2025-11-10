import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface CodeContextType {
  code: string;
  language: string;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  clearCode: () => void;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export const useCode = () => {
  const context = useContext(CodeContext);
  if (!context) {
    throw new Error('useCode must be used within a CodeProvider');
  }
  return context;
};

interface CodeProviderProps {
  children: ReactNode;
}

export const CodeProvider: React.FC<CodeProviderProps> = ({ children }) => {
  const [code, setCode] = useState<string>('// Пиши код тут...');
  const [language, setLanguage] = useState<string>('javascript');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('gameLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gameLanguage', language);
  }, [language]);

  const clearCode = () => {
    setCode('// Пиши код тут...');
    setLanguage('javascript');
    localStorage.removeItem('gameLanguage');
  };

  return (
    <CodeContext.Provider
      value={{
        code,
        language,
        setCode,
        setLanguage,
        clearCode,
      }}
    >
      {children}
    </CodeContext.Provider>
  );
};
