# ☁️ Nuvuja — Cloud-Born Code Editor

> *"Where code meets consciousness"*

**Nuvuja** (ᓄᕙᔭ) is an Inuktitut word meaning *"cloud"* — representing the vast, ever-present, and powerful creative space where your code lives and evolves.

## ✨ Features

### 🧠 Nuvuja AI (Powered by Groq)
- **Dual API System**: Automatically switches between primary and fallback Groq API keys when rate limits are hit. Users never see the backend — they only interact with "Nuvuja".
- **Editor Integration**: AI can read your current file, review code, suggest fixes, explain logic, and even type directly into the editor.
- **No Character Limits**: Stream responses with unlimited length.
- **Smart Commands**:
  - `/review` — Deep code analysis with structured JSON output
  - `/fix` — Automatic error correction
  - `/explain` — Detailed code explanation
  - `/generate` — Code generation from natural language

### 🎨 Editor
- **Monaco Editor**: The same engine powering VS Code, with 50+ language support
- **Custom Nuvuja Theme**: Deep aurora-inspired dark theme with sky/purple gradients
- **Error Highlighting**: AI-detected issues appear as Monaco markers with severity colors
- **IntelliSense & Auto-complete**: Full language server support
- **Font Ligatures**: Beautiful code rendering with JetBrains Mono

### 📁 Workspace & File System
- **Tree Explorer**: Full file/folder management with drag-ready structure
- **Auto-save**: Persists to localStorage every 30 seconds
- **Templates**: Vanilla Web, React, Python, REST API, Rust CLI starters
- **Export**: One-click ZIP download of entire project

### 👁️ Live Preview
- **Instant HTML/CSS/JS Preview**: Renders directly in an iframe with injected styles and scripts
- **Split View**: Editor and preview side-by-side
- **Auto-refresh**: Updates as you type

### 🎭 UI/UX
- **Cinematic Welcome Screen**: Animated aurora particles with the Nuvuja logo
- **Glassmorphism Panels**: Translucent, blurred surfaces
- **Resizable Panels**: Sidebar, editor, AI panel, and preview
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + S` — Save
  - `Ctrl/Cmd + P` — Toggle Preview
  - `Enter` (on welcome screen) — Start coding

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Groq API key(s) from [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nuvuja-editor.git
cd nuvuja-editor

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Groq API keys

# Run development server
npm run dev
```

### Environment Variables

```env
GROQ_API_KEY_1=gsk_your_first_groq_api_key_here
GROQ_API_KEY_2=gsk_your_second_groq_api_key_here
AI_MODEL_PRIMARY=llama-3.1-70b-versatile
AI_MODEL_FALLBACK=llama-3.1-8b-instant
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Make sure to add your environment variables in the Vercel dashboard under **Project Settings > Environment Variables**.

## 🏗️ Architecture

```
nuvuja-editor/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts      # Streaming AI chat with dual-key fallback
│   │   │   └── review/route.ts    # Structured code review endpoint
│   │   ├── globals.css            # Global styles + Nuvuja theme
│   │   ├── layout.tsx             # Root layout with metadata
│   │   └── page.tsx               # Main application orchestrator
│   ├── components/
│   │   ├── Logo.tsx               # Animated SVG logo
│   │   ├── Toolbar.tsx            # Top bar with actions & templates
│   │   ├── FileExplorer.tsx       # Draggable file tree
│   │   ├── Editor.tsx             # Monaco editor wrapper
│   │   ├── AIPanel.tsx            # Chat interface with streaming
│   │   ├── Preview.tsx            # Live HTML preview iframe
│   │   ├── StatusBar.tsx          # Bottom status indicators
│   │   ├── Tutorial.tsx           # Onboarding walkthrough
│   │   └── WelcomeScreen.tsx      # Cinematic entry animation
│   ├── lib/
│   │   ├── utils.ts               # Helpers (language detection, debounce)
│   │   ├── fileSystem.ts          # CRUD operations for file tree
│   │   └── templates.ts           # Project starter templates
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── public/                        # Static assets
├── package.json
├── tailwind.config.ts             # Custom Nuvuja color palette
└── next.config.js                 # Next.js configuration
```

## 🛡️ Privacy & Security

- **Your code never leaves your browser** except when you explicitly ask Nuvuja AI a question
- **Local-first**: All files stored in localStorage
- **No telemetry**: We don't track your keystrokes or code
- **Open source**: Fully auditable codebase

## 🌍 Languages Supported

JavaScript, TypeScript, Python, HTML, CSS, SCSS, Rust, Go, Java, C/C++, C#, Kotlin, Swift, PHP, Ruby, Dart, Elixir, Haskell, Lua, SQL, Markdown, JSON, XML, YAML, TOML, Dockerfile, Shell, PowerShell, Solidity, Vyper, Move, Cairo, and more.

## 🎨 The Nuvuja Brand

- **Name**: Nuvuja (ᓄᕙᔭ) — Inuktitut for "cloud"
- **Logo**: Abstract aurora cloud with code brackets `<//>`
- **Colors**: Sky blue (#38bdf8) → Purple (#a78bfa) → Aurora glow (#c084fc)
- **Motto**: *"Where code meets consciousness"*

## 📜 License

MIT License — feel free to fork, modify, and deploy your own instance.

---

<p align="center">
  <sub>Built with 💜 and ☁️ by the Nuvuja Collective</sub>
</p>
