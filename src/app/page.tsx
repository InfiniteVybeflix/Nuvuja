"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { FileNode, EditorTab, AIConversation, ChatSession, ConsoleEntry } from "@/types";
import { generateId, getLanguageFromFilename } from "@/lib/utils";
import {
  createDefaultWorkspace,
  saveWorkspace,
  loadWorkspace,
  findFileById,
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

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Chat system
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("nuvuja-chats");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("nuvuja-active-chat");
    } catch { return null; }
  });
  const [showChatList, setShowChatList] = useState(false);

  const conversations = useMemo(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    return chat?.messages || [];
  }, [chats, activeChatId]);

  const [isAILoading, setIsAILoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [consoleEntries, setConsoleEntries] = useState<<ConsoleEntry[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [theme, setTheme] = useState<<"nuvuja-dark" | "light">("nuvuja-dark");
  const [aiStatus, setAIStatus] = useState("ready");
  const [isConnected, setIsConnected] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);

  // Initialize
  useEffect(() => {
    const saved = loadWorkspace();
    setFiles(saved);
    const htmlFile = findFileRecursive(saved, "index.html");
    if (htmlFile) {
      openFile(htmlFile);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      saveWorkspace(files);
    }, 30000);
    return () => clearInterval(interval);
  }, [files]);

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
  }, [showWelcome, files]);

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
  }, []);

  // Persist chats
  useEffect(() => {
    localStorage.setItem("nuvuja-chats", JSON.stringify(chats));
    if (activeChatId) localStorage.setItem("nuvuja-active-chat", activeChatId);
  }, [chats, activeChatId]);

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

  const findFileRecursive = (fileList: FileNode[], name: string): FileNode | null => {
    for (const f of fileList) {
      if (f.name === name) return f;
      if (f.children) {
        const found = findFileRecursive(f.children, name);
        if (found) return found;
      }
    }
    return null;
  };

  const openFile = useCallback((file: FileNode) => {
    if (file.type === "folder") return;
    const existingTab = tabs.find((t) => t.fileId === file.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    const newTab: EditorTab = {
      id: generateId(),
      fileId: file.id,
      name: file.name,
      language: file.language || getLanguageFromFilename(file.name),
      content: file.content || "",
      isDirty: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleContentChange = useCallback((tabId: string, content: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, content, isDirty: true } : t))
    );
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      setFiles((prev) => updateFileContent(prev, tab.fileId, content));
    }
  }, [tabs]);

  const handleSave = useCallback(() => {
    saveWorkspace(files);
    setTabs((prev) => prev.map((t) => ({ ...t, isDirty: false })));
  }, [files]);

  const handleExport = useCallback(async () => {
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
    addToZip(files);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuvuja-project.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [files]);

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
      openFile(newNode);
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
  }, []);

  const handleSwitchChat = useCallback((id: string) => {
    setActiveChatId(id);
    setShowChatList(false);
  }, []);

  const handleRenameChat = useCallback((id: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c))
    );
  }, []);

  const handlePinChat = useCallback((id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned, updatedAt: Date.now() } : c))
    );
  }, []);

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
  }, [activeChatId]);

  const handleApplyCode = useCallback((code: string) => {
    if (activeTabId) {
      handleContentChange(activeTabId, code);
    }
  }, [activeTabId, handleContentChange]);

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
      openFile(newFiles[0]);
    }
  }, [openFile]);

  const handleSendMessage = useCallback(async (message: string, action: "chat" | "review" | "fix" | "explain" | "generate" = "chat") => {
    if (!activeChatId) return;

    const userMsg: AIConversation = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChatId) return chat;
        const msgs = [...chat.messages, userMsg];
        const title =
          chat.messages.length === 0
            ? message.slice(0, 30).replace(/[^\w\s-]/g, "").trim() || "New Chat"
            : chat.title;
        return { ...chat, messages: msgs, title, updatedAt: Date.now() };
      })
    );

    setIsAILoading(true);
    setAIStatus("thinking");

    try {
      const activeChat = chats.find((c) => c.id === activeChatId);
      const chatMessages = activeChat?.messages || [];

      const buildProjectContext = (includeContent: boolean): string => {
        const lines: string[] = ["=== PROJECT FILES ==="];
        const walk = (nodes: FileNode[], prefix = "") => {
          for (const node of nodes) {
            if (node.type === "folder") {
              lines.push(`${prefix}📁 ${node.name}/`);
              if (node.children) walk(node.children, prefix + "  ");
            } else {
              lines.push(`${prefix}📄 ${node.name} (${node.language || "txt"})`);
              if (includeContent && node.content) {
                const truncated =
                  node.content.length > 2000
                    ? node.content.slice(0, 2000) + `\n... [${node.content.length - 2000} more chars]`
                    : node.content;
                lines.push(`${prefix}---`);
                lines.push(truncated);
                lines.push(`${prefix}---`);
              }
            }
          }
        };
        walk(files);
        return lines.join("\n");
      };

      const needsFullContext =
        action !== "chat" ||
        message.toLowerCase().includes("error") ||
        message.toLowerCase().includes("bug") ||
        message.toLowerCase().includes("fix") ||
        message.toLowerCase().includes("debug") ||
        message.toLowerCase().includes("project") ||
        message.toLowerCase().includes("all files");

      let apiContent = message;
      if (needsFullContext) {
        apiContent += "\n\n" + buildProjectContext(true);
      } else {
        apiContent += "\n\n" + buildProjectContext(false);
      }

      const recentErrors = consoleEntries
        .filter((e) => e.type === "error" || e.type === "warn")
        .slice(-5);
      if (recentErrors.length > 0 && (action === "fix" || message.toLowerCase().includes("error") || message.toLowerCase().includes("console"))) {
        apiContent += "\n\n=== CONSOLE OUTPUT ===\n";
        recentErrors.forEach((e) => {
          apiContent += `[${e.type.toUpperCase()}] ${e.message}\n`;
          if (e.stack) apiContent += `Stack: ${e.stack}\n`;
        });
        apiContent += "=== END CONSOLE ===";
      }

      const trimmedHistory = chatMessages.slice(-8);
      const apiMessages = [
        ...trimmedHistory.map((c) => ({ role: c.role, content: c.content })),
        { role: "user" as const, content: apiContent },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, action }),
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
                // Ignore
              }
            }
          }
        }
      }

      const assistantMsg: AIConversation = {
        id: generateId(),
        role: "assistant",
        content: fullContent,
        timestamp: Date.now(),
        metadata: { model, action },
      };

      // FIX_LINE parser
      const fixLineRegex = /###FIX_LINE:([^:]+):(\d+)###\n([\s\S]*?)###FIX_END###/g;
      let fixMatch;
      while ((fixMatch = fixLineRegex.exec(fullContent)) !== null) {
        const filePath = fixMatch[1].trim();
        const lineNum = parseInt(fixMatch[2], 10);
        const newLine = fixMatch[3].trim();

        const targetFile = findFileByPath(files, filePath);
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

        const targetFile = findFileByPath(files, filePath);
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
      const editorMatch = fullContent.match(/###EDITOR_START###([\s\S]*?)###EDITOR_END###/);
      if (editorMatch) {
        const codeToApply = editorMatch[1].trim();
        setActiveTabId((currentTabId) => {
          if (currentTabId) {
            handleContentChange(currentTabId, codeToApply);
          }
          return currentTabId;
        });
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
          // Ignore
        }
      }

      // Save assistant message
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
          return {
            ...chat,
            messages: [...chat.messages, assistantMsg],
            updatedAt: Date.now(),
          };
        })
      );

      setAIStatus("ready");
      setIsConnected(true);
    } catch (error: any) {
      setAIStatus("error");
      setIsConnected(false);
      const errMsg = error?.message || "Unknown error";
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== activeChatId) return chat;
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
    }
  }, [activeChatId, chats, files, consoleEntries, handleContentChange, openFile]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const lineCount = activeTab?.content?.split("\n").length || 0;
  const charCount = activeTab?.content?.length || 0;

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden" data-theme={theme}>
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
        <AnimatePresence initial={false}>
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
  );
}
