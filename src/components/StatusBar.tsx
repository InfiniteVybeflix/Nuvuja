"use client";

import { Cpu, GitBranch, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  language: string;
  lineCount: number;
  charCount: number;
  cursorLine: number;
  cursorColumn: number;
  isConnected: boolean;
  aiStatus: string;
}

export function StatusBar({
  language,
  lineCount,
  charCount,
  cursorLine,
  cursorColumn,
  isConnected,
  aiStatus,
}: StatusBarProps) {
  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800/50 flex items-center px-3 text-xs text-slate-500 justify-between select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")} />
          <span>{isConnected ? "Nuvuja AI Online" : "AI Offline"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-600">
          <GitBranch size={12} />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-sky-400 font-medium uppercase">{language}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span>Ln {cursorLine}, Col {cursorColumn}</span>
        <span>{lineCount} lines</span>
        <span>{charCount} chars</span>
        <div className="flex items-center gap-1.5">
          {aiStatus === "thinking" ? (
            <>
              <Cpu size={12} className="text-purple-400 animate-pulse" />
              <span className="text-purple-400">Nuvuja is thinking...</span>
            </>
          ) : aiStatus === "ready" ? (
            <>
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Ready</span>
            </>
          ) : (
            <>
              <AlertCircle size={12} className="text-amber-400" />
              <span className="text-amber-400">{aiStatus}</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
