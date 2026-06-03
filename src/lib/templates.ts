import { ProjectTemplate } from "@/types";
import { generateId } from "./utils";

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "vanilla",
    name: "Vanilla Web",
    description: "HTML + CSS + JavaScript starter",
    icon: "🌐",
    files: [
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
    <title>Vanilla App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <script src="app.js"></script>
</body>
</html>`,
      },
      {
        id: generateId(),
        name: "style.css",
        type: "file",
        language: "css",
        content: `body { font-family: system-ui; margin: 2rem; }`,
      },
      {
        id: generateId(),
        name: "app.js",
        type: "file",
        language: "javascript",
        content: `console.log("Hello from Vanilla JS!");`,
      },
    ],
  },
  {
    id: "react",
    name: "React Component",
    description: "Modern React with hooks",
    icon: "⚛️",
    files: [
      {
        id: generateId(),
        name: "App.jsx",
        type: "file",
        language: "javascript",
        content: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Counter: {count}</h1>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}`,
      },
    ],
  },
  {
    id: "python",
    name: "Python Script",
    description: "Python starter with argparse",
    icon: "🐍",
    files: [
      {
        id: generateId(),
        name: "main.py",
        type: "file",
        language: "python",
        content: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Nuvuja Python App")
    parser.add_argument("--name", default="World", help="Name to greet")
    args = parser.parse_args()

    print(f"Hello, {args.name}!")
    print("Nuvuja is watching your code...")

if __name__ == "__main__":
    main()`,
      },
      {
        id: generateId(),
        name: "requirements.txt",
        type: "file",
        language: "plaintext",
        content: `# Add your dependencies here`,
      },
    ],
  },
  {
    id: "api",
    name: "REST API",
    description: "Express.js API structure",
    icon: "🔌",
    files: [
      {
        id: generateId(),
        name: "server.js",
        type: "file",
        language: "javascript",
        content: `const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'nuvuja-api' });
});

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Nuvuja User' }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
      },
      {
        id: generateId(),
        name: "package.json",
        type: "file",
        language: "json",
        content: `{
  "name": "nuvuja-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}`,
      },
    ],
  },
  {
    id: "rust",
    name: "Rust CLI",
    description: "Command-line tool in Rust",
    icon: "🦀",
    files: [
      {
        id: generateId(),
        name: "main.rs",
        type: "file",
        language: "rust",
        content: `use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() > 1 {
        println!("Hello, {}!", args[1]);
    } else {
        println!("Hello from Nuvuja Rust!");
    }
}`,
      },
      {
        id: generateId(),
        name: "Cargo.toml",
        type: "file",
        language: "toml",
        content: `[package]
name = "nuvuja-rust"
version = "0.1.0"
edition = "2021"

[dependencies]`,
      },
    ],
  },
];
