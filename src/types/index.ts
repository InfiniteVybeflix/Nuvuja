export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  parentId?: string | null;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export interface AIConversation {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    action?: "review" | "fix" | "explain" | "generate" | "chat";
  };
}

export interface EditorMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: "error" | "warning" | "info";
  code?: string;
  suggestion?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  files: FileNode[];
}

export type PanelSize = {
  sidebar: number;
  editor: number;
  ai: number;
};

export type ThemeMode = "nuvuja-dark" | "vs-dark" | "light";
