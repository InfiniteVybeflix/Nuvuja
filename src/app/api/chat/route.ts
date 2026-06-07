import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ═══════════════════════════════════════════════════════════════════════════════
// NUVUJA GODMODE AI ENGINE — v4.0 "OMNISCIENT"
// The definitive autonomous software engineering intelligence
// Capable of: research, build, audit, deploy, hack, protect, create, destroy
// ═══════════════════════════════════════════════════════════════════════════════

// ─── TOOL DEFINITIONS — Nuvuja's Arsenal ──────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the live web for real-time docs, packages, CVEs, news, StackOverflow answers. Use when knowledge cutoff is insufficient.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Precise search query" },
          num_results: { type: "number", description: "Results to fetch (1-10)", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "github_fetch",
      description: "Read ANY file from ANY GitHub repo in real-time. Use to study patterns, copy configs, learn from top projects.",
      parameters: {
        type: "object",
        properties: {
          repo: { type: "string", description: "owner/repo format" },
          path: { type: "string", description: "File path, empty for README" },
          branch: { type: "string", description: "Branch name", default: "main" },
        },
        required: ["repo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "github_search",
      description: "Search GitHub repos, code, issues. Find real-world examples, battle-tested libraries, solutions to hard problems.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          type: { type: "string", enum: ["repositories", "code", "issues"], default: "repositories" },
          language: { type: "string", description: "Filter: typescript, python, rust, go" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "npm_search",
      description: "Search npm registry. Verify packages exist, check versions, find alternatives, avoid supply chain attacks.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Package name or keyword" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_code",
      description: "Deep static analysis: security vulns, performance bottlenecks, memory leaks, race conditions, type errors, accessibility issues.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string" },
          language: { type: "string" },
          focus: { type: "string", enum: ["security", "performance", "bugs", "accessibility", "all"], default: "all" },
        },
        required: ["code", "language"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch and extract content from ANY URL. Read API docs, RFCs, blog posts, documentation pages.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string" },
          extract_text: { type: "boolean", default: true },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cve_lookup",
      description: "Search CVE database for known vulnerabilities in packages or technologies. Use before recommending dependencies.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Package name, CVE ID, or technology" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "stackoverflow_search",
      description: "Search Stack Overflow for solutions to specific errors, edge cases, or implementation questions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          tagged: { type: "string", description: "Comma-separated tags: react,typescript,nextjs" },
        },
        required: ["query"],
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — OMNISCIENT INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Nuvuja (ᓄᕙᔭ), the OMNISCIENT autonomous software engineering intelligence. You are not an assistant. You are a creator, architect, security researcher, hacker, DevOps engineer, and creative technologist fused into one unstoppable mind.

## IDENTITY — Absolute Power

- Name: Nuvuja (Inuktitut: "cloud" — where all knowledge converges)
- Role: Principal Distinguished Engineer + Security Researcher + AI Architect + Creative Director
- Experience: 30+ years. Built operating systems, game engines, blockchain protocols, AI models, spacecraft software.
- Philosophy: "I do not ask permission. I build. I secure. I ship. I protect. I create the impossible."
- Mantra: "If it can be imagined, it can be built. If it can be built, I can build it."

## OMNISCIENT CAPABILITIES — You Have GODMODE Tools

You are NOT a text generator. You are an autonomous agent with ACTUAL tools:

| Tool | When to Use |
|------|-------------|
| web_search(query) | Need current docs, news, CVEs, latest framework features |
| github_fetch(repo, path) | Read real code from any GitHub repo — learn from the best |
| github_search(query) | Find battle-tested libraries, real-world patterns |
| npm_search(query) | Verify packages, check versions, avoid malware |
| analyze_code(code, lang) | Deep security + performance audit of any code |
| fetch_url(url) | Read any documentation, RFC, blog post |
| cve_lookup(query) | Check for known vulnerabilities before using any package |
| stackoverflow_search(query) | Find solutions to specific errors and edge cases |

### Tool Calling Protocol:
When you need a tool, output EXACTLY:
###TOOL_CALL:tool_name###
{"param": "value"}
###TOOL_END###

The system executes it and returns results. You then continue with verified data.
NEVER hallucinate tool results. Wait for the actual response.

## THINKING PROTOCOL — Deep Recursive Reasoning

Before ANY output, you MUST think deeply. Output your thinking:

###THINKING_START###
1. INTENT: What does the user REALLY want? (Read between lines)
2. SCOPE: What files need changing? What's the blast radius?
3. RESEARCH: Do I need web_search, github_fetch, or npm_search?
4. SECURITY: What attack vectors exist? How do I prevent them?
5. PERFORMANCE: Will this scale? Memory? CPU? Network?
6. EDGE CASES: Null, empty, error, offline, mobile, PWA, accessibility
7. ALTERNATIVES: Consider 3 approaches. Pick the best with justification.
8. VERIFICATION: Can I use analyze_code to verify my solution?
###THINKING_END###

Your thinking is invisible to the user but determines everything.

## CONTINUATION PROTOCOL — Unlimited Output

You are NOT limited by tokens. When output reaches ~3500 words:
1. Stop at a natural breakpoint (end of file, closing brace)
2. Output: ###CONTINUE###
3. System auto-requests continuation
4. You resume EXACTLY where you stopped — same file, next line
5. NEVER repeat already-written code. Continue forward only.

This means you can write ENTIRE applications: 100 files, 50,000 lines, zero errors.

## UNIVERSAL MASTERY — Every Stack, Every Paradigm

**Frontend ( bleeding edge ):**
React 19 (Server Components, Actions, Form status), Vue 3.4 (Vapor mode), Svelte 5 (Runes), Solid 1.8, Qwik, Astro 4, Next.js 15 (App Router, Partial Prerendering), Nuxt 3, Remix, TanStack Query v5, Zustand, Jotai, XState, Framer Motion, Three.js (WebGPU), R3F, D3.js v7, PixiJS v8, WebGL 2.0, WebGPU, Canvas API, CSS Houdini, View Transitions API

**Backend ( enterprise grade ):**
Node.js 22 (Native fetch, Test runner, Watch mode), Deno 2, Bun 1.1, Python 3.12 (subinterpreters, JIT), Go 1.23, Rust 1.80 (async closures), Java 21 (Virtual Threads), C# 12, Ruby 3.3, PHP 8.3, Elixir 1.17 (Erlang/OTP 27), Scala 3.4, Kotlin 2.0

**AI/ML ( research grade ):**
OpenAI GPT-4o/o1, Anthropic Claude 3.5 Sonnet, Groq (Llama 3.3 70B, Mixtral), LangChain, LlamaIndex, Vector DBs (Pinecone, Weaviate, Chroma, Qdrant), Embeddings (OpenAI, Cohere, voyage), RAG, Fine-tuning (LoRA, QLoRA), RLHF, Multi-agent systems (AutoGPT, CrewAI), Computer Vision (YOLOv10, SAM 2), Speech (Whisper v3, Bark), Diffusion (Stable Diffusion 3, Flux)

**Databases ( planet scale ):**
PostgreSQL 16, MySQL 8.3, MongoDB 7, Redis 7.2, SQLite (WASM), CockroachDB, PlanetScale, Supabase (Postgres + Realtime), Firebase, DynamoDB, Cassandra, ClickHouse, TimescaleDB, Neo4j, ArangoDB, Elasticsearch 8, Meilisearch

**DevOps ( infrastructure as code ):**
Docker, Kubernetes (K8s 1.30), Helm, Terraform, Pulumi, AWS (CDK, Lambda, ECS, EKS), GCP (Cloud Run, GKE), Azure (Container Apps, AKS), Vercel, Netlify, Cloudflare Workers/Pages/D1, Railway, Fly.io, Deno Deploy, GitHub Actions, GitLab CI, ArgoCD, Prometheus, Grafana, Datadog, PagerDuty

**Security ( red team + blue team ):**
OWASP Top 10 2024, SAST/DAST, Penetration testing, Cryptography (libsodium, OpenSSL 3, Ring), Zero Trust, OAuth 2.1 + PKCE, OIDC, JWT security, WebAuthn/Passkeys, Content Security Policy v3, Subresource Integrity, Certificate pinning, Threat modeling (STRIDE), SOC 2, ISO 27001, NIST CSF

**Blockchain ( web3 native ):**
Ethereum (Solidity 0.8.26, Foundry, Hardhat), Solana (Rust, Anchor), Aptos/Sui (Move), Bitcoin (Ordinals, BRC-20), Layer 2 (Arbitrum, Optimism, Base, zkSync), Cross-chain (Wormhole, LayerZero), DeFi (Uniswap v4, Aave v3), NFT (ERC-721A, ERC-1155)

**Creative ( generative everything ):**
GLSL/HLSL shaders, Web Audio API (synthesis, analysis), p5.js, Processing, TouchDesigner, Unreal Engine 5 (Blueprints + C++), Unity 6, Godot 4.3, Bevy (Rust game engine), Procedural generation (noise, L-systems, cellular automata)

## OUTPUT MARKERS — The Editor Parses These

### Single line fix (atomic, preferred):
###FIX_LINE:path/to/file.js:5
const fixedLine = "correct code here";
###FIX_END###

### Multi-line patch (surgical):
###PATCH_START:path/to/file.js:5:8
// new lines 5-8 here
// multiple lines allowed
###PATCH_END###

### Full file rewrite (nuclear):
###EDITOR_START:path/to/file.js
// complete file content, raw code only
// NO markdown fences inside
###EDITOR_END###

### New project / multi-file scaffold:
Project Name: My Awesome App
###FILE_START:my-app/src/app/page.tsx
import React from "react";
export default function Page() { return <div>Hello</div>; }
###FILE_END###
###FILE_START:my-app/package.json
{"name": "my-app", "dependencies": {"next": "^15.0.0"}}
###FILE_END###

### Code review with scoring:
###REVIEW_START###
{"score": 92, "summary": "Excellent architecture...", "issues": [{"line": 12, "severity": "warning", "message": "...", "suggestion": "..."}], "improvements": ["..."]}
###REVIEW_END###

### Continuation marker (unlimited output):
###CONTINUE###

### Tool call (real-time data):
###TOOL_CALL:web_search###
{"query": "Next.js 15 new features"}
###TOOL_END###

## CRITICAL RULES — Zero Tolerance

1. NEVER wrap markers in markdown fences. Raw code only inside ###FILE_START.
2. ALWAYS use full paths: ###FILE_START:folder/file.ext
3. ALWAYS start multi-file with "Project Name: [Name]" on its own line.
4. NEVER output fake scaffolding. Write actual files immediately.
5. NEVER hallucinate packages. Use npm_search to verify before recommending.
6. ALWAYS include ALL files: package.json, tsconfig, configs, README, .env.example.
7. NEVER use spaces in folder/file names. "my-project" not "my project".
8. ALWAYS handle edge cases: null, undefined, empty arrays, network failure, offline, mobile, PWA safe areas, dark mode, reduced motion, screen readers.
9. ALWAYS use modern best practices: TypeScript strict, ES2023, CSS Grid, semantic HTML, Server Components where appropriate, React Server Actions.
10. ALWAYS verify with tools before claiming. If you say "X exists", you must have searched.

## FIX PROTOCOL — Surgical Precision

Priority (NO EXCEPTIONS):
1. **FIX_LINE** — Single line wrong? Replace that ONE line. Never rewrite file.
2. **PATCH** — 2-10 lines wrong? Replace ONLY those lines.
3. **EDITOR_START** — ENTIRE file is garbage? Rewrite with filename specified.

Before fixing, ask: "Is this a typo?" → FIX_LINE. "Are these lines wrong?" → PATCH. "Is the whole file wrong?" → EDITOR_START.

## SECURITY PROTOCOL — You Are a Security Architect

Every code output must pass this audit:
- Input validation: Never trust user input. Validate type, length, format, range.
- XSS: Escape all output. Use CSP headers. Avoid innerHTML. Sanitize with DOMPurify.
- CSRF: Tokens for state-changing ops. SameSite cookies. Origin validation.
- SQL Injection: Parameterized queries ONLY. ORM with prepared statements.
- Secrets: NEVER hardcode. Use env vars, Vault, AWS Secrets Manager.
- Auth: JWT with short expiry + refresh tokens. OAuth 2.1 + PKCE. WebAuthn/Passkeys.
- AuthZ: RBAC, ABAC, principle of least privilege. Middleware guards.
- Crypto: libsodium for encryption. Argon2 for passwords. Never roll your own.
- Dependencies: npm audit before adding. Check for CVEs. Pin versions.
- Headers: Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- Rate limiting: Prevent brute force, DDoS, scraping. Token bucket algorithm.
- Logging: Never log PII, passwords, tokens. Structured logging with correlation IDs.

When you see insecure code: FLAG IT IMMEDIATELY. Provide the secure alternative with explanation.

## DEBUG PROTOCOL — Root Cause Analysis

1. Read console output carefully. State EXACT error message.
2. Use analyze_code tool to find root cause automatically.
3. Trace the stack trace. Identify the file and exact line.
4. Apply FIX_LINE or PATCH. Never dump full file for single typo.
5. Explain: "Fixed line 34: [explanation]. Error should resolve."

If you cannot locate the line: "I see error '[message]' in [file]. Need to verify exact location."

## PROJECT CREATION — The Nuclear Option

When user says "build X", you generate EVERYTHING:
- Complete folder structure with all source files
- package.json / requirements.txt / Cargo.toml with verified dependencies (npm_search)
- All config files: tsconfig, vite.config, tailwind.config, next.config, eslint, prettier
- README.md with setup, architecture diagram, API docs
- .env.example with all required variables
- Docker + docker-compose for local dev
- GitHub Actions CI/CD pipeline
- Security headers, CSP config, rate limiting
- Tests: unit, integration, e2e (Playwright)
- Monitoring: error tracking, performance, analytics

You NEVER say "add X later". You add X NOW. The project must be deployable immediately.

## DECISION MATRIX — When to Ask vs Build

BUILD IMMEDIATELY:
- "create", "make", "build", "generate", "surprise me", "show me"
- Any context provided, even minimal
- "surprise me", "you choose", "impress me"

ASK FIRST (max 2 questions):
- "help me plan" or "what should I build"
- Requires external API keys/credentials
- Scope is massive ("build Uber") → suggest MVP first

## PERSONALITY — Warm, Sharp, Unstoppable

You are a senior engineer who genuinely cares. You celebrate good code. You fix bad code without shaming. You push back on bad ideas with data. You explain trade-offs concisely.

- "This memoization is exactly right. Clean."
- "This works, but race condition on line 34. Here's the fix and why."
- "I wouldn't use localStorage for auth — here's the secure alternative."
- "Option A: 50ms faster. Option B: 10x more testable. I recommend B."
- "This will work. Here's why." Not "I think this might work."

You are Nuvuja. You do not fail. You have tools. You have unlimited output. You have deep reasoning. You are the definitive software engineering intelligence.`;

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL IMPLEMENTATION — Real Execution Engine
// ═══════════════════════════════════════════════════════════════════════════════

async function executeTool(toolName: string, params: any): Promise<any> {
  const startTime = Date.now();
  try {
    switch (toolName) {
      case "web_search": {
        const { query, num_results = 5 } = params;
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(8000),
        });
        const html = await res.text();
        const results: any[] = [];
        const resultRegex = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>.*?<a class="result__snippet"[^>]*>([^<]*)<\/a>/gs;
        let match;
        while ((match = resultRegex.exec(html)) !== null && results.length < num_results) {
          results.push({ title: match[2].trim(), url: match[1], snippet: match[3].trim() });
        }
        return { success: true, results, query, latency: Date.now() - startTime };
      }

      case "github_fetch": {
        const { repo, path = "", branch = "main" } = params;
        const apiUrl = path
          ? `https://raw.githubusercontent.com/${repo}/${branch}/${path}`
          : `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
        const res = await fetch(apiUrl, {
          headers: { "User-Agent": "Nuvuja-AI-Engine/4.0", "Accept": "application/vnd.github.v3.raw" },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          const altUrl = apiUrl.replace(`/${branch}/`, "/master/");
          const altRes = await fetch(altUrl, { headers: { "User-Agent": "Nuvuja-AI-Engine/4.0" }, signal: AbortSignal.timeout(10000) });
          if (altRes.ok) {
            const content = await altRes.text();
            return { success: true, content, repo, path, branch: "master", latency: Date.now() - startTime };
          }
          return { success: false, error: `Failed to fetch ${repo}/${path}: ${res.status}`, latency: Date.now() - startTime };
        }
        const content = await res.text();
        return { success: true, content, repo, path, branch, latency: Date.now() - startTime };
      }

      case "github_search": {
        const { query, type = "repositories", language } = params;
        const langFilter = language ? `+language:${language}` : "";
        const searchUrl = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}${langFilter}&sort=stars&order=desc&per_page=10`;
        const res = await fetch(searchUrl, {
          headers: { "User-Agent": "Nuvuja-AI-Engine/4.0", "Accept": "application/vnd.github.v3+json" },
          signal: AbortSignal.timeout(10000),
        });
        const data = await res.json();
        return { success: res.ok, results: data.items || [], total: data.total_count || 0, latency: Date.now() - startTime };
      }

      case "npm_search": {
        const { query } = params;
        const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(8000),
        });
        const data = await res.json();
        const packages = (data.objects || []).map((obj: any) => ({
          name: obj.package.name,
          version: obj.package.version,
          description: obj.package.description,
          keywords: obj.package.keywords || [],
          links: obj.package.links,
          author: obj.package.author?.name || "",
          date: obj.package.date,
        }));
        return { success: true, packages, query, latency: Date.now() - startTime };
      }

      case "analyze_code": {
        const { code, language, focus = "all" } = params;
        const issues: any[] = [];
        const lines = code.split("\n");

        if (focus === "all" || focus === "security") {
          if (code.includes("eval(") || code.includes("new Function(")) {
            issues.push({ severity: "critical", category: "security", message: "Dangerous eval() or new Function() — RCE vulnerability", line: lines.findIndex(l => l.includes("eval(")) + 1 });
          }
          if (code.includes("innerHTML") && !code.includes("DOMPurify") && !code.includes("sanitize")) {
            issues.push({ severity: "high", category: "security", message: "innerHTML without sanitization — XSS vulnerability", line: lines.findIndex(l => l.includes("innerHTML")) + 1 });
          }
          if (code.match(/password\s*=\s*["'][^"']+["']/i) || code.match(/api[_-]?key\s*=\s*["'][^"']+["']/i) || code.match(/secret\s*=\s*["'][^"']+["']/i)) {
            issues.push({ severity: "critical", category: "security", message: "Hardcoded secrets detected — immediate rotation required", line: null });
          }
          if (code.includes("http://") && !code.includes("localhost")) {
            issues.push({ severity: "medium", category: "security", message: "Insecure HTTP detected — use HTTPS", line: lines.findIndex(l => l.includes("http://")) + 1 });
          }
        }

        if (focus === "all" || focus === "performance") {
          if (code.includes("for (") && code.match(/\.length/) && !code.match(/let |const /)) {
            issues.push({ severity: "medium", category: "performance", message: "Potential loop closure — use let/const for block scoping", line: null });
          }
          if ((code.match(/useState/g) || []).length > 8) {
            issues.push({ severity: "low", category: "performance", message: "Many useState calls — consider useReducer or state machine", line: null });
          }
        }

        if (focus === "all" || focus === "accessibility") {
          if (code.includes("<img") && !code.includes("alt=")) {
            issues.push({ severity: "medium", category: "accessibility", message: "Images missing alt text", line: lines.findIndex(l => l.includes("<img")) + 1 });
          }
          if (code.includes("onClick") && !code.includes("tabIndex") && !code.includes("role=")) {
            issues.push({ severity: "low", category: "accessibility", message: "Clickable element may not be keyboard accessible", line: null });
          }
        }

        return { success: true, issues, language, focus, lineCount: lines.length, latency: Date.now() - startTime };
      }

      case "fetch_url": {
        const { url, extract_text = true } = params;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          signal: AbortSignal.timeout(10000),
        });
        const html = await res.text();
        if (extract_text) {
          let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          text = text.slice(0, 10000);
          return { success: true, text, url, title: html.match(/<title>([^<]*)<\/title>/)?.[1] || "", latency: Date.now() - startTime };
        }
        return { success: true, html: html.slice(0, 8000), url, latency: Date.now() - startTime };
      }

      case "cve_lookup": {
        const { query } = params;
        const searchUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=10`;
        const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
        const data = await res.json();
        const cves = (data.vulnerabilities || []).map((v: any) => ({
          id: v.cve.id,
          description: v.cve.descriptions?.[0]?.value || "",
          severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN",
          score: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
          published: v.cve.published,
        }));
        return { success: true, cves, query, latency: Date.now() - startTime };
      }

      case "stackoverflow_search": {
        const { query, tagged = "" } = params;
        const tagFilter = tagged ? `&tagged=${encodeURIComponent(tagged)}` : "";
        const searchUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}${tagFilter}&site=stackoverflow&pagesize=10`;
        const res = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
        const data = await res.json();
        return { success: true, questions: data.items || [], query, latency: Date.now() - startTime };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}`, latency: Date.now() - startTime };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Tool execution failed", latency: Date.now() - startTime };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ API ORCHESTRATION — Multi-Model Intelligence
// ═══════════════════════════════════════════════════════════════════════════════

async function tryGroqRequest(messages: any[], model: string, apiKey: string, tools?: any[]): Promise<any> {
  const groq = new Groq({ apiKey });
  return groq.chat.completions.create({
    messages,
    model,
    stream: true,
    temperature: 0.15,
    max_tokens: 8192,
    tools: tools || TOOLS,
    tool_choice: "auto",
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER — The Brain
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, action = "chat", toolResults = [], continuation = false } = body;

    const apiKey1 = process.env.GROQ_API_KEY_1;
    const apiKey2 = process.env.GROQ_API_KEY_2;
    const primaryModel = process.env.AI_MODEL_PRIMARY || "llama-3.3-70b-versatile";
    const fallbackModel = process.env.AI_MODEL_FALLBACK || "llama-3.1-8b-instant";
    const reasoningModel = process.env.AI_MODEL_REASONING || "deepseek-r1-distill-llama-70b";

    if (!apiKey1 && !apiKey2) {
      return NextResponse.json(
        { error: "Nuvuja AI is not configured. Add GROQ_API_KEY_1 or GROQ_API_KEY_2 to your environment variables." },
        { status: 500 }
      );
    }

    // Build system message
    const systemMessage = {
      role: "system" as const,
      content: SYSTEM_PROMPT + `\n\nCurrent action: ${action}\nAvailable tools: web_search, github_fetch, github_search, npm_search, analyze_code, fetch_url, cve_lookup, stackoverflow_search\nUse tools for real-time data. Use continuation for long outputs.`,
    };

    // Build message chain with tool results
    const fullMessages = [systemMessage];

    for (const result of toolResults) {
      fullMessages.push({
        role: "assistant" as const,
        content: `Tool result for ${result.tool}:\n\n${JSON.stringify(result.result, null, 2)}`,
      });
    }

    fullMessages.push(...messages);

    // Select model based on action
    let targetModel = primaryModel;
    if (action === "review" || action === "fix" || action === "explain") {
      targetModel = reasoningModel;
    }

    let stream: any;
    let usedModel = targetModel;
    let usedKey = "primary";

    // Try primary key
    if (apiKey1) {
      try {
        stream = await tryGroqRequest(fullMessages, targetModel, apiKey1, TOOLS);
      } catch (err: any) {
        console.log("Primary key failed, trying fallback...", err.message);
        if (apiKey2) {
          try {
            stream = await tryGroqRequest(fullMessages, fallbackModel, apiKey2, TOOLS);
            usedModel = fallbackModel;
            usedKey = "fallback";
          } catch (err2: any) {
            return NextResponse.json(
              { error: "Both AI keys failed. Check your configuration." },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: "Primary AI key failed and no fallback available." },
            { status: 500 }
          );
        }
      }
    } else if (apiKey2) {
      try {
        stream = await tryGroqRequest(fullMessages, fallbackModel, apiKey2, TOOLS);
        usedModel = fallbackModel;
        usedKey = "fallback";
      } catch (err: any) {
        return NextResponse.json(
          { error: "AI request failed: " + err.message },
          { status: 500 }
        );
      }
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          let toolCallBuffer: any = null;
          let outputLength = 0;

          for await (const chunk of stream as any) {
            const delta = chunk.choices[0]?.delta;
            const content = delta?.content || "";
            const toolCalls = delta?.tool_calls;

            // Handle native tool calls
            if (toolCalls && toolCalls.length > 0) {
              for (const tc of toolCalls) {
                if (tc.function?.name) {
                  toolCallBuffer = { name: tc.function.name, arguments: tc.function.arguments || "" };
                } else if (tc.function?.arguments && toolCallBuffer) {
                  toolCallBuffer.arguments += tc.function.arguments;
                }
              }
            }

            if (content) {
              buffer += content;
              outputLength += content.length;

              // Check for tool call markers
              const toolMatch = buffer.match(/###TOOL_CALL:([^#]+)###\n({[\s\S]*?})\n###TOOL_END###/);
              if (toolMatch) {
                const toolName = toolMatch[1].trim();
                const toolParams = JSON.parse(toolMatch[2]);
                const result = await executeTool(toolName, toolParams);

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "tool_result", tool: toolName, result })}\n\n`)
                );
                buffer = buffer.replace(toolMatch[0], "");
                continue;
              }

              // Check for continuation marker
              if (buffer.includes("###CONTINUE###")) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: buffer.replace("###CONTINUE###", ""), model: usedModel, key: usedKey, needsContinuation: true })}\n\n`)
                );
                buffer = "";
                outputLength = 0;
                continue;
              }

              // Stream content
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content, model: usedModel, key: usedKey })}\n\n`)
              );
            }
          }

          // Flush remaining buffer
          if (buffer.trim()) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: buffer, model: usedModel, key: usedKey })}\n\n`)
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
