"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { FileNode, EditorTab, AIConversation, ChatSession, ConsoleEntry } from "@/types";
import { generateId, getLanguageFromFilename } from "@/lib/utils";
import {
  createDefaultWorkspace,
  saveWorkspace,
  loadWorkspace,
  findFileById,
  findFileByPath,
  updateFileContent,
  addFileNode,
  deleteFileNode,
  renameFileNode,
  toggleFolder,
} from "@/lib/fileSystem";
import { Toolbar } from "@/components/Toolbar";
import { FileExplorer } from "@/components/FileExplorer";
import { EditorPanel } from "@/components/Editor";
import { AIPanel } from "@/components/AIPanel";
import { Preview } from "@/components/Preview";
import { StatusBar } from "@/components/StatusBar";
import { Tutorial } from "@/components/Tutorial";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ConsolePanel } from "@/components/ConsolePanel";

type ViewMode = "code" | "preview" | "split";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE DETECTION HOOK
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

// ═══════════════════════════════════════════════════════════════════════════════
// SAFE LOCALSTORAGE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useSafeLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[Nuvuja] localStorage read error for ${key}:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const newValue = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
        return newValue;
      });
    } catch (error) {
      console.warn(`[Nuvuja] localStorage write error for ${key}:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE SYSTEM HELPERS (outside component to prevent recreation)
// ═══════════════════════════════════════════════════════════════════════════════

function findFileRecursive(fileList: FileNode[], name: string): FileNode | null {
  for (const f of fileList) {
    if (f.name === name) return f;
    if (f.children) {
      const found = findFileRecursive(f.children, name);
      if (found) return found;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════════

import React from "react";

class NuvujaErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Nuvuja Error Boundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-200 p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
            <p className="text-slate-400 text-sm">{this.state.error?.message || "Unknown error"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
            >
              Reload ᓄᕙᔭ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Home() {
  const isMobile = useIsMobile();

  const [showWelcome, setShowWelcome] = useState(true);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Chat system with safe localStorage
  const [chats, setChats] = useSafeLocalStorage<ChatSession[]>("nuvuja-chats", []);
  const [activeChatId, setActiveChatId] = useSafeLocalStorage<string | null>("nuvuja-active-chat", null);
  const [showChatList, setShowChatList] = useState(false);

  const conversations = useMemo(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    return chat?.messages || [];
  }, [chats, activeChatId]);

  const [isAILoading, setIsAILoading] = useState(false);
  const [continuationContext, setContinuationContext] = useState("");
  const [isContinuing, setIsContinuing] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // MOBILE: Hide sidebar by default on small screens
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // MOBILE: Default to "code" view on mobile
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "code" : "code";
    }
    return "code";
  });

  const [theme, setTheme] = useState<"nuvuja-dark" | "light">("nuvuja-dark");
  const [aiStatus, setAIStatus] = useState("ready");
  const [isConnected, setIsConnected] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);

  // Refs for latest state in callbacks
  const chatsRef = useRef(chats);
  const filesRef = useRef(files);
  const tabsRef = useRef(tabs);
  const activeTabIdRef = useRef(activeTabId);
  const consoleEntriesRef = useRef(consoleEntries);

  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { tabsRef.current = tabs; }, [tabs]);
  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);
  useEffect(() => { consoleEntriesRef.current = consoleEntries; }, [consoleEntries]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    let mounted = true;
    try {
      const saved = loadWorkspace();
      if (!mounted) return;
      setFiles(saved);
      const htmlFile = findFileRecursive(saved, "index.html");
      if (htmlFile) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => openFile(htmlFile), 0);
      }
    } catch (error) {
      console.error("[Nuvuja] Failed to load workspace:", error);
      if (mounted) {
        setFiles(createDefaultWorkspace());
      }
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        saveWorkspace(filesRef.current);
      } catch (error) {
        console.error("[Nuvuja] Auto-save failed:", error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(160, Math.min(400, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showWelcome) {
        e.preventDefault();
        setShowWelcome(false);
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") {
          e.preventDefault();
          handleSave();
        }
        if (e.key === "p") {
          e.preventDefault();
          setViewMode((m) => m === "code" ? "split" : m === "split" ? "preview" : "code");
        }
        if (e.key === "b") {
          e.preventDefault();
          setShowSidebar((s) => !s);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWelcome, handleSave]);

  // Auto-create first chat
  useEffect(() => {
    if (chats.length === 0) {
      const newChat: ChatSession = {
        id: generateId(),
        title: "New Chat",
        pinned: false,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else if (!activeChatId || !chats.find((c) => c.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId, setChats, setActiveChatId]);

  // Console listener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.source === "nuvuja-console") {
        setConsoleEntries((prev) => [
          ...prev,
          {
            id: generateId(),
            type: e.data.type,
            args: e.data.args || [],
            message: (e.data.args || [])
              .map((a: any) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
              .join(" "),
            timestamp: e.data.timestamp || Date.now(),
            stack: e.data.type === "error" ? e.data.args?.[1] : undefined,
          },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // MOBILE: Handle sidebar and view mode on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        setViewMode((prev) => prev === "split" ? "code" : prev);
        setShowSidebar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const openFile = useCallback((file: FileNode) => {
    if (file.type === "folder") return;
    setTabs((prevTabs) => {
      const existingTab = prevTabs.find((t) => t.fileId === file.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return prevTabs;
      }
      const newTab: EditorTab = {
        id: generateId(),
        fileId: file.id,
        name: file.name,
        language: file.language || getLanguageFromFilename(file.name),
        content: file.content || "",
        isDirty: false,
      };
      setActiveTabId(newTab.id);
      return [...prevTabs, newTab];
    });
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabIdRef.current === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, []);

  const handleContentChange = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, isDirty: true } : t))
    );
    const tab = tabsRef.current.find((t) => t.id === tabId);
    if (tab) {
      setFiles((prev) => updateFileContent(prev, tab.fileId, content));
    }
  }, []);

  const handleSave = useCallback(() => {
    try {
      saveWorkspace(filesRef.current);
      setTabs((prev) => prev.map((t) => ({ ...t, isDirty: false })));
    } catch (error) {
      console.error("[Nuvuja] Save failed:", error);
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const zip = new JSZip();
      const addToZip = (fileList: FileNode[], path: string = "") => {
        for (const file of fileList) {
          if (file.type === "file" && file.content) {
            zip.file(`${path}${file.name}`, file.content);
          }
          if (file.type === "folder" && file.children) {
            addToZip(file.children, `${path}${file.name}/`);
          }
        }
      };
      addToZip(filesRef.current);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nuvuja-project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Nuvuja] Export failed:", error);
    }
  }, []);

  const handleAddFile = useCallback((parentId: string | null, type: "file" | "folder") => {
    const name = type === "file" ? "untitled.txt" : "new-folder";
    const newNode: FileNode = {
      id: generateId(),
      name,
      type,
      language: type === "file" ? "plaintext" : undefined,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
      parentId,
    };
    setFiles((prev) => addFileNode(prev, parentId, newNode));
    if (type === "file") {
      setTimeout(() => openFile(newNode), 0);
    }
  }, [openFile]);

  const handleDeleteNode = useCallback((id: string) => {
    setFiles((prevFiles) => {
      const newFiles = deleteFileNode(prevFiles, id);
      setTabs((prevTabs) =>
        prevTabs.filter((t) => findFileById(newFiles, t.fileId) !== null)
      );
      return newFiles;
    });
  }, []);

  const handleRenameNode = useCallback((id: string, newName: string) => {
    setFiles((prev) => renameFileNode(prev, id, newName));
  }, []);

  const handleToggleFolder = useCallback((id: string) => {
    setFiles((prev) => toggleFolder(prev, id));
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHAT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════════

  const handleNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: generateId(),
      title: "New Chat",
      pinned: false,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setShowChatList(false);
  }, [setChats, setActiveChatId]);

  const handleSwitchChat = useCallback((id: string) => {
    setActiveChatId(id);
    setShowChatList(false);
  }, [setActiveChatId]);

  const handleRenameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c))
    );
  }, [setChats]);

  const handlePinChat = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c))
    );
  }, [setChats]);

  const handleDeleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeChatId === id && next.length > 0) {
        setActiveChatId(next[0].id);
      } else if (next.length === 0) {
        const newChat: ChatSession = {
          id: generateId(),
          title: "New Chat",
          pinned: false,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveChatId(newChat.id);
        return [newChat];
      }
      return next;
    });
  }, [activeChatId, setChats, setActiveChatId]);

  const handleApplyCode = useCallback((code: string) => {
    const currentTabId = activeTabIdRef.current;
    if (currentTabId) {
      handleContentChange(currentTabId, code);
    }
  }, [handleContentChange]);

  const handleLoadTemplate = useCallback((template: any) => {
    const newFiles = template.files.map((f: any) => ({
      ...f,
      id: generateId(),
      parentId: undefined,
    }));
    setFiles((prev) => [
      ...prev,
      {
        id: generateId(),
        name: template.name.toLowerCase().replace(/\s+/g, "-"),
        type: "folder" as const,
        isOpen: true,
        children: newFiles,
      },
    ]);
    if (newFiles[0]) {
      setTimeout(() => openFile(newFiles[0]), 0);
    }
  }, [openFile]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // AI MESSAGE HANDLER (THE MOST CRITICAL FUNCTION)
  // ═══════════════════════════════════════════════════════════════════════════════

  const handleSendMessage = useCallback(async (
    message: string, 
    action: "chat" | "review" | "fix" | "explain" | "generate" = "chat",
    isContinuation: boolean = false
  ) => {
    const currentActiveChatId = activeChatIdRef.current;
    if (!currentActiveChatId) return;

    const userMsg: AIConversation = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    // Use functional update to ensure we have latest chats
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat.id !== currentActiveChatId) return chat;
        const msgs = [...chat.messages, userMsg];
        const title =
          chat.messages.length === 0
            ? message.slice(0, 30).replace(/[^\w\s-]/g, "").trim() || "New Chat"
            : chat.title;
        return { ...chat, messages: msgs, title, updatedAt: Date.now() };
      });
      return updatedChats;
    });

    setIsAILoading(true);
    setAIStatus("thinking");

    try {
      // Get latest state from refs
      const currentChats = chatsRef.current;
      const currentFiles = filesRef.current;
      const activeChat = currentChats.find((c) => c.id === currentActiveChatId);
      const chatMessages = activeChat?.messages || [];
      const currentConsoleEntries = consoleEntriesRef.current;

      // ═── TOKEN-SAFE CONTEXT BUILDER ───
      const MAX_CONTEXT_CHARS = 6000;
      const MAX_FILE_CHARS = 1000;
      const MAX_CONSOLE_ERRORS = 3;
      const MAX_HISTORY = 4;

      const buildSafeContext = (includeContent: boolean): string => {
        const lines: string[] = ["=== PROJECT FILES ==="];
        const walk = (nodes: FileNode[], prefix = "") => {
          for (const node of nodes) {
            if (node.type === "folder") {
              lines.push(`${prefix}📁 ${node.name}/`);
              if (node.children) walk(node.children, prefix + "  ");
            } else {
              lines.push(`${prefix}📄 ${node.name} (${node.language || "txt"})`);
              if (includeContent && node.content) {
                const truncated = node.content.length > MAX_FILE_CHARS
                  ? node.content.slice(0, MAX_FILE_CHARS) + `\n... [${node.content.length - MAX_FILE_CHARS} more chars]`
                  : node.content;
                lines.push(`${prefix}---`);
                lines.push(truncated);
                lines.push(`${prefix}---`);
              }
            }
          }
        };
        walk(currentFiles);
        const result = lines.join("\n");
        return result.length > MAX_CONTEXT_CHARS
          ? result.slice(0, MAX_CONTEXT_CHARS) + "\n... [context truncated to save tokens]"
          : result;
      };

      const needsFullContext =
        action === "fix" ||
        action === "review" ||
        message.toLowerCase().includes("error") ||
        message.toLowerCase().includes("bug") ||
        message.toLowerCase().includes("fix") ||
        message.toLowerCase().includes("debug");

      let apiContent = message;
      if (needsFullContext) {
        apiContent += "\n\n" + buildSafeContext(true);
      } else {
        apiContent += "\n\n" + buildSafeContext(false);
      }

      const recentErrors = currentConsoleEntries
        .filter((e) => e.type === "error" || e.type === "warn")
        .slice(-MAX_CONSOLE_ERRORS);
      if (recentErrors.length > 0) {
        apiContent += "\n\n=== CONSOLE OUTPUT ===\n";
        recentErrors.forEach((e) => {
          apiContent += `[${e.type.toUpperCase()}] ${e.message}\n`;
          if (e.stack) apiContent += `Stack: ${e.stack.slice(0, 500)}\n`;
        });
        apiContent += "=== END CONSOLE ===";
      }

      const trimmedHistory = chatMessages.slice(-MAX_HISTORY);
      const apiMessages = [
        ...trimmedHistory.map((c) => ({ role: c.role, content: c.content })),
        { role: "user" as const, content: apiContent },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, action, continuation: isContinuation }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let model = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  model = parsed.model || model;
                }
              } catch {
                // Ignore parse errors in stream
              }
            }
          }
        }
      }

      let needsContinuation = false;
      if (fullContent.includes("###CONTINUE###")) {
        needsContinuation = true;
        fullContent = fullContent.replace("###CONTINUE###", "");
      }

      const assistantMsg: AIConversation = {
        id: generateId(),
        role: "assistant",
        content: fullContent,
        timestamp: Date.now(),
        metadata: { model, action, needsContinuation },
      };

      // FIX_LINE parser
      const fixLineRegex = /###FIX_LINE:([^:]+):(\d+)###\n([\s\S]*?)###FIX_END###/g;
      let fixMatch;
      while ((fixMatch = fixLineRegex.exec(fullContent)) !== null) {
        const filePath = fixMatch[1].trim();
        const lineNum = parseInt(fixMatch[2], 10);
        const newLine = fixMatch[3].trim();

        const targetFile = findFileByPath(currentFiles, filePath);
        if (targetFile?.content) {
          const lines = targetFile.content.split("\n");
          if (lineNum > 0 && lineNum <= lines.length) {
            lines[lineNum - 1] = newLine;
            const newContent = lines.join("\n");
            setFiles((prev) => updateFileContent(prev, targetFile.id, newContent));
            setTabs((prev) =>
              prev.map((t) =>
                t.fileId === targetFile.id ? { ...t, content: newContent, isDirty: true } : t
              )
            );
          }
        }
      }

      // PATCH parser
      const patchRegex = /###PATCH_START:([^:]+):(\d+):(\d+)###\n([\s\S]*?)###PATCH_END###/g;
      let patchMatch;
      while ((patchMatch = patchRegex.exec(fullContent)) !== null) {
        const filePath = patchMatch[1].trim();
        const startLine = parseInt(patchMatch[2], 10);
        const endLine = parseInt(patchMatch[3], 10);
        const newLinesRaw = patchMatch[4].trim();

        const targetFile = findFileByPath(currentFiles, filePath);
        if (targetFile?.content) {
          const lines = targetFile.content.split("\n");
          const before = lines.slice(0, startLine - 1);
          const after = lines.slice(endLine);
          const newContent = [...before, newLinesRaw, ...after].join("\n");
          setFiles((prev) => updateFileContent(prev, targetFile.id, newContent));
          setTabs((prev) =>
            prev.map((t) =>
              t.fileId === targetFile.id ? { ...t, content: newContent, isDirty: true } : t
            )
          );
        }
      }

      // EDITOR_START parser
      const editorRegex = /###EDITOR_START(?::([^\n#]+))?###\n([\s\S]*?)###EDITOR_END###/g;
      let editorMatch;
      while ((editorMatch = editorRegex.exec(fullContent)) !== null) {
        const filePath = editorMatch[1]?.trim();
        const codeToApply = editorMatch[2].trim();

        if (filePath) {
          const targetFile = findFileByPath(currentFiles, filePath);
          if (targetFile) {
            setFiles((prev) => updateFileContent(prev, targetFile.id, codeToApply));
            setTabs((prev) =>
              prev.map((t) =>
                t.fileId === targetFile.id ? { ...t, content: codeToApply, isDirty: true } : t
              )
            );
            const isOpen = tabsRef.current.some((t) => t.fileId === targetFile.id);
            if (!isOpen) {
              setTimeout(() => openFile(targetFile), 0);
            }
          } else {
            console.warn(`[Nuvuja] EDITOR_START: File not found: "${filePath}"`);
          }
        } else {
          const currentTabId = activeTabIdRef.current;
          if (currentTabId) {
            handleContentChange(currentTabId, codeToApply);
          }
        }
      }

      // FILE_START parser
      const fileRegex = /###FILE_START:([^\n]+?)(?:###)?\n([\s\S]*?)###FILE_END###/g;
      const fileEntries: Array<{ path: string; content: string }> = [];
      let fileMatch;

      while ((fileMatch = fileRegex.exec(fullContent)) !== null) {
        const path = fileMatch[1].trim();
        const content = fileMatch[2].trim();
        if (path && content) {
          fileEntries.push({ path, content });
        }
      }

      if (fileEntries.length > 0) {
        const projectNameMatch =
          fullContent.match(/Project Name:\s*(.+)/i) ||
          fullContent.match(/Folder name:\s*(.+)/i);
        const folderName = projectNameMatch
          ? projectNameMatch[1].trim().toLowerCase().replace(/\s+/g, "-")
          : `project-${Date.now()}`;

        const folderMap = new Map<string, FileNode>();
        const treeNodes: FileNode[] = [];

        for (const { path, content } of fileEntries) {
          const parts = path.split("/").filter(Boolean);
          if (parts.length === 0) continue;

          const fileName = parts.pop()!;
          let currentNodes = treeNodes;
          let currentPath = "";

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            let folder = folderMap.get(currentPath);
            if (!folder) {
              const parentPath = parts.slice(0, i).join("/");
              const parentId = parentPath ? folderMap.get(parentPath)?.id : undefined;

              folder = {
                id: generateId(),
                name: part,
                type: "folder",
                isOpen: true,
                children: [],
                parentId,
              };
              folderMap.set(currentPath, folder);
              currentNodes.push(folder);
            }
            currentNodes = folder.children!;
          }

          const parentPath = parts.join("/");
          const parentId = parentPath ? folderMap.get(parentPath)?.id : undefined;

          const fileNode: FileNode = {
            id: generateId(),
            name: fileName,
            type: "file",
            language: getLanguageFromFilename(fileName),
            content,
            parentId,
          };

          currentNodes.push(fileNode);
        }

        const setParentIds = (nodes: FileNode[], parentId?: string) => {
          for (const node of nodes) {
            node.parentId = parentId;
            if (node.children) {
              setParentIds(node.children, node.id);
            }
          }
        };
        setParentIds(treeNodes);

        const rootFolder: FileNode = {
          id: generateId(),
          name: folderName,
          type: "folder",
          isOpen: true,
          children: treeNodes,
        };

        if (treeNodes.length > 0) {
          setParentIds(treeNodes, rootFolder.id);
        }

        setFiles((prev) => [...prev, rootFolder]);

        const findFirstFile = (nodes: FileNode[]): FileNode | null => {
          for (const node of nodes) {
            if (node.type === "file") return node;
            if (node.children) {
              const found = findFirstFile(node.children);
              if (found) return found;
            }
          }
          return null;
        };
        const firstFile = findFirstFile(treeNodes);
        if (firstFile) {
          setTimeout(() => openFile(firstFile), 0);
        }
      }

      // REVIEW markers
      if (action === "review" && fullContent.includes("###REVIEW_START###")) {
        try {
          const match = fullContent.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
          if (match) {
            const review = JSON.parse(match[1].trim());
            if (review.issues) {
              const newMarkers = review.issues.map((issue: any) => ({
                startLineNumber: issue.line || 1,
                startColumn: 1,
                endLineNumber: issue.line || 1,
                endColumn: 100,
                message: issue.message,
                severity: issue.severity,
                suggestion: issue.suggestion,
              }));
              setMarkers(newMarkers);
            }
          }
        } catch {
          // Ignore review parse errors
        }
      }

      // Save assistant message
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentActiveChatId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, assistantMsg],
            updatedAt: Date.now(),
          };
        })
      );

      setAIStatus("ready");
      setIsConnected(true);

      // Auto-continue if needed
      if (needsContinuation && !isContinuation) {
        setContinuationContext(fullContent);
        setIsContinuing(true);
        setTimeout(() => {
          handleSendMessage("Continue from where you stopped. Do NOT repeat what you already wrote. Output ONLY the new content that follows.", action, true);
        }, 800);
      }
    } catch (error: any) {
      setAIStatus("error");
      setIsConnected(false);
      const errMsg = error?.message || "Unknown error";
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentActiveChatId) return chat;
          return {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: generateId(),
                role: "assistant",
                content: `Error: ${errMsg}. If this persists, check your API keys or refresh the page.`,
                timestamp: Date.now(),
              },
            ],
            updatedAt: Date.now(),
          };
        })
      );
    } finally {
      setIsAILoading(false);
      setIsContinuing(false);
    }
  }, [setChats, handleContentChange, openFile]);

  // ═══════════════════════════════════════════════════════════════════════════════
  // DERIVED STATE
  // ═══════════════════════════════════════════════════════════════════════════════

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const lineCount = activeTab?.content?.split("\n").length || 0;
  const charCount = activeTab?.content?.length || 0;

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  return (
    <NuvujaErrorBoundary>
      <div className="h-[100dvh] flex flex-col bg-slate-950 overflow-hidden nuvuja-root" data-theme={theme}>
        <Toolbar
          onRun={() => setViewMode((m) => m === "code" ? "split" : m === "split" ? "preview" : "code")}
          onSave={handleSave}
          onExport={handleExport}
          onToggleTheme={() => setTheme(theme === "light" ? "nuvuja-dark" : "light")}
          onOpenTutorial={() => setShowTutorial(true)}
          onLoadTemplate={handleLoadTemplate}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onSetViewMode={setViewMode}
          theme={theme}
          viewMode={viewMode}
          sidebarOpen={showSidebar}
          isRunning={viewMode !== "code"}
          hasChanges={tabs.some((t) => t.isDirty)}
        />

        <div className="flex-1 flex overflow-hidden min-h-0">
          <AnimatePresence initial={false} mode="wait">
            {showSidebar && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: sidebarWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 flex"
              >
                <div className="w-full h-full overflow-hidden">
                  <FileExplorer
                    files={files}
                    activeFileId={activeTab?.fileId || null}
                    onFileClick={openFile}
                    onToggleFolder={handleToggleFolder}
                    onAddFile={handleAddFile}
                    onDeleteNode={handleDeleteNode}
                    onRenameNode={handleRenameNode}
                  />
                </div>
                <div
                  className="w-1 cursor-col-resize hover:bg-purple-500/50 transition-colors shrink-0"
                  onMouseDown={() => setIsResizing(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex min-w-0 min-h-0 overflow-hidden">
            {(viewMode === "code" || viewMode === "split") && (
              <div className={cn("flex flex-col min-h-0 overflow-hidden", viewMode === "code" ? "flex-1" : "flex-1")}>
                <EditorPanel
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={handleTabChange}
                  onTabClose={handleTabClose}
                  onContentChange={handleContentChange}
                  theme={theme}
                  markers={markers}
                  onAskAI={(code, action) => {
                    setShowAI(true);
                    setTimeout(() => {
                      const input = document.querySelector('input[placeholder*="Ask ᓄᕙᔭ"]') as HTMLInputElement;
                      if (input) {
                        const prefix = action.includes("fix") ? "/fix" : action.includes("explain") ? "/explain" : "";
                        input.value = `${prefix} ${action}:\n\n\`\`\`\n${code.slice(0, 800)}\n\`\`\``;
                        input.focus();
                      }
                    }, 100);
                  }}
                />
              </div>
            )}

            {(viewMode === "preview" || viewMode === "split") && (
              <div className={cn("flex flex-col border-l border-slate-800/50 min-h-0 overflow-hidden", viewMode === "preview" ? "flex-1" : "w-[45%] shrink-0")}>
                <Preview
                  files={files}
                  onClose={() => setViewMode("code")}
                  onRefresh={() => {}}
                  isFullScreen={viewMode === "preview"}
                />
              </div>
            )}
          </div>
        </div>

        <AIPanel
          conversations={conversations}
          onSendMessage={handleSendMessage}
          onClearChat={() => {
            setChats((prev) =>
              prev.map((c) => (c.id === activeChatId ? { ...c, messages: [] } : c))
            );
          }}
          isLoading={isAILoading}
          currentCode={activeTab?.content || ""}
          currentLanguage={activeTab?.language || "plaintext"}
          onApplyCode={handleApplyCode}
          isOpen={showAI}
          onToggle={() => setShowAI(!showAI)}
          chats={chats}
          activeChatId={activeChatId}
          showChatList={showChatList}
          onToggleChatList={() => setShowChatList(!showChatList)}
          onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat}
          onRenameChat={handleRenameChat}
          onPinChat={handlePinChat}
          onDeleteChat={handleDeleteChat}
          hasConsoleErrors={consoleEntries.some((e) => e.type === "error")}
        />

        <ConsolePanel
          entries={consoleEntries}
          isOpen={showConsole}
          onToggle={() => setShowConsole(!showConsole)}
          onClear={() => setConsoleEntries([])}
        />

        <StatusBar
          language={activeTab?.language || "plaintext"}
          lineCount={lineCount}
          charCount={charCount}
          cursorLine={1}
          cursorColumn={1}
          isConnected={isConnected}
          aiStatus={aiStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      </div>
    </NuvujaErrorBoundary>
  );
}
