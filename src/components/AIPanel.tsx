"use client";

import { useState, useRef, useEffect } from "react";
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
  X,
  MessageSquare,
  Paperclip,
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
            <button
              onClick={() => onApply(code)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Wand2 size={8} />
              Apply
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
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
              processed = processed.replace(
                match,
                `<code class="px-1 py-0.5 rounded bg-slate-800 text-sky-400 text-[11px] font-mono">${code}</code>`
              );
            });
            return <p key={`${i}-${j}`} className="text-[13px] text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />;
          }
          if (line.trim()) {
            return <p key={`${i}-${j}`} className="text-[13px] text-slate-300 leading-relaxed">{line}</p>;
          }
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
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          review.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
          review.score >= 50 ? "bg-amber-500/20 text-amber-400" :
          "bg-red-500/20 text-red-400"
        )}>
          {review.score}/100
        </span>
      </div>
      <div className="p-2 space-y-1.5">
        <p className="text-[11px] text-slate-400">{review.summary}</p>
        {review.issues?.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Issues</p>
            {review.issues.map((issue: any, i: number) => (
              <div key={i} className={cn(
                "flex items-start gap-1.5 p-1.5 rounded text-[11px]",
                issue.severity === "error" ? "bg-red-500/10 border border-red-500/20" :
                issue.severity === "warning" ? "bg-amber-500/10 border border-amber-500/20" :
                "bg-sky-500/10 border border-sky-500/20"
              )}>
                {issue.severity === "error" ? <AlertTriangle size={10} className="text-red-400 shrink-0 mt-0.5" /> :
                 issue.severity === "warning" ? <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> :
                 <CheckCircle size={10} className="text-sky-400 shrink-0 mt-0.5" />}
                <div>
                  <span className="text-slate-400">Line {issue.line}:</span>{" "}
                  <span className="text-slate-300">{issue.message}</span>
                  {issue.suggestion && (
                    <p className="text-slate-500 mt-0.5 italic">{issue.suggestion}</p>
                  )}
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
                <Sparkles size={8} className="text-purple-400 shrink-0 mt-0.5" />
                {imp}
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    let action: "chat" | "review" | "fix" | "explain" | "generate" = "chat";
    let message = input.trim();

    if (message.startsWith("/review")) action = "review";
    else if (message.startsWith("/fix")) action = "fix";
    else if (message.startsWith("/explain")) action = "explain";
    else if (message.startsWith("/generate")) action = "generate";

    // Only attach code if user explicitly chooses to
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
      {/* Toggle Button - Floating */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "fixed right-4 bottom-10 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl transition-all",
          isOpen
            ? "bg-slate-800 text-slate-300 border border-slate-700 shadow-black/40"
            : "bg-gradient-to-r from-sky-500 via-purple-500 to-purple-600 text-white shadow-purple-500/30"
        )}
      >
        {isOpen ? <X size={16} /> : <MessageSquare size={16} />}
        <span className="text-sm font-semibold">{isOpen ? "Close" : "ᓄᕙᔭ"}</span>
        {!isOpen && conversations.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-0.5" />
        )}
      </motion.button>

      {/* AI Panel - Slide in from right */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-12 bottom-7 w-[380px] z-50 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/50 flex flex-col shadow-2xl shadow-black/50"
          >
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
              <button
                onClick={onClearChat}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                title="Clear chat"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                      onClick={() => {
                        setInput(s.text.split(" — ")[0]);
                        setShowSuggestions(false);
                      }}
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
                  className={cn(
                    "flex gap-2.5",
                    conv.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    conv.role === "user" ? "bg-sky-500/20" : "bg-purple-500/20"
                  )}>
                    {conv.role === "user" ? (
                      <User size={12} className="text-sky-400" />
                    ) : (
                      <Bot size={12} className="text-purple-400" />
                    )}
                  </div>

                  <div className={cn(
                    "flex-1 max-w-[85%]",
                    conv.role === "user" && "text-right"
                  )}>
                    {conv.role === "assistant" && conv.metadata?.action === "review" && conv.content.includes("###REVIEW_START###") ? (
                      <ReviewCard review={(() => {
                        try {
                          const match = conv.content.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
                          return match ? JSON.parse(match[1].trim()) : null;
                        } catch {
                          return null;
                        }
                      })()} />
                    ) : (
                      <div className={cn(
                        "inline-block px-3 py-2 rounded-xl text-left",
                        conv.role === "user"
                          ? "bg-sky-500/10 border border-sky-500/20"
                          : "bg-slate-900/80 border border-slate-700/30"
                      )}>
                        <MessageContent
                          content={conv.content}
                          language={currentLanguage}
                          onApplyCode={conv.role === "assistant" ? onApplyCode : undefined}
                        />
                      </div>
                    )}

                    <p className="text-[9px] text-slate-600 mt-1">
                      {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {conv.metadata?.model && (
                        <span className="ml-1">{conv.metadata.model}</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-slate-500"
                >
                  <Loader2 size={13} className="animate-spin text-purple-400" />
                  <span className="text-xs">ᓄᕙᔭ is thinking...</span>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800/50 bg-slate-950/50 shrink-0">
              {/* Attach code toggle */}
              {currentCode && (
                <button
                  onClick={() => setAttachCode(!attachCode)}
                  className={cn(
                    "flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md text-[10px] transition-colors",
                    attachCode
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-slate-600 hover:text-slate-400 hover:bg-slate-800/50"
                  )}
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
                  className={cn(
                    "px-4 py-2 rounded-lg transition-all flex items-center justify-center",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/25"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  )}
                >
                  <Send size={14} />
                </motion.button>
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
