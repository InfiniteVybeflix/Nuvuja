"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import { FileNode, EditorTab, AIConversation } from "@/types";
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

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [theme, setTheme] = useState("nuvuja-dark");
  const [aiStatus, setAIStatus] = useState("ready");
  const [isConnected, setIsConnected] = useState(true);
  const [markers, setMarkers] = useState<any[]>([]);

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
          setShowPreview((p) => !p);
        }
        if (e.key === "b") {
          e.preventDefault();
          setShowPreview((p) => !p);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWelcome, files]);

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

  const handleSendMessage = useCallback(async (message: string, action: "chat" | "review" | "fix" | "explain" | "generate" = "chat") => {
    const userMsg: AIConversation = {
      id: generateId(),
      role: "user",
      content: message,
      timestamp: Date.now(),
    };

    setConversations((prev) => [...prev, userMsg]);
    setIsAILoading(true);
    setAIStatus("thinking");

    try {
      const currentMessages = [...conversations, userMsg].map((c) => ({
        role: c.role,
        content: c.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
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
                // Ignore parse errors
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

      setConversations((prev) => [...prev, assistantMsg]);
      setAIStatus("ready");
      setIsConnected(true);

      // Check for editor markers from review
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
          // Ignore parse errors
        }
      }

      // Check for code to apply
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
    } catch (error) {
      setAIStatus("error");
      setIsConnected(false);
      setConversations((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please check your API configuration and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsAILoading(false);
    }
  }, [conversations, handleContentChange]);

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

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const lineCount = activeTab?.content?.split("\n").length || 0;
  const charCount = activeTab?.content?.length || 0;

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <Toolbar
        onRun={() => setShowPreview(!showPreview)}
        onSave={handleSave}
        onExport={handleExport}
        onToggleTheme={() => setTheme(theme === "light" ? "nuvuja-dark" : "light")}
        onOpenTutorial={() => setShowTutorial(true)}
        onLoadTemplate={handleLoadTemplate}
        theme={theme}
        isRunning={showPreview}
        hasChanges={tabs.some((t) => t.isDirty)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer - Collapsible */}
        <div className="w-56 shrink-0 bg-slate-950 border-r border-slate-800/50">
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

        {/* Main Content - Editor + Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor */}
          <div className="flex-1 flex min-h-0">
            <div className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", showPreview && "w-1/2")}>
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

            {/* Preview - Side by side */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "50%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-l border-slate-800/50 overflow-hidden shrink-0"
                >
                  <Preview
                    files={files}
                    onClose={() => setShowPreview(false)}
                    onRefresh={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* AI Panel - Floating Overlay */}
      <AIPanel
        conversations={conversations}
        onSendMessage={handleSendMessage}
        onClearChat={() => setConversations([])}
        isLoading={isAILoading}
        currentCode={activeTab?.content || ""}
        currentLanguage={activeTab?.language || "plaintext"}
        onApplyCode={handleApplyCode}
        isOpen={showAI}
        onToggle={() => setShowAI(!showAI)}
      />

      <StatusBar
        language={activeTab?.language || "plaintext"}
        lineCount={lineCount}
        charCount={charCount}
        cursorLine={1}
        cursorColumn={1}
        isConnected={isConnected}
        aiStatus={aiStatus}
      />

      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
