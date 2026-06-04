import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { company_name, division, region, prospect_id, refresh } = body;

  let finalProspectId = prospect_id;

  // Create or fetch prospect record
  if (!refresh) {
    if (!company_name) {
      return NextResponse.json({ error: "company_name is required" }, { status: 400 });
    }

    const { data: prospect, error: insertError } = await supabase
      .from("prospects")
      .insert({ company_name, division: division || null, region: region || null, created_by: user.id })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    finalProspectId = prospect.id;
  }

  // Create a pending research record
  const { error: researchError } = await supabase
    .from("research_results")
    .insert({
      prospect_id: finalProspectId,
      source: "n8n_agent",
      raw_data: {},
      status: "pending",
    });

  if (researchError) {
    return NextResponse.json({ error: researchError.message }, { status: 500 });
  }

  // Fire n8n webhook (non-blocking)
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect_id: finalProspectId, company_name, division, region }),
    }).catch(() => {
      // n8n failure is non-fatal — research_results row stays "pending"
    });
  }

  return NextResponse.json({ prospectId: finalProspectId });
}
