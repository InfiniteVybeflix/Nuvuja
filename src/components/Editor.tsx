"use client";

import { useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { EditorTab } from "@/types";
import { cn } from "@/lib/utils";
import { X, Circle } from "lucide-react";

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
  theme: string;
  markers?: any[];
}

export function EditorPanel({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onContentChange,
  theme,
  markers,
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom theme
    monaco.editor.defineTheme("nuvuja-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "e2e8f0" },
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "identifier", foreground: "38bdf8" },
        { token: "string", foreground: "4ade80" },
        { token: "number", foreground: "fbbf24" },
        { token: "operator", foreground: "f472b6" },
        { token: "type", foreground: "a78bfa" },
        { token: "function", foreground: "38bdf8" },
        { token: "tag", foreground: "f87171" },
        { token: "attribute.name", foreground: "fbbf24" },
        { token: "attribute.value", foreground: "4ade80" },
      ],
      colors: {
        "editor.background": "#0f172a",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#1e293b40",
        "editor.selectionBackground": "#38bdf830",
        "editor.inactiveSelectionBackground": "#38bdf820",
        "editorCursor.foreground": "#38bdf8",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editorIndentGuide.background": "#1e293b",
        "editorIndentGuide.activeBackground": "#334155",
        "editorBracketMatch.background": "#a78bfa30",
        "editorBracketMatch.border": "#a78bfa",
        "editorOverviewRuler.border": "#1e293b",
        "editorGutter.background": "#0f172a",
        "editorWidget.background": "#1e293b",
        "editorWidget.border": "#334155",
        "editorSuggestWidget.background": "#1e293b",
        "editorSuggestWidget.border": "#334155",
        "editorSuggestWidget.selectedBackground": "#38bdf820",
        "peekView.border": "#a78bfa",
        "peekViewEditor.background": "#0f172a",
        "peekViewResult.background": "#1e293b",
      },
    });

    monaco.editor.setTheme("nuvuja-dark");

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save handled by parent
    });
  }, []);

  useEffect(() => {
    if (editorRef.current && markers && markers.length > 0) {
      const model = editorRef.current.getModel();
      if (model) {
        const monacoMarkers = markers.map((m) => ({
          startLineNumber: m.startLineNumber,
          startColumn: m.startColumn,
          endLineNumber: m.endLineNumber,
          endColumn: m.endColumn,
          message: m.message,
          severity:
            m.severity === "error"
              ? monacoRef.current.MarkerSeverity.Error
              : m.severity === "warning"
              ? monacoRef.current.MarkerSeverity.Warning
              : monacoRef.current.MarkerSeverity.Info,
        }));
        monacoRef.current.editor.setModelMarkers(model, "nuvuja", monacoMarkers);
      }
    }
  }, [markers]);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-3xl">☁️</span>
          </div>
          <p className="text-slate-500 text-sm">Open a file to start coding</p>
          <p className="text-slate-600 text-xs mt-1">Create files from the explorer or load a template</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
      {/* Tabs */}
      <div className="flex items-center bg-slate-950 border-b border-slate-800/50 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm border-r border-slate-800/50 min-w-[120px] max-w-[200px] group transition-all",
              activeTabId === tab.id
                ? "bg-slate-900 text-slate-200 border-t-2 border-t-sky-400"
                : "bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            )}
          >
            {tab.isDirty && <Circle size={6} className="fill-amber-400 text-amber-400 shrink-0" />}
            <span className="truncate flex-1 text-left">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 transition-all"
            >
              <X size={12} />
            </button>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 relative min-h-0">
        {activeTab && (
          <Editor
            key={activeTab.id}
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            theme={theme === "light" ? "vs" : "nuvuja-dark"}
            onChange={(value) => onContentChange(activeTab.id, value || "")}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              fontFamily: "JetBrains Mono, Fira Code, monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 1, renderCharacters: false },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              renderWhitespace: "selection",
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              lineNumbers: "on",
              glyphMargin: true,
              folding: true,
              renderLineHighlight: "all",
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
              quickSuggestions: true,
              wordWrap: "on",
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="animate-pulse">Loading editor...</div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
