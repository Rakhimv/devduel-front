// src/components/CodeIDE.tsx
import { useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
const languages = ["javascript", "typescript", "python", "csharp", "cpp"];
loader.config({ monaco });
export default function CodeIDE() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Пиши код тут...");
  loader.config({ monaco });
  return (
    <div className="w-full mt-[50px] h-[20vh] flex flex-col bg-black text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-2 ">
        <span className="font-bold">My IDE</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-black text-white rounded px-2 py-1"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <Editor
          height="20vh"
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
    </div>
  );
}
