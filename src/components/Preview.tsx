"use client";

import { useMemo } from "react";
import { FileNode } from "@/types";
import { X, RefreshCw } from "lucide-react";

interface PreviewProps {
  files: FileNode[];
  onClose: () => void;
  onRefresh: () => void;
  isFullScreen?: boolean;
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

export function Preview({ files, onClose, onRefresh, isFullScreen }: PreviewProps) {
  const srcDoc = useMemo(() => {
    const htmlFile = findFileByName(files, "index.html") || findFileByExtension(files, ".html");

    if (!htmlFile?.content) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #0f172a;
              color: #94a3b8;
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 2rem;
            }
            .container { max-width: 400px; }
            h2 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1.25rem; font-weight: 600; }
            p { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
            .icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5; }
            code { background: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; color: #38bdf8; }
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

    // Remove local resource references (keep CDN links)
    content = content.replace(
      /<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*\/?>/gi,
      ""
    );
    content = content.replace(
      /<script[^>]*src=["'](?!https?:\/\/|\/\/|data:)[^"']*["'][^>]*>\s*<\/script>/gi,
      ""
    );

    // Inject CSS files
    const cssFiles = findFilesByExtension(files, ".css");
    const cssContent = cssFiles.map((f) => f.content || "").join("\n");
    if (cssContent) {
      const safeCss = cssContent.replace(/<\/style>/gi, "<\/style>");
      const styleTag = `<style>\n${safeCss}\n</style>`;
      if (content.includes("</head>")) {
        content = content.replace("</head>", `${styleTag}\n</head>`);
      } else if (content.includes("<head>")) {
        content = content.replace("<head>", `<head>\n${styleTag}`);
      } else if (content.includes("<html>")) {
        content = content.replace("<html>", `<html>\n<head>\n${styleTag}\n</head>`);
      } else {
        content = `${styleTag}\n${content}`;
      }
    }

    // Inject JS files
    const jsFiles = findFilesByExtension(files, ".js");
    const jsContent = jsFiles.map((f) => f.content || "").join("\n");
    if (jsContent) {
      const safeJs = jsContent.replace(/<<\/script>/gi, "<\/script>");
      const scriptTag = `<script>\n${safeJs}\n</script>`;
      if (content.includes("</body>")) {
        content = content.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        content += `\n${scriptTag}`;
      }
    }

    // Inject console interception
    const consoleScript = `<script>
(function(){
  if(window.__nuvujaConsoleHooked)return;
  window.__nuvujaConsoleHooked=true;
  const methods=['log','error','warn','info','debug','table','clear','assert','trace'];
  const originals={};
  methods.forEach(function(method){
    originals[method]=console[method];
    console[method]=function(){
      const args=Array.from(arguments);
      try{
        var serialized=args.map(function(arg){
          if(arg instanceof Error)return{__type:'Error',message:arg.message,stack:arg.stack,name:arg.name};
          if(arg===null)return null;
          if(arg===undefined)return undefined;
          if(typeof arg==='function')return arg.toString();
          if(typeof arg==='object'){try{return JSON.parse(JSON.stringify(arg));}catch(e){return Object.prototype.toString.call(arg);}}
          return arg;
        });
        window.parent.postMessage({source:'nuvuja-console',type:method,args:serialized,timestamp:Date.now()},'*');
      }catch(e){}
      originals[method].apply(console,args);
    };
  });
  window.onerror=function(msg,url,line,col,err){
    window.parent.postMessage({source:'nuvuja-console',type:'error',args:[String(msg),err?err.stack:''],timestamp:Date.now()},'*');
    return false;
  };
  window.onunhandledrejection=function(e){
    window.parent.postMessage({source:'nuvuja-console',type:'error',args:['Unhandled Promise Rejection:',e.reason?String(e.reason):''],timestamp:Date.now()},'*');
  };
})();
</script>`;

    if (content.includes("</head>")) {
      content = content.replace("</head>", consoleScript + "\n</head>");
    } else if (content.includes("<head>")) {
      content = content.replace("<head>", "<head>\n" + consoleScript);
    } else {
      content = consoleScript + "\n" + content;
    }

    return content;

  }, [files]);

  const iframeKey = useMemo(() => hashString(srcDoc), [srcDoc]);

  return (
    <div className="h-full flex flex-col bg-slate-950 min-h-0 min-w-0">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800/50 shrink-0">
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
            <RefreshCw size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Close Preview"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white min-h-0 min-w-0 relative overflow-hidden">
        <iframe
          key={iframeKey}
          srcDoc={srcDoc}
          className="w-full h-full border-0 absolute inset-0"
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
