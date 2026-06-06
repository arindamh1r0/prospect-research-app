import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContact } from "@/lib/contacts";
import { getUserSettings } from "@/lib/settings";
import type { DraftEmailResponse, EmailTone } from "@/types/contact";

type Params = { params: Promise<{ id: string }> };

function buildPrompt(contact: Awaited<ReturnType<typeof getContact>>, tone: EmailTone): string {
  if (!contact) return "";

  const toneInstruction =
    tone === "formal"
      ? "Use a formal, polished, corporate tone."
      : tone === "direct"
      ? "Use a direct, confident, no-fluff tone. Get to the point fast."
      : "Use a professional but conversational tone — warm, not stiff.";

  return `You are a senior B2B sales consultant helping draft personalized cold outreach emails.

Prospect Profile:
- Name: ${contact.full_name}
- Title: ${contact.job_title ?? "N/A"} at ${contact.company_name ?? "N/A"}
- Email: ${contact.email ?? "N/A"}
- Location: ${contact.location ?? "N/A"}
- LinkedIn: ${contact.linkedin_url ?? "N/A"}
- Source: ${contact.source ?? "N/A"}
- Context / Intel: ${contact.context_notes ?? "None provided"}
- Tags: ${contact.tags?.join(", ") || "None"}

Task: Write a short, personalized cold outreach email (150–200 words max).
- Subject line included
- ${toneInstruction}
- Reference the context notes naturally if relevant
- End with a soft CTA (e.g. a 15-min call, not a hard sell)
- Do not use filler phrases like "I hope this email finds you well"

Return format:
Subject: <subject line>

<email body>`;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const [contact, settings] = await Promise.all([
    getContact(id, user.id),
    getUserSettings(user.id),
  ]);
  if (!contact) return NextResponse.json({ data: null, error: "Contact not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const tone: EmailTone = ["formal", "casual", "direct"].includes(body.tone) ? body.tone : "casual";

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ data: null, error: "OPENROUTER_API_KEY is not configured" }, { status: 500 });
  }

  const prompt = buildPrompt(contact, tone);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "ProspectAI",
    },
    body: JSON.stringify({
      model: settings.email_draft_model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({ data: null, error: `OpenRouter error: ${text}` }, { status: 502 });
  }

  const json = await response.json();
  const raw: string = json.choices?.[0]?.message?.content ?? "";

  // Parse "Subject: ..." line and body
  const subjectMatch = raw.match(/^Subject:\s*(.+)$/m);
  const subject = subjectMatch?.[1]?.trim() ?? "Outreach from ProspectAI";
  const emailBody = raw.replace(/^Subject:.*$/m, "").trim();

  const data: DraftEmailResponse = { subject, body: emailBody };
  return NextResponse.json({ data, error: null });
}
