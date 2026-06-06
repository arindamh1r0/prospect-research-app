import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateOutreachEmail, deleteOutreachEmail } from "@/lib/outreach";
import { VALID_TRANSITIONS } from "@/types/outreach";
import type { OutreachStatus } from "@/types/outreach";

// GMAIL HOOK: When gmail_thread_id is present, this manual update can be
// overridden by the Gmail sync job. Manual updates should set a
// `manually_overridden: true` flag (future column) to prevent sync from
// reverting user changes.

type Params = { params: Promise<{ emailId: string }> };

const ALL_STATUSES = new Set<OutreachStatus>([
  "drafted", "sent", "replied", "meeting_booked", "no_response",
]);

export async function PATCH(request: NextRequest, { params }: Params) {
  const { emailId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  // Fetch current row to validate transition
  const { data: current, error: fetchErr } = await supabase
    .from("outreach_emails")
    .select("status, user_id")
    .eq("id", emailId)
    .single();

  if (fetchErr || !current) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  if (current.user_id !== user.id) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { status, outcome_notes, sent_at, replied_at, subject, body: emailBody } = body;

  if ((subject !== undefined || emailBody !== undefined) && current.status !== "drafted") {
    return NextResponse.json(
      { data: null, error: "Can only edit content of drafted emails." },
      { status: 422 }
    );
  }

  if (status !== undefined) {
    if (!ALL_STATUSES.has(status)) {
      return NextResponse.json({ data: null, error: "Invalid status" }, { status: 400 });
    }
    const allowed = VALID_TRANSITIONS[current.status as OutreachStatus];
    if (allowed.length === 0) {
      return NextResponse.json(
        { data: null, error: `Status '${current.status}' is terminal and cannot be changed.` },
        { status: 422 }
      );
    }
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { data: null, error: `Cannot transition from '${current.status}' to '${status}'. Allowed: ${allowed.join(", ")}` },
        { status: 422 }
      );
    }
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (status !== undefined) {
    patch.status = status;
    if (status === "sent" && !sent_at) patch.sent_at = now;
    if ((status === "replied" || status === "meeting_booked") && !replied_at) patch.replied_at = now;
  }
  if (sent_at !== undefined) patch.sent_at = sent_at;
  if (replied_at !== undefined) patch.replied_at = replied_at;
  if (outcome_notes !== undefined) patch.outcome_notes = outcome_notes;
  if (subject !== undefined) patch.subject = subject;
  if (emailBody !== undefined) patch.body = emailBody;

  try {
    const data = await updateOutreachEmail(emailId, user.id, patch as Parameters<typeof updateOutreachEmail>[2]);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// Hard delete — only allowed when status = 'drafted'
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { emailId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { data: current } = await supabase
    .from("outreach_emails")
    .select("status, user_id")
    .eq("id", emailId)
    .single();

  if (!current) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  if (current.user_id !== user.id) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  if (current.status !== "drafted") {
    return NextResponse.json({ data: null, error: "Only drafted emails can be deleted." }, { status: 422 });
  }

  try {
    await deleteOutreachEmail(emailId, user.id);
    return NextResponse.json({ data: { id: emailId }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
