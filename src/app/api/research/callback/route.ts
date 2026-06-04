import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// n8n calls this endpoint when research is complete (or failed).
// POST body: { prospect_id, summary, raw_data?, status? }
// Header: x-n8n-secret must match N8N_CALLBACK_SECRET env var (if set).
export async function POST(request: Request) {
  const secret = process.env.N8N_CALLBACK_SECRET;
  if (secret) {
    const incoming = request.headers.get("x-n8n-secret");
    if (incoming !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Use service role key to bypass RLS — this is a trusted server-to-server call from n8n.
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await request.json();
  const { prospect_id, summary, raw_data, status = "completed" } = body;

  if (!prospect_id || !summary) {
    return NextResponse.json(
      { error: "prospect_id and summary are required" },
      { status: 400 }
    );
  }

  // Find the most recent in-flight research record (pending or processing)
  const { data: existing, error: fetchError } = await supabase
    .from("research_results")
    .select("id")
    .eq("prospect_id", prospect_id)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "No pending research record found for this prospect" },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabase
    .from("research_results")
    .update({
      summary,
      raw_data: raw_data ?? {},
      status,
      refreshed_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
