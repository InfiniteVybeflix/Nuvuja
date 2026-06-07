"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  X,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  Code,
} from "lucide-react";
import { ConsoleEntry } from "@/types";
import { cn } from "@/lib/utils";

interface ConsolePanelProps {
  entries: ConsoleEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export function ConsolePanel({ entries, isOpen, onToggle, onClear }: ConsolePanelProps) {
  const [filter, setFilter] = useState<"all" | "log" | "error" | "warn" | "info" | "debug">("all");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  const groupedEntries = useMemo(() => {
    const groups: Array<{ entry: ConsoleEntry; count: number }> = [];
    for (const entry of entries) {
      const last = groups[groups.length - 1];
      if (last && last.entry.type === entry.type && last.entry.message === entry.message) {
        last.count++;
      } else {
        groups.push({ entry, count: 1 });
      }
    }
    return groups;
  }, [entries]);

  const filtered = groupedEntries.filter(({ entry }) => {
    if (filter !== "all" && entry.type !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        entry.message.toLowerCase().includes(term) ||
        entry.args.some((a) => String(a).toLowerCase().includes(term))
      );
    }
    return true;
  });

  useEffect(() => {
    if (bottomRef.current && isOpen) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries, isOpen]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatArg = (arg: any): string => {
    if (arg === null) return "null";
    if (arg === undefined) return "undefined";
    if (typeof arg === "object") {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    log: { icon: Code, color: "text-slate-400", bg: "bg-slate-800/30", border: "border-slate-700/30" },
    error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    warn: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    info: { icon: Info, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    debug: { icon: Bug, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    table: { icon: Code, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    assert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    trace: { icon: Code, color: "text-slate-400", bg: "bg-slate-800/30", border: "border-slate-700/30" },
    clear: { icon: Trash2, color: "text-slate-500", bg: "bg-slate-800/30", border: "border-slate-700/30" },
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "fixed z-[55] flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all",
          isOpen
            ? "bg-slate-800 text-slate-300 border border-slate-700"
            : "bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200"
        )}
        style={{ 
            left: "50%", 
            bottom: isOpen ? "calc(280px + env(safe-area-inset-bottom))" : "calc(12px + env(safe-area-inset-bottom))", 
            transform: "translateX(-50%)" 
         }}
       >
        <Terminal size={14} />
        <span className="text-xs font-medium">Console</span>
        {entries.length > 0 && (
          <span
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              entries.some((e) => e.type === "error")
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-700 text-slate-400"
            )}
          >
            {entries.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[54] h-[280px] bg-slate-950/98 border-t border-slate-800/50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 shrink-0 bg-slate-900/50">
              <div className="flex items-center gap-1">
                {(["all", "log", "error", "warn", "info", "debug"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-all",
                      filter === f
                        ? "bg-slate-700 text-slate-200"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter..."
                    className="bg-slate-900 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-sky-500/50 w-32"
                  />
                </div>
                <button
                  onClick={onClear}
                  className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                  title="Clear console"
                >
                  <Trash2 size={12} />
                </button>
                <button
                  onClick={onToggle}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-600 text-xs">
                  {entries.length === 0 ? "No console output yet" : "No matching entries"}
                </div>
              ) : (
                filtered.map(({ entry, count }) => {
                  const config = typeConfig[entry.type] || typeConfig.log;
                  const Icon = config.icon;
                  const isExpanded = expandedIds.has(entry.id);

                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex items-start gap-2 px-2 py-1.5 rounded-md border transition-all group",
                        config.bg,
                        config.border,
                        entry.type === "error" && "border-l-2 border-l-red-500"
                      )}
                    >
                      <Icon size={12} className={cn("shrink-0 mt-0.5", config.color)} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-[10px] shrink-0">{formatTime(entry.timestamp)}</span>
                          <span className={cn("truncate", config.color)}>{entry.message}</span>
                          {count > 1 && (
                            <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">×{count}</span>
                          )}
                          {entry.args.length > 0 && (
                            <button
                              onClick={() => toggleExpand(entry.id)}
                              className="ml-auto p-0.5 rounded hover:bg-slate-800 text-slate-600 transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && entry.args.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-1.5 overflow-hidden"
                            >
                              <div className="bg-slate-950 rounded-md p-2 border border-slate-800/50 space-y-1">
                                {entry.args.map((arg, j) => (
                                  <pre
                                    key={j}
                                    className="text-[10px] text-slate-400 whitespace-pre-wrap break-all"
                                  >
                                    {formatArg(arg)}
                                  </pre>
                                ))}
                                {entry.stack && (
                                  <pre className="text-[10px] text-red-400/70 whitespace-pre-wrap mt-1 border-t border-slate-800 pt-1">
                                    {entry.stack}
                                  </pre>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
