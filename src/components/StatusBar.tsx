"use client";

import { Cpu, GitBranch, Code, Eye, Columns, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  language: string;
  lineCount: number;
  charCount: number;
  cursorLine: number;
  cursorColumn: number;
  isConnected: boolean;
  aiStatus: string;
  viewMode: string;
  onViewModeChange: (mode: "code" | "preview" | "split") => void;
}

export function StatusBar({
  language,
  lineCount,
  charCount,
  cursorLine,
  cursorColumn,
  isConnected,
  aiStatus,
  viewMode,
  onViewModeChange,
}: StatusBarProps) {
  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800/50 flex items-center px-3 text-[11px] text-slate-500 justify-between select-none shrink-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")} />
          <span className="text-slate-400">{isConnected ? "ᓄᕙᔭ Online" : "Offline"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-600">
          <GitBranch size={10} />
          <span>main</span>
        </div>

        <span className="text-sky-400 font-medium uppercase text-[10px]">{language}</span>

        {/* View Mode Quick Switch */}
        <div className="flex items-center gap-0.5 ml-2">
          {(["code", "split", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] transition-colors",
                viewMode === mode
                  ? "bg-slate-800 text-slate-300"
                  : "text-slate-600 hover:text-slate-400"
              )}
            >
              {mode === "code" && <Code size={10} className="inline mr-0.5" />}
              {mode === "split" && <Columns size={10} className="inline mr-0.5" />}
              {mode === "preview" && <Eye size={10} className="inline mr-0.5" />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span>Ln {cursorLine}, Col {cursorColumn}</span>
        <span>{lineCount} lines</span>
        <span>{charCount} chars</span>
        <div className="flex items-center gap-1.5">
          {aiStatus === "thinking" ? (
            <>
              <Cpu size={10} className="text-purple-400 animate-pulse" />
              <span className="text-purple-400">ᓄᕙᔭ thinking...</span>
            </>
          ) : aiStatus === "ready" ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Ready</span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400">{aiStatus}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
