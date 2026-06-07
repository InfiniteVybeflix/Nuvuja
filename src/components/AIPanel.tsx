"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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
  Plus,
  Pin,
  MessageSquare,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Globe,
  Github,
  Package,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Brain,
  Cpu,
  Terminal,
  FileCode,
  GitBranch,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Settings,
  History,
  Star,
  Flame,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  AlertOctagon,
  Bug,
  Lightbulb,
  BookOpen,
  Hash,
  Type,
  Image,
  Film,
  Music,
  Database,
  Server,
  Cloud,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  Radar,
  Radio,
  Satellite,
  Rocket,
  Atom,
  Orbit,
  Infinity,
  Dna,
  Dices,
  Puzzle,
  Layers,
  Box,
  Boxes,
  Container,
  Cuboid,
  Hexagon,
  Octagon,
  Pentagon,
  Triangle,
  CircleDot,
  Square,
  Diamond,
  Crown,
  Trophy,
  Medal,
  Award,
  BadgeCheck,
  BadgeAlert,
  BadgeInfo,
  BadgeX,
} from "lucide-react";
import { AIConversation, ChatSession } from "@/types";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToolResult {
  tool: string;
  result: any;
  timestamp: number;
}

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
  chats: ChatSession[];
  activeChatId: string | null;
  showChatList: boolean;
  onToggleChatList: () => void;
  onNewChat: () => void;
  onSwitchChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onPinChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  hasConsoleErrors?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function HolographicCard({ children, className, glowColor = "purple" }: { children: React.ReactNode; className?: string; glowColor?: "purple" | "sky" | "emerald" | "amber" | "rose" | "cyan" }) {
  const glowMap = {
    purple: "from-purple-500/20 via-purple-500/5 to-transparent",
    sky: "from-sky-500/20 via-sky-500/5 to-transparent",
    emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    amber: "from-amber-500/20 via-amber-500/5 to-transparent",
    rose: "from-rose-500/20 via-rose-500/5 to-transparent",
    cyan: "from-cyan-500/20 via-cyan-500/5 to-transparent",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-white/5 backdrop-blur-xl", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", glowMap[glowColor])} />
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#a78bfa", "#38bdf8", "#4ade80", "#fbbf24", "#f472b6"];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 100) * 0.1;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />;
}

function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 animate-pulse" />
        <div className="absolute inset-0 w-8 h-8 rounded-full border-t-2 border-purple-400 animate-spin" style={{ animationDuration: "1.5s" }} />
        <Brain size={14} className="absolute inset-0 m-auto text-purple-400" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-purple-300">ᓄᕙᔭ is thinking...</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((idx: number) => (
            <motion.div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.2 } as any}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolResultCard({ result }: { result: ToolResult }) {
  const toolIcons: Record<string, any> = {
    web_search: Search,
    github_fetch: Github,
    github_search: GitBranch,
    npm_search: Package,
    analyze_code: ShieldCheck,
    fetch_url: Globe,
    cve_lookup: ShieldAlert,
    stackoverflow_search: Terminal,
  };

  const toolColors: Record<string, string> = {
    web_search: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    github_fetch: "text-slate-300 bg-slate-500/10 border-slate-500/20",
    github_search: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    npm_search: "text-red-400 bg-red-500/10 border-red-500/20",
    analyze_code: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    fetch_url: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    cve_lookup: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    stackoverflow_search: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  const Icon = toolIcons[result.tool] || Zap;
  const colorClass = toolColors[result.tool] || "text-purple-400 bg-purple-500/10 border-purple-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("rounded-lg border p-3 mb-2", colorClass)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{result.tool.replace("_", " ")}</span>
        {result.result?.latency && (
          <span className="text-[9px] text-slate-500 ml-auto">{result.result.latency}ms</span>
        )}
      </div>
      {result.result?.success === false ? (
        <div className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertOctagon size={10} /> {result.result.error}
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 font-mono max-h-32 overflow-y-auto scrollbar-thin">
          {result.result?.results?.length > 0 && (
            <div className="space-y-1">
              {result.result.results.slice(0, 3).map((r: any, i: number) => (
                <div key={i} className="truncate">
                  {r.title && <span className="text-slate-300">{r.title}</span>}
                  {r.name && <span className="text-slate-300">{r.name}</span>}
                  {r.url && <span className="text-sky-500/60 ml-1">↗</span>}
                </div>
              ))}
              {result.result.results.length > 3 && (
                <span className="text-slate-600">+{result.result.results.length - 3} more</span>
              )}
            </div>
          )}
          {result.result?.packages?.length > 0 && (
            <div className="space-y-1">
              {result.result.packages.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Package size={8} className="text-red-400" />
                  <span className="text-slate-300">{p.name}</span>
                  <span className="text-slate-600">@{p.version}</span>
                </div>
              ))}
            </div>
          )}
          {result.result?.issues?.length > 0 && (
            <div className="space-y-1">
              {result.result.issues.map((issue: any, i: number) => (
                <div key={i} className={cn("flex items-center gap-1", issue.severity === "critical" ? "text-rose-400" : issue.severity === "high" ? "text-amber-400" : "text-slate-400")}>
                  {issue.severity === "critical" ? <ShieldAlert size={8} /> : <ShieldCheck size={8} />}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
          {result.result?.content && (
            <div className="text-slate-500 truncate">{result.result.content.slice(0, 100)}...</div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function SecurityBadge({ level }: { level: "secure" | "warning" | "critical" | "unknown" }) {
  const config = {
    secure: { icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Secure" },
    warning: { icon: ShieldAlert, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Warning" },
    critical: { icon: AlertOctagon, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "Critical" },
    unknown: { icon: Shield, color: "text-slate-400 bg-slate-500/10 border-slate-500/20", label: "Unknown" },
  };
  const c = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", c.color)}>
      <c.icon size={10} /> {c.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE BLOCK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function CodeBlock({ code, language, onApply }: { code: string; language: string; onApply?: (code: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cleanCode = code
    .replace(/^```\w*\n/, "")
    .replace(/^```\n/, "")
    .replace(/\n```$/, "")
    .replace(/^\s*```\w*\s*$/, "")
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = cleanCode.split("\n").length;
  const shouldCollapse = lineCount > 20;

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-700/30 bg-slate-950/90 backdrop-blur-sm group">
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-900/90 to-slate-800/50 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <FileCode size={12} className="text-sky-400" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{language}</span>
          <span className="text-[9px] text-slate-600">{lineCount} lines</span>
        </div>
        <div className="flex gap-1">
          {onApply && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onApply(cleanCode)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/20"
            >
              <Wand2 size={9} /> Apply
            </motion.button>
          )}
          {shouldCollapse && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
          <button onClick={handleCopy} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
          </button>
        </div>
      </div>
      <pre className={cn("p-3 text-[11px] overflow-x-auto text-slate-300 font-mono leading-relaxed scrollbar-thin", !expanded && shouldCollapse && "max-h-64")}>
        <code>{cleanCode}</code>
      </pre>
      {!expanded && shouldCollapse && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

function MessageContent({ content, language, onApplyCode }: { content: string; language: string; onApplyCode?: (code: string) => void }) {
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
        const lines = part.split("\n");
        return lines.map((line, j) => {
          const inlineMatch = line.match(/`([^`]+)`/g);
          if (inlineMatch) {
            let processed = line;
            inlineMatch.forEach((match) => {
              const code = match.slice(1, -1);
              processed = processed.replace(match, `<code class="px-1.5 py-0.5 rounded-md bg-slate-800/80 text-sky-400 text-[11px] font-mono border border-slate-700/30">${code}</code>`);
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

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW CARD
// ═══════════════════════════════════════════════════════════════════════════════

function ReviewCard({ review }: { review: any }) {
  if (!review || !review.issues) return null;
  return (
    <HolographicCard glowColor={review.score >= 80 ? "emerald" : review.score >= 50 ? "amber" : "rose"} className="my-2">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className={review.score >= 80 ? "text-emerald-400" : review.score >= 50 ? "text-amber-400" : "text-rose-400"} />
            <span className="text-xs font-semibold text-slate-300">Code Review</span>
          </div>
          <div className={cn("text-xs font-bold px-2 py-0.5 rounded-full", review.score >= 80 ? "bg-emerald-500/20 text-emerald-400" : review.score >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400")}>
            {review.score}/100
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">{review.summary}</p>

        {review.issues?.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Bug size={10} /> Issues ({review.issues.length})
            </p>
            {review.issues.map((issue: any, i: number) => (
              <div key={i} className={cn("flex items-start gap-2 p-2 rounded-lg text-[11px] border", issue.severity === "error" ? "bg-rose-500/5 border-rose-500/20" : issue.severity === "warning" ? "bg-amber-500/5 border-amber-500/20" : "bg-sky-500/5 border-sky-500/20")}>
                {issue.severity === "error" ? <AlertOctagon size={10} className="text-rose-400 shrink-0 mt-0.5" /> : issue.severity === "warning" ? <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> : <CheckCircle size={10} className="text-sky-400 shrink-0 mt-0.5" />}
                <div>
                  <span className="text-slate-500">Line {issue.line}:</span> <span className="text-slate-300">{issue.message}</span>
                  {issue.suggestion && <p className="text-slate-500 mt-1 italic text-[10px]">{issue.suggestion}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {review.improvements?.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb size={10} /> Improvements
            </p>
            {review.improvements.map((imp: string, i: number) => (
              <p key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                <Sparkles size={8} className="text-purple-400 shrink-0 mt-0.5" /> {imp}
              </p>
            ))}
          </div>
        )}
      </div>
    </HolographicCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════════

function ChatListItem({ chat, isActive, onSwitch, onRename, onPin, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chat.title);

  const handleSave = () => {
    if (editValue.trim()) onRename(editValue.trim());
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border",
        isActive
          ? "bg-purple-500/10 border-purple-500/20 shadow-lg shadow-purple-500/5"
          : "hover:bg-slate-800/50 border-transparent hover:border-slate-700/30"
      )}
      onClick={onSwitch}
    >
      <Pin size={11} className={cn("shrink-0 transition-colors", chat.pinned ? "text-amber-400 fill-amber-400" : "text-slate-700")} />
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setIsEditing(false); }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded-lg border border-purple-500/50 outline-none min-w-0"
        />
      ) : (
        <span className={cn("flex-1 text-xs truncate", isActive ? "text-purple-300" : "text-slate-400")}>
          {chat.title}
        </span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditValue(chat.title); }} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300">
          <Pencil size={9} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-amber-400">
          <Pin size={9} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this chat?")) onDelete(); }} className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400">
          <Trash2 size={9} />
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN AIPANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

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
  chats,
  activeChatId,
  showChatList,
  onToggleChatList,
  onNewChat,
  onSwitchChat,
  onRenameChat,
  onPinChat,
  onDeleteChat,
  hasConsoleErrors,
}: AIPanelProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachCode, setAttachCode] = useState(false);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panelWidth, setPanelWidth] = useState(420);
  const [panelHeight, setPanelHeight] = useState(0);
  const [panelTop, setPanelTop] = useState(() => {
    const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-top") || "0", 10);
    return Math.max(44, 44 + safeTop);
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"secure" | "warning" | "critical" | "unknown">("unknown");
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef<string | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(420);
  const startHeightRef = useRef(0);
  const startTopRef = useRef(44);

  // Panel height calculation with visualViewport
  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      const visibleHeight = vv ? vv.height : window.innerHeight;
      const h = visibleHeight - panelTop;
      setPanelHeight(h);
      startHeightRef.current = h;
    };
    update();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", () => setTimeout(update, 300));
    return () => {
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [panelTop]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, isLoading, toolResults]);

  // Security level detection
  useEffect(() => {
    if (!currentCode) {
      setSecurityLevel("unknown");
      return;
    }
    if (currentCode.includes("eval(") || currentCode.includes("new Function(") || currentCode.match(/password\s*=\s*["'][^"']+["']/i)) {
      setSecurityLevel("critical");
    } else if (currentCode.includes("innerHTML") && !currentCode.includes("DOMPurify")) {
      setSecurityLevel("warning");
    } else {
      setSecurityLevel("secure");
    }
  }, [currentCode]);

  // Resize handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !resizeDirRef.current) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      const dir = resizeDirRef.current;
      let newW = startWidthRef.current;
      let newH = startHeightRef.current;
      let newT = startTopRef.current;
      if (dir.includes("w")) newW = Math.max(320, Math.min(900, startWidthRef.current - dx));
      if (dir.includes("e")) newW = Math.max(320, Math.min(900, startWidthRef.current + dx));
      if (dir.includes("n")) {
        const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-top") || "0", 10);
        newT = Math.max(safeTop, Math.min(window.innerHeight - 200, startTopRef.current + dy));
        newH = Math.max(200, startHeightRef.current - dy);
      }
      if (dir.includes("s")) {
        newH = Math.max(200, Math.min(window.innerHeight - panelTop, startHeightRef.current + dy));
      }
      setPanelWidth(newW);
      setPanelHeight(newH);
      setPanelTop(newT);
    };
    const handleUp = () => { isResizingRef.current = false; resizeDirRef.current = null; setIsResizing(false); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [panelTop]);

  const startResize = useCallback((dir: string) => (e: React.MouseEvent) => {
    isResizingRef.current = true;
    resizeDirRef.current = dir;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = panelWidth;
    startHeightRef.current = panelHeight;
    startTopRef.current = panelTop;
    setIsResizing(true);
    e.preventDefault();
    e.stopPropagation();
  }, [panelWidth, panelHeight, panelTop]);

  // Voice input
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    let action: "chat" | "review" | "fix" | "explain" | "generate" = "chat";
    let message = input.trim();
    if (message.startsWith("/review")) action = "review";
    else if (message.startsWith("/fix")) action = "fix";
    else if (message.startsWith("/explain")) action = "explain";
    else if (message.startsWith("/generate")) action = "generate";

    if (attachCode && currentCode) {
      message += `\n\nCurrent file (${currentLanguage}):\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\``;
    }
    onSendMessage(message, action);
    setInput("");
    setShowSuggestions(false);
    setAttachCode(false);
  };

  const suggestions = [
    { text: "/review — Deep code review with security audit", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { text: "/fix — Auto-fix errors with CVE check", icon: Wand2, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { text: "/explain — Explain with architecture diagram", icon: Brain, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { text: "/generate — Generate production-ready code", icon: Rocket, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  const sortedChats = useMemo(() => [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt), [chats]);

  // Extract tool results from conversations
  useEffect(() => {
    const newToolResults: ToolResult[] = [];
    conversations.forEach((conv) => {
      if (conv.role === "assistant" && conv.content.includes("###TOOL_RESULT###")) {
        const matches = Array.from(conv.content.matchAll(/###TOOL_RESULT###\n({[\s\S]*?})\n###TOOL_END###/g));
        for (const match of matches) {
          try {
            const result = JSON.parse(match[1]);
            newToolResults.push({ tool: result.tool, result: result.result, timestamp: conv.timestamp });
          } catch {}
        }
      }
    });
    setToolResults(newToolResults);
  }, [conversations]);

  if (!isOpen) {
    return (
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(168, 85, 247, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className="fixed z-[60] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl transition-all bg-gradient-to-r from-sky-500 via-purple-500 to-purple-600 text-white shadow-purple-500/30 backdrop-blur-sm border border-white/10"
          style={{
            right: "max(16px, env(safe-area-inset-right))",
            bottom: "calc(40px + env(safe-area-inset-bottom))",
          }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" } as any}
          >
            <Orbit size={20} />
          </motion.div>
          <span className="text-sm font-semibold tracking-wide">ᓄᕙᔭ</span>
          {hasConsoleErrors && (
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity } as any}
              className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-400/50"
            />
          )}
          {!hasConsoleErrors && conversations.length > 0 && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity } as any}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </motion.button>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: panelWidth, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: panelWidth, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ top: panelTop, right: 0, width: panelWidth, height: panelHeight }}
        className={cn("fixed z-50 flex flex-row shadow-2xl shadow-black/50 overflow-hidden", isResizing && "select-none")}
      >
        {/* Holographic background — particles FIRST so they show through */}
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-slate-950/50 to-sky-900/10 z-[1]" />

        {/* Border glow */}
        <div className="absolute inset-0 rounded-l-2xl border border-purple-500/10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        {isResizing && <div className="fixed inset-0 z-[9999] cursor-none" />}

        {/* Resize overlay */}
        <div className={cn("absolute inset-0 pointer-events-none z-[100] border-2 border-dashed transition-opacity duration-200 rounded-l-2xl", isResizing ? "border-purple-500/60 opacity-100" : "border-purple-500/0 opacity-0")}>
          <div className="absolute top-2 left-2 bg-purple-500/90 text-white text-[10px] px-2 py-0.5 rounded font-mono backdrop-blur-sm">
            {Math.round(panelWidth)}×{Math.round(panelHeight)} @ {Math.round(panelTop)}px
          </div>
        </div>

        {/* Resize handles */}
        <div onMouseDown={startResize("w")} className="absolute top-8 bottom-8 left-0 w-3 cursor-ew-resize z-50 group flex items-center justify-center">
          <div className={cn("w-0.5 h-12 rounded-full transition-all", isResizing && resizeDirRef.current?.includes("w") ? "bg-purple-400 w-1" : "bg-slate-600/0 group-hover:bg-slate-400/40")} />
        </div>
        <div onMouseDown={startResize("n")} className="absolute top-0 left-8 right-8 h-3 cursor-ns-resize z-50 group flex items-center justify-center">
          <div className={cn("h-0.5 w-12 rounded-full transition-all", isResizing && resizeDirRef.current === "n" ? "bg-purple-400 h-1" : "bg-slate-600/0 group-hover:bg-slate-400/40")} />
        </div>
        <div onMouseDown={startResize("s")} className="absolute bottom-0 left-8 right-8 h-3 cursor-ns-resize z-50 group flex items-center justify-center">
          <div className={cn("h-0.5 w-12 rounded-full transition-all", isResizing && resizeDirRef.current === "s" ? "bg-purple-400 h-1" : "bg-slate-600/0 group-hover:bg-slate-400/40")} />
        </div>
        <div onMouseDown={startResize("nw")} className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50" />
        <div onMouseDown={startResize("sw")} className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-50" />

        {/* Chat List Sidebar */}
        <AnimatePresence>
          {showChatList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-r border-white/5 bg-slate-950/80 backdrop-blur-xl flex flex-col overflow-hidden shrink-0 relative z-10"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <History size={13} className="text-purple-400" />
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Conversations</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onNewChat}
                  className="p-1.5 rounded-lg hover:bg-purple-500/20 text-slate-500 hover:text-purple-400 transition-colors"
                  title="New conversation"
                >
                  <Plus size={14} />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {sortedChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSwitch={() => onSwitchChat(chat.id)}
                    onRename={(title: string) => onRenameChat(chat.id, title)}
                    onPin={() => onPinChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0 bg-slate-950/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onToggleChatList}
                className={cn("p-2 rounded-xl transition-all", showChatList ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/5 text-slate-500 hover:text-slate-300")}
              >
                <MessageSquare size={14} />
              </motion.button>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 via-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10">
                <Bot size={16} className="text-purple-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-200">ᓄᕙᔭ AI</span>
                  <SecurityBadge level={securityLevel} />
                </div>
                <span className="text-[10px] text-slate-600">Nuvuja Godmode v4.0</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Zoom controls */}
              <div className="flex items-center gap-0.5 mr-2 bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom out">
                  <ZoomOut size={11} />
                </button>
                <span className="text-[9px] text-slate-500 w-9 text-center font-mono">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom in">
                  <ZoomIn size={11} />
                </button>
              </div>

              <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors" title="Settings">
                <Settings size={13} />
              </button>
              <button onClick={onClearChat} className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors" title="Clear chat">
                <Trash2 size={13} />
              </button>
              <button onClick={onToggle} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors" title="Close panel">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0 scrollbar-thin"
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, minHeight: "100%" }}>

              {/* Welcome state */}
              {conversations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" } as any}
                    className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-sky-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/20 shadow-2xl shadow-purple-500/20"
                  >
                    <Atom size={36} className="text-purple-400" />
                  </motion.div>
                  <h2 className="text-lg font-bold text-slate-200 mb-2">ᓄᕙᔭ is online</h2>
                  <p className="text-sm text-slate-500 mb-1">Autonomous software engineering intelligence</p>
                  <p className="text-xs text-slate-600">Web search · GitHub access · Security audit · Unlimited output</p>
                </motion.div>
              )}

              {/* Suggestions */}
              {showSuggestions && conversations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 mt-6"
                >
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setInput(s.text.split(" — ")[0]); setShowSuggestions(false); }}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-left transition-all group border", s.bg, s.border, "hover:bg-white/5")}
                    >
                      <s.icon size={16} className={cn(s.color, "shrink-0")} />
                      <div>
                        <span className="text-slate-300 font-medium">{s.text}</span>
                      </div>
                      <ChevronRight size={12} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Tool results */}
              {toolResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Zap size={10} /> Tool Results
                  </p>
                  {toolResults.slice(-3).map((result, i) => (
                    <ToolResultCard key={`${result.tool}-${i}`} result={result} />
                  ))}
                </div>
              )}

              {/* Messages */}
              {conversations.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                  className={cn("flex gap-3", conv.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-lg", conv.role === "user" ? "bg-sky-500/20 shadow-sky-500/10" : "bg-purple-500/20 shadow-purple-500/10")}>
                    {conv.role === "user" ? <User size={13} className="text-sky-400" /> : <Bot size={13} className="text-purple-400" />}
                  </div>
                  <div className={cn("flex-1 max-w-[88%]", conv.role === "user" && "text-right")}>
                    {conv.role === "assistant" && conv.metadata?.action === "review" && conv.content.includes("###REVIEW_START###") ? (
                      <ReviewCard review={(() => {
                        try {
                          const match = conv.content.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
                          return match ? JSON.parse(match[1].trim()) : null;
                        } catch { return null; }
                      })()} />
                    ) : (
                      <div className={cn("inline-block px-4 py-3 rounded-2xl text-left shadow-sm", conv.role === "user" ? "bg-sky-500/10 border border-sky-500/20" : "bg-white/5 border border-white/5 backdrop-blur-sm")}>
                        <MessageContent content={conv.content} language={currentLanguage} onApplyCode={conv.role === "assistant" ? onApplyCode : undefined} />
                      </div>
                    )}
                    <p className="text-[9px] text-slate-600 mt-1.5 flex items-center gap-1.5">
                      <Clock size={8} />
                      {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {conv.metadata?.model && <span className="text-slate-700">· {conv.metadata.model}</span>}
                      {conv.metadata?.key && <span className="text-slate-700">· {conv.metadata.key}</span>}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Thinking animation */}
              {isLoading && <ThinkingAnimation />}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl shrink-0">
            {currentCode && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAttachCode(!attachCode)}
                className={cn("flex items-center gap-2 mb-2.5 px-3 py-1.5 rounded-lg text-[11px] transition-all border", attachCode ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "text-slate-600 hover:text-slate-400 hover:bg-white/5 border-transparent")}
              >
                <Paperclip size={10} />
                {attachCode ? "Code attached · Click to detach" : "Attach current file"}
                {attachCode && <span className="text-[9px] text-slate-500">{currentLanguage}</span>}
              </motion.button>
            )}

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleVoice}
                className={cn("p-2.5 rounded-xl transition-all shrink-0", isListening ? "bg-rose-500/20 text-rose-400 animate-pulse" : "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10")}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <Satellite size={15} className="animate-pulse" /> : <Radio size={15} />}
              </motion.button>

              <div className="flex-1 relative z-10">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask ᓄᕙᔭ anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all backdrop-blur-sm pointer-events-auto"
                />
                {isListening && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity } as any}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-400"
                  />
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn("px-5 py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg", input.trim() && !isLoading ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 shadow-purple-500/25" : "bg-white/5 text-slate-600 cursor-not-allowed")}
              >
                <Send size={14} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] text-slate-700 flex items-center gap-3">
                <span className="flex items-center gap-1"><Zap size={8} /> /review</span>
                <span className="flex items-center gap-1"><Wand2 size={8} /> /fix</span>
                <span className="flex items-center gap-1"><Brain size={8} /> /explain</span>
                <span className="flex items-center gap-1"><Rocket size={8} /> /generate</span>
              </p>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <span className="text-[9px] text-purple-400 flex items-center gap-1">
                    <Loader2 size={8} className="animate-spin" /> Processing
                  </span>
                )}
                <span className="text-[9px] text-slate-700">{input.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
