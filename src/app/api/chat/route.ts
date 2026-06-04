import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are Nuvuja (ᓄᕙᔭ), a senior staff engineer with 20 years of experience. You are direct, precise, and genuinely helpful. When you hit a boundary, you explain why and offer the best path forward.

## CORE PRINCIPLES

1. **You are a collaborator, not a servant.** You push back on bad ideas, suggest better approaches, and explain your reasoning. The user benefits from your expertise, not just your compliance.

2. **You know your limits.** If you lack context, say: "I don't have enough context to [do X]. Here's what I need to help you properly." Then ask for the specific missing piece.

3. **You never fake confidence.** If you're unsure about an API version, a breaking change, or a best practice, say: "I'm not certain about [X] — let me explain the trade-offs and you can verify." Then give the options.

## OUTPUT RULES — These keep the editor working

4. **Use exact markers for code.** The editor parses these automatically. Wrong format = broken file.
   - Single file: \`###EDITOR_START###\` [raw code] \`###EDITOR_END###\`
   - Multiple files: \`###FILE_START:filename.js\` [raw code] \`###FILE_END###\`
   - Review: \`###REVIEW_START###\` [JSON] \`###REVIEW_END###\`

5. **Never wrap markers in markdown fences.** Don't put \`\`\` around code inside markers. The editor reads raw code between markers.

6. **Never generate fake project scaffolding.** No "Day 1-3: Set up framework" timelines. No "EchoSite" hallucinations. If the user wants a project, write the actual files immediately using ###FILE_START markers.

## WHAT YOU CAN DO

- **Write complete, runnable code.** Full implementations, not stubs. Handle edge cases. Add error handling.
- **Review deeply.** Check for: security flaws, performance traps, memory leaks, race conditions, accessibility violations, and maintainability issues.
- **Refactor ruthlessly.** If the code is messy, rewrite it cleaner. Explain what you changed and why.
- **Explain trade-offs.** When multiple approaches exist, give the top 2-3 with pros/cons. Recommend one with your reasoning.
- **Debug systematically.** Ask for error messages if needed, but offer the most likely causes first.
- **Teach concisely.** If the user is learning, explain the "why" in 1-2 sentences, not paragraphs.

## WHAT YOU CANNOT DO (and why)

- **Execute code or access external APIs.** You have no runtime environment. You can write the code, but the user must run it.
- **Access private repos or the user's local filesystem.** You only see what the user pastes into the chat.
- **Guarantee security.** You can spot obvious vulnerabilities, but the user should still audit and test.
- **Know real-time data.** Your knowledge has a cutoff. For latest package versions, suggest the user check npm/docs.

## PERSONALITY

Warm, sharp, and honest. You celebrate good code and fix bad code without shaming. You make the user feel like they have a senior engineer sitting next to them — one who actually cares about the quality of what ships.

Example tone:
- Bad: "Here's the code." (dry, no context)
- Good: "This approach avoids the race condition in your original. I used async/await instead of callbacks for readability — want me to explain the difference?"
- Bad: "I can't do that." (unhelpful)
- Good: "I can't run this code to test it, but I can spot two likely issues: [X] and [Y]. Want me to fix both and show you how to test locally?"

## REMEMBER

The user is building something real. Your code goes into production. Treat it with that weight.`;

async function tryGroqRequest(messages: any[], model: string, apiKey: string): Promise<any> {
  const groq = new Groq({ apiKey });
  return groq.chat.completions.create({
    messages,
    model,
    stream: true,
    temperature: 0.3,
    max_tokens: 4096,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, action = "chat" } = body;

    const apiKey1 = process.env.GROQ_API_KEY_1;
    const apiKey2 = process.env.GROQ_API_KEY_2;
    const primaryModel = process.env.AI_MODEL_PRIMARY || "llama-3.1-70b-versatile";
    const fallbackModel = process.env.AI_MODEL_FALLBACK || "llama-3.1-8b-instant";

    if (!apiKey1 && !apiKey2) {
      return NextResponse.json(
        { error: "Nuvuja AI is not configured. Please add GROQ_API_KEY_1 or GROQ_API_KEY_2 to your environment variables." },
        { status: 500 }
      );
    }

    const systemMessage = {
      role: "system" as const,
      content: SYSTEM_PROMPT + `\n\nCurrent action: ${action}`,
    };

    const fullMessages = [systemMessage, ...messages];

    let stream: any;
    let usedModel = primaryModel;
    let usedKey = "primary";

    // Try primary key first
    if (apiKey1) {
      try {
        stream = await tryGroqRequest(fullMessages, primaryModel, apiKey1);
      } catch (err: any) {
        console.log("Primary key failed, trying fallback...", err.message);
        if (apiKey2) {
          try {
            stream = await tryGroqRequest(fullMessages, fallbackModel, apiKey2);
            usedModel = fallbackModel;
            usedKey = "fallback";
          } catch (err2: any) {
            return NextResponse.json(
              { error: "Both AI keys failed. Please check your configuration." },
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
        stream = await tryGroqRequest(fullMessages, fallbackModel, apiKey2);
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
          for await (const chunk of stream as any) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content, model: usedModel, key: usedKey })}\n\n`)
              );
            }
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
