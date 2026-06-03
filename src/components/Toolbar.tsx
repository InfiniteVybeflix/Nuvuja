"use client";

import {
  Play,
  Square,
  Save,
  Download,
  Moon,
  Sun,
  HelpCircle,
  LayoutTemplate,
  ChevronDown,
  PanelLeft,
  Code,
  Eye,
  Columns,
  Zap,
  Monitor,
  Smartphone,
} from "lucide-react";
import { LogoFull } from "./Logo";
import { cn } from "@/lib/utils";
import { ProjectTemplate } from "@/types";
import { projectTemplates } from "@/lib/templates";
import { useState } from "react";

interface ToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onExport: () => void;
  onToggleTheme: () => void;
  onOpenTutorial: () => void;
  onLoadTemplate: (template: ProjectTemplate) => void;
  onToggleSidebar: () => void;
  onToggleViewMode: () => void;
  theme: string;
  viewMode: string;
  sidebarOpen: boolean;
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
  onToggleSidebar,
  onToggleViewMode,
  theme,
  viewMode,
  sidebarOpen,
  isRunning,
  hasChanges,
}: ToolbarProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const viewIcons = {
    code: <Code size={14} />,
    preview: <Eye size={14} />,
    split: <Columns size={14} />,
  };

  const viewLabels = {
    code: "Code",
    preview: "Preview",
    split: "Split",
  };

  return (
    <header className="h-12 bg-slate-950 border-b border-slate-800/50 flex items-center px-3 justify-between shrink-0 z-50">
      {/* Left: Logo + Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            sidebarOpen ? "bg-slate-800 text-slate-300" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
          title="Toggle Sidebar (Ctrl+B)"
        >
          <PanelLeft size={16} />
        </button>
        <div className="h-5 w-px bg-slate-800" />
        <LogoFull />
      </div>

      {/* Center: View Mode Toggle */}
      <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800/50">
        {(["code", "split", "preview"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              if (viewMode !== mode) {
                // Cycle to this mode
                const currentIndex = ["code", "split", "preview"].indexOf(viewMode as any);
                const targetIndex = ["code", "split", "preview"].indexOf(mode);
                const diff = targetIndex - currentIndex;
                for (let i = 0; i < Math.abs(diff); i++) {
                  onToggleViewMode();
                }
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === mode
                ? "bg-slate-800 text-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
            )}
          >
            {viewIcons[mode]}
            {viewLabels[mode]}
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRun}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            isRunning
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          )}
        >
          {isRunning ? <Square size={12} /> : <Play size={12} />}
          {isRunning ? "Stop" : "Run"}
        </button>

        <button
          onClick={onSave}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            hasChanges
              ? "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
        >
          <Save size={12} />
          Save
          {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <Download size={12} />
          Export
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Templates */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >
            <LayoutTemplate size={12} />
            Templates
            <ChevronDown size={10} className={cn("transition-transform", showTemplates && "rotate-180")} />
          </button>
          {showTemplates && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
              <div className="p-2 border-b border-slate-800">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Start New Project</p>
              </div>
              {projectTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onLoadTemplate(template);
                    setShowTemplates(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <span className="text-lg">{template.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-slate-200">{template.name}</p>
                    <p className="text-[10px] text-slate-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          title="Toggle Theme"
        >
          {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          onClick={onOpenTutorial}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          title="Tutorial"
        >
          <HelpCircle size={14} />
        </button>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          <Zap size={10} className="text-purple-400" />
          <span className="text-[10px] font-medium text-purple-400">ᓄᕙᔭ</span>
        </div>
      </div>
    </header>
  );
}
