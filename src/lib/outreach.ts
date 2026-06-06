import { createClient } from "@/lib/supabase/server";
import type { OutreachEmailRow, OutreachEmailInsert } from "@/lib/types/database.types";
import type { OutreachStatus, OutreachSummary, OutreachEmailWithContact } from "@/types/outreach";

export async function listEmailsForContact(
  contactId: string,
  userId: string
): Promise<OutreachEmailRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_emails")
    .select("*")
    .eq("contact_id", contactId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEmailSummary(
  contactId: string,
  userId: string
): Promise<OutreachSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_emails")
    .select("status")
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const counts: Record<OutreachStatus, number> = {
    drafted: 0, sent: 0, replied: 0, meeting_booked: 0, no_response: 0,
  };
  for (const row of data ?? []) {
    counts[row.status as OutreachStatus]++;
  }
  const sent = counts.sent;
  const replies = counts.replied + counts.meeting_booked;
  return {
    ...counts,
    reply_rate: sent > 0 ? Math.round((replies / sent) * 100) : 0,
  };
}

export async function saveOutreachEmail(
  payload: Omit<OutreachEmailInsert, "user_id">,
  userId: string
): Promise<OutreachEmailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_emails")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOutreachEmail(
  emailId: string,
  userId: string,
  patch: {
    status?: OutreachStatus;
    outcome_notes?: string | null;
    sent_at?: string | null;
    replied_at?: string | null;
    subject?: string;
    body?: string;
  }
): Promise<OutreachEmailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_emails")
    .update(patch)
    .eq("id", emailId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteOutreachEmail(emailId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("outreach_emails")
    .delete()
    .eq("id", emailId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function listAllOutreachEmails(
  userId: string,
  opts?: {
    status?: OutreachStatus[];
    search?: string;
    from?: string;
    to?: string;
  }
): Promise<OutreachEmailWithContact[]> {
  const supabase = await createClient();
  let query = supabase
    .from("outreach_emails")
    .select("*, contacts(full_name, company_name)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (opts?.status?.length) {
    query = query.in("status", opts.status);
  }
  if (opts?.search) {
    // search against joined contact name/company via manual filter after fetch
  }
  if (opts?.from) query = query.gte("created_at", opts.from);
  if (opts?.to) query = query.lte("created_at", opts.to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data ?? []) as OutreachEmailWithContact[];

  if (opts?.search) {
    const q = opts.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.contacts?.full_name.toLowerCase().includes(q) ||
        e.contacts?.company_name?.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
    );
  }
  return results;
}

export async function getGlobalSummary(userId: string): Promise<OutreachSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outreach_emails")
    .select("status")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const counts: Record<OutreachStatus, number> = {
    drafted: 0, sent: 0, replied: 0, meeting_booked: 0, no_response: 0,
  };
  for (const row of data ?? []) counts[row.status as OutreachStatus]++;
  const sent = counts.sent;
  const replies = counts.replied + counts.meeting_booked;
  return { ...counts, reply_rate: sent > 0 ? Math.round((replies / sent) * 100) : 0 };
}

// Fetch latest email per contact in one query — used for the contacts list "Last Outreach" column
export async function getLatestEmailPerContact(
  userId: string,
  contactIds: string[]
): Promise<Map<string, Pick<OutreachEmailRow, "contact_id" | "status" | "subject" | "updated_at">>> {
  if (contactIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("outreach_emails")
    .select("contact_id, status, subject, updated_at")
    .eq("user_id", userId)
    .in("contact_id", contactIds)
    .order("updated_at", { ascending: false });

  const map = new Map<string, Pick<OutreachEmailRow, "contact_id" | "status" | "subject" | "updated_at">>();
  for (const row of data ?? []) {
    if (!map.has(row.contact_id)) map.set(row.contact_id, row);
  }
  return map;
}
