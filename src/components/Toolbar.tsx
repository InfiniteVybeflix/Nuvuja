"use client";

import { useState } from "react";
import {
  Play,
  Square,
  Save,
  FolderOpen,
  Download,
  Settings,
  Moon,
  Sun,
  HelpCircle,
  Zap,
  FileCode,
  LayoutTemplate,
  ChevronDown,
} from "lucide-react";
import { LogoFull } from "./Logo";
import { cn } from "@/lib/utils";
import { ProjectTemplate } from "@/types";
import { projectTemplates } from "@/lib/templates";

interface ToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onExport: () => void;
  onToggleTheme: () => void;
  onOpenTutorial: () => void;
  onLoadTemplate: (template: ProjectTemplate) => void;
  theme: string;
  isRunning: boolean;
  hasChanges: boolean;
}

export function Toolbar({
  onRun,
  onSave,
  onExport,
  onToggleTheme,
  onOpenTutorial,
  onLoadTemplate,
  theme,
  isRunning,
  hasChanges,
}: ToolbarProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center px-4 justify-between z-50">
      <div className="flex items-center gap-6">
        <LogoFull />

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-1">
          <button
            onClick={onRun}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isRunning
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            )}
          >
            {isRunning ? <Square size={14} /> : <Play size={14} />}
            {isRunning ? "Stop" : "Preview"}
          </button>

          <button
            onClick={onSave}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              hasChanges
                ? "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Save size={14} />
            Save
            {hasChanges && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <LayoutTemplate size={14} />
            Templates
            <ChevronDown size={12} className={cn("transition-transform", showTemplates && "rotate-180")} />
          </button>

          {showTemplates && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
              <div className="p-3 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Start New</p>
              </div>
              {projectTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onLoadTemplate(template);
                    setShowTemplates(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <span className="text-xl">{template.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          title="Toggle Theme"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button
          onClick={onOpenTutorial}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          title="Tutorial"
        >
          <HelpCircle size={16} />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Zap size={12} className="text-purple-400" />
          <span className="text-xs font-medium text-purple-400">Nuvuja AI</span>
        </div>
      </div>
    </header>
  );
}
