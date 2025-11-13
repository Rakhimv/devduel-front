import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useState, useEffect, useRef } from "react";
import { useCode } from "../../context/CodeContext";
import { submitTaskSolution, getTaskTemplate } from "../../api/api";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const languages = [
  { name: "javascript", id: 102, defaultCode: "// JavaScript code\nconsole.log('Hello, World!');" },
  { name: "python", id: 109, defaultCode: "# Python code\nprint('Hello, World!')" },
  { name: "cpp", id: 105, defaultCode: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
  { name: "java", id: 91, defaultCode: '// Java code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { name: "csharp", id: 51, defaultCode: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { name: "go", id: 107, defaultCode: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { name: "php", id: 98, defaultCode: '<?php\necho "Hello, World!";\n?>' },
];

loader.config({ monaco });


interface CodeEditorProps {
  gameId?: string;
  taskId?: number;
  onTaskSubmitted?: (success: boolean, testResults: any[], gameFinished?: boolean) => void;
}

export default function CodeIDE({ gameId, taskId, onTaskSubmitted }: CodeEditorProps = {}) {
  const { code, language, setCode, setLanguage } = useCode();
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const prevTaskIdRef = useRef<number | undefined>(undefined);
  const prevLanguageRef = useRef<string | undefined>(undefined);
  const prevGameIdRef = useRef<string | undefined>(undefined);

  const getStorageKey = (gameIdValue: string | undefined, taskIdValue: number | undefined, lang: string) => {
    if (!taskIdValue) return null;
    return `gameCode_${gameIdValue || 'default'}_${taskIdValue}_${lang}`;
  };

  const saveCodeToStorage = (gameIdValue: string | undefined, taskIdValue: number | undefined, lang: string, codeToSave: string) => {
    const key = getStorageKey(gameIdValue, taskIdValue, lang);
    if (key) {
      localStorage.setItem(key, codeToSave);
    }
  };

  const loadCodeFromStorage = (gameIdValue: string | undefined, taskIdValue: number | undefined, lang: string): string | null => {
    const key = getStorageKey(gameIdValue, taskIdValue, lang);
    if (key) {
      return localStorage.getItem(key);
    }
    return null;
  };

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);
  
  useEffect(() => {
    if (!taskId || isInitializingRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveCodeToStorage(gameId, taskId, language, code);
      saveTimeoutRef.current = null;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, taskId, language, gameId]);

  useEffect(() => {
    return () => {
      if (taskId && language && code) {
        saveCodeToStorage(gameId, taskId, language, code);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [taskId, language, code, gameId]);

  useEffect(() => {
    if (!taskId || !language) {
      return;
    }

    const taskChanged = prevTaskIdRef.current !== taskId;
    const languageChanged = prevLanguageRef.current !== language;
    const gameChanged = prevGameIdRef.current !== gameId;

    if (!taskChanged && !languageChanged && !gameChanged && prevTaskIdRef.current !== undefined) {
      return;
    }

    isInitializingRef.current = true;

    if (prevTaskIdRef.current !== undefined && prevLanguageRef.current && (taskChanged || languageChanged || gameChanged)) {
      const prevGameId = prevGameIdRef.current || gameId;
      saveCodeToStorage(prevGameId, prevTaskIdRef.current, prevLanguageRef.current, code);
    }

    const savedCode = loadCodeFromStorage(gameId, taskId, language);
    
    if (savedCode) {
      setCode(savedCode);
      isInitializingRef.current = false;
    } else {
      loadTaskTemplate().finally(() => {
        isInitializingRef.current = false;
      });
    }
    
    prevTaskIdRef.current = taskId;
    prevLanguageRef.current = language;
    prevGameIdRef.current = gameId;
    setOutput("");
  }, [taskId, language, gameId]);

  const handleLanguageChange = async (newLanguage: string) => {
    if (taskId) {
      saveCodeToStorage(gameId, taskId, language, code);
    }
    
    setLanguage(newLanguage);
    
    if (taskId && newLanguage) {
      const savedCode = loadCodeFromStorage(gameId, taskId, newLanguage);
      
      if (savedCode) {
        setCode(savedCode);
      } else {
        try {
          const templateData = await getTaskTemplate(taskId, newLanguage);
          setCode(templateData.template);
        } catch (error) {
          console.error("Failed to load task template:", error);
          const lang = languages.find(l => l.name === newLanguage);
          if (lang) {
            setCode(lang.defaultCode);
          }
        }
      }
    }
  };

  const loadTaskTemplate = async () => {
    if (!taskId || !language) return;
    
    const savedCode = loadCodeFromStorage(gameId, taskId, language);
    if (savedCode) {
      setCode(savedCode);
      return;
    }
    
    try {
      const templateData = await getTaskTemplate(taskId, language);
      const finalSavedCode = loadCodeFromStorage(gameId, taskId, language);
      if (!finalSavedCode) {
        setCode(templateData.template);
      }
    } catch (error) {
      console.error("Failed to load task template:", error);
      const lang = languages.find(l => l.name === language);
      if (lang) {
        const finalSavedCode = loadCodeFromStorage(gameId, taskId, language);
        if (!finalSavedCode) {
          setCode(lang.defaultCode);
        }
      }
    }
  };

  const runCodeHandler = async () => {
    if (!gameId || !taskId) {
      setOutput("Ошибка: Контекст игры или задачи недоступен");
      return;
    }

    setIsLoading(true);
    setOutput("Запуск теста...");
    try {
      const result = await submitTaskSolution({
        gameId,
        taskId,
        source_code: code,
        language,
        isRunTest: true,
      });

      if (result.success) {
        setOutput("✅ Тест пройден!");
      } else {
        const failedTests = result.testResults.filter(test => !test.passed);
        setOutput(`❌ Тест не пройден.\n\nВходные данные: ${failedTests[0]?.input}\nОжидалось: ${failedTests[0]?.expected}\nПолучено: ${failedTests[0]?.actual}`);
      }
    } catch (error: any) {
      setOutput(`Ошибка: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTaskHandler = async () => {
    if (!gameId || !taskId) {
      setOutput("Ошибка: Контекст игры или задачи недоступен");
      return;
    }

    setIsLoading(true);
    setOutput("Отправка решения...");
    try {
      const result = await submitTaskSolution({
        gameId,
        taskId,
        source_code: code,
        language,
        isRunTest: false,
      });

      if (result.success) {
        if (result.gameFinished) {
          setOutput("✅ Задача решена успешно! 🏆 Игра завершена! Вы победили!");
        } else {
          setOutput("✅ Задача решена успешно! Повышение уровня!");
        }
      } else {
        const failedTests = result.testResults.filter(test => !test.passed);
        setOutput(`❌ Задача не решена. Провалено ${failedTests.length} тест(ов).\n\nПроваленные тесты:\n${failedTests.map(test => `Входные данные: ${test.input}\nОжидалось: ${test.expected}\nПолучено: ${test.actual}\n`).join('\n')}`);
      }
      
      onTaskSubmitted?.(result.success, result.testResults, result.gameFinished);
    } catch (error: any) {
      setOutput(`Ошибка: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorWillMount = (monaco: typeof import('monaco-editor')) => {
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '83D6C5', fontStyle: 'bold' },
        { token: 'string', foreground: '94C1FA' },
        { token: 'number', foreground: 'EBC88D' },
        { token: 'type', foreground: '83D6C5' },
        { token: 'function', foreground: 'DA70D6' },
        { token: 'variable', foreground: 'ffffff' },
      ],
      colors: {
        'editor.background': '#0A0A0A',
        'editor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#6A9955',
        'editorLineNumber.activeForeground': '#83D6C5',
        'editor.selectionBackground': '#83D6C520',
        'editor.selectionHighlightBackground': '#83D6C510',
        'editorCursor.foreground': '#83D6C5',
        'editorWhitespace.foreground': '#3B3B3B',
        'editorIndentGuide.background': '#3B3B3B',
        'editorIndentGuide.activeBackground': '#83D6C5',
        'editor.lineHighlightBackground': '#161616',
        'editorWidget.background': '#161616',
        'editorWidget.border': '#1c1c1c',
        'editorSuggestWidget.background': '#161616',
        'editorSuggestWidget.border': '#1c1c1c',
        'editorSuggestWidget.selectedBackground': '#83D6C520',
        'editorHoverWidget.background': '#161616',
        'editorHoverWidget.border': '#1c1c1c',
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-primary-bg text-white overflow-hidden">
      <div className="flex items-center gap-4 p-2 border-b border-primary-bdr bg-secondary-bg flex-shrink-0">
        <span className="font-bold text-sm">Редактор кода</span>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-primary-bg border border-primary-bdr text-white px-2 py-1 text-sm cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          onClick={runCodeHandler}
          disabled={isLoading}
          className={`px-4 py-1 text-sm border ${isLoading ? "bg-secondary-bg border-primary-bdr cursor-not-allowed text-white/60" : "bg-blueDD hover:bg-blueDD/80 text-black border-blueDD cursor-pointer"
            }`}
        >
          {isLoading ? "Проверка..." : "Запустить"}
        </button>
        {gameId && taskId && (
          <button
            onClick={submitTaskHandler}
            disabled={isLoading}
            className={`px-4 py-1 text-sm border ${isLoading ? "bg-secondary-bg border-primary-bdr cursor-not-allowed text-white/60" : "bg-primary hover:bg-primary/80 text-black border-primary cursor-pointer"
              }`}
          >
            {isLoading ? "Проверка..." : "Подтвердить"}
          </button>
        )}
      </div>

      <PanelGroup direction="vertical" className="flex-1 min-h-0">
        <Panel defaultSize={70} minSize={40} className="min-h-0">
          <div className="h-full overflow-hidden">
            <Editor
              height="100%"
              width="100%"
              defaultLanguage={language}
              language={language}
              theme="custom-dark"
              value={code}
              onChange={(val) => {
                setCode(val || "");
              }}
              beforeMount={handleEditorWillMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="h-1 bg-primary-bdr hover:bg-primary/20 transition-colors cursor-row-resize" />

        <Panel defaultSize={30} minSize={15} maxSize={50} className="min-h-0">
          <div className="h-full bg-secondary-bg flex flex-col border-t border-primary-bdr">
            <div className="font-bold p-2 border-b border-primary-bdr text-sm flex-shrink-0">Вывод</div>
            <div className="flex-1 overflow-auto p-2 min-h-0">
              <pre className="text-sm text-white/80 whitespace-pre-wrap break-words" style={{ 
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                maxWidth: '100%'
              }}>
                {output || "Запустите код, чтобы увидеть вывод."}
              </pre>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
