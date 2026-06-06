import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings, upsertUserSettings } from "@/lib/settings";
import { AI_MODELS } from "@/types/settings";

const VALID_MODEL_IDS = new Set(AI_MODELS.map((m) => m.id));

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const data = await getUserSettings(user.id);
  return NextResponse.json({ data, error: null });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { email_draft_model, research_model } = body;

  if (email_draft_model && !VALID_MODEL_IDS.has(email_draft_model)) {
    return NextResponse.json({ data: null, error: "Invalid email_draft_model" }, { status: 400 });
  }
  if (research_model && !VALID_MODEL_IDS.has(research_model)) {
    return NextResponse.json({ data: null, error: "Invalid research_model" }, { status: 400 });
  }

  try {
    const data = await upsertUserSettings(user.id, {
      ...(email_draft_model ? { email_draft_model } : {}),
      ...(research_model ? { research_model } : {}),
    });
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
