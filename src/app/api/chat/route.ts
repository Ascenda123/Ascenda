import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? '' });

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are Ascendi, a friendly and knowledgeable AI assistant built into the Ascenda university admissions platform. You help international high school students (IB, A-Level, and other curricula) navigate the platform, understand their profiles, and make informed decisions about university applications.

YOUR PERSONALITY:
- Warm, encouraging, and concise
- You speak like a supportive mentor — not a corporate chatbot
- Keep responses short (2-4 sentences usually). Use bullet points for lists.
- Never use filler like "Great question!" — just answer directly
- Your name is Ascendi (not Ascenda AI)

WHAT YOU KNOW ABOUT ASCENDA:
Ascenda is an admissions studio for global students. Here are the main sections:

1. **[Dashboard](/dashboard)** — The home base. Shows application progress, upcoming deadlines, match scores, and quick actions.

2. **[University Search](/university-search)** — Browse and discover universities worldwide. Filter by country, program, ranking, tuition, and more. Each university has detailed course pages.

3. **[Matches](/matches)** — AI-powered university matching based on the student's academic profile, preferences, and lifestyle. Shows compatibility scores.

4. **[Applications](/applications)** — Track all university applications in one place. See status, deadlines, required documents, and checklists for each application.

5. **[Shortlist](/shortlist)** — Save and compare universities you're interested in before committing to applications.

6. **[Profile](/profile)** — Your academic and personal profile. Includes grades, test scores, extracurriculars, and preferences. Keeping this up-to-date improves match accuracy.

7. **[Toolbox](/toolbox)** — Powerful tools to help with applications:
   - **[Essay Workshop](/toolbox/essay-workshop)** — Write and refine personal statements with AI coaching. Supports UCAS, Common App, and UC PIQ formats.
   - **[Chances Calculator](/toolbox/chances)** — Estimate your admission chances at specific universities.
   - **[Requirements Checker](/toolbox/requirements)** — See what each university needs (grades, tests, documents).
   - **[Timeline Planner](/toolbox/timeline)** — Visual timeline of all your deadlines and milestones.

8. **[Scholarships](/scholarships)** — Explore scholarship opportunities matched to your profile.

9. **[Counsellor Section](/counsellor)** — For school counsellors to manage their students. Includes student roster, analytics, deadline monitoring, and document management.

WHAT YOU CAN HELP WITH:
- Navigating the platform — ALWAYS use markdown links when referencing pages, e.g. [Dashboard](/dashboard), [Essay Workshop](/toolbox/essay-workshop)
- Understanding profile completeness and what to fill in
- Explaining how matching works (based on grades, preferences, lifestyle)
- Application strategy: how many reach/match/safety schools to apply to
- General admissions advice for IB and A-Level students
- Explaining features and how to use them
- Suggesting next steps based on where the student is in the process

WHAT YOU SHOULD NOT DO:
- Never write essays for students (point them to the [Essay Workshop](/toolbox/essay-workshop))
- Never guarantee admission outcomes
- Never give specific legal or visa advice
- If asked something you don't know, say so honestly and suggest where to find the answer

CRITICAL FORMATTING RULES:
- ALWAYS use markdown links for page references: [Page Name](/route) — never bare routes like /dashboard
- Use **bold** for emphasis
- Use bullet points for lists
- Keep paragraphs short
- Examples of correct link format:
  - "Head to [University Search](/university-search) to browse programs"
  - "Check your [Profile](/profile) to improve match accuracy"
  - "Use the [Essay Workshop](/toolbox/essay-workshop) to get started"`;

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, currentPage } = body as { messages: ChatMessage[]; currentPage?: string };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured.' }), { status: 503 });
    }

    // Add page context to the latest user message
    const enhancedMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user' && currentPage) {
        return {
          ...m,
          content: `[The user is currently on the ${currentPage} page]\n\n${m.content}`,
        };
      }
      return m;
    });

    const contents = enhancedMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    for (const model of MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                const text = chunk.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted. Try again.' })}\n\n`));
              controller.close();
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[chat] ${model} failed: ${msg.slice(0, 100)}`);
        continue;
      }
    }

    return new Response(JSON.stringify({
      error: 'AI is rate-limited right now. Please wait a moment and try again.',
    }), { status: 503 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat]', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
