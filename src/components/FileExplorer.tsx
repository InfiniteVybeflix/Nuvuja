"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  FileType,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  File,
} from "lucide-react";
import { FileNode } from "@/types";
import { cn, generateId } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileClick: (file: FileNode) => void;
  onToggleFolder: (id: string) => void;
  onAddFile: (parentId: string | null, type: "file" | "folder") => void;
  onDeleteNode: (id: string) => void;
  onRenameNode: (id: string, newName: string) => void;
}

function getFileIcon(filename: string, isOpen?: boolean) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const props = { size: 16, className: "shrink-0" };

  if (["html", "htm"].includes(ext)) return <FileCode {...props} className="text-orange-400 shrink-0" />;
  if (["css", "scss", "sass", "less"].includes(ext)) return <FileCode {...props} className="text-sky-400 shrink-0" />;
  if (["js", "jsx", "ts", "tsx"].includes(ext)) return <FileCode {...props} className="text-yellow-400 shrink-0" />;
  if (["py"].includes(ext)) return <FileCode {...props} className="text-emerald-400 shrink-0" />;
  if (["json"].includes(ext)) return <FileJson {...props} className="text-amber-400 shrink-0" />;
  if (["md"].includes(ext)) return <FileText {...props} className="text-slate-400 shrink-0" />;
  if (["rs"].includes(ext)) return <FileCode {...props} className="text-orange-300 shrink-0" />;
  if (["go"].includes(ext)) return <FileCode {...props} className="text-cyan-400 shrink-0" />;
  if (["java"].includes(ext)) return <FileCode {...props} className="text-red-400 shrink-0" />;
  return <File {...props} className="text-slate-500 shrink-0" />;
}

function FileTreeItem({
  node,
  depth,
  activeFileId,
  onFileClick,
  onToggleFolder,
  onAddFile,
  onDeleteNode,
  onRenameNode,
}: {
  node: FileNode;
  depth: number;
  activeFileId: string | null;
} & Omit<FileExplorerProps, "files">) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const isActive = node.id === activeFileId;
  const isFolder = node.type === "folder";

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRenameNode(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer group transition-all select-none",
          isActive && "bg-sky-500/10 text-sky-300",
          !isActive && "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(node.id);
          } else {
            onFileClick(node);
          }
        }}
      >
        {isFolder && (
          <span className="text-slate-500">
            {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}

        {isFolder ? (
          node.isOpen ? (
            <FolderOpen size={16} className="text-amber-400 shrink-0" />
          ) : (
            <Folder size={16} className="text-amber-400 shrink-0" />
          )
        ) : (
          getFileIcon(node.name)
        )}

        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 text-slate-200 text-sm px-1.5 py-0.5 rounded border border-sky-500/50 outline-none w-32"
          />
        ) : (
          <span className="text-sm truncate flex-1">{node.name}</span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isFolder && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(!showAddMenu);
                }}
                className="p-1 rounded hover:bg-slate-700/50"
              >
                <Plus size={12} />
              </button>
              {showAddMenu && (
                <div className="absolute left-full top-0 ml-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 w-32 z-50 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFile(node.id, "file");
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 text-slate-300"
                  >
                    New File
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFile(node.id, "folder");
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 text-slate-300"
                  >
                    New Folder
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
              setRenameValue(node.name);
            }}
            className="p-1 rounded hover:bg-slate-700/50"
          >
            <Edit3 size={12} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${node.name}"?`)) {
                onDeleteNode(node.id);
              }
            }}
            className="p-1 rounded hover:bg-red-500/20 text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFolder && node.isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                activeFileId={activeFileId}
                onFileClick={onFileClick}
                onToggleFolder={onToggleFolder}
                onAddFile={onAddFile}
                onDeleteNode={onDeleteNode}
                onRenameNode={onRenameNode}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileExplorer({
  files,
  activeFileId,
  onFileClick,
  onToggleFolder,
  onAddFile,
  onDeleteNode,
  onRenameNode,
}: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col bg-slate-950/50 border-r border-slate-800/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Explorer</span>
        <div className="flex gap-1">
          <button
            onClick={() => onAddFile(null, "file")}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="New File"
          >
            <FileCode size={14} />
          </button>
          <button
            onClick={() => onAddFile(null, "folder")}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="New Folder"
          >
            <Folder size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {files.map((file) => (
          <FileTreeItem
            key={file.id}
            node={file}
            depth={0}
            activeFileId={activeFileId}
            onFileClick={onFileClick}
            onToggleFolder={onToggleFolder}
            onAddFile={onAddFile}
            onDeleteNode={onDeleteNode}
            onRenameNode={onRenameNode}
          />
        ))}
      </div>
    </div>
  );
}
