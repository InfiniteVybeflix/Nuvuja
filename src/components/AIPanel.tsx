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
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AIConversation } from "@/types";
import { cn } from "@/lib/utils";

interface AIPanelProps {
  conversations: AIConversation[];
  onSendMessage: (message: string, action?: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  currentCode: string;
  currentLanguage: string;
  onApplyCode: (code: string) => void;
}

function CodeBlock({ code, language, onApply }: { code: string; language: string; onApply?: (code: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-950/80">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/50">
        <span className="text-xs text-slate-500 font-mono">{language}</span>
        <div className="flex gap-1">
          {onApply && (
            <button
              onClick={() => onApply(code)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
            >
              <Wand2 size={10} />
              Apply
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      <pre className="p-3 text-xs overflow-x-auto text-slate-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MessageContent({ content, language, onApplyCode }: { content: string; language: string; onApplyCode?: (code: string) => void }) {
  // Parse code blocks
  const parts = content.split(/(```[\w]*\n?[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        const codeMatch = part.match(/```(\w*)\n?([\s\S]*?)```/);
        if (codeMatch) {
          const lang = codeMatch[1] || language;
          const code = codeMatch[2].trim();
          return <CodeBlock key={i} code={code} language={lang} onApply={onApplyCode} />;
        }
        // Parse inline code
        const lines = part.split("\n");
        return lines.map((line, j) => {
          const inlineMatch = line.match(/`([^`]+)`/g);
          if (inlineMatch) {
            let processed = line;
            inlineMatch.forEach((match) => {
              const code = match.slice(1, -1);
              processed = processed.replace(
                match,
                `<code class="px-1 py-0.5 rounded bg-slate-800 text-sky-400 text-xs font-mono">${code}</code>`
              );
            });
            return <p key={`${i}-${j}`} className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />;
          }
          if (line.trim()) {
            return <p key={`${i}-${j}`} className="text-sm text-slate-300 leading-relaxed">{line}</p>;
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
    <div className="my-3 rounded-lg border border-slate-700/50 bg-slate-950/80 overflow-hidden">
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800/50 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">Code Review</span>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          review.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
          review.score >= 50 ? "bg-amber-500/20 text-amber-400" :
          "bg-red-500/20 text-red-400"
        )}>
          {review.score}/100
        </span>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs text-slate-400">{review.summary}</p>
        
        {review.issues?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">Issues</p>
            {review.issues.map((issue: any, i: number) => (
              <div key={i} className={cn(
                "flex items-start gap-2 p-2 rounded text-xs",
                issue.severity === "error" ? "bg-red-500/10 border border-red-500/20" :
                issue.severity === "warning" ? "bg-amber-500/10 border border-amber-500/20" :
                "bg-sky-500/10 border border-sky-500/20"
              )}>
                {issue.severity === "error" ? <AlertTriangle size={12} className="text-red-400 shrink-0 mt-0.5" /> :
                 issue.severity === "warning" ? <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" /> :
                 <CheckCircle size={12} className="text-sky-400 shrink-0 mt-0.5" />}
                <div>
                  <span className="text-slate-400">Line {issue.line}:</span>{" "}
                  <span className="text-slate-300">{issue.message}</span>
                  {issue.suggestion && (
                    <p className="text-slate-500 mt-0.5 italic">Suggestion: {issue.suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {review.improvements?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">Improvements</p>
            {review.improvements.map((imp: string, i: number) => (
              <p key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                <Sparkles size={10} className="text-purple-400 shrink-0 mt-0.5" />
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
}: AIPanelProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    let action = "chat";
    let message = input.trim();
    
    if (message.startsWith("/review")) action = "review";
    else if (message.startsWith("/fix")) action = "fix";
    else if (message.startsWith("/explain")) action = "explain";
    else if (message.startsWith("/generate")) action = "generate";
    
    // Include current code context
    if (currentCode && !message.includes("```")) {
      message += "\n\nCurrent file (" + currentLanguage + "):\n```" + currentLanguage + "\n" + currentCode + "\n```";
    }
    
    onSendMessage(message, action);
    setInput("");
    setShowSuggestions(false);
  };

  const suggestions = [
    { text: "/review — Review my code", icon: AlertTriangle, color: "text-amber-400" },
    { text: "/fix — Fix errors automatically", icon: Wand2, color: "text-emerald-400" },
    { text: "/explain — Explain this code", icon: Sparkles, color: "text-sky-400" },
    { text: "/generate — Generate new code", icon: Code2, color: "text-purple-400" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-950/50 border-l border-slate-800/50 ai-glow">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-purple-400" />
          <span className="text-xs font-semibold text-slate-300">Nuvuja AI</span>
        </div>
        <button
          onClick={onClearChat}
          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
          title="Clear chat"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {conversations.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 flex items-center justify-center">
              <Sparkles size={20} className="text-purple-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Nuvuja is ready</p>
            <p className="text-xs text-slate-600 mt-1">Ask anything or use commands below</p>
          </div>
        )}

        {showSuggestions && conversations.length === 0 && (
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => {
                  setInput(s.text.split(" — ")[0]);
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left hover:bg-slate-800/50 transition-colors group"
              >
                <s.icon size={12} className={cn(s.color, "shrink-0")} />
                <span className="text-slate-400 group-hover:text-slate-300">{s.text}</span>
              </button>
            ))}
          </div>
        )}

        {conversations.map((conv, i) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "flex gap-2",
              conv.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              conv.role === "user" ? "bg-sky-500/20" : "bg-purple-500/20"
            )}>
              {conv.role === "user" ? (
                <User size={12} className="text-sky-400" />
              ) : (
                <Bot size={12} className="text-purple-400" />
              )}
            </div>
            
            <div className={cn(
              "flex-1 max-w-[90%]",
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
              
              <p className="text-[10px] text-slate-600 mt-1">
                {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {conv.metadata?.model && (
                  <span className="ml-1.5 text-slate-700">via {conv.metadata.model}</span>
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
            <Loader2 size={14} className="animate-spin text-purple-400" />
            <span className="text-xs">Nuvuja is thinking...</span>
          </motion.div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Nuvuja anything..."
            className="flex-1 bg-slate-900 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "px-3 py-2 rounded-lg transition-all",
              input.trim() && !isLoading
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            )}
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-slate-700 mt-1.5 text-center">
          Use /review, /fix, /explain, /generate
        </p>
      </div>
    </div>
  );
}
