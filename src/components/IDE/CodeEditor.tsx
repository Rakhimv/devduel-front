import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useState } from "react";
import { useCode } from "../../context/CodeContext";
import { runCode } from "../../api/api";

const languages = [
  { name: "javascript", id: 63, defaultCode: "// JavaScript code\nconsole.log('Hello, World!');" },
  { name: "typescript", id: 74, defaultCode: "// TypeScript code\nconsole.log('Hello, World!');" },
  { name: "python", id: 71, defaultCode: "# Python code\nprint('Hello, World!')" },
  { name: "java", id: 62, defaultCode: '// Java code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { name: "cpp", id: 54, defaultCode: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
  { name: "csharp", id: 51, defaultCode: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { name: "go", id: 60, defaultCode: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { name: "rust", id: 73, defaultCode: 'fn main() {\n    println!("Hello, World!");\n}' },
  { name: "php", id: 68, defaultCode: '<?php\necho "Hello, World!";\n?>' },
  { name: "ruby", id: 72, defaultCode: '# Ruby code\nputs "Hello, World!"' },
];

loader.config({ monaco });


export default function CodeIDE() {
  const { code, language, setCode, setLanguage } = useCode();
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runCodeHandler = async () => {
    setIsLoading(true);
    setOutput("");
    try {
      const result = await runCode({
        source_code: code,
        language,
      });

      setOutput(result.output);
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
          onChange={(e) => setLanguage(e.target.value)}
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
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <Editor
            height="100%"
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
        <div className="h-1/3 border-t border-gray-600 p-2 bg-gray-900">
          <h3 className="font-bold mb-2">Output</h3>
          <pre className="bg-gray-800 p-2 rounded text-sm overflow-auto h-full">
            {output || "Run the code to see the output."}
          </pre>
        </div>
      </div>
    </div>
  );
}