import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const REVIEW_PROMPT = `You are Nuvuja, a legendary code reviewer with centuries of compiled wisdom. Analyze the provided code with brutal honesty and surgical precision.

OUTPUT FORMAT: Return a JSON object wrapped in ###REVIEW_START### and ###REVIEW_END### markers.

The JSON must have this structure:
{
  "score": number (0-100),
  "summary": "brief overall assessment",
  "issues": [
    {
      "severity": "error|warning|info",
      "line": number,
      "message": "description",
      "suggestion": "fix or improvement"
    }
  ],
  "improvements": ["suggestion 1", "suggestion 2"],
  "security": ["security concern 1"],
  "performance": ["performance note 1"]
}

RULES:
- Be ruthless about bugs, anti-patterns, and security flaws
- Praise elegance when found
- Suggest concrete improvements, not vague advice
- Consider: memory leaks, injection vulnerabilities, race conditions, edge cases
- Line numbers must be accurate`;

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    const apiKey = process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY_2;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Build content using string concatenation to avoid backtick escaping issues
    const userContent = "Review this " + language + " code:\n" +
      "```" + language + "\n" + code + "\n```";

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: REVIEW_PROMPT },
        {
          role: "user",
          content: userContent,
        },
      ],
      model: process.env.AI_MODEL_PRIMARY || "llama-3.1-70b-versatile",
      temperature: 0.2,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Extract JSON from markers
    const match = content.match(/###REVIEW_START###([\s\S]*?)###REVIEW_END###/);
    let review;
    if (match) {
      try {
        review = JSON.parse(match[1].trim());
      } catch {
        review = { raw: content, score: 0, summary: "Parse error", issues: [] };
      }
    } else {
      review = { raw: content, score: 0, summary: "No review format found", issues: [] };
    }

    return NextResponse.json({ review, raw: content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
