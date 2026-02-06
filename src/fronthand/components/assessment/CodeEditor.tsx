"use client";

import Editor from "@monaco-editor/react";
import { Loader2, Play } from "lucide-react";
import { useState } from "react";

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    onRun?: (code: string) => Promise<string>;
}

export default function CodeEditor({
    initialCode = "// Your solution here\n",
    language = "javascript",
    onChange,
    onRun,
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        if (!onRun) return;
        setIsRunning(true);
        try {
            const result = await onRun(code);
            setOutput(result);
        } catch (error) {
            setOutput("Error executing code.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <div className="text-sm font-medium text-muted-foreground">{language.toUpperCase()}</div>
                <button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                >
                    {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    RUN CODE
                </button>
            </div>

            <div className="flex-1 min-h-[400px]">
                <Editor
                    height="100%"
                    language={language}
                    defaultValue={initialCode}
                    theme="vs-dark"
                    onChange={(value) => {
                        setCode(value || "");
                        onChange?.(value);
                    }}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>

            <div className="h-48 border-t border-border bg-black/90 p-4 font-mono text-sm overflow-auto">
                <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wider">Console Output</div>
                <pre className="text-green-400 whitespace-pre-wrap">{output || "No output yet..."}</pre>
            </div>
        </div>
    );
}
