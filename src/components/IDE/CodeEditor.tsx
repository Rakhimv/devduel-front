import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useState, useEffect } from "react";
import { useCode } from "../../context/CodeContext";
import { submitTaskSolution, getTaskTemplate } from "../../api/api";

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

  useEffect(() => {
    if (taskId && language) {
      loadTaskTemplate();
      setOutput("");
    }
  }, [taskId, language]);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    
    if (taskId && newLanguage) {
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
  };

  const loadTaskTemplate = async () => {
    if (!taskId || !language) return;
    
    try {
      const templateData = await getTaskTemplate(taskId, language);
      setCode(templateData.template);
    } catch (error) {
      console.error("Failed to load task template:", error);
      const lang = languages.find(l => l.name === language);
      if (lang) {
        setCode(lang.defaultCode);
      }
    }
  };

  const runCodeHandler = async () => {
    if (!gameId || !taskId) {
      setOutput("Error: Game or task context not available");
      return;
    }

    setIsLoading(true);
    setOutput("Running test...");
    try {
      const result = await submitTaskSolution({
        gameId,
        taskId,
        source_code: code,
        language,
        isRunTest: true,
      });

      if (result.success) {
        setOutput("✅ Test passed!");
      } else {
        const failedTests = result.testResults.filter(test => !test.passed);
        setOutput(`❌ Test failed.\n\nInput: ${failedTests[0]?.input}\nExpected: ${failedTests[0]?.expected}\nGot: ${failedTests[0]?.actual}`);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitTaskHandler = async () => {
    if (!gameId || !taskId) {
      setOutput("Error: Game or task context not available");
      return;
    }

    setIsLoading(true);
    setOutput("Submitting solution...");
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
          setOutput("✅ Task solved successfully! 🏆 Game finished! You won!");
        } else {
          setOutput("✅ Task solved successfully! Level up!");
        }
      } else {
        const failedTests = result.testResults.filter(test => !test.passed);
        setOutput(`❌ Task not solved. Failed ${failedTests.length} test(s).\n\nFailed tests:\n${failedTests.map(test => `Input: ${test.input}\nExpected: ${test.expected}\nGot: ${test.actual}\n`).join('\n')}`);
      }
      
      onTaskSubmitted?.(result.success, result.testResults, result.gameFinished);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-white">
      <div className="flex items-center gap-4 p-2 border-b border-gray-600">
        <span className="font-bold">Code Editor</span>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-gray-800 text-white rounded px-2 py-1 border border-gray-600"
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
          className={`px-4 py-1 rounded ${isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white`}
        >
          {isLoading ? "Running..." : "Run"}
        </button>
        {gameId && taskId && (
          <button
            onClick={submitTaskHandler}
            disabled={isLoading}
            className={`px-4 py-1 rounded ml-2 ${isLoading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
          >
            {isLoading ? "Submitting..." : "Submit Task"}
          </button>
        )}
      </div>

      <div className=" flex flex-col justify-between h-full overflow-hidden">
        <div className="h-[40vh] overflow-hidden">
          <Editor
            height="100%"
            width="100%"
            defaultLanguage={language}
            language={language}
            theme="hc-black"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="max-h-[200px] border-t border-gray-600 bg-gray-900 flex flex-col">
          <h3 className="font-bold p-2 flex-shrink-0">Output</h3>
          <pre className="bg-gray-800 max-h-[80%] m-2 overflow-auto rounded text-sm whitespace-pre-wrap break-words">
            {output || "Run the code to see the output."}
          </pre>
        </div>
      </div>
    </div>
  );
}