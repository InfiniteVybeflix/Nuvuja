"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Command,
  Wand,
  Play,
  Pause,
  FastForward,
  Rewind,
  SkipForward,
  MousePointerClick,
  MousePointer,
  GripVertical,
  MoreHorizontal,
  MoreVertical,
  GripHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layout,
  LayoutGrid,
  LayoutList,
  PanelLeft,
  PanelRight,
  Sidebar,
  Split,
  Columns,
  Rows,
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Move,
  RotateCcw,
  Redo,
  Undo,
  Save,
  Folder,
  FolderOpen,
  FileText,
  FileJson,
  FileType,
  FileCode2,
  FilePlus,
  FolderPlus,
  FolderMinus,
  Trash,
  Edit3,
  Scissors,
  Clipboard,
  ClipboardCopy,
  ClipboardList,
  List,
  ListOrdered,
  ListChecks,
  CheckSquare,
  ToggleLeft,
  ToggleRight,
  Sliders,
  SlidersHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  MinusCircle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  Bell,
  BellRing,
  BellOff,
  Mail,
  MessageCircle,
  MessagesSquare,
  Share2,
  Link,
  Unlink,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Tag,
  Tags,
  FolderTree,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitFork,
  Watch,
  Bolt,
  Flashlight,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cast,
  Airplay,
  Bluetooth,
  Signal,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Plug,
  PlugZap,
  Power,
  PowerOff,
  RefreshCcw,
  RotateCw,
  Repeat,
  Shuffle,
  SkipBack,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Volume,
  Volume1,
  Headphones,
  Speaker,
  Mic2,
  Video,
  Camera,
  Images,
  Tv,
  MonitorPlay,
  Gamepad2,
  Joystick,
  ToyBrick,
  Blocks,
  Shapes,
  Palette,
  Paintbrush,
  PaintBucket,
  PenTool,
  Eraser,
  Ruler,
  Compass,
  DraftingCompass,
  Focus,
  Aperture,
  Clapperboard,
  Popcorn,
  Ticket,
  Music2,
  } from "lucide-react";

import { AIConversation, ChatSession } from "@/types";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// SPEECH RECOGNITION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE DETECTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", () => setTimeout(check, 100));
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, [breakpoint]);
  return isMobile;
}

function useIsSmallPhone(breakpoint = 380) {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isSmall;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ToolResultItem {
  title?: string;
  name?: string;
  url?: string;
  version?: string;
}

interface ToolResultPackage {
  name: string;
  version: string;
}

interface ToolResultIssue {
  severity: "critical" | "high" | "warning" | "info";
  message: string;
}

interface ToolResultData {
  success?: boolean;
  error?: string;
  latency?: number;
  results?: ToolResultItem[];
  packages?: ToolResultPackage[];
  issues?: ToolResultIssue[];
  content?: string;
}

interface ToolResult {
  tool: string;
  result: ToolResultData;
  timestamp: number;
}

interface ReviewIssue {
  line: number;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
}

interface ReviewData {
  score: number;
  summary: string;
  issues: ReviewIssue[];
  improvements: string[];
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

interface ChatListItemProps {
  chat: ChatSession;
  isActive: boolean;
  onSwitch: () => void;
  onRename: (title: string) => void;
  onPin: () => void;
  onDelete: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS CARD — Ultimate glassmorphism with depth
// ═══════════════════════════════════════════════════════════════════════════════

function LiquidGlassCard({ children, className, glowColor = "purple", intensity = "medium" }: { 
  children: React.ReactNode; 
  className?: string; 
  glowColor?: "purple" | "sky" | "emerald" | "amber" | "rose" | "cyan" | "indigo";
  intensity?: "low" | "medium" | "high";
}) {
  const glowMap = {
    purple: "from-purple-500/30 via-purple-500/10 to-transparent",
    sky: "from-sky-500/30 via-sky-500/10 to-transparent",
    emerald: "from-emerald-500/30 via-emerald-500/10 to-transparent",
    amber: "from-amber-500/30 via-amber-500/10 to-transparent",
    rose: "from-rose-500/30 via-rose-500/10 to-transparent",
    cyan: "from-cyan-500/30 via-cyan-500/10 to-transparent",
    indigo: "from-indigo-500/30 via-indigo-500/10 to-transparent",
  };

  const intensityMap = {
    low: { border: "border-white/5", bg: "bg-slate-950/40", blur: "backdrop-blur-xl" },
    medium: { border: "border-white/10", bg: "bg-slate-950/50", blur: "backdrop-blur-2xl" },
    high: { border: "border-white/15", bg: "bg-slate-950/60", blur: "backdrop-blur-3xl" },
  };

  const i = intensityMap[intensity];

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", i.border, i.blur, className)}>
      {/* Multi-layer glass effect */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", glowMap[glowColor])} />
      <div className={cn("absolute inset-0", i.bg)} />
      {/* Inner highlight */}
      <div className="absolute inset-0 rounded-2xl border border-white/5" />
      {/* Top light reflection */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE BACKGROUND — Deep space starfield
// ═══════════════════════════════════════════════════════════════════════════════

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let frameCount = 0;
    const particleCount = isMobile ? 15 : 35;
    const particles: Array<{ 
      x: number; y: number; vx: number; vy: number; 
      size: number; alpha: number; color: string;
      pulseSpeed: number; pulseOffset: number;
    }> = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#a78bfa", "#38bdf8", "#4ade80", "#fbbf24", "#f472b6", "#c084fc", "#7dd3fc"];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      frameCount++;
      if (isMobile && frameCount % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw constellation lines
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const lineAlpha = (1 - dist / 120) * 0.08;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(167,139,250,${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles with pulsing
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        const pulse = Math.sin(frameCount * p.pulseSpeed + p.pulseOffset);
        const currentAlpha = p.alpha * (0.6 + 0.4 * pulse);
        const currentSize = p.size * (0.8 + 0.2 * pulse);

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha * 0.1;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isMobile]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ✦ STAR FIELD THINKING ✦ — Beautiful particle animation when AI processes
// ═══════════════════════════════════════════════════════════════════════════════

function StarFieldThinking() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const W = 320;
    const H = 100;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    interface Star {
      x: number; y: number; size: number;
      alpha: number; twinkleSpeed: number; twinkleOffset: number;
      color: string; layer: number;
    }

    const stars: Star[] = [];
    const starCount = 50;
    const colors = [
      "#a78bfa", "#c4b5fd", "#e9d5ff", "#ddd6fe",
      "#38bdf8", "#7dd3fc", "#bae6fd",
      "#fbbf24", "#fde68a", "#fef3c7",
      "#f472b6", "#fbcfe8", "#fce7f3",
      "#34d399", "#6ee7b7", "#a7f3d0",
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 2 + 0.3,
        alpha: Math.random() * 0.9 + 0.1,
        twinkleSpeed: Math.random() * 0.04 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        layer: Math.floor(Math.random() * 3),
      });
    }

    // Shooting stars
    interface ShootingStar {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; brightness: number;
    }
    let shootingStars: ShootingStar[] = [];

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Draw nebula background
      const gradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
      gradient.addColorStop(0, "rgba(139,92,246,0.08)");
      gradient.addColorStop(0.5, "rgba(56,189,248,0.04)");
      gradient.addColorStop(1, "rgba(15,23,42,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // Constellation lines between nearby stars
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            const lineAlpha = (1 - dist / 70) * 0.12 * (stars[i].layer === stars[j].layer ? 1 : 0.5);
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(167,139,250,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw stars with depth layers
      stars.forEach((star) => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.alpha * (0.4 + 0.6 * twinkle);
        const size = star.size * (0.7 + 0.3 * twinkle);

        // Outer glow based on layer
        const glowSize = size * (3 + star.layer * 2);
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha * 0.08;
        ctx.fill();

        // Middle glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha * 0.2;
        ctx.fill();

        // Core star
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Cross sparkle for bright stars
        if (size > 1.2 && alpha > 0.5) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.5;
          const sparkleLen = size * 3;
          ctx.beginPath();
          ctx.moveTo(star.x - sparkleLen, star.y);
          ctx.lineTo(star.x + sparkleLen, star.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - sparkleLen);
          ctx.lineTo(star.x, star.y + sparkleLen);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;

      // Spawn shooting stars
      if (Math.random() < 0.008) {
        shootingStars.push({
          x: Math.random() * W * 0.3,
          y: Math.random() * H * 0.4,
          vx: 2.5 + Math.random() * 2,
          vy: 0.8 + Math.random() * 0.8,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          brightness: 0.8 + Math.random() * 0.2,
        });
      }

      // Draw shooting stars
      shootingStars = shootingStars.filter((ss) => {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        const progress = ss.life / ss.maxLife;
        const alpha = (1 - progress) * ss.brightness;

        if (alpha <= 0 || ss.x > W + 50) return false;

        // Trail
        const trailLen = 15;
        const gradient = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * trailLen, ss.y - ss.vy * trailLen
        );
        gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
        gradient.addColorStop(0.3, `rgba(167,139,250,${alpha * 0.6})`);
        gradient.addColorStop(1, "rgba(167,139,250,0)");

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * trailLen, ss.y - ss.vy * trailLen);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowColor = "rgba(167,139,250,0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-950/80">
      {/* Star field canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl"
        style={{ opacity: 0.95 }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Animated brain icon with rings */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-400/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-sky-400/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 0.3 }}
          />
          <div className="w-9 h-9 rounded-full border-2 border-purple-400/40 flex items-center justify-center relative bg-slate-950/50 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Brain size={16} className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] tracking-wide">
            ✦ ᓄᕙᔭ is thinking ✦
          </span>
          <div className="flex gap-2 items-center">
            {[0, 1, 2].map((idx) => (
              <motion.div
                key={idx}
                className="rounded-full"
                style={{
                  width: idx === 1 ? 6 : 4,
                  height: idx === 1 ? 6 : 4,
                  backgroundColor: idx === 0 ? "#a78bfa" : idx === 1 ? "#38bdf8" : "#f472b6",
                  boxShadow: `0 0 ${idx === 1 ? 10 : 6}px ${idx === 0 ? "rgba(167,139,250,0.6)" : idx === 1 ? "rgba(56,189,248,0.6)" : "rgba(244,114,182,0.6)"}`,
                }}
                animate={{ 
                  opacity: [0.3, 1, 0.3], 
                  scale: [0.6, 1.4, 0.6],
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  delay: idx * 0.25,
                  ease: "easeInOut",
                }}
              />
            ))}
            <span className="text-[10px] text-purple-400/70 ml-1 font-mono">processing...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL RESULT CARD — Visual cards with data visualization
// ═══════════════════════════════════════════════════════════════════════════════

function ToolResultCard({ result }: { result: ToolResult }) {
  const toolIcons: Record<string, React.ElementType> = {
    web_search: Search,
    github_fetch: Github,
    github_search: GitBranch,
    npm_search: Package,
    analyze_code: ShieldCheck,
    fetch_url: Globe,
    cve_lookup: ShieldAlert,
    stackoverflow_search: Terminal,
  };

  const toolColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    web_search: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-400", icon: "text-sky-400" },
    github_fetch: { bg: "bg-slate-500/10", border: "border-slate-500/20", text: "text-slate-300", icon: "text-slate-300" },
    github_search: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-400" },
    npm_search: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", icon: "text-red-400" },
    analyze_code: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-400" },
    fetch_url: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: "text-cyan-400" },
    cve_lookup: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: "text-rose-400" },
    stackoverflow_search: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-400" },
  };

  const Icon = toolIcons[result.tool] || Zap;
  const c = toolColors[result.tool] || { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("rounded-xl border p-3 mb-2", c.bg, c.border)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", c.bg)}>
          <Icon size={12} className={c.icon} />
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", c.text)}>
          {result.tool.replace(/_/g, " ")}
        </span>
        {result.result?.latency && (
          <span className="text-[9px] text-slate-600 ml-auto font-mono flex items-center gap-1">
            <Zap size={8} className="text-amber-500/50" />
            {result.result.latency}ms
          </span>
        )}
      </div>

      {result.result?.success === false ? (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
          <AlertOctagon size={10} />
          <span>{result.result.error}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Web search results */}
          {result.result?.results && result.result.results.length > 0 && (
            <div className="space-y-1">
              {result.result.results.slice(0, 3).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-[11px] group cursor-pointer"
                >
                  <div className="w-1 h-1 rounded-full bg-sky-400/50 shrink-0" />
                  <span className="text-slate-300 truncate flex-1 group-hover:text-sky-300 transition-colors">
                    {r.title || r.name}
                  </span>
                  {r.url && <ExternalLink size={9} className="text-sky-500/40 shrink-0 group-hover:text-sky-400 transition-colors" />}
                </motion.div>
              ))}
              {result.result.results.length > 3 && (
                <span className="text-[9px] text-slate-600 pl-3">+{result.result.results.length - 3} more results</span>
              )}
            </div>
          )}

          {/* NPM packages */}
          {result.result?.packages && result.result.packages.length > 0 && (
            <div className="space-y-1">
              {result.result.packages.slice(0, 3).map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <Package size={9} className="text-red-400/70 shrink-0" />
                  <span className="text-slate-300 font-mono">{p.name}</span>
                  <span className="text-slate-600 font-mono">@{p.version}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Security issues */}
          {result.result?.issues && result.result.issues.length > 0 && (
            <div className="space-y-1">
              {result.result.issues.map((issue, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px]",
                    issue.severity === "critical" ? "text-rose-400" :
                    issue.severity === "high" ? "text-amber-400" : "text-slate-400"
                  )}
                >
                  {issue.severity === "critical" ? <ShieldAlert size={9} /> : <ShieldCheck size={9} />}
                  <span>{issue.message}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Content preview */}
          {result.result?.content && (
            <div className="text-[11px] text-slate-500 truncate border-l-2 border-slate-700/50 pl-2">
              {result.result.content.slice(0, 120)}...
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY BADGE — Animated status indicator
// ═══════════════════════════════════════════════════════════════════════════════

function SecurityBadge({ level }: { level: "secure" | "warning" | "critical" | "unknown" }) {
  const config = {
    secure: {
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/20",
      label: "Secure",
    },
    warning: {
      icon: ShieldAlert,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20",
      label: "Warning",
    },
    critical: {
      icon: AlertOctagon,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-rose-500/20",
      label: "Critical",
    },
    unknown: {
      icon: Shield,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      glow: "shadow-slate-500/10",
      label: "Unknown",
    },
  };
  const c = config[level];
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-sm",
        c.color, c.bg, c.border, c.glow
      )}
    >
      <c.icon size={10} /> {c.label}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE BLOCK — Beautiful code display with diff support
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="my-2.5 rounded-xl overflow-hidden border border-slate-700/40 bg-slate-950/95 group relative shadow-lg shadow-black/20"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900/95 via-slate-800/60 to-slate-900/95 border-b border-slate-700/30">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <FileCode size={12} className="text-sky-400/80" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{language || "code"}</span>
          <span className="text-[9px] text-slate-600 font-mono">{lineCount} lines</span>
        </div>
        <div className="flex gap-1">
          {onApply && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onApply(cleanCode)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] bg-purple-500/15 text-purple-400 hover:bg-purple-500/25 transition-all border border-purple-500/20 hover:border-purple-500/40"
            >
              <Wand2 size={9} /> Apply
            </motion.button>
          )}
          {shouldCollapse && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
          </button>
        </div>
      </div>

      {/* Code content */}
      <pre className={cn(
        "p-3.5 text-[11px] overflow-x-auto text-slate-300 font-mono leading-relaxed scrollbar-thin",
        !expanded && shouldCollapse && "max-h-64"
      )}>
        <code>{cleanCode}</code>
      </pre>

      {!expanded && shouldCollapse && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none flex items-end justify-center pb-2">
          <span className="text-[10px] text-slate-600 font-mono">Click to expand</span>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE CODE — Subtle inline code styling
// ═══════════════════════════════════════════════════════════════════════════════

function InlineCode({ code }: { code: string }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-800/80 text-sky-400 text-[11px] font-mono border border-slate-700/40">
      {code}
    </code>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE CONTENT — Safe rendering with rich formatting
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
          return <CodeBlock key={`code-${i}`} code={code} language={lang} onApply={onApplyCode} />;
        }
        const lines = part.split("\n");
        return lines.map((line, j) => {
          if (!line.trim()) return null;

          const inlineCodes: Array<{ text: string; isCode: boolean }> = [];
          let lastIndex = 0;
          const inlineRegex = /`([^`]+)`/g;
          let match;

          while ((match = inlineRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              inlineCodes.push({ text: line.slice(lastIndex, match.index), isCode: false });
            }
            inlineCodes.push({ text: match[1], isCode: true });
            lastIndex = match.index + match[0].length;
          }
          if (lastIndex < line.length) {
            inlineCodes.push({ text: line.slice(lastIndex), isCode: false });
          }
          if (inlineCodes.length === 0) {
            inlineCodes.push({ text: line, isCode: false });
          }

          return (
            <p key={`line-${i}-${j}`} className="text-[13px] text-slate-300 leading-relaxed">
              {inlineCodes.map((segment, idx) =>
                segment.isCode
                  ? <InlineCode key={idx} code={segment.text} />
                  : <span key={idx}>{segment.text}</span>
              )}
            </p>
          );
        });
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REVIEW CARD — Beautiful code review display
// ═══════════════════════════════════════════════════════════════════════════════

function ReviewCard({ review }: { review: ReviewData | null }) {
  if (!review || !review.issues) return null;

  const scoreColor = review.score >= 80 ? "emerald" : review.score >= 50 ? "amber" : "rose";
  const scoreLabel = review.score >= 80 ? "Excellent" : review.score >= 50 ? "Needs Work" : "Critical";

  return (
    <LiquidGlassCard glowColor={scoreColor} intensity="high" className="my-2.5">
      <div className="p-3.5">
        {/* Score header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              review.score >= 80 ? "bg-emerald-500/15" : review.score >= 50 ? "bg-amber-500/15" : "bg-rose-500/15"
            )}>
              <ShieldCheck size={15} className={
                review.score >= 80 ? "text-emerald-400" : review.score >= 50 ? "text-amber-400" : "text-rose-400"
              } />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">Code Review</span>
              <span className="text-[10px] text-slate-500 ml-2">{scoreLabel}</span>
            </div>
          </div>
          <div className={cn(
            "text-sm font-bold px-3 py-1 rounded-full border",
            review.score >= 80 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
            review.score >= 50 ? "bg-amber-500/15 text-amber-400 border-amber-500/20" :
            "bg-rose-500/15 text-rose-400 border-rose-500/20"
          )}>
            {review.score}<span className="text-[10px] text-slate-500">/100</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">{review.summary}</p>

        {/* Issues */}
        {review.issues && review.issues.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Bug size={10} />
              Issues ({review.issues.length})
            </div>
            {review.issues.map((issue, i) => (
              <motion.div
                key={`issue-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-xl text-[11px] border",
                  issue.severity === "error" ? "bg-rose-500/5 border-rose-500/15" :
                  issue.severity === "warning" ? "bg-amber-500/5 border-amber-500/15" :
                  "bg-sky-500/5 border-sky-500/15"
                )}
              >
                {issue.severity === "error" ? (
                  <AlertOctagon size={11} className="text-rose-400 shrink-0 mt-0.5" />
                ) : issue.severity === "warning" ? (
                  <AlertTriangle size={11} className="text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle size={11} className="text-sky-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-slate-500 font-mono text-[10px]">L{issue.line}</span>
                  <span className="text-slate-300 ml-1.5">{issue.message}</span>
                  {issue.suggestion && (
                    <p className="text-slate-500 mt-1.5 italic text-[10px] border-l-2 border-slate-700/50 pl-2">
                      {issue.suggestion}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Improvements */}
        {review.improvements && review.improvements.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <Lightbulb size={10} />
              Improvements
            </div>
            {review.improvements.map((imp, i) => (
              <motion.p
                key={`imp-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-[11px] text-slate-400 flex items-start gap-2"
              >
                <Sparkles size={9} className="text-purple-400 shrink-0 mt-0.5" />
                {imp}
              </motion.p>
            ))}
          </div>
        )}
      </div>
    </LiquidGlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT LIST ITEM — Beautiful chat list with animations
// ═══════════════════════════════════════════════════════════════════════════════

function ChatListItem({ chat, isActive, onSwitch, onRename, onPin, onDelete }: ChatListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chat.title);

  const handleSave = () => {
    if (editValue.trim()) onRename(editValue.trim());
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border",
        isActive
          ? "bg-purple-500/10 border-purple-500/25 shadow-lg shadow-purple-500/5"
          : "hover:bg-slate-800/40 border-transparent hover:border-slate-700/20"
      )}
      onClick={onSwitch}
    >
      <motion.div
        animate={chat.pinned ? { rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Pin size={11} className={cn(
          "shrink-0 transition-colors",
          chat.pinned ? "text-amber-400 fill-amber-400" : "text-slate-700"
        )} />
      </motion.div>

      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-slate-900 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-purple-500/40 outline-none min-w-0 focus:ring-2 focus:ring-purple-500/20"
        />
      ) : (
        <div className="flex-1 min-w-0">
          <span className={cn("text-xs truncate block", isActive ? "text-purple-300 font-medium" : "text-slate-400")}>
            {chat.title}
          </span>
          {chat.messages.length > 0 && (
            <span className="text-[9px] text-slate-600 truncate block">
              {chat.messages[chat.messages.length - 1]?.content.slice(0, 40)}...
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditValue(chat.title); }}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Pencil size={9} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-amber-400 transition-colors"
        >
          <Pin size={9} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); if (confirm("Delete this chat?")) onDelete(); }}
          className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors"
        >
          <Trash2 size={9} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK ACTION CHIP — Context-aware AI actions
// ═══════════════════════════════════════════════════════════════════════════════

function QuickActionChip({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: "purple" | "sky" | "emerald" | "amber" | "rose";
  onClick: () => void;
}) {
  const colorMap = {
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
        colorMap[color]
      )}
    >
      <Icon size={12} />
      {label}
    </motion.button>
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
  const isMobile = useIsMobile();
  const isSmallPhone = useIsSmallPhone();

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachCode, setAttachCode] = useState(false);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [proMode, setProMode] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nuvuja-pro-mode");
      if (saved !== null) setProMode(saved !== "false");
    } catch { /* ignore */ }
  }, []);

  // Panel dimensions - desktop only
  const [panelWidth, setPanelWidth] = useState(480);
  const [panelHeight, setPanelHeight] = useState(640);
  const [panelTop, setPanelTop] = useState(80);

  // Load saved dimensions on mount
  useEffect(() => {
    try {
      const savedW = localStorage.getItem("nuvuja-panel-width");
      const savedH = localStorage.getItem("nuvuja-panel-height");
      const savedT = localStorage.getItem("nuvuja-panel-top");
      if (savedW) setPanelWidth(Math.max(360, Math.min(900, parseInt(savedW, 10))));
      if (savedH) setPanelHeight(Math.max(400, Math.min(850, parseInt(savedH, 10))));
      if (savedT) setPanelTop(Math.max(60, parseInt(savedT, 10)));
    } catch { /* ignore */ }
  }, []);

  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"secure" | "warning" | "critical" | "unknown">("unknown");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef<string | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(480);
  const startHeightRef = useRef(640);
  const startTopRef = useRef(80);

  // Safe panelTop initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateTop = () => {
      try {
        const safeTopVal = getComputedStyle(document.documentElement).getPropertyValue("--safe-top").trim();
        const numeric = parseInt(safeTopVal || "0", 10);
        const safeTop = isNaN(numeric) ? 0 : numeric;
        const top = Math.max(60, 60 + safeTop);
        setPanelTop(top);
        startTopRef.current = top;
      } catch { /* ignore */ }
    };
    updateTop();
    window.addEventListener("orientationchange", () => setTimeout(updateTop, 300));
    return () => window.removeEventListener("orientationchange", updateTop);
  }, []);

  // Panel height - cap at viewport but respect user resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      try {
        const vv = window.visualViewport;
        const visibleHeight = vv ? vv.height : window.innerHeight;
        const maxH = visibleHeight - panelTop - 20;
        setPanelHeight((prev) => Math.min(prev, maxH));
        startHeightRef.current = panelHeight;
      } catch { /* ignore */ }
    };
    update();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", update);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", () => setTimeout(update, 300));
    return () => {
      if (vv) {
        vv.removeEventListener("resize", update);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [panelTop, panelHeight]);

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

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  // MOUSE + TOUCH Resize handlers - DESKTOP ONLY
  useEffect(() => {
    if (isMobile) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current || !resizeDirRef.current) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const dx = clientX - startXRef.current;
      const dy = clientY - startYRef.current;
      const dir = resizeDirRef.current;
      let newW = startWidthRef.current;
      let newH = startHeightRef.current;
      let newT = startTopRef.current;

      if (dir.includes("w")) newW = Math.max(360, Math.min(900, startWidthRef.current - dx));
      if (dir.includes("e")) newW = Math.max(360, Math.min(900, startWidthRef.current + dx));
      if (dir.includes("n")) {
        const safeTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safe-top") || "0", 10) || 0;
        newT = Math.max(safeTop + 44, Math.min(window.innerHeight - 300, startTopRef.current + dy));
        newH = Math.max(400, startHeightRef.current - dy);
      }
      if (dir.includes("s")) {
        newH = Math.max(400, Math.min(window.innerHeight - panelTop - 20, startHeightRef.current + dy));
      }
      setPanelWidth(newW);
      setPanelHeight(newH);
      setPanelTop(newT);
    };

    const handleUp = () => {
      isResizingRef.current = false;
      resizeDirRef.current = null;
      setIsResizing(false);
      try {
        localStorage.setItem("nuvuja-panel-width", String(panelWidth));
        localStorage.setItem("nuvuja-panel-height", String(panelHeight));
        localStorage.setItem("nuvuja-panel-top", String(panelTop));
      } catch { /* ignore */ }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isMobile, panelTop, panelWidth, panelHeight]);

  const startResize = useCallback((dir: string) => (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) return;
    isResizingRef.current = true;
    resizeDirRef.current = dir;

    if ("touches" in e.nativeEvent) {
      startXRef.current = e.nativeEvent.touches[0].clientX;
      startYRef.current = e.nativeEvent.touches[0].clientY;
    } else {
      startXRef.current = e.nativeEvent.clientX;
      startYRef.current = e.nativeEvent.clientY;
    }

    startWidthRef.current = panelWidth;
    startHeightRef.current = panelHeight;
    startTopRef.current = panelTop;
    setIsResizing(true);
    e.preventDefault();
    e.stopPropagation();
  }, [isMobile, panelWidth, panelHeight, panelTop]);

  // Voice input
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    { text: "/review — Deep code review with security audit", icon: ShieldCheck, color: "emerald" as const, desc: "Analyze code quality, security & performance" },
    { text: "/fix — Auto-fix errors with CVE check", icon: Wand2, color: "amber" as const, desc: "Detect and patch bugs automatically" },
    { text: "/explain — Explain with architecture diagram", icon: Brain, color: "sky" as const, desc: "Understand how your code works" },
    { text: "/generate — Generate production-ready code", icon: Rocket, color: "purple" as const, desc: "Create complete features from description" },
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
            const result = JSON.parse(match[1]) as { tool: string; result: ToolResultData };
            newToolResults.push({ tool: result.tool, result: result.result, timestamp: conv.timestamp });
          } catch {
            // Ignore parse errors
          }
        }
      }
    });
    setToolResults(newToolResults);
  }, [conversations]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: TOGGLE BUTTON
  // ═══════════════════════════════════════════════════════════════════════════════

  const toggleButton = (
    <motion.button
      key="nuvuja-toggle"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      className="fixed flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white pointer-events-auto cursor-pointer "
      style={{
        zIndex: 9999,
        bottom: 80,
        right: 20,
        background: "linear-gradient(135deg, rgba(139,92,246,0.92) 0%, rgba(56,189,248,0.88) 50%, rgba(168,85,247,0.92) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(139,92,246,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset, 0 0 24px rgba(56,189,248,0.25)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="relative z-10"
        >
          <Orbit size={22} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
        </motion.div>
        <div className="absolute inset-0 bg-white/25 blur-xl rounded-full" />
      </div>

      <div className="flex flex-col items-start">
        <span className="text-sm font-bold tracking-wider text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
          ᓄᕙᔭ
        </span>
        <span className="text-[9px] text-white/70 font-medium tracking-wide">AI Assistant</span>
      </div>

      {hasConsoleErrors && (
        <motion.div
          className="relative ml-1"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)] block" />
          <motion.span
            className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-red-400 opacity-75"
            animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
        </motion.div>
      )}
      {!hasConsoleErrors && isLoading && (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
          <Loader2 size={14} className="text-white/80" />
        </motion.div>
      )}
      {!hasConsoleErrors && !isLoading && conversations.length > 0 && (
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
        />
      )}
      {!hasConsoleErrors && !isLoading && conversations.length === 0 && (
        <motion.span
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="w-1.5 h-1.5 rounded-full bg-white/50"
        />
      )}
    </motion.button>
  );

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER: MAIN PANEL
  // ═══════════════════════════════════════════════════════════════════════════════

  const panelContent = (
    <motion.div
      key="ai-panel"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      style={{
        top: isMobile ? panelTop : panelTop,
        right: isMobile ? 0 : 20,
        width: isMobile ? "100%" : panelWidth,
        maxWidth: isMobile ? "100vw" : 900,
        height: isMobile ? panelHeight : panelHeight,
        borderRadius: isMobile ? 0 : "20px 0 0 20px",
      }}
      className={cn("fixed flex flex-row shadow-2xl shadow-black/60 overflow-hidden ", isResizing && "select-none")}
    >
      {/* Deep space background */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-2xl z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-slate-950/40 to-sky-900/15 z-[1]" />

      {/* Border glow */}
      <div className={cn("absolute inset-0 border border-purple-500/10 pointer-events-none", !isMobile && "rounded-l-[20px]")} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />

      {isResizing && <div className="fixed inset-0 z-[9999] cursor-none" />}

      {/* Resize overlay with dimensions */}
      <div className={cn("absolute inset-0 pointer-events-none z-[100] border-2 border-dashed transition-opacity duration-200", !isMobile && "rounded-l-[20px]", isResizing ? "border-purple-500/60 opacity-100" : "border-purple-500/0 opacity-0")}>
        <div className="absolute top-3 left-3 bg-purple-500/90 text-white text-[10px] px-2.5 py-1 rounded-lg font-mono backdrop-blur-sm shadow-lg">
          {Math.round(panelWidth)} × {Math.round(panelHeight)} @ {Math.round(panelTop)}px
        </div>
      </div>

      {/* Resize handles - DESKTOP ONLY, all 8 directions */}
      {!isMobile && (
        <>
          {/* West edge */}
          <div onMouseDown={startResize("w")} className="absolute top-10 bottom-10 left-0 w-3 cursor-ew-resize z-50 group flex items-center justify-center">
            <div className={cn("w-0.5 h-14 rounded-full transition-all", isResizing && resizeDirRef.current?.includes("w") ? "bg-purple-400 w-1 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-slate-600/0 group-hover:bg-slate-400/50")} />
          </div>
          {/* East edge */}
          <div onMouseDown={startResize("e")} className="absolute top-10 bottom-10 right-0 w-3 cursor-ew-resize z-50 group flex items-center justify-center">
            <div className={cn("w-0.5 h-14 rounded-full transition-all", isResizing && resizeDirRef.current?.includes("e") ? "bg-purple-400 w-1 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-slate-600/0 group-hover:bg-slate-400/50")} />
          </div>
          {/* North edge */}
          <div onMouseDown={startResize("n")} className="absolute top-0 left-10 right-10 h-3 cursor-ns-resize z-50 group flex items-center justify-center">
            <div className={cn("h-0.5 w-14 rounded-full transition-all", isResizing && resizeDirRef.current === "n" ? "bg-purple-400 h-1 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-slate-600/0 group-hover:bg-slate-400/50")} />
          </div>
          {/* South edge */}
          <div onMouseDown={startResize("s")} className="absolute bottom-0 left-10 right-10 h-3 cursor-ns-resize z-50 group flex items-center justify-center">
            <div className={cn("h-0.5 w-14 rounded-full transition-all", isResizing && resizeDirRef.current === "s" ? "bg-purple-400 h-1 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-slate-600/0 group-hover:bg-slate-400/50")} />
          </div>
          {/* Northwest corner */}
          <div onMouseDown={startResize("nw")} className="absolute top-0 left-0 w-7 h-7 cursor-nwse-resize z-50 group flex items-start justify-start p-1">
            <div className={cn("w-2 h-2 rounded-full transition-all", isResizing && resizeDirRef.current === "nw" ? "bg-purple-400 scale-150 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-slate-600/0 group-hover:bg-slate-400/60")} />
          </div>
          {/* Northeast corner */}
          <div onMouseDown={startResize("ne")} className="absolute top-0 right-0 w-7 h-7 cursor-nesw-resize z-50 group flex items-start justify-end p-1">
            <div className={cn("w-2 h-2 rounded-full transition-all", isResizing && resizeDirRef.current === "ne" ? "bg-purple-400 scale-150 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-slate-600/0 group-hover:bg-slate-400/60")} />
          </div>
          {/* Southwest corner */}
          <div onMouseDown={startResize("sw")} className="absolute bottom-0 left-0 w-7 h-7 cursor-nesw-resize z-50 group flex items-end justify-start p-1">
            <div className={cn("w-2 h-2 rounded-full transition-all", isResizing && resizeDirRef.current === "sw" ? "bg-purple-400 scale-150 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-slate-600/0 group-hover:bg-slate-400/60")} />
          </div>
          {/* Southeast corner */}
          <div onMouseDown={startResize("se")} className="absolute bottom-0 right-0 w-7 h-7 cursor-nwse-resize z-50 group flex items-end justify-end p-1">
            <div className={cn("w-2 h-2 rounded-full transition-all", isResizing && resizeDirRef.current === "se" ? "bg-purple-400 scale-150 shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "bg-slate-600/0 group-hover:bg-slate-400/60")} />
          </div>
        </>
      )}

      {/* Chat List Sidebar */}
      <AnimatePresence>
        {showChatList && (
          <motion.div
            initial={isMobile ? { x: -60, opacity: 0 } : { width: 0, opacity: 0 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { width: 240, opacity: 1 }}
            exit={isMobile ? { x: -60, opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "border-r border-white/5 bg-slate-950/90 backdrop-blur-2xl flex flex-col overflow-hidden shrink-0 relative z-10",
              isMobile && "absolute inset-y-0 left-0 z-50 w-[300px] shadow-2xl shadow-black/90"
            )}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <History size={13} className="text-purple-400" />
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Conversations</span>
              </div>
              <div className="flex items-center gap-1">
                {isMobile && (
                  <button onClick={onToggleChatList} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors mr-1">
                    <X size={14} />
                  </button>
                )}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onNewChat} className="p-1.5 rounded-lg hover:bg-purple-500/20 text-slate-500 hover:text-purple-400 transition-colors" title="New conversation">
                  <Plus size={14} />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
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
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleChatList}
              className={cn("p-2 rounded-xl transition-all", showChatList ? "bg-purple-500/20 text-purple-400" : "hover:bg-white/5 text-slate-500 hover:text-slate-300")}
            >
              <MessageSquare size={14} />
            </motion.button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/25 via-purple-500/25 to-purple-600/25 flex items-center justify-center border border-purple-500/25 shadow-lg shadow-purple-500/15">
              <Bot size={17} className="text-purple-300" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-slate-100">ᓄᕙᔭ AI</span>
                <SecurityBadge level={securityLevel} />
              </div>
              <span className="text-[10px] text-slate-600 font-medium">Nuvuja Godmode v4.0</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Pro/Beginner mode toggle */}
            <button
              onClick={() => {
                const newMode = !proMode;
                setProMode(newMode);
                try { localStorage.setItem("nuvuja-pro-mode", String(newMode)); } catch {}
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all mr-1",
                proMode
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/25"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/25 hover:bg-sky-500/25"
              )}
              title={proMode ? "Switch to Beginner Mode" : "Switch to Pro Mode"}
            >
              {proMode ? "Pro" : "Beginner"}
            </button>

            {!isSmallPhone && (
              <div className="flex items-center gap-0.5 mr-2 bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom out">
                  <ZoomOut size={11} />
                </button>
                <span className="text-[9px] text-slate-500 w-9 text-center font-mono">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors" title="Zoom in">
                  <ZoomIn size={11} />
                </button>
              </div>
            )}

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
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0 scrollbar-thin">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, minHeight: "100%" }}>

            {/* Welcome state */}
            {conversations.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-purple-500/25 via-sky-500/25 to-purple-600/25 flex items-center justify-center border border-purple-500/25 shadow-2xl shadow-purple-500/25"
                >
                  <Atom size={42} className="text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">ᓄᕙᔭ is online</h2>
                <p className="text-sm text-slate-500 mb-1">Autonomous software engineering intelligence</p>
                <p className="text-xs text-slate-600">Web search · GitHub access · Security audit · Code generation</p>

                {/* Quick stats for pro mode */}
                {proMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-4 mt-6"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Cpu size={10} className="text-purple-400" /> Groq LPU
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Zap size={10} className="text-amber-400" /> 800+ tokens/s
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <Shield size={10} className="text-emerald-400" /> Security audit
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Suggestions with descriptions */}
            {showSuggestions && conversations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2 mt-4"
              >
            {suggestions.map((s, i) => (
              <motion.button
                key={`suggestion-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setInput(s.text.split(" — ")[0]); setShowSuggestions(false); }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs text-left transition-all group border",
                  s.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" :
                  s.color === "amber" ? "bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10" :
                  s.color === "sky" ? "bg-sky-500/5 border-sky-500/10 hover:bg-sky-500/10" :
                  "bg-purple-500/5 border-purple-500/10 hover:bg-purple-500/10"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  s.color === "emerald" ? "bg-emerald-500/15" :
                  s.color === "amber" ? "bg-amber-500/15" :
                  s.color === "sky" ? "bg-sky-500/15" :
                  "bg-purple-500/15"
                )}>
                  <s.icon size={16} className={cn(
                    s.color === "emerald" ? "text-emerald-400" :
                    s.color === "amber" ? "text-amber-400" :
                    s.color === "sky" ? "text-sky-400" :
                    "text-purple-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-200 font-semibold block">{s.text.split(" — ")[0]}</span>
                  <span className="text-slate-600 text-[10px] block mt-0.5">{s.desc}</span>
                </div>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
              </motion.button>
            ))}

            {/* Quick action chips for pro mode */}
            {proMode && conversations.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                <QuickActionChip icon={Wand2} label="Refactor" color="purple" onClick={() => { setInput("/fix Refactor this code to be cleaner"); handleSend(); }} />
                <QuickActionChip icon={ShieldCheck} label="Audit" color="emerald" onClick={() => { setInput("/review Security audit"); handleSend(); }} />
                <QuickActionChip icon={Brain} label="Explain" color="sky" onClick={() => { setInput("/explain How does this work?"); handleSend(); }} />
                <QuickActionChip icon={Rocket} label="Optimize" color="amber" onClick={() => { setInput("/fix Optimize performance"); handleSend(); }} />
              </motion.div>
            )}

            {/* Tool results */}
            {toolResults.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Zap size={10} className="text-amber-500/70" />
                  Tool Results
                </div>
                {toolResults.slice(-3).map((result, i) => (
                  <ToolResultCard key={`tool-${result.tool}-${i}`} result={result} />
                ))}
              </div>
            )}

            {/* Messages with staggered animation */}
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id || `msg-${i}`}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), type: "spring", stiffness: 350, damping: 28 }}
                className={cn("flex gap-3", conv.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-lg",
                  conv.role === "user" ? "bg-sky-500/15 shadow-sky-500/10" : "bg-purple-500/15 shadow-purple-500/10"
                )}>
                  {conv.role === "user" ? <User size={13} className="text-sky-400" /> : <Bot size={13} className="text-purple-400" />}
                </div>
                <div className={cn("flex-1 max-w-[88%]", conv.role === "user" && "text-right")}>
                  {conv.role === "assistant" && conv.metadata?.action === "review" && conv.content.includes("###REVIEW_START###") ? (
                    <ReviewCard review={(() => {
                      try {
                        const match = conv.content.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
                        return match ? (JSON.parse(match[1].trim()) as ReviewData) : null;
                      } catch { return null; }
                    })()} />
                  ) : (
                    <div className={cn(
                      "inline-block px-4 py-3 rounded-2xl text-left shadow-sm",
                      conv.role === "user"
                        ? "bg-sky-500/8 border border-sky-500/15"
                        : "bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm"
                    )}>
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

            {/* ✦ Star Field Thinking Animation ✦ */}
            {isLoading && <StarFieldThinking />}
          </div>
        </div>

        {/* Input area */}
        <div className="p-3.5 border-t border-white/5 bg-slate-950/80 backdrop-blur-2xl shrink-0">
          {currentCode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAttachCode(!attachCode)}
              className={cn(
                "flex items-center gap-2 mb-2.5 px-3 py-1.5 rounded-lg text-[11px] transition-all border",
                attachCode
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "text-slate-600 hover:text-slate-400 hover:bg-white/5 border-transparent"
              )}
            >
              <Paperclip size={10} />
              {attachCode ? "Code attached · Click to detach" : "Attach current file"}
              {attachCode && <span className="text-[9px] text-slate-500 font-mono">{currentLanguage}</span>}
            </motion.button>
          )}

          <div className="flex gap-2">
            {/* Voice button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleVoice}
              className={cn(
                "p-2.5 rounded-xl transition-all shrink-0 relative",
                isListening ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
              )}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening && (
                <motion.span
                  className="absolute inset-0 rounded-xl"
                  animate={{ boxShadow: ["0 0 0 0 rgba(244,63,94,0.4)", "0 0 0 8px rgba(244,63,94,0)", "0 0 0 0 rgba(244,63,94,0.4)"] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
              {isListening ? (
                <motion.div animate={{ scaleY: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}>
                  <MicOff size={15} />
                </motion.div>
              ) : (
                <Mic size={15} />
              )}
            </motion.button>

            <div className="flex-1 relative z-10">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask ᓄᕙᔭ anything..."
                enterKeyHint="send"
                autoCapitalize="off"
                autoCorrect="off"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all backdrop-blur-sm pointer-events-auto"
              />
              {isListening && (
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-400"
                />
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "px-5 py-2.5 rounded-xl transition-all flex items-center justify-center shadow-lg",
                input.trim() && !isLoading
                  ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white hover:opacity-90 shadow-purple-500/30"
                  : "bg-white/5 text-slate-600 cursor-not-allowed"
              )}
            >
              <Send size={14} />
            </motion.button>
          </div>

          <div className="flex items-center justify-between mt-2.5">
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
              <span className="text-[9px] text-slate-700 font-mono">{input.length} chars</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        {!isOpen && toggleButton}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isOpen && panelContent}
      </AnimatePresence>
    </>
  );
}
