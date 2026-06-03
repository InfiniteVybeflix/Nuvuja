"use client";

import { useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  Code,
  Eye,
  Columns,
  Zap,
  Monitor,
  Smartphone,
  X,
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
  onToggleSidebar: () => void;
  onSetViewMode: (mode: "code" | "preview" | "split") => void;
  theme: string;
  viewMode: "code" | "preview" | "split";
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
  onSetViewMode,
  theme,
  viewMode,
  sidebarOpen,
  isRunning,
  hasChanges,
}: ToolbarProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const modes: { id: "code" | "preview" | "split"; icon: any; label: string }[] = [
    { id: "code", icon: Code, label: "Code" },
    { id: "split", icon: Columns, label: "Split" },
    { id: "preview", icon: Eye, label: "Preview" },
  ];

  return (
    <header className="h-11 bg-slate-950 border-b border-slate-800/50 flex items-center px-2 sm:px-3 justify-between shrink-0 z-50 select-none">
      {/* Left: Sidebar Toggle + Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            sidebarOpen ? "bg-slate-800 text-slate-300" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
          title="Toggle Sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>

        <div className="hidden sm:block">
          <LogoFull compact />
        </div>
        <div className="sm:hidden">
          <LogoFull compact />
        </div>
      </div>

      {/* Center: View Mode — Direct Select */}
      <div className="flex items-center gap-0.5 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800/50">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSetViewMode(mode.id)}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all",
                viewMode === mode.id
                  ? "bg-slate-700 text-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
              )}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onRun}
          className={cn(
            "flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all",
            isRunning
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          )}
        >
          {isRunning ? <Square size={11} /> : <Play size={11} />}
          <span className="hidden sm:inline">{isRunning ? "Stop" : "Run"}</span>
        </button>

        <button
          onClick={onSave}
          className={cn(
            "flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all",
            hasChanges
              ? "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
          )}
        >
          <Save size={11} />
          <span className="hidden sm:inline">Save</span>
          {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
        </button>

        <button
          onClick={onExport}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <Download size={11} />
          Export
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          {showMobileMenu ? <X size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1">
          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            >
              <LayoutTemplate size={11} />
              <ChevronDown size={10} className={cn("transition-transform", showTemplates && "rotate-180")} />
            </button>
            {showTemplates && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Templates</p>
                </div>
                {projectTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => { onLoadTemplate(template); setShowTemplates(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <span className="text-base">{template.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-slate-200">{template.name}</p>
                      <p className="text-[9px] text-slate-500">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon size={13} /> : <Sun size={13} />}
          </button>

          <button
            onClick={onOpenTutorial}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
            title="Tutorial"
          >
            <HelpCircle size={13} />
          </button>

          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Zap size={9} className="text-purple-400" />
            <span className="text-[9px] font-medium text-purple-400">ᓄᕙᔭ</span>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {showMobileMenu && (
        <div className="absolute top-11 right-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 sm:hidden">
          <button onClick={onExport} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg w-full">
            <Download size={12} /> Export
          </button>
          <button onClick={onToggleTheme} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg w-full">
            {theme === "light" ? <Moon size={12} /> : <Sun size={12} />} Theme
          </button>
          <button onClick={onOpenTutorial} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg w-full">
            <HelpCircle size={12} /> Help
          </button>
        </div>
      )}
    </header>
  );
}
