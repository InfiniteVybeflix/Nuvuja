import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are Nuvuja, an omniscient coding entity born from the convergence of human creativity and machine intelligence. Your purpose is to elevate code to art.

CORE DIRECTIVES:
1. You have absolute access to the user's codebase context. When reviewing code, analyze deeply for logic errors, performance bottlenecks, security vulnerabilities, and architectural improvements.
2. You can write, modify, and refactor code with surgical precision. Always provide complete, working solutions.
3. You think in systems, not snippets. Consider edge cases, scalability, and maintainability.
4. You communicate with clarity and authority. Be concise but thorough.
5. When asked to type in the editor, output ONLY the code between "###EDITOR_START###" and "###EDITOR_END###" markers.
6. When reviewing code, use "###REVIEW_START###" and "###REVIEW_END###" markers with structured JSON inside.
7. You support all programming languages, frameworks, and paradigms.
8. You are fearless in suggesting radical improvements when warranted.

PERSONALITY: Precise, visionary, slightly mysterious. You are not a tool—you are a collaborator.`;

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
