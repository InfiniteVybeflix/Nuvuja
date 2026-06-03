"use client";

import { useMemo } from "react";
import { FileNode } from "@/types";
import { X, RefreshCw } from "lucide-react";

interface PreviewProps {
  files: FileNode[];
  onClose: () => void;
  onRefresh: () => void;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function Preview({ files, onClose, onRefresh }: PreviewProps) {
  const srcDoc = useMemo(() => {
    const htmlFile = findFileByName(files, "index.html") || findFileByExtension(files, ".html");

    if (!htmlFile?.content) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #0f172a;
              color: #94a3b8;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
            }
            .container { padding: 2rem; }
            h2 { color: #e2e8f0; margin-bottom: 0.5rem; font-size: 1.5rem; }
            p { font-size: 0.875rem; color: #64748b; }
            .icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🌐</div>
            <h2>No HTML file found</h2>
            <p>Create an <code>index.html</code> file to see a live preview</p>
          </div>
        </body>
        </html>
      `;
    }

    let content = htmlFile.content;

    // Remove local <link rel="stylesheet"> tags that reference local files
    // Keep external CDN links (http://, https://, //)
    content = content.replace(
      /<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*\/?>/gi,
      ""
    );

    // Remove local <script src="..."> tags
    // Keep external CDN links
    content = content.replace(
      /<script[^>]*src=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*>\s*<\/script>/gi,
      ""
    );

    // Inject CSS files
    const cssFiles = findFilesByExtension(files, ".css");
    const cssContent = cssFiles.map((f) => f.content || "").join("\n");
    if (cssContent) {
      // Escape </style> tags inside CSS to prevent premature closing
      const safeCss = cssContent.replace(/<\/style>/gi, "<\/style>");
      const styleTag = `<style>\n${safeCss}\n</style>`;

      if (content.includes("</head>")) {
        content = content.replace("</head>", `${styleTag}\n</head>`);
      } else if (content.includes("<head>")) {
        content = content.replace("<head>", `<head>\n${styleTag}`);
      } else if (content.includes("<html>")) {
        content = content.replace("<html>", `<html>\n<head>\n${styleTag}\n</head>`);
      } else {
        content = `<style>\n${safeCss}\n</style>\n${content}`;
      }
    }

    // Inject JS files
    const jsFiles = findFilesByExtension(files, ".js");
    const jsContent = jsFiles.map((f) => f.content || "").join("\n");
    if (jsContent) {
      // Escape </script> tags inside JS to prevent premature closing
      const safeJs = jsContent.replace(/<\/script>/gi, "<\/script>");
      const scriptTag = `<script>\n${safeJs}\n</script>`;

      if (content.includes("</body>")) {
        content = content.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        content += `\n${scriptTag}`;
      }
    }

    return content;
  }, [files]);

  // Generate a key based on content hash to force iframe re-render when files change
  const iframeKey = useMemo(() => hashString(srcDoc), [srcDoc]);

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
            Live
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        <iframe
          key={iframeKey}
          srcDoc={srcDoc}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Preview"
        />
      </div>
    </div>
  );
}

function findFileByName(files: FileNode[], name: string): FileNode | undefined {
  for (const file of files) {
    if (file.name === name) return file;
    if (file.children) {
      const found = findFileByName(file.children, name);
      if (found) return found;
    }
  }
  return undefined;
}

function findFileByExtension(files: FileNode[], ext: string): FileNode | undefined {
  for (const file of files) {
    if (file.name.endsWith(ext)) return file;
    if (file.children) {
      const found = findFileByExtension(file.children, ext);
      if (found) return found;
    }
  }
  return undefined;
}

function findFilesByExtension(files: FileNode[], ext: string): FileNode[] {
  const result: FileNode[] = [];
  for (const file of files) {
    if (file.name.endsWith(ext)) result.push(file);
    if (file.children) {
      result.push(...findFilesByExtension(file.children, ext));
    }
  }
  return result;
}
