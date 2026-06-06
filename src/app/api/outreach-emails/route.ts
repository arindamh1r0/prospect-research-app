import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listAllOutreachEmails, getGlobalSummary } from "@/lib/outreach";
import type { OutreachStatus } from "@/types/outreach";

const VALID_STATUSES = new Set<OutreachStatus>([
  "drafted", "sent", "replied", "meeting_booked", "no_response",
]);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const statusParam = searchParams.getAll("status");
  const search = searchParams.get("search") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const summaryOnly = searchParams.get("summary") === "true";

  const status = statusParam.filter((s) => VALID_STATUSES.has(s as OutreachStatus)) as OutreachStatus[];

  try {
    if (summaryOnly) {
      const summary = await getGlobalSummary(user.id);
      return NextResponse.json({ data: summary, error: null });
    }
    const data = await listAllOutreachEmails(user.id, { status, search, from, to });
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
