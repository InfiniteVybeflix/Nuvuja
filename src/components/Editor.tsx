"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { EditorTab } from "@/types";
import { cn } from "@/lib/utils";
import {
  X, Circle, ChevronLeft, ChevronRight,
  Scissors, Copy, ClipboardPaste, Braces,
  Code, MessageSquare, Type, Hash, AtSign,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  WrapText, Search, Replace, Undo2, Redo2,
  Bug, Sparkles, Zap, AlignLeft,
  Terminal, Brackets, Quote, Parentheses,
  GripVertical
} from "lucide-react";

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabChange: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange: (tabId: string, content: string) => void;
  theme: string;
  markers?: any[];
  onAskAI?: (code: string, action: string) => void;
}

// ─── LANGUAGE SNIPPETS ─────────────────────────────────────────────
const SNIPPETS: Record<string, Array<{ label: string; insertText: string; detail: string; kind: string }>> = {
  html: [
    { label: "html5", insertText: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>${1:Title}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>", detail: "HTML5 boilerplate", kind: "Snippet" },
    { label: "div", insertText: "<div${1: class=\"${2}\"}>${3}</div>", detail: "Div element", kind: "Tag" },
    { label: "h1", insertText: "<h1>${1}</h1>", detail: "Heading 1", kind: "Tag" },
    { label: "h2", insertText: "<h2>${1}</h2>", detail: "Heading 2", kind: "Tag" },
    { label: "p", insertText: "<p>${1}</p>", detail: "Paragraph", kind: "Tag" },
    { label: "a", insertText: "<a href=\"${1:#}\">${2}</a>", detail: "Anchor link", kind: "Tag" },
    { label: "img", insertText: "<img src=\"${1}\" alt=\"${2}\">", detail: "Image", kind: "Tag" },
    { label: "button", insertText: "<button${1: type=\"${2:button}\">${3}</button>", detail: "Button", kind: "Tag" },
    { label: "input", insertText: "<input type=\"${1:text}\"${2: placeholder=\"${3}\"}>", detail: "Input field", kind: "Tag" },
    { label: "form", insertText: "<form action=\"${1}\" method=\"${2:post}\">\n  ${3}\n</form>", detail: "Form", kind: "Tag" },
    { label: "ul", insertText: "<ul>\n  <li>${1}</li>\n</ul>", detail: "Unordered list", kind: "Tag" },
    { label: "ol", insertText: "<ol>\n  <li>${1}</li>\n</ol>", detail: "Ordered list", kind: "Tag" },
    { label: "table", insertText: "<table>\n  <tr>\n    <th>${1}</th>\n  </tr>\n  <tr>\n    <td>${2}</td>\n  </tr>\n</table>", detail: "Table", kind: "Tag" },
    { label: "script", insertText: "<script>\n  ${1}\n</script>", detail: "Script block", kind: "Tag" },
    { label: "style", insertText: "<style>\n  ${1}\n</style>", detail: "Style block", kind: "Tag" },
    { label: "link-css", insertText: "<link rel=\"stylesheet\" href=\"${1:style.css}\">", detail: "CSS link", kind: "Tag" },
    { label: "meta-viewport", insertText: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">", detail: "Viewport meta", kind: "Tag" },
    { label: "section", insertText: "<section${1: class=\"${2}\"}>${3}</section>", detail: "Section", kind: "Tag" },
    { label: "article", insertText: "<article>${1}</article>", detail: "Article", kind: "Tag" },
    { label: "nav", insertText: "<nav>${1}</nav>", detail: "Navigation", kind: "Tag" },
    { label: "header", insertText: "<header>${1}</header>", detail: "Header", kind: "Tag" },
    { label: "footer", insertText: "<footer>${1}</footer>", detail: "Footer", kind: "Tag" },
    { label: "main", insertText: "<main>${1}</main>", detail: "Main content", kind: "Tag" },
    { label: "aside", insertText: "<aside>${1}</aside>", detail: "Sidebar", kind: "Tag" },
    { label: "canvas", insertText: "<canvas id=\"${1}\" width=\"${2:300}\" height=\"${3:150}\"></canvas>", detail: "Canvas", kind: "Tag" },
    { label: "video", insertText: "<video controls>\n  <source src=\"${1}\" type=\"${2:video/mp4}\">\n</video>", detail: "Video", kind: "Tag" },
    { label: "audio", insertText: "<audio controls>\n  <source src=\"${1}\" type=\"${2:audio/mpeg}\">\n</audio>", detail: "Audio", kind: "Tag" },
  ],
  css: [
    { label: "flex-center", insertText: "display: flex;\njustify-content: center;\nalign-items: center;", detail: "Flexbox center", kind: "Snippet" },
    { label: "grid-2", insertText: "display: grid;\ngrid-template-columns: repeat(2, 1fr);\ngap: ${1:1rem};", detail: "2-column grid", kind: "Snippet" },
    { label: "grid-3", insertText: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: ${1:1rem};", detail: "3-column grid", kind: "Snippet" },
    { label: "absolute-fill", insertText: "position: absolute;\ntop: 0;\nleft: 0;\nright: 0;\nbottom: 0;", detail: "Absolute fill", kind: "Snippet" },
    { label: "media-mobile", insertText: "@media (max-width: 768px) {\n  ${1}\n}", detail: "Mobile breakpoint", kind: "Snippet" },
    { label: "keyframes", insertText: "@keyframes ${1:fadeIn} {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}", detail: "Keyframes animation", kind: "Snippet" },
    { label: "transition", insertText: "transition: ${1:all} ${2:0.3s} ${3:ease};", detail: "Transition", kind: "Property" },
    { label: "transform", insertText: "transform: ${1:translate(-50%, -50%)};", detail: "Transform", kind: "Property" },
    { label: "box-shadow", insertText: "box-shadow: 0 ${1:4}px ${2:6}px rgba(0, 0, 0, ${3:0.1});", detail: "Box shadow", kind: "Property" },
    { label: "text-gradient", insertText: "background: linear-gradient(${1:135deg}, ${2:#38bdf8}, ${3:#a78bfa});\n-webkit-background-clip: text;\n-webkit-text-fill-color: transparent;", detail: "Text gradient", kind: "Snippet" },
    { label: "glass", insertText: "background: rgba(255, 255, 255, ${1:0.1});\nbackdrop-filter: blur(${2:10}px);\nborder: 1px solid rgba(255, 255, 255, ${3:0.2});", detail: "Glassmorphism", kind: "Snippet" },
    { label: "reset", insertText: "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}", detail: "CSS reset", kind: "Snippet" },
    { label: "hover-scale", insertText: "transition: transform 0.3s ease;\n&:hover {\n  transform: scale(${1:1.05});\n}", detail: "Hover scale", kind: "Snippet" },
    { label: "scrollbar-hide", insertText: "&::-webkit-scrollbar {\n  display: none;\n}\n-ms-overflow-style: none;\nscrollbar-width: none;", detail: "Hide scrollbar", kind: "Snippet" },
    { label: "line-clamp", insertText: "display: -webkit-box;\n-webkit-line-clamp: ${1:3};\n-webkit-box-orient: vertical;\noverflow: hidden;", detail: "Line clamp", kind: "Snippet" },
    { label: "aspect-ratio", insertText: "aspect-ratio: ${1:16} / ${2:9};", detail: "Aspect ratio", kind: "Property" },
    { label: "container-query", insertText: "@container (min-width: ${1:400px}) {\n  ${2}\n}", detail: "Container query", kind: "Snippet" },
    { label: "dark-mode", insertText: "@media (prefers-color-scheme: dark) {\n  ${1}\n}", detail: "Dark mode media query", kind: "Snippet" },
    { label: "custom-prop", insertText: "--${1:primary}: ${2:#3b82f6};", detail: "CSS custom property", kind: "Property" },
    { label: "clamp", insertText: "font-size: clamp(${1:1rem}, ${2:2.5vw}, ${3:2rem});", detail: "Fluid typography", kind: "Property" },
  ],
  javascript: [
    { label: "log", insertText: "console.log(${1});", detail: "Console log", kind: "Function" },
    { label: "error", insertText: "console.error(${1});", detail: "Console error", kind: "Function" },
    { label: "fn", insertText: "function ${1:name}(${2}) {\n  ${3}\n}", detail: "Function declaration", kind: "Snippet" },
    { label: "arrow", insertText: "const ${1:name} = (${2}) => {\n  ${3}\n};", detail: "Arrow function", kind: "Snippet" },
    { label: "async-arrow", insertText: "const ${1:name} = async (${2}) => {\n  ${3}\n};", detail: "Async arrow function", kind: "Snippet" },
    { label: "if", insertText: "if (${1:condition}) {\n  ${2}\n}", detail: "If statement", kind: "Snippet" },
    { label: "if-else", insertText: "if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}", detail: "If-else statement", kind: "Snippet" },
    { label: "for", insertText: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3}\n}", detail: "For loop", kind: "Snippet" },
    { label: "for-of", insertText: "for (const ${1:item} of ${2:array}) {\n  ${3}\n}", detail: "For-of loop", kind: "Snippet" },
    { label: "for-in", insertText: "for (const ${1:key} in ${2:obj}) {\n  ${3}\n}", detail: "For-in loop", kind: "Snippet" },
    { label: "while", insertText: "while (${1:condition}) {\n  ${2}\n}", detail: "While loop", kind: "Snippet" },
    { label: "switch", insertText: "switch (${1:expr}) {\n  case ${2:value}:\n    ${3}\n    break;\n  default:\n    ${4}\n}", detail: "Switch statement", kind: "Snippet" },
    { label: "try", insertText: "try {\n  ${1}\n} catch (${2:err}) {\n  ${3}\n}", detail: "Try-catch", kind: "Snippet" },
    { label: "try-finally", insertText: "try {\n  ${1}\n} catch (${2:err}) {\n  ${3}\n} finally {\n  ${4}\n}", detail: "Try-catch-finally", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name} {\n  constructor(${2}) {\n    ${3}\n  }\n}", detail: "Class", kind: "Snippet" },
    { label: "class-extends", insertText: "class ${1:Name} extends ${2:Parent} {\n  constructor(${3}) {\n    super(${4});\n    ${5}\n  }\n}", detail: "Class extends", kind: "Snippet" },
    { label: "import", insertText: "import { ${1} } from '${2}';", detail: "Named import", kind: "Snippet" },
    { label: "import-default", insertText: "import ${1} from '${2}';", detail: "Default import", kind: "Snippet" },
    { label: "export-default", insertText: "export default ${1};", detail: "Default export", kind: "Snippet" },
    { label: "export-named", insertText: "export { ${1} };", detail: "Named export", kind: "Snippet" },
    { label: "fetch", insertText: "fetch('${1:url}')\n  .then(res => res.json())\n  .then(data => {\n    ${2}\n  })\n  .catch(err => console.error(err));", detail: "Fetch API", kind: "Snippet" },
    { label: "fetch-async", insertText: "const ${1:data} = await fetch('${2:url}');\nconst ${3:result} = await ${1:data}.json();", detail: "Async fetch", kind: "Snippet" },
    { label: "setTimeout", insertText: "setTimeout(() => {\n  ${1}\n}, ${2:1000});", detail: "Set timeout", kind: "Snippet" },
    { label: "setInterval", insertText: "setInterval(() => {\n  ${1}\n}, ${2:1000});", detail: "Set interval", kind: "Snippet" },
    { label: "addEventListener", insertText: "document.getElementById('${1}').addEventListener('${2:click}', (${3:e}) => {\n  ${4}\n});", detail: "Event listener", kind: "Snippet" },
    { label: "querySelector", insertText: "document.querySelector('${1}')", detail: "Query selector", kind: "Function" },
    { label: "querySelectorAll", insertText: "document.querySelectorAll('${1}')", detail: "Query selector all", kind: "Function" },
    { label: "localStorage", insertText: "localStorage.setItem('${1:key}', JSON.stringify(${2}));", detail: "LocalStorage set", kind: "Snippet" },
    { label: "debounce", insertText: "const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};", detail: "Debounce utility", kind: "Snippet" },
    { label: "throttle", insertText: "const throttle = (fn, ms) => {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= ms) {\n      last = now;\n      fn(...args);\n    }\n  };\n};", detail: "Throttle utility", kind: "Snippet" },
    { label: "map", insertText: "${1:array}.map((${2:item}) => ${3});", detail: "Array map", kind: "Function" },
    { label: "filter", insertText: "${1:array}.filter((${2:item}) => ${3});", detail: "Array filter", kind: "Function" },
    { label: "reduce", insertText: "${1:array}.reduce((acc, ${2:item}) => ${3}, ${4:initial});", detail: "Array reduce", kind: "Function" },
    { label: "find", insertText: "${1:array}.find((${2:item}) => ${3});", detail: "Array find", kind: "Function" },
    { label: "promise", insertText: "new Promise((resolve, reject) => {\n  ${1}\n});", detail: "New Promise", kind: "Snippet" },
    { label: "promise-all", insertText: "Promise.all([${1}])\n  .then(results => {\n    ${2}\n  })\n  .catch(err => console.error(err));", detail: "Promise.all", kind: "Snippet" },
    { label: "module", insertText: "(function() {\n  'use strict';\n  ${1}\n})();", detail: "IIFE module", kind: "Snippet" },
  ],
  typescript: [
    { label: "interface", insertText: "interface ${1:Name} {\n  ${2}: ${3:type};\n}", detail: "Interface", kind: "Snippet" },
    { label: "type", insertText: "type ${1:Name} = ${2};", detail: "Type alias", kind: "Snippet" },
    { label: "enum", insertText: "enum ${1:Name} {\n  ${2} = ${3},\n}", detail: "Enum", kind: "Snippet" },
    { label: "generic", insertText: "function ${1:name}<T>(${2:arg}: T): T {\n  return ${2:arg};\n}", detail: "Generic function", kind: "Snippet" },
    { label: "extends", insertText: "interface ${1:Name} extends ${2:Parent} {\n  ${3}\n}", detail: "Interface extends", kind: "Snippet" },
    { label: "implements", insertText: "class ${1:Name} implements ${2:Interface} {\n  ${3}\n}", detail: "Class implements", kind: "Snippet" },
    { label: "readonly", insertText: "readonly ${1:name}: ${2:type};", detail: "Readonly property", kind: "Property" },
    { label: "optional", insertText: "${1:name}?: ${2:type};", detail: "Optional property", kind: "Property" },
    { label: "union", insertText: "type ${1:Name} = ${2:A} | ${3:B};", detail: "Union type", kind: "Snippet" },
    { label: "intersection", insertText: "type ${1:Name} = ${2:A} & ${3:B};", detail: "Intersection type", kind: "Snippet" },
    { label: "mapped", insertText: "type ${1:Mapped} = {\n  [K in keyof ${2:T}]: ${3:T[K]};\n};", detail: "Mapped type", kind: "Snippet" },
    { label: "utility-partial", insertText: "Partial<<${1:T}>", detail: "Partial utility", kind: "Type" },
    { label: "utility-required", insertText: "Required<<${1:T}>", detail: "Required utility", kind: "Type" },
    { label: "utility-pick", insertText: "Pick<<${1:T}, '${2:key}'>", detail: "Pick utility", kind: "Type" },
    { label: "utility-omit", insertText: "Omit<<${1:T}, '${2:key}'>", detail: "Omit utility", kind: "Type" },
    { label: "utility-record", insertText: "Record<<${1:string}, ${2:any}>", detail: "Record utility", kind: "Type" },
    { label: "decorator", insertText: "@${1:decorator}(${2})", detail: "Decorator", kind: "Snippet" },
    { label: "namespace", insertText: "namespace ${1:Name} {\n  export ${2}\n}", detail: "Namespace", kind: "Snippet" },
    { label: "declare", insertText: "declare module '${1}' {\n  ${2}\n}", detail: "Module declaration", kind: "Snippet" },
  ],
  python: [
    { label: "def", insertText: "def ${1:name}(${2}):\n    ${3:pass}", detail: "Function", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name}:\n    def __init__(self${2}):\n        ${3:pass}", detail: "Class", kind: "Snippet" },
    { label: "if", insertText: "if ${1:condition}:\n    ${2:pass}", detail: "If statement", kind: "Snippet" },
    { label: "if-else", insertText: "if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}", detail: "If-else", kind: "Snippet" },
    { label: "for", insertText: "for ${1:item} in ${2:iterable}:\n    ${3:pass}", detail: "For loop", kind: "Snippet" },
    { label: "while", insertText: "while ${1:condition}:\n    ${2:pass}", detail: "While loop", kind: "Snippet" },
    { label: "try", insertText: "try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:print(e)}", detail: "Try-except", kind: "Snippet" },
    { label: "try-finally", insertText: "try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:print(e)}\nfinally:\n    ${4:pass}", detail: "Try-except-finally", kind: "Snippet" },
    { label: "with", insertText: "with ${1:open('file')} as f:\n    ${2:pass}", detail: "Context manager", kind: "Snippet" },
    { label: "list-comp", insertText: "[${1:x} for ${1:x} in ${2:range(10)}]", detail: "List comprehension", kind: "Snippet" },
    { label: "dict-comp", insertText: "{${1:k}: ${2:v} for ${1:k}, ${2:v} in ${3:items}}", detail: "Dict comprehension", kind: "Snippet" },
    { label: "lambda", insertText: "lambda ${1:x}: ${2:x}", detail: "Lambda", kind: "Snippet" },
    { label: "import", insertText: "import ${1:module}", detail: "Import", kind: "Snippet" },
    { label: "from-import", insertText: "from ${1:module} import ${2:name}", detail: "From import", kind: "Snippet" },
    { label: "print", insertText: "print(${1})", detail: "Print", kind: "Function" },
    { label: "main", insertText: "if __name__ == '__main__':\n    ${1:main()}", detail: "Main guard", kind: "Snippet" },
    { label: "requests", insertText: "import requests\n\nresponse = requests.${1:get}('${2:url}')\ndata = response.json()", detail: "HTTP request", kind: "Snippet" },
    { label: "flask-route", insertText: "@app.route('${1:/}')\ndef ${2:index}():\n    return '${3:Hello}'", detail: "Flask route", kind: "Snippet" },
    { label: "django-view", insertText: "from django.http import JsonResponse\n\ndef ${1:view}(request):\n    return JsonResponse({'${2:key}': ${3:value}})", detail: "Django view", kind: "Snippet" },
    { label: "pandas", insertText: "import pandas as pd\n\ndf = pd.DataFrame(${1:data})\nprint(df.head())", detail: "Pandas DataFrame", kind: "Snippet" },
    { label: "numpy", insertText: "import numpy as np\n\narr = np.array([${1:1, 2, 3}])\nprint(arr)", detail: "NumPy array", kind: "Snippet" },
  ],
  json: [
    { label: "obj", insertText: "{\n  \"${1:key}\": \"${2:value}\"\n}", detail: "Object", kind: "Snippet" },
    { label: "arr", insertText: "[\n  ${1}\n]", detail: "Array", kind: "Snippet" },
    { label: "str", insertText: "\"${1}\"", detail: "String", kind: "Value" },
    { label: "num", insertText: "${1:0}", detail: "Number", kind: "Value" },
    { label: "bool", insertText: "${1|true,false|}", detail: "Boolean", kind: "Value" },
    { label: "null", insertText: "null", detail: "Null", kind: "Value" },
  ],
  markdown: [
    { label: "h1", insertText: "# ${1}", detail: "Heading 1", kind: "Snippet" },
    { label: "h2", insertText: "## ${1}", detail: "Heading 2", kind: "Snippet" },
    { label: "h3", insertText: "### ${1}", detail: "Heading 3", kind: "Snippet" },
    { label: "link", insertText: "[${1:text}](${2:url})", detail: "Link", kind: "Snippet" },
    { label: "image", insertText: "![${1:alt}](${2:url})", detail: "Image", kind: "Snippet" },
    { label: "code", insertText: "```${1:language}\n${2}\n```", detail: "Code block", kind: "Snippet" },
    { label: "table", insertText: "| ${1:Header} | ${2:Header} |\n| --- | --- |\n| ${3:Cell} | ${4:Cell} |", detail: "Table", kind: "Snippet" },
    { label: "quote", insertText: "> ${1}", detail: "Blockquote", kind: "Snippet" },
    { label: "checkbox", insertText: "- [ ] ${1}", detail: "Checkbox", kind: "Snippet" },
    { label: "hr", insertText: "---\n", detail: "Horizontal rule", kind: "Snippet" },
  ],
  sql: [
    { label: "select", insertText: "SELECT ${1:*} FROM ${2:table} WHERE ${3:condition};", detail: "Select", kind: "Snippet" },
    { label: "insert", insertText: "INSERT INTO ${1:table} (${2:columns}) VALUES (${3:values});", detail: "Insert", kind: "Snippet" },
    { label: "update", insertText: "UPDATE ${1:table} SET ${2:column} = ${3:value} WHERE ${4:condition};", detail: "Update", kind: "Snippet" },
    { label: "delete", insertText: "DELETE FROM ${1:table} WHERE ${2:condition};", detail: "Delete", kind: "Snippet" },
    { label: "join", insertText: "SELECT * FROM ${1:a} JOIN ${2:b} ON ${1:a}.${3:id} = ${2:b}.${3:id};", detail: "Join", kind: "Snippet" },
    { label: "create-table", insertText: "CREATE TABLE ${1:name} (\n  id INT PRIMARY KEY,\n  ${2:column} ${3:TYPE}\n);", detail: "Create table", kind: "Snippet" },
    { label: "alter", insertText: "ALTER TABLE ${1:table} ADD COLUMN ${2:name} ${3:TYPE};", detail: "Alter table", kind: "Snippet" },
    { label: "index", insertText: "CREATE INDEX ${1:idx} ON ${2:table}(${3:column});", detail: "Create index", kind: "Snippet" },
  ],
  shell: [
    { label: "shebang", insertText: "#!/bin/bash\n\n${1}", detail: "Shebang", kind: "Snippet" },
    { label: "if", insertText: "if [ ${1:condition} ]; then\n  ${2}\nfi", detail: "If statement", kind: "Snippet" },
    { label: "for", insertText: "for ${1:item} in ${2:list}; do\n  ${3}\ndone", detail: "For loop", kind: "Snippet" },
    { label: "while", insertText: "while [ ${1:condition} ]; do\n  ${2}\ndone", detail: "While loop", kind: "Snippet" },
    { label: "function", insertText: "${1:name}() {\n  ${2}\n}", detail: "Function", kind: "Snippet" },
    { label: "case", insertText: "case ${1:var} in\n  ${2:pattern})\n    ${3}\n    ;;\nesac", detail: "Case statement", kind: "Snippet" },
    { label: "echo", insertText: "echo \"${1}\"", detail: "Echo", kind: "Function" },
    { label: "export", insertText: "export ${1:VAR}=\"${2:value}\"", detail: "Export variable", kind: "Snippet" },
    { label: "curl", insertText: "curl -X ${1|GET,POST,PUT,DELETE|} \"${2:url}\"", detail: "Curl request", kind: "Snippet" },
    { label: "chmod", insertText: "chmod ${1|+x,755,644|} ${2:file}", detail: "Chmod", kind: "Snippet" },
  ],
  go: [
    { label: "package", insertText: "package ${1:main}\n\nimport \"fmt\"\n\nfunc main() {\n\t${2}\n}", detail: "Main package", kind: "Snippet" },
    { label: "func", insertText: "func ${1:name}(${2}) ${3:error} {\n\t${4}\n}", detail: "Function", kind: "Snippet" },
    { label: "struct", insertText: "type ${1:Name} struct {\n\t${2:Field} ${3:type}\n}", detail: "Struct", kind: "Snippet" },
    { label: "interface", insertText: "type ${1:Name} interface {\n\t${2:Method}() ${3:error}\n}", detail: "Interface", kind: "Snippet" },
    { label: "goroutine", insertText: "go func() {\n\t${1}\n}()", detail: "Goroutine", kind: "Snippet" },
    { label: "channel", insertText: "${1:ch} := make(chan ${2:type})", detail: "Channel", kind: "Snippet" },
    { label: "select", insertText: "select {\ncase ${1:v} := <-${2:ch}:\n\t${3}\ndefault:\n\t${4}\n}", detail: "Select", kind: "Snippet" },
    { label: "defer", insertText: "defer ${1:func}()", detail: "Defer", kind: "Snippet" },
    { label: "error-check", insertText: "if err != nil {\n\treturn ${1:err}\n}", detail: "Error check", kind: "Snippet" },
  ],
  rust: [
    { label: "fn", insertText: "fn ${1:name}(${2}) ${3:-> ${4:type}} {\n    ${5}\n}", detail: "Function", kind: "Snippet" },
    { label: "struct", insertText: "struct ${1:Name} {\n    ${2:field}: ${3:type},\n}", detail: "Struct", kind: "Snippet" },
    { label: "impl", insertText: "impl ${1:Name} {\n    ${2}\n}", detail: "Impl block", kind: "Snippet" },
    { label: "trait", insertText: "trait ${1:Name} {\n    fn ${2:method}(&self);\n}", detail: "Trait", kind: "Snippet" },
    { label: "match", insertText: "match ${1:expr} {\n    ${2:pattern} => ${3},\n    _ => ${4},\n}", detail: "Match", kind: "Snippet" },
    { label: "if-let", insertText: "if let ${1:Some(x)} = ${2:expr} {\n    ${3}\n}", detail: "If let", kind: "Snippet" },
    { label: "result", insertText: "Result<<${1:T}, ${2:E}>", detail: "Result type", kind: "Type" },
    { label: "option", insertText: "Option<<${1:T}>", detail: "Option type", kind: "Type" },
    { label: "vec", insertText: "vec![${1}]", detail: "Vector macro", kind: "Macro" },
    { label: "println", insertText: "println!(\"${1}\", ${2});", detail: "Println macro", kind: "Macro" },
  ],
  java: [
    { label: "class", insertText: "public class ${1:Name} {\n    public static void main(String[] args) {\n        ${2}\n    }\n}", detail: "Main class", kind: "Snippet" },
    { label: "method", insertText: "public ${1:void} ${2:name}(${3}) {\n    ${4}\n}", detail: "Method", kind: "Snippet" },
    { label: "constructor", insertText: "public ${1:Name}(${2}) {\n    ${3}\n}", detail: "Constructor", kind: "Snippet" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3}\n}", detail: "For loop", kind: "Snippet" },
    { label: "foreach", insertText: "for (${1:Type} ${2:item} : ${3:collection}) {\n    ${4}\n}", detail: "For-each", kind: "Snippet" },
    { label: "if", insertText: "if (${1:condition}) {\n    ${2}\n}", detail: "If statement", kind: "Snippet" },
    { label: "try", insertText: "try {\n    ${1}\n} catch (${2:Exception} e) {\n    ${3}\n}", detail: "Try-catch", kind: "Snippet" },
    { label: "sout", insertText: "System.out.println(${1});", detail: "Print line", kind: "Snippet" },
    { label: "scanner", insertText: "Scanner scanner = new Scanner(System.in);\n${1:String} ${2:input} = scanner.nextLine();", detail: "Scanner input", kind: "Snippet" },
  ],
  cpp: [
    { label: "main", insertText: "int main() {\n    ${1}\n    return 0;\n}", detail: "Main function", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name} {\npublic:\n    ${2:Name}();\n    ~${2:Name}();\n};", detail: "Class", kind: "Snippet" },
    { label: "for", insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3}\n}", detail: "For loop", kind: "Snippet" },
    { label: "if", insertText: "if (${1:condition}) {\n    ${2}\n}", detail: "If statement", kind: "Snippet" },
    { label: "cout", insertText: "std::cout << ${1} << std::endl;", detail: "Cout", kind: "Snippet" },
    { label: "vector", insertText: "std::vector<<${1:int}> ${2:name};", detail: "Vector", kind: "Snippet" },
    { label: "map", insertText: "std::map<<${1:string}, ${2:int}> ${3:name};", detail: "Map", kind: "Snippet" },
  ],
  php: [
    { label: "php", insertText: "<?php\n${1}\n?>", detail: "PHP tags", kind: "Snippet" },
    { label: "echo", insertText: "echo ${1};", detail: "Echo", kind: "Snippet" },
    { label: "function", insertText: "function ${1:name}(${2}) {\n    ${3}\n}", detail: "Function", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name} {\n    ${2}\n}", detail: "Class", kind: "Snippet" },
    { label: "array", insertText: "array(${1})", detail: "Array", kind: "Function" },
    { label: "foreach", insertText: "foreach (${1:\\$array} as ${2:\\$key} => ${3:\\$value}) {\n    ${4}\n}", detail: "Foreach", kind: "Snippet" },
    { label: "pdo", insertText: "\\$pdo = new PDO('mysql:host=${1:localhost};dbname=${2:test}', '${3:root}', '${4:}');", detail: "PDO connection", kind: "Snippet" },
  ],
  ruby: [
    { label: "def", insertText: "def ${1:name}(${2})\n  ${3}\nend", detail: "Method", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name}\n  ${2}\nend", detail: "Class", kind: "Snippet" },
    { label: "if", insertText: "if ${1:condition}\n  ${2}\nend", detail: "If statement", kind: "Snippet" },
    { label: "each", insertText: "${1:array}.each do |${2:item}|\n  ${3}\nend", detail: "Each block", kind: "Snippet" },
    { label: "puts", insertText: "puts ${1}", detail: "Puts", kind: "Function" },
    { label: "block", insertText: "{ |${1:x}| ${2} }", detail: "Block", kind: "Snippet" },
  ],
  swift: [
    { label: "func", insertText: "func ${1:name}(${2}) ${3:-> ${4:Type}} {\n    ${5}\n}", detail: "Function", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name} {\n    ${2}\n}", detail: "Class", kind: "Snippet" },
    { label: "struct", insertText: "struct ${1:Name} {\n    ${2}\n}", detail: "Struct", kind: "Snippet" },
    { label: "if-let", insertText: "if let ${1:value} = ${2:optional} {\n    ${3}\n}", detail: "If let", kind: "Snippet" },
    { label: "guard", insertText: "guard ${1:condition} else {\n    ${2:return}\n}", detail: "Guard", kind: "Snippet" },
    { label: "print", insertText: "print(${1})", detail: "Print", kind: "Function" },
  ],
  kotlin: [
    { label: "fun", insertText: "fun ${1:name}(${2}): ${3:Unit} {\n    ${4}\n}", detail: "Function", kind: "Snippet" },
    { label: "class", insertText: "class ${1:Name}(${2}) {\n    ${3}\n}", detail: "Class", kind: "Snippet" },
    { label: "data-class", insertText: "data class ${1:Name}(val ${2:property}: ${3:String})", detail: "Data class", kind: "Snippet" },
    { label: "if", insertText: "if (${1:condition}) {\n    ${2}\n}", detail: "If statement", kind: "Snippet" },
    { label: "when", insertText: "when (${1:expr}) {\n    ${2} -> ${3}\n    else -> ${4}\n}", detail: "When expression", kind: "Snippet" },
    { label: "println", insertText: "println(${1})", detail: "Println", kind: "Function" },
  ],
};

// ─── SHORTCUT TOOLBAR CONFIG ──────────────────────────────────────
type ShortcutAction = "cut" | "copy" | "paste" | "undo" | "redo" | "find" | "replace" | "format" | "comment" | "indentLeft" | "indentRight" | "moveLineUp" | "moveLineDown" | "wrap" | "askAI" | "explain" | "fix" | "generate" | "insert";

interface ShortcutDef {
  label: string;
  icon: React.ElementType;
  action?: ShortcutAction;
  insert?: string;
  cursorOffset?: number;
  group: string;
}

const SHORTCUTS: ShortcutDef[] = [
  // Edit group
  { label: "Undo", icon: Undo2, action: "undo", group: "Edit" },
  { label: "Redo", icon: Redo2, action: "redo", group: "Edit" },
  { label: "Cut", icon: Scissors, action: "cut", group: "Edit" },
  { label: "Copy", icon: Copy, action: "copy", group: "Edit" },
  { label: "Paste", icon: ClipboardPaste, action: "paste", group: "Edit" },
  { label: "Find", icon: Search, action: "find", group: "Edit" },
  { label: "Replace", icon: Replace, action: "replace", group: "Edit" },
  // Format group
  { label: "Format", icon: AlignLeft, action: "format", group: "Format" },
  { label: "Comment", icon: Terminal, action: "comment", group: "Format" },
  { label: "Wrap", icon: WrapText, action: "wrap", group: "Format" },
  { label: "← Indent", icon: ArrowLeft, action: "indentLeft", group: "Format" },
  { label: "Indent →", icon: ArrowRight, action: "indentRight", group: "Format" },
  { label: "↑ Move", icon: ArrowUp, action: "moveLineUp", group: "Format" },
  { label: "↓ Move", icon: ArrowDown, action: "moveLineDown", group: "Format" },
  // Insert group
  { label: "{}", icon: Braces, insert: "{\n  \n}", cursorOffset: -2, group: "Insert" },
  { label: "()", icon: Parentheses, insert: "()", cursorOffset: -1, group: "Insert" },
  { label: "[]", icon: Brackets, insert: "[]", cursorOffset: -1, group: "Insert" },
  { label: "\"\"", icon: Quote, insert: "\"\"", cursorOffset: -1, group: "Insert" },
  { label: "<>", icon: Code, insert: "<></>", cursorOffset: -2, group: "Insert" },
  // AI group
  { label: "Ask AI", icon: MessageSquare, action: "askAI", group: "AI" },
  { label: "Explain", icon: Sparkles, action: "explain", group: "AI" },
  { label: "Fix", icon: Bug, action: "fix", group: "AI" },
  { label: "Generate", icon: Zap, action: "generate", group: "AI" },
];

export function EditorPanel({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onContentChange,
  theme,
  markers,
  onAskAI,
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Floating toggle button position
  const [togglePos, setTogglePos] = useState({ x: 16, y: -60 }); // default bottom-left
  const [isDraggingToggle, setIsDraggingToggle] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const getLanguageId = useCallback(() => {
    const lang = activeTab?.language || "plaintext";
    const map: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      html: "html",
      css: "css",
      json: "json",
      markdown: "markdown",
      python: "python",
      java: "java",
      cpp: "cpp",
      csharp: "csharp",
      go: "go",
      rust: "rust",
      php: "php",
      ruby: "ruby",
      swift: "swift",
      kotlin: "kotlin",
      shell: "shell",
      sql: "sql",
    };
    return map[lang] || "plaintext";
  }, [activeTab?.language]);

  const registerCompletionProvider = useCallback((monaco: any, languageId: string) => {
    const snippets = SNIPPETS[languageId];
    if (!snippets) return;

    return monaco.languages.registerCompletionItemProvider(languageId, {
      triggerCharacters: ["<<", ".", "#", "@", ":", " ", "(", "{", "["],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.slice(0, position.column - 1);
        const lastWord = beforeCursor.match(/[\w<<.#@]*$/)?.[0] || "";

        const suggestions = snippets
          .filter((s) => {
            if (!lastWord) return true;
            return s.label.toLowerCase().startsWith(lastWord.toLowerCase()) ||
              s.detail.toLowerCase().includes(lastWord.toLowerCase());
          })
          .map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind[s.kind as keyof typeof monaco.languages.CompletionItemKind] || monaco.languages.CompletionItemKind.Snippet,
            documentation: { value: s.detail },
            detail: s.detail,
            insertText: s.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            sortText: s.label,
          }));

        return { suggestions, incomplete: false };
      },
    });
  }, []);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme("nuvuja-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "e2e8f0" },
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "identifier", foreground: "38bdf8" },
        { token: "string", foreground: "4ade80" },
        { token: "number", foreground: "fbbf24" },
        { token: "operator", foreground: "f472b6" },
        { token: "type", foreground: "a78bfa" },
        { token: "function", foreground: "38bdf8" },
        { token: "tag", foreground: "f87171" },
        { token: "attribute.name", foreground: "fbbf24" },
        { token: "attribute.value", foreground: "4ade80" },
      ],
      colors: {
        "editor.background": "#0f172a",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#1e293b40",
        "editor.selectionBackground": "#38bdf830",
        "editor.inactiveSelectionBackground": "#38bdf820",
        "editorCursor.foreground": "#38bdf8",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editorIndentGuide.background": "#1e293b",
        "editorIndentGuide.activeBackground": "#334155",
        "editorBracketMatch.background": "#a78bfa30",
        "editorBracketMatch.border": "#a78bfa",
        "editorOverviewRuler.border": "#1e293b",
        "editorGutter.background": "#0f172a",
        "editorWidget.background": "#1e293b",
        "editorWidget.border": "#334155",
        "editorSuggestWidget.background": "#1e293b",
        "editorSuggestWidget.border": "#334155",
        "editorSuggestWidget.selectedBackground": "#38bdf820",
        "editorSuggestWidget.highlightForeground": "#38bdf8",
        "peekView.border": "#a78bfa",
        "peekViewEditor.background": "#0f172a",
        "peekViewResult.background": "#1e293b",
      },
    });

    monaco.editor.setTheme("nuvuja-dark");

    Object.keys(SNIPPETS).forEach((lang) => {
      registerCompletionProvider(monaco, lang);
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
  }, [registerCompletionProvider]);

  useEffect(() => {
    if (editorRef.current && markers && markers.length > 0) {
      const model = editorRef.current.getModel();
      if (model && monacoRef.current) {
        const monacoMarkers = markers.map((m) => ({
          startLineNumber: m.startLineNumber,
          startColumn: m.startColumn,
          endLineNumber: m.endLineNumber,
          endColumn: m.endColumn,
          message: m.message,
          severity:
            m.severity === "error"
              ? monacoRef.current.MarkerSeverity.Error
              : m.severity === "warning"
              ? monacoRef.current.MarkerSeverity.Warning
              : monacoRef.current.MarkerSeverity.Info,
        }));
        monacoRef.current.editor.setModelMarkers(model, "nuvuja", monacoMarkers);
      }
    }
  }, [markers]);

  const insertText = (text: string, offset: number = 0) => {
    const editor = editorRef.current;
    if (!editor || !monacoRef.current) return;
    const pos = editor.getPosition();
    if (!pos) return;
    editor.executeEdits("shortcut", [{
      range: new monacoRef.current.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
      text,
    }]);
    if (offset !== 0) {
      editor.setPosition({
        lineNumber: pos.lineNumber,
        column: pos.column + text.length + offset,
      });
    }
    editor.focus();
  };

  const handleShortcut = (shortcut: ShortcutDef) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (shortcut.insert) {
      insertText(shortcut.insert, shortcut.cursorOffset);
      return;
    }

    switch (shortcut.action) {
      case "cut":
        editor.trigger("keyboard", "editor.action.clipboardCutAction", null);
        break;
      case "copy":
        editor.trigger("keyboard", "editor.action.clipboardCopyAction", null);
        break;
      case "paste":
        navigator.clipboard.readText().then((text) => {
          insertText(text);
        }).catch(() => {
          editor.trigger("keyboard", "editor.action.clipboardPasteAction", null);
        });
        break;
      case "undo":
        editor.trigger("keyboard", "undo", null);
        break;
      case "redo":
        editor.trigger("keyboard", "redo", null);
        break;
      case "find":
        editor.trigger("keyboard", "actions.find", null);
        break;
      case "replace":
        editor.trigger("keyboard", "editor.action.startFindReplaceAction:mk", null);
        break;
      case "format":
        editor.trigger("keyboard", "editor.action.formatDocument", null);
        break;
      case "comment":
        editor.trigger("keyboard", "editor.action.commentLine", null);
        break;
      case "wrap":
        editor.trigger("keyboard", "editor.action.toggleWordWrap", null);
        break;
      case "indentLeft":
        editor.trigger("keyboard", "editor.action.outdentLines", null);
        break;
      case "indentRight":
        editor.trigger("keyboard", "editor.action.indentLines", null);
        break;
      case "moveLineUp":
        editor.trigger("keyboard", "editor.action.moveLinesUpAction", null);
        break;
      case "moveLineDown":
        editor.trigger("keyboard", "editor.action.moveLinesDownAction", null);
        break;
      case "askAI":
      case "explain":
      case "fix":
      case "generate":
        if (onAskAI && activeTab) {
          const selection = editor.getSelection();
          const model = editor.getModel();
          let code = activeTab.content;
          if (selection && model) {
            const selected = model.getValueInRange(selection);
            if (selected.trim()) code = selected;
          }
          const actionMap: Record<string, string> = {
            askAI: "explain this code",
            explain: "explain this code in detail",
            fix: "fix errors in this code",
            generate: "generate code based on this",
          };
          onAskAI(code, actionMap[shortcut.action] || "explain");
        }
        break;
    }
  };

  const groupedShortcuts = SHORTCUTS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {} as Record<string, ShortcutDef[]>);

  // Drag handlers for floating toggle
  const handleToggleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingToggle(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: togglePos.x,
      startY: togglePos.y,
    };
  };

  const handleToggleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDraggingToggle(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      startX: togglePos.x,
      startY: togglePos.y,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDraggingToggle) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setTogglePos({
        x: Math.max(0, Math.min(window.innerWidth - 48, dragStartRef.current.startX + dx)),
        y: Math.max(-window.innerHeight + 48, Math.min(0, dragStartRef.current.startY + dy)),
      });
    };
    const handleUp = () => setIsDraggingToggle(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingToggle) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;
      setTogglePos({
        x: Math.max(0, Math.min(window.innerWidth - 48, dragStartRef.current.startX + dx)),
        y: Math.max(-window.innerHeight + 48, Math.min(0, dragStartRef.current.startY + dy)),
      });
    };
    const handleTouchEnd = () => setIsDraggingToggle(false);

    if (isDraggingToggle) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDraggingToggle]);

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 min-h-0">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-3xl">☁️</span>
          </div>
          <p className="text-slate-500 text-sm">Open a file to start coding</p>
          <p className="text-slate-600 text-xs mt-1">Create files from the explorer or load a template</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-w-0 min-h-0 overflow-hidden relative">
      {/* Tabs */}
      <div className="flex items-center bg-slate-950 border-b border-slate-800/50 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm border-r border-slate-800/50 min-w-[120px] max-w-[200px] group transition-all",
              activeTabId === tab.id
                ? "bg-slate-900 text-slate-200 border-t-2 border-t-sky-400"
                : "bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            )}
          >
            {tab.isDirty && <Circle size={6} className="fill-amber-400 text-amber-400 shrink-0" />}
            <span className="truncate flex-1 text-left">{tab.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700 transition-all"
            >
              <X size={12} />
            </button>
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* Shortcut Toolbar */}
        <div className={cn(
          "flex flex-col bg-slate-900/90 border-r border-slate-800/50 transition-all duration-200 overflow-hidden shrink-0 z-10",
          showShortcuts ? "w-[72px]" : "w-0"
        )}>
          <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
            {Object.entries(groupedShortcuts).map(([group, items]) => (
              <div key={group} className="px-1">
                <div className="text-[8px] text-slate-600 uppercase tracking-wider px-1.5 py-1 font-semibold">
                  {group}
                </div>
                {items.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleShortcut(s)}
                    className={cn(
                      "w-full p-1.5 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors flex flex-col items-center gap-0.5 mb-0.5",
                      s.group === "AI" && "hover:bg-purple-500/10 hover:text-purple-400"
                    )}
                    title={`${s.label}${s.insert ? ` — "${s.insert}"` : ""}`}
                  >
                    <s.icon size={13} />
                    <span className="text-[7px] leading-none text-center leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative min-h-0">
          {activeTab && (
            <Editor
              key={activeTab.id}
              height="100%"
              language={getLanguageId()}
              value={activeTab.content}
              theme={theme === "light" ? "vs" : "nuvuja-dark"}
              onChange={(value) => onContentChange(activeTab.id, value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                fontLigatures: true,
                minimap: { enabled: true, scale: 1, renderCharacters: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderWhitespace: "selection",
                guides: { bracketPairs: true, indentation: true },
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                lineNumbers: "on",
                glyphMargin: true,
                folding: true,
                renderLineHighlight: "all",
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                  showWords: true,
                  showColors: true,
                  showFiles: true,
                  showFolders: true,
                },
                quickSuggestions: { other: true, comments: true, strings: true },
                suggestOnTriggerCharacters: true,
                wordWrap: "on",
                tabSize: 2,
                insertSpaces: true,
                formatOnPaste: true,
                formatOnType: true,
                domReadOnly: false,
                readOnly: false,
                hover: { enabled: true },
                links: true,
                colorDecorators: true,
              }}
              loading={
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="animate-pulse">Loading editor...</div>
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 bg-slate-950 border-t border-slate-800/50 text-[10px] text-slate-600 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="uppercase">{activeTab?.language || "plaintext"}</span>
          {activeTab?.isDirty && <span className="text-amber-500">● unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>{activeTab?.content?.split("\n").length || 0} lines</span>
        </div>
      </div>

      {/* Floating Toolbar Toggle — ⚡ at bottom-left, draggable */}
      <div
        className="fixed z-[70] flex flex-col items-center gap-1"
        style={{
          left: togglePos.x,
          bottom: Math.abs(togglePos.y),
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShortcuts(!showShortcuts)}
          onMouseDown={handleToggleMouseDown}
          onTouchStart={handleToggleTouchStart}
          className={cn(
            "w-10 h-10 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing",
            showShortcuts
              ? "bg-gradient-to-r from-sky-500 to-purple-500 text-white"
              : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          )}
          title="Drag to move • Click to toggle toolbar"
        >
          <Zap size={18} />
        </motion.button>
        <span className="text-[9px] text-slate-500 bg-slate-900/80 px-1.5 py-0.5 rounded">
          {showShortcuts ? "Hide" : "Tools"}
        </span>
      </div>
    </div>
  );
}
