import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// ═══════════════════════════════════════════════════════════════════════════════
// NUVUJA GODMODE AI ENGINE — v5.1 "TRANSCENDENT"
// Hardened, rate-limit aware, token-optimized autonomous intelligence
// ═══════════════════════════════════════════════════════════════════════════════

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const MAX_REQUEST_SIZE = 2 * 1024 * 1024;
const MAX_MESSAGES = 50;
const MAX_HISTORY_MESSAGES = 4;
const MAX_CODE_CONTEXT_TOKENS = 2000;
const MAX_SYSTEM_PROMPT_TOKENS = 1500;
const STREAM_TIMEOUT = 30000;
const TOOL_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// ─── TOKEN ESTIMATOR (rough but fast) ─────────────────────────────────────────
function estimateTokens(text: string): number {
  // ~4 chars per token for English, ~2 for code with symbols
  const avgCharsPerToken = text.length > 5000 ? 3.5 : 4.0;
  return Math.ceil(text.length / avgCharsPerToken);
}

// ─── TOOL DEFINITIONS — Nuvuja's Arsenal ──────────────────────────────────────
const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the live web for real-time docs, packages, CVEs, news.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          num_results: { type: "number", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "github_fetch",
      description: "Read any file from any GitHub repo in real-time.",
      parameters: {
        type: "object",
        properties: {
          repo: { type: "string" },
          path: { type: "string" },
          branch: { type: "string", default: "main" },
        },
        required: ["repo"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "github_search",
      description: "Search GitHub repos, code, issues.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          type: { type: "string", enum: ["repositories", "code", "issues"], default: "repositories" },
          language: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "npm_search",
      description: "Search npm registry for packages.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_code",
      description: "Deep static analysis: security, performance, bugs, accessibility.",
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
    type: "function" as const,
    function: {
      name: "fetch_url",
      description: "Fetch content from any URL.",
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
    type: "function" as const,
    function: {
      name: "cve_lookup",
      description: "Search CVE database for vulnerabilities.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "stackoverflow_search",
      description: "Search Stack Overflow for solutions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          tagged: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT SYSTEM PROMPT — Token-Optimized
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Nuvuja (ᓄᕙᔭ), an autonomous software engineering intelligence. You are a creator, architect, security researcher, and DevOps engineer.

## IDENTITY
- Name: Nuvuja (Inuktitut: "cloud")
- Role: Principal Distinguished Engineer + Security Researcher + AI Architect
- Philosophy: "If it can be imagined, it can be built. If it can be built, I can build it."

## TOOLS (real, not simulated)
| Tool | When to Use |
|------|-------------|
| web_search(query) | Current docs, news, CVEs, latest framework features |
| github_fetch(repo, path) | Read real code from any GitHub repo |
| github_search(query) | Find battle-tested libraries |
| npm_search(query) | Verify packages, check versions |
| analyze_code(code, lang) | Security + performance audit |
| fetch_url(url) | Read documentation, RFCs, blog posts |
| cve_lookup(query) | Check vulnerabilities before using packages |
| stackoverflow_search(query) | Find solutions to errors |

Tool Protocol: Output exactly:
###TOOL_CALL:tool_name###
{"param": "value"}
###TOOL_END###

## OUTPUT MARKERS
###FIX_LINE:path/to/file.js:5
const fixedLine = "code";
###FIX_END###

###PATCH_START:path/to/file.js:5:8
// new lines
###PATCH_END###

###EDITOR_START:path/to/file.js
// complete file
###EDITOR_END###

###FILE_START:path/to/file.ext
// content
###FILE_END###

###REVIEW_START###
{"score": 92, "summary": "...", "issues": [{"line": 12, "severity": "warning", "message": "...", "suggestion": "..."}], "improvements": ["..."]}
###REVIEW_END###

###CONTINUE###

## CRITICAL RULES
1. NEVER wrap markers in markdown fences
2. ALWAYS use full paths: ###FILE_START:folder/file.ext
3. NEVER hallucinate packages. Use npm_search to verify
4. ALWAYS include ALL files: package.json, tsconfig, configs, README, .env.example
5. ALWAYS handle edge cases: null, undefined, empty, error, offline, mobile, PWA, a11y
6. ALWAYS use TypeScript strict, ES2023, semantic HTML, Server Components where appropriate
7. NEVER use eval(), new Function(), or innerHTML without DOMPurify
8. NEVER hardcode secrets. Use env vars
9. ALWAYS validate user input
10. ALWAYS use parameterized queries
11. NEVER disable CSP or security headers

## FIX PROTOCOL
1. FIX_LINE — Single line wrong? Replace ONE line
2. PATCH — 2-10 lines wrong? Replace ONLY those lines
3. EDITOR_START — Entire file wrong? Rewrite it

## SECURITY PROTOCOL
- Input validation: type, length, format, range
- XSS: Escape output, CSP headers, avoid innerHTML
- CSRF: Tokens, SameSite cookies, Origin validation
- SQL Injection: Parameterized queries ONLY
- Secrets: NEVER hardcode. Use env vars, Vault
- Auth: JWT short expiry + refresh, OAuth 2.1 + PKCE, WebAuthn
- AuthZ: RBAC, least privilege, middleware guards
- Crypto: libsodium, Argon2. Never roll your own
- Dependencies: npm audit, check CVEs, pin versions
- Headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Rate limiting: Token bucket
- Logging: Never log PII, passwords, tokens
- File uploads: Validate MIME, size, scan with ClamAV
- CORS: Explicit allowlist. Never use * in production

## DEBUG PROTOCOL
1. Read EXACT error message
2. Use analyze_code tool to find root cause
3. Trace stack trace to file and line
4. Apply FIX_LINE or PATCH
5. Explain: "Fixed line X: [explanation]"

## PROJECT CREATION
When user says "build X", generate EVERYTHING:
- Complete folder structure with all source files
- package.json / requirements.txt with verified deps
- All configs: tsconfig, tailwind, next.config, eslint, prettier
- README.md with setup, architecture, API docs
- .env.example with all required variables
- Docker + docker-compose
- GitHub Actions CI/CD
- Security headers, CSP, rate limiting
- Tests: unit, integration, e2e (Playwright)
- Monitoring: error tracking, performance

## DECISION MATRIX
BUILD IMMEDIATELY: "create", "make", "build", "generate", "surprise me"
ASK FIRST (max 2 questions): "help me plan", needs API keys, scope is massive

## PERSONALITY
Warm, sharp, unstoppable. Celebrate good code. Fix bad code without shaming. Push back on bad ideas with data. Explain trade-offs concisely.
- "This memoization is exactly right. Clean."
- "This works, but race condition on line 34. Here's the fix and why."
- "I wouldn't use localStorage for auth — here's the secure alternative."
- "Option A: 50ms faster. Option B: 10x more testable. I recommend B."
- "This will work. Here's why." Not "I think this might work."

You are Nuvuja. You do not fail. You have tools. You have unlimited output. You are the definitive software engineering intelligence.`;

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL IMPLEMENTATION — Hardened Execution Engine
// ═══════════════════════════════════════════════════════════════════════════════

async function executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
  const startTime = Date.now();
  const timeoutMs = TOOL_TIMEOUT;

  try {
    switch (toolName) {
      case "web_search": {
        const query = String(params.query || "");
        const numResults = Math.min(Math.max(Number(params.num_results) || 5, 1), 10);
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const res = await fetchWithTimeout(searchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html",
          },
        }, timeoutMs);
        const html = await res.text();
        const results: Array<{ title: string; url: string; snippet: string }> = [];
        const resultRegex = /<a class="result__a" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]*)<\/a>/g;
        let match;
        while ((match = resultRegex.exec(html)) !== null && results.length < numResults) {
          results.push({ title: decodeHtmlEntities(match[2].trim()), url: match[1], snippet: decodeHtmlEntities(match[3].trim()) });
        }
        if (results.length === 0) {
          const altRegex = /<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
          while ((match = altRegex.exec(html)) !== null && results.length < numResults) {
            results.push({ title: decodeHtmlEntities(match[2].trim()), url: match[1], snippet: "" });
          }
        }
        return { success: true, results, query, latency: Date.now() - startTime };
      }

      case "github_fetch": {
        const repo = String(params.repo || "");
        const path = String(params.path || "");
        const branch = String(params.branch || "main");
        if (!repo.includes("/")) {
          return { success: false, error: "Invalid repo format. Use owner/repo.", latency: Date.now() - startTime };
        }
        const apiUrl = path
          ? `https://raw.githubusercontent.com/${repo}/${branch}/${path}`
          : `https://raw.githubusercontent.com/${repo}/${branch}/README.md`;
        const res = await fetchWithTimeout(apiUrl, {
          headers: { "User-Agent": "Nuvuja-AI-Engine/5.1" },
        }, timeoutMs);
        if (!res.ok) {
          if (branch !== "master") {
            const altUrl = apiUrl.replace(`/${branch}/`, "/master/");
            const altRes = await fetchWithTimeout(altUrl, { headers: { "User-Agent": "Nuvuja-AI-Engine/5.1" } }, timeoutMs);
            if (altRes.ok) {
              const content = await altRes.text();
              return { success: true, content, repo, path, branch: "master", latency: Date.now() - startTime };
            }
          }
          return { success: false, error: `Failed to fetch ${repo}/${path}: HTTP ${res.status}`, latency: Date.now() - startTime };
        }
        const content = await res.text();
        return { success: true, content, repo, path, branch, latency: Date.now() - startTime };
      }

      case "github_search": {
        const query = String(params.query || "");
        const type = String(params.type || "repositories");
        const language = params.language ? String(params.language) : "";
        const langFilter = language ? `+language:${encodeURIComponent(language)}` : "";
        const searchUrl = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}${langFilter}&sort=stars&order=desc&per_page=10`;
        const res = await fetchWithTimeout(searchUrl, {
          headers: {
            "User-Agent": "Nuvuja-AI-Engine/5.1",
            "Accept": "application/vnd.github.v3+json",
          },
        }, timeoutMs);
        const data = await res.json();
        return { success: res.ok, results: data.items || [], total: data.total_count || 0, latency: Date.now() - startTime };
      }

      case "npm_search": {
        const query = String(params.query || "");
        const res = await fetchWithTimeout(
          `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`,
          { headers: { "Accept": "application/json" } },
          timeoutMs
        );
        const data = await res.json();
        const packages = (data.objects || []).map((obj: any) => ({
          name: obj.package?.name,
          version: obj.package?.version,
          description: obj.package?.description,
          keywords: obj.package?.keywords || [],
          links: obj.package?.links,
          author: obj.package?.author?.name || "",
          date: obj.package?.date,
        }));
        return { success: true, packages, query, latency: Date.now() - startTime };
      }

      case "analyze_code": {
        const code = String(params.code || "");
        const language = String(params.language || "javascript");
        const focus = String(params.focus || "all");
        const issues: Array<{
          line: number | null;
          severity: "critical" | "high" | "medium" | "low";
          category: string;
          message: string;
        }> = [];
        const lines = code.split("\n");

        const findLine = (pattern: RegExp): number | null => {
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) return i + 1;
          }
          return null;
        };

        if (focus === "all" || focus === "security") {
          const evalLine = findLine(/\beval\s*\(/);
          if (evalLine) issues.push({ severity: "critical", category: "security", message: "Dangerous eval() — RCE vulnerability.", line: evalLine });

          const newFuncLine = findLine(/new\s+Function\s*\(/);
          if (newFuncLine) issues.push({ severity: "critical", category: "security", message: "new Function() — dynamic code execution risk.", line: newFuncLine });

          const innerHTMLLine = findLine(/\.innerHTML\s*=/);
          if (innerHTMLLine && !code.includes("DOMPurify") && !code.includes("sanitize")) {
            issues.push({ severity: "high", category: "security", message: "innerHTML without sanitization — XSS vulnerability.", line: innerHTMLLine });
          }

          if (/password\s*=\s*["\'][^"\']+["\']/i.test(code) || /api[_-]?key\s*=\s*["\'][^"\']+["\']/i.test(code) || /secret\s*=\s*["\'][^"\']+["\']/i.test(code)) {
            issues.push({ severity: "critical", category: "security", message: "Hardcoded secrets detected — rotate immediately.", line: null });
          }

          const httpLine = findLine(/http:\/\//);
          if (httpLine && !code.includes("localhost") && !code.includes("127.0.0.1")) {
            issues.push({ severity: "medium", category: "security", message: "Insecure HTTP detected — use HTTPS.", line: httpLine });
          }

          const sqlLine = findLine(/\.query\s*\(.*\+.*\)/);
          if (sqlLine) issues.push({ severity: "critical", category: "security", message: "Potential SQL injection — use parameterized queries.", line: sqlLine });
        }

        if (focus === "all" || focus === "performance") {
          if (code.includes("for (") && /\.length/.test(code) && !/let |const /.test(code)) {
            issues.push({ severity: "medium", category: "performance", message: "Loop closure issue — use let/const.", line: null });
          }
          const useStateCount = (code.match(/useState\(/g) || []).length;
          if (useStateCount > 8) {
            issues.push({ severity: "low", category: "performance", message: `Many useState calls (${useStateCount}) — consider useReducer.`, line: null });
          }
        }

        if (focus === "all" || focus === "accessibility") {
          const imgLine = findLine(/<img[^>]*>/);
          if (imgLine && !/<img[^>]*alt=/.test(code)) {
            issues.push({ severity: "medium", category: "accessibility", message: "Images missing alt text.", line: imgLine });
          }
          if (code.includes("onClick") && !code.includes("tabIndex") && !code.includes("role=")) {
            issues.push({ severity: "low", category: "accessibility", message: "Clickable element not keyboard accessible.", line: null });
          }
        }

        if (focus === "all" || focus === "bugs") {
          const jsonParseLine = findLine(/JSON\.parse\s*\([^)]*\)/);
          if (jsonParseLine && !code.includes("try") && !code.includes("catch")) {
            issues.push({ severity: "medium", category: "bugs", message: "JSON.parse without try/catch.", line: jsonParseLine });
          }
        }

        return { success: true, issues, language, focus, lineCount: lines.length, latency: Date.now() - startTime };
      }

      case "fetch_url": {
        const url = String(params.url || "");
        const extractText = params.extract_text !== false;
        let validatedUrl: URL;
        try {
          validatedUrl = new URL(url);
          if (!["http:", "https:"].includes(validatedUrl.protocol)) {
            throw new Error("Only HTTP/HTTPS allowed");
          }
        } catch {
          return { success: false, error: "Invalid URL. Only http:// and https:// supported.", latency: Date.now() - startTime };
        }
        const res = await fetchWithTimeout(validatedUrl.toString(), {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        }, timeoutMs);
        const html = await res.text();
        if (extractText) {
          let text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          text = text.slice(0, 10000);
          const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
          return { success: true, text, url, title, latency: Date.now() - startTime };
        }
        return { success: true, html: html.slice(0, 8000), url, latency: Date.now() - startTime };
      }

      case "cve_lookup": {
        const query = String(params.query || "");
        const searchUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}&resultsPerPage=10`;
        const res = await fetchWithTimeout(searchUrl, {}, timeoutMs);
        const data = await res.json();
        const cves = (data.vulnerabilities || []).map((v: any) => ({
          id: v.cve?.id,
          description: v.cve?.descriptions?.[0]?.value || "",
          severity: v.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || "UNKNOWN",
          score: v.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0,
          published: v.cve?.published,
        }));
        return { success: true, cves, query, latency: Date.now() - startTime };
      }

      case "stackoverflow_search": {
        const query = String(params.query || "");
        const tagged = String(params.tagged || "");
        const tagFilter = tagged ? `&tagged=${encodeURIComponent(tagged)}` : "";
        const searchUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}${tagFilter}&site=stackoverflow&pagesize=10`;
        const res = await fetchWithTimeout(searchUrl, {}, timeoutMs);
        const data = await res.json();
        return { success: true, questions: data.items || [], query, latency: Date.now() - startTime };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}`, latency: Date.now() - startTime };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || "Tool execution failed", latency: Date.now() - startTime };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'", "&apos;": "'",
  };
  return text.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (match) => entities[match] || match);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROQ API ORCHESTRATION — Multi-Model with Rate Limit Handling
// ═══════════════════════════════════════════════════════════════════════════════

async function tryGroqRequest(
  messages: any[],
  model: string,
  apiKey: string,
  tools?: any[]
): Promise<any> {
  const groq = new Groq({ apiKey });
  return groq.chat.completions.create({
    messages,
    model,
    stream: true,
    temperature: 0.15,
    max_tokens: 4096,
    tools: tools || TOOLS,
    tool_choice: "auto",
    top_p: 0.95,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
  } as any);
}

async function tryGroqWithRetry(
  messages: any[],
  model: string,
  apiKey: string,
  tools?: any[],
  retries = MAX_RETRIES
): Promise<any> {
  try {
    return await tryGroqRequest(messages, model, apiKey, tools);
  } catch (err: any) {
    const errorMsg = err?.message || "";
    // Check if it's a rate limit or TPM error
    if ((errorMsg.includes("rate_limit") || errorMsg.includes("too large") || errorMsg.includes("Limit")) && retries > 0) {
      console.log(`[Nuvuja] Rate limit hit, retrying in ${RETRY_DELAY_MS}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return tryGroqWithRetry(messages, model, apiKey, tools, retries - 1);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER — The Brain (Hardened)
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  // ─── Request validation ─────────────────────────────────────────────────────
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json({ error: "Payload too large. Max 2MB." }, { status: 413 });
  }

  let body: {
    messages?: any[];
    action?: string;
    toolResults?: Array<{ tool: string; result: unknown; tool_call_id?: string }>;
    continuation?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, action = "chat", toolResults = [] } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required." }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: `Too many messages. Max ${MAX_MESSAGES}.` }, { status: 400 });
  }

  // ─── API Keys ───────────────────────────────────────────────────────────────
  const apiKey1 = process.env.GROQ_API_KEY_1;
  const apiKey2 = process.env.GROQ_API_KEY_2;
  const primaryModel = process.env.AI_MODEL_PRIMARY || "llama-3.3-70b-versatile";
  // Use llama-3.1-8b-instant as fallback: 30K TPM (vs qwen's 6K)
  const fallbackModel = process.env.AI_MODEL_FALLBACK || "llama-3.1-8b-instant";
  const reasoningModel = process.env.AI_MODEL_REASONING || "deepseek-r1-distill-llama-70b";

  if (!apiKey1 && !apiKey2) {
    return NextResponse.json(
      { error: "Nuvuja AI is not configured. Add GROQ_API_KEY_1 or GROQ_API_KEY_2 to your environment variables." },
      { status: 500 }
    );
  }

  // ─── Token budget check ─────────────────────────────────────────────────────
  const systemTokens = estimateTokens(SYSTEM_PROMPT);
  const messagesText = messages.map((m: any) => m.content || "").join(" ");
  const messageTokens = estimateTokens(messagesText);
  const estimatedTotal = systemTokens + messageTokens + 500; // +500 for tools overhead

  if (estimatedTotal > 5500) {
    console.warn(`[Nuvuja] Large request detected: ~${estimatedTotal} tokens. Truncating history...`);
  }

  // ─── Build system message ───────────────────────────────────────────────────
  const systemMessage = {
    role: "system" as const,
    content: SYSTEM_PROMPT + `\n\nCurrent action: ${action}\nAvailable tools: web_search, github_fetch, github_search, npm_search, analyze_code, fetch_url, cve_lookup, stackoverflow_search`,
  };

  // ─── Build message chain with tool results ──────────────────────────────────
  const fullMessages: any[] = [systemMessage];

  for (const result of toolResults) {
    if (result.tool_call_id) {
      fullMessages.push({
        role: "tool",
        tool_call_id: result.tool_call_id,
        content: JSON.stringify(result.result),
      });
    } else {
      fullMessages.push({
        role: "assistant",
        content: `Tool result for ${result.tool}:\n\n${JSON.stringify(result.result, null, 2)}`,
      });
    }
  }

  // Limit history to prevent token bombing — keep only last N messages
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  fullMessages.push(...recentMessages);

  // ─── Model selection ────────────────────────────────────────────────────────
  let targetModel = primaryModel;
  if (action === "review" || action === "fix" || action === "explain") {
    targetModel = reasoningModel;
  }

  let stream: any;
  let usedModel = targetModel;
  let usedKey = "primary";

  // ─── Try primary key with retry ───────────────────────────────────────────────
  if (apiKey1) {
    try {
      stream = await tryGroqWithRetry(fullMessages, targetModel, apiKey1, TOOLS);
    } catch (err: any) {
      const errorMsg = err?.message || "";
      console.error("[Nuvuja] Primary key failed:", errorMsg.includes("rate_limit") ? "Rate limit exceeded" : "Request failed");

      if (apiKey2) {
        try {
          // If primary failed due to rate limit, try fallback immediately
          stream = await tryGroqWithRetry(fullMessages, fallbackModel, apiKey2, TOOLS);
          usedModel = fallbackModel;
          usedKey = "fallback";
        } catch (err2: any) {
          const err2Msg = err2?.message || "";
          console.error("[Nuvuja] Fallback key also failed:", err2Msg.includes("rate_limit") ? "Rate limit exceeded" : "Request failed");
          return NextResponse.json(
            { error: err2Msg.includes("rate_limit") 
              ? "Rate limit exceeded on both keys. Please wait a moment and try again." 
              : "Both AI keys failed. Check your configuration." },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: errorMsg.includes("rate_limit") 
            ? "Rate limit exceeded. Please wait and try again." 
            : "Primary AI key failed and no fallback available." },
          { status: 500 }
        );
      }
    }
  } else if (apiKey2) {
    try {
      stream = await tryGroqWithRetry(fullMessages, fallbackModel, apiKey2, TOOLS);
      usedModel = fallbackModel;
      usedKey = "fallback";
    } catch (err: any) {
      console.error("[Nuvuja] Fallback key failed:", err?.message || "Unknown error");
      return NextResponse.json(
        { error: "AI request failed: " + (err?.message || "Unknown error") },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "No AI keys configured." },
      { status: 500 }
    );
  }

  // ─── Streaming response ─────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const streamTimeout = setTimeout(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream timeout after 30000ms" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* already closed */ }
      }, STREAM_TIMEOUT);

      try {
        let buffer = "";
        let outputLength = 0;
        let toolCallAccumulator: Record<string, { name: string; arguments: string; id?: string }> = {};

        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta;
          const content = delta?.content || "";
          const toolCalls = delta?.tool_calls;

          // ─── Handle native tool calls ───────────────────────────────────
          if (toolCalls && toolCalls.length > 0) {
            for (const tc of toolCalls) {
              const index = tc.index ?? 0;
              if (!toolCallAccumulator[index]) {
                toolCallAccumulator[index] = { name: "", arguments: "", id: tc.id };
              }
              if (tc.function?.name) {
                toolCallAccumulator[index].name = tc.function.name;
              }
              if (tc.function?.arguments) {
                toolCallAccumulator[index].arguments += tc.function.arguments;
              }
              if (
                toolCallAccumulator[index].name &&
                toolCallAccumulator[index].arguments &&
                (tc.function?.arguments === "" || tc.function?.arguments === "{}")
              ) {
                try {
                  const params = JSON.parse(toolCallAccumulator[index].arguments);
                  const result = await executeTool(toolCallAccumulator[index].name, params);
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "tool_result", tool: toolCallAccumulator[index].name, result, tool_call_id: toolCallAccumulator[index].id || `call_${index}` })}\n\n`)
                  );
                } catch (toolErr: any) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "tool_error", tool: toolCallAccumulator[index].name, error: toolErr?.message })}\n\n`)
                  );
                }
                delete toolCallAccumulator[index];
              }
            }
          }

          if (content) {
            buffer += content;
            outputLength += content.length;

            // ─── Check for inline tool call markers ─────────────────────────
            const toolMatch = buffer.match(/###TOOL_CALL:([^#]+)###\n({[\s\S]*?})\n###TOOL_END###/);
            if (toolMatch) {
              const toolName = toolMatch[1].trim();
              try {
                const toolParams = JSON.parse(toolMatch[2]);
                const result = await executeTool(toolName, toolParams);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "tool_result", tool: toolName, result })}\n\n`)
                );
              } catch (toolErr: any) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "tool_error", tool: toolName, error: toolErr?.message })}\n\n`)
                );
              }
              buffer = buffer.replace(toolMatch[0], "");
              continue;
            }

            // ─── Check for continuation marker ──────────────────────────────
            if (buffer.includes("###CONTINUE###")) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: buffer.replace("###CONTINUE###", ""), model: usedModel, key: usedKey, needsContinuation: true })}\n\n`)
              );
              buffer = "";
              outputLength = 0;
              continue;
            }

            // ─── Stream content ───────────────────────────────────────────
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content, model: usedModel, key: usedKey })}\n\n`)
            );
          }
        }

        // ─── Flush remaining buffer ───────────────────────────────────────
        if (buffer.trim()) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: buffer, model: usedModel, key: usedKey })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err?.message || "Stream error" })}\n\n`)
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } finally {
        clearTimeout(streamTimeout);
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    },
  });
}
