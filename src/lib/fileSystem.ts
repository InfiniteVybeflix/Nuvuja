import { FileNode } from "@/types";
import { generateId } from "./utils";

const STORAGE_KEY = "nuvuja-workspace";

export function createDefaultWorkspace(): FileNode[] {
  return [
    {
      id: "root-folder-1",
      name: "my-project",
      type: "folder",
      isOpen: true,
      children: [
        {
          id: generateId(),
          name: "index.html",
          type: "file",
          language: "html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuvuja Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Nuvuja</h1>
        <p>The cloud-born editor of infinite possibility.</p>
        <button id="magic">Cast Spell</button>
    </div>
    <script src="app.js"></script>
</body>
</html>`,
          parentId: "root-folder-1",
        },
        {
          id: generateId(),
          name: "style.css",
          type: "file",
          language: "css",
          content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #e2e8f0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    padding: 3rem;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    backdrop-filter: blur(20px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

h1 {
    font-size: 3rem;
    background: linear-gradient(135deg, #38bdf8, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

p {
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

button {
    padding: 1rem 2rem;
    font-size: 1rem;
    background: linear-gradient(135deg, #38bdf8, #a78bfa);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(56, 189, 248, 0.4);
}`,
          parentId: "root-folder-1",
        },
        {
          id: generateId(),
          name: "app.js",
          type: "file",
          language: "javascript",
          content: `document.getElementById('magic').addEventListener('click', () => {
    const messages = [
        "✨ The cloud whispers secrets...",
        "⚡ Lightning strikes your code!",
        "🌌 The aurora guides your logic...",
        "🔮 Nuvuja sees your potential..."
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = \`
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(15, 23, 42, 0.95);
        color: #38bdf8;
        padding: 2rem 3rem;
        border-radius: 16px;
        border: 1px solid #a78bfa;
        font-size: 1.5rem;
        z-index: 10000;
        animation: fadeIn 0.5s ease;
    \`;
    document.body.appendChild(div);

    setTimeout(() => {
        div.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => div.remove(), 500);
    }, 2000);
});

console.log("Nuvuja Editor initialized. The cloud is watching.");`,
          parentId: "root-folder-1",
        },
        {
          id: generateId(),
          name: "README.md",
          type: "file",
          language: "markdown",
          content: `# Nuvuja Project

Welcome to your new project created with **Nuvuja** — the cloud-born editor.

## Files

- \`index.html\` — Main HTML structure
- \`style.css\` — Styling with glassmorphism effects
- \`app.js\` — Interactive JavaScript

## Getting Started

1. Open any file in the editor
2. Ask Nuvuja AI for help (right panel)
3. Click Preview to see your changes live
4. Export your project when ready

## Nuvuja AI Commands

- \`/review\` — Review current file
- \`/fix\` — Fix errors automatically
- \`/explain\` — Explain selected code
- \`/generate\` — Generate new code

---
*Powered by Nuvuja Cloud Intelligence*`,
          parentId: "root-folder-1",
        },
      ],
    },
  ];
}

export function saveWorkspace(files: FileNode[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch {
    console.error("Failed to save workspace");
  }
}

export function loadWorkspace(): FileNode[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    console.error("Failed to load workspace");
  }
  return createDefaultWorkspace();
}

export function findFileById(files: FileNode[], id: string): FileNode | null {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateFileContent(files: FileNode[], id: string, content: string): FileNode[] {
  return files.map((file) => {
    if (file.id === id) {
      return { ...file, content };
    }
    if (file.children) {
      return { ...file, children: updateFileContent(file.children, id, content) };
    }
    return file;
  });
}

export function addFileNode(
  files: FileNode[],
  parentId: string | null,
  node: FileNode
): FileNode[] {
  if (!parentId) {
    return [...files, node];
  }
  return files.map((file) => {
    if (file.id === parentId && file.type === "folder") {
      return { ...file, children: [...(file.children || []), node], isOpen: true };
    }
    if (file.children) {
      return { ...file, children: addFileNode(file.children, parentId, node) };
    }
    return file;
  });
}

export function deleteFileNode(files: FileNode[], id: string): FileNode[] {
  return files
    .filter((file) => file.id !== id)
    .map((file) => {
      if (file.children) {
        return { ...file, children: deleteFileNode(file.children, id) };
      }
      return file;
    });
}

export function renameFileNode(files: FileNode[], id: string, newName: string): FileNode[] {
  return files.map((file) => {
    if (file.id === id) {
      const newLang = newName.includes(".") ? newName.split(".").pop() || "" : "";
      return {
        ...file,
        name: newName,
        language: newLang,
      };
    }
    if (file.children) {
      return { ...file, children: renameFileNode(file.children, id, newName) };
    }
    return file;
  });
}

export function toggleFolder(files: FileNode[], id: string): FileNode[] {
  return files.map((file) => {
    if (file.id === id && file.type === "folder") {
      return { ...file, isOpen: !file.isOpen };
    }
    if (file.children) {
      return { ...file, children: toggleFolder(file.children, id) };
    }
    return file;
  });
}

export function flattenFiles(files: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const file of files) {
    result.push(file);
    if (file.children) {
      result.push(...flattenFiles(file.children));
    }
  }
  return result;
}
