"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Code2,
  Wand2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Trash2,
  Paperclip,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { AIConversation } from "@/types";
import { cn } from "@/lib/utils";

interface AIPanelProps {
  conversations: AIConversation[];
  onSendMessage: (message: string, action?: "chat" | "review" | "fix" | "explain" | "generate") => void;
  onClearChat: () => void;
  isLoading: boolean;
  currentCode: string;
  currentLanguage: string;
  onApplyCode: (code: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function CodeBlock({ code, language, onApply }: { code: string; language: string; onApply?: (code: string) => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950/80">
      <div className="flex items-center justify-between px-2 py-1 bg-slate-900/80 border-b border-slate-800/50">
        <span className="text-[10px] text-slate-500 font-mono">{language}</span>
        <div className="flex gap-1">
          {onApply && (
            <button onClick={() => onApply(code)} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors">
              <Wand2 size={8} /> Apply
            </button>
          )}
          <button onClick={handleCopy} className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>
        </div>
      </div>
      <pre className="p-2 text-[11px] overflow-x-auto text-slate-300 font-mono leading-relaxed max-h-64 overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageContent({ content, language, onApplyCode }: { content: string; language: string; onApplyCode?: (code: string) => void }) {
  const parts = content.split(/(```[\w]*\n?[\s\S]*?```)/g);
  return (
    <div className="space-y-0.5">
      {parts.map((part, i) => {
        const codeMatch = part.match(/```(\w*)\n?([\s\S]*?)```/);
        if (codeMatch) {
          const lang = codeMatch[1] || language;
          const code = codeMatch[2].trim();
          return <CodeBlock key={i} code={code} language={lang} onApply={onApplyCode} />;
        }
        const lines = part.split("\n");
        return lines.map((line, j) => {
          const inlineMatch = line.match(/`([^`]+)`/g);
          if (inlineMatch) {
            let processed = line;
            inlineMatch.forEach((match) => {
              const code = match.slice(1, -1);
              processed = processed.replace(match, `<code class="px-1 py-0.5 rounded bg-slate-800 text-sky-400 text-[11px] font-mono">${code}</code>`);
            });
            return <p key={`${i}-${j}`} className="text-[13px] text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />;
          }
          if (line.trim()) return <p key={`${i}-${j}`} className="text-[13px] text-slate-300 leading-relaxed">{line}</p>;
          return null;
        });
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  if (!review || !review.issues) return null;
  return (
    <div className="my-2 rounded-lg border border-slate-700/50 bg-slate-950/80 overflow-hidden">
      <div className="px-2 py-1.5 bg-slate-900/80 border-b border-slate-800/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400">Code Review</span>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", review.score >= 80 ? "bg-emerald-500/20 text-emerald-400" : review.score >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400")}>
          {review.score}/100
        </span>
      </div>
      <div className="p-2 space-y-1.5">
        <p className="text-[11px] text-slate-400">{review.summary}</p>
        {review.issues?.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Issues</p>
            {review.issues.map((issue: any, i: number) => (
              <div key={i} className={cn("flex items-start gap-1.5 p-1.5 rounded text-[11px]", issue.severity === "error" ? "bg-red-500/10 border border-red-500/20" : issue.severity === "warning" ? "bg-amber-500/10 border border-amber-500/20" : "bg-sky-500/10 border border-sky-500/20")}>
                {issue.severity === "error" ? <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" /> : issue.severity === "warning" ? <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> : <CheckCircle size={10} className="text-sky-400 shrink-0 mt-0.5" />}
                <div>
                  <span className="text-slate-400">Line {issue.line}:</span> <span className="text-slate-300">{issue.message}</span>
                  {issue.suggestion && <p className="text-slate-500 mt-0.5 italic">{issue.suggestion}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {review.improvements?.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Improvements</p>
            {review.improvements.map((imp: string, i: number) => (
              <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1">
                <Sparkles size={8} className="text-purple-400 shrink-0 mt-0.5" /> {imp}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AIPanel({
  conversations,
  onSendMessage,
  onClearChat,
  isLoading,
  currentCode,
  currentLanguage,
  onApplyCode,
  isOpen,
  onToggle,
}: AIPanelProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachCode, setAttachCode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const lastTouchDist = useRef<number | null>(null);

  const [panelWidth, setPanelWidth] = useState(384);
  const [panelHeight, setPanelHeight] = useState(0);
  const [panelTop, setPanelTop] = useState(44);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(384);
  const startHeightRef = useRef(0);
  const startTopRef = useRef(44);

  useEffect(() => {
    const update = () => {
      const h = window.innerHeight - 44;
      setPanelHeight(h);
      setPanelTop(44);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, isLoading]);

  const startResize = useCallback((dir: string) => (e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeDir(dir);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = panelWidth;
    startHeightRef.current = panelHeight;
    startTopRef.current = panelTop;
    e.preventDefault();
    e.stopPropagation();
  }, [panelWidth, panelHeight, panelTop]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizing || !resizeDir) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      let newW = startWidthRef.current;
      let newH = startHeightRef.current;
      let newT = startTopRef.current;

      if (resizeDir.includes("w")) newW = Math.max(280, Math.min(800, startWidthRef.current - dx));
      if (resizeDir.includes("e")) newW = Math.max(280, Math.min(800, startWidthRef.current + dx));
      if (resizeDir.includes("n")) {
        newT = Math.max(0, Math.min(window.innerHeight - 200, startTopRef.current + dy));
        newH = Math.max(200, startHeightRef.current - dy);
      }
      if (resizeDir.includes("s")) newH = Math.max(200, Math.min(window.innerHeight - panelTop, startHeightRef.current + dy));

      setPanelWidth(newW);
      setPanelHeight(newH);
      setPanelTop(newT);
    };
    const handleUp = () => {
      setIsResizing(false);
      setResizeDir(null);
    };
    if (isResizing) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isResizing, resizeDir, panelTop]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.max(0.6, Math.min(1.8, z + delta)));
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastTouchDist.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const delta = (dist - lastTouchDist.current) / 300;
      setZoom((z) => Math.max(0.6, Math.min(1.8, z + delta)));
      lastTouchDist.current = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDist.current = null;
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    let action: "chat" | "review" | "fix" | "explain" | "generate" = "chat";
    let message = input.trim();
    if (message.startsWith("/review")) action = "review";
    else if (message.startsWith("/fix")) action = "fix";
    else if (message.startsWith("/explain")) action = "explain";
    else if (message.startsWith("/generate")) action = "generate";

    if (attachCode && currentCode) {
      message += "\n\nCurrent file (" + currentLanguage + "):\n```" + currentLanguage + "\n" + currentCode + "\n```";
    }
    onSendMessage(message, action);
    setInput("");
    setShowSuggestions(false);
    setAttachCode(false);
  };

  const suggestions = [
    { text: "/review — Review my code", icon: AlertTriangle, color: "text-amber-400" },
    { text: "/fix — Fix errors automatically", icon: Wand2, color: "text-emerald-400" },
    { text: "/explain — Explain this code", icon: Sparkles, color: "text-sky-400" },
    { text: "/generate — Generate new code", icon: Code2, color: "text-purple-400" },
  ];

  return (
    <>
      {/* Floating Toggle — ONLY when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="fixed z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl transition-all bg-gradient-to-r from-sky-500 via-purple-500 to-purple-600 text-white shadow-purple-500/30 right-4 bottom-10"
          >
            <span>ᓄᕙᔭ</span>
            {conversations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-0.5" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: panelWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: panelWidth, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ top: panelTop, right: 0, width: panelWidth, height: panelHeight }}
            className={cn(
              "fixed z-50 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/50 flex flex-col shadow-2xl shadow-black/50",
              isResizing && "select-none"
            )}
          >
            {/* BOUNDARY INDICATOR OVERLAY — shows when hovering/resizing */}
            <div className={cn(
              "absolute inset-0 pointer-events-none z-[100] border-2 border-dashed transition-opacity duration-200",
              isResizing ? "border-purple-500/60 opacity-100" : "border-purple-500/0 opacity-0 hover:opacity-100"
            )}>
              {/* Corner dots */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-purple-500 rounded-full -translate-x-1/2 translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-full translate-x-1/2 translate-y-1/2" />
              {/* Edge midpoints */}
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-sky-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-sky-400 rounded-full -translate-x-1/2 translate-y-1/2" />
              <div className="absolute left-0 top-1/2 w-3 h-3 bg-sky-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute right-0 top-1/2 w-3 h-3 bg-sky-400 rounded-full translate-x-1/2 -translate-y-1/2" />
              {/* Dimensions label */}
              <div className="absolute top-2 left-2 bg-purple-500/90 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {Math.round(panelWidth)}×{Math.round(panelHeight)}
              </div>
            </div>

            {/* RESIZE HANDLES — 8 directions with visible hit areas */}
            {/* Top */}
            <div onMouseDown={startResize("n")} className="absolute top-0 left-6 right-6 h-3 cursor-ns-resize z-40 group">
              <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 rounded-full transition-all", isResizing && resizeDir === "n" ? "bg-purple-500 w-20" : "bg-slate-600/0 group-hover:bg-slate-500/50")} />
            </div>
            {/* Bottom */}
            <div onMouseDown={startResize("s")} className="absolute bottom-0 left-6 right-6 h-3 cursor-ns-resize z-40 group">
              <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 rounded-full transition-all", isResizing && resizeDir === "s" ? "bg-purple-500 w-20" : "bg-slate-600/0 group-hover:bg-slate-500/50")} />
            </div>
            {/* Left */}
            <div onMouseDown={startResize("w")} className="absolute top-6 bottom-6 left-0 w-3 cursor-ew-resize z-40 group">
              <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full transition-all", isResizing && resizeDir === "w" ? "bg-purple-500 h-20" : "bg-slate-600/0 group-hover:bg-slate-500/50")} />
            </div>
            {/* Right */}
            <div onMouseDown={startResize("e")} className="absolute top-6 bottom-6 right-0 w-3 cursor-ew-resize z-40 group">
              <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full transition-all", isResizing && resizeDir === "e" ? "bg-purple-500 h-20" : "bg-slate-600/0 group-hover:bg-slate-500/50")} />
            </div>
            {/* Top-Left */}
            <div onMouseDown={startResize("nw")} className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 group">
              <div className={cn("absolute bottom-1 right-1 w-3 h-3 rounded-full transition-all", isResizing && resizeDir === "nw" ? "bg-purple-500 scale-125" : "bg-slate-600/0 group-hover:bg-slate-500/70")} />
            </div>
            {/* Top-Right */}
            <div onMouseDown={startResize("ne")} className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize z-50 group">
              <div className={cn("absolute bottom-1 left-1 w-3 h-3 rounded-full transition-all", isResizing && resizeDir === "ne" ? "bg-purple-500 scale-125" : "bg-slate-600/0 group-hover:bg-slate-500/70")} />
            </div>
            {/* Bottom-Left */}
            <div onMouseDown={startResize("sw")} className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-50 group">
              <div className={cn("absolute top-1 right-1 w-3 h-3 rounded-full transition-all", isResizing && resizeDir === "sw" ? "bg-purple-500 scale-125" : "bg-slate-600/0 group-hover:bg-slate-500/70")} />
            </div>
            {/* Bottom-Right */}
            <div onMouseDown={startResize("se")} className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 group">
              <div className={cn("absolute top-1 left-1 w-3 h-3 rounded-full transition-all", isResizing && resizeDir === "se" ? "bg-purple-500 scale-125" : "bg-slate-600/0 group-hover:bg-slate-500/70")} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center border border-purple-500/20">
                  <Bot size={15} className="text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-200">ᓄᕙᔭ AI</span>
                  <span className="text-[10px] text-slate-600 ml-1.5">Nuvuja</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5 mr-2 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800/50">
                  <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom out">
                    <ZoomOut size={11} />
                  </button>
                  <span className="text-[9px] text-slate-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom in">
                    <ZoomIn size={11} />
                  </button>
                </div>
                <button onClick={onClearChat} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors" title="Clear chat">
                  <Trash2 size={13} />
                </button>
                <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors" title="Close panel">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 overflow-y-auto overflow-x-auto p-4 space-y-4 min-h-0 touch-pan-y"
            >
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, minHeight: "100%" }}>
                {conversations.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 flex items-center justify-center border border-purple-500/10">
                      <Sparkles size={24} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">ᓄᕙᔭ is ready</p>
                    <p className="text-xs text-slate-600 mt-1">Ask anything or use commands</p>
                  </div>
                )}

                {showSuggestions && conversations.length === 0 && (
                  <div className="space-y-1.5 mt-4">
                    {suggestions.map((s) => (
                      <button
                        key={s.text}
                        onClick={() => { setInput(s.text.split(" — ")[0]); setShowSuggestions(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-left hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-700/50"
                      >
                        <s.icon size={14} className={cn(s.color, "shrink-0")} />
                        <span className="text-slate-400 group-hover:text-slate-300">{s.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {conversations.map((conv, i) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn("flex gap-2.5", conv.role === "user" ? "flex-row-reverse" : "flex-row")}
                  >
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", conv.role === "user" ? "bg-sky-500/20" : "bg-purple-500/20")}>
                      {conv.role === "user" ? <User size={12} className="text-sky-400" /> : <Bot size={12} className="text-purple-400" />}
                    </div>
                    <div className={cn("flex-1 max-w-[85%]", conv.role === "user" && "text-right")}>
                      {conv.role === "assistant" && conv.metadata?.action === "review" && conv.content.includes("###REVIEW_START###") ? (
                        <ReviewCard review={(() => {
                          try {
                            const match = conv.content.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
                            return match ? JSON.parse(match[1].trim()) : null;
                          } catch { return null; }
                        })()} />
                      ) : (
                        <div className={cn("inline-block px-3 py-2 rounded-xl text-left", conv.role === "user" ? "bg-sky-500/10 border border-sky-500/20" : "bg-slate-900/80 border border-slate-700/30")}>
                          <MessageContent content={conv.content} language={currentLanguage} onApplyCode={conv.role === "assistant" ? onApplyCode : undefined} />
                        </div>
                      )}
                      <p className="text-[9px] text-slate-600 mt-1">
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {conv.metadata?.model && <span className="ml-1">{conv.metadata.model}</span>}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-slate-500">
                    <Loader2 size={13} className="animate-spin text-purple-400" />
                    <span className="text-xs">ᓄᕙᔭ is thinking...</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800/50 bg-slate-950/50 shrink-0">
              {currentCode && (
                <button
                  onClick={() => setAttachCode(!attachCode)}
                  className={cn("flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md text-[10px] transition-colors", attachCode ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-slate-600 hover:text-slate-400 hover:bg-slate-800/50")}
                >
                  <Paperclip size={10} />
                  {attachCode ? "Code attached" : "Attach current file"}
                </button>
              )}

              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask ᓄᕙᔭ anything..."
                  className="flex-1 bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn("px-4 py-2 rounded-lg transition-all flex items-center justify-center", input.trim() && !isLoading ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25" : "bg-slate-800 text-slate-600 cursor-not-allowed")}
                >
                  <Send size={14} />
                </motion.button>
                <button
                  onClick={onToggle}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all"
                  title="Close chat"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-[9px] text-slate-700 mt-1.5 text-center">
                /review  /fix  /explain  /generate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
