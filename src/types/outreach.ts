export type OutreachStatus = "drafted" | "sent" | "replied" | "meeting_booked" | "no_response";
export type OutreachTone = "formal" | "casual" | "direct";

export interface OutreachEmail {
  id: string;
  prospect_id: string; // alias: contact_id in DB
  contact_id: string;
  user_id: string;
  subject: string;
  body: string;
  tone: OutreachTone | null;
  status: OutreachStatus;
  sent_at: string | null;
  replied_at: string | null;
  outcome_notes: string | null;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export type OutreachSummary = Record<OutreachStatus, number> & { reply_rate: number };

// Valid status transitions — drafted → sent | no_response; sent → replied | meeting_booked | no_response
export const VALID_TRANSITIONS: Record<OutreachStatus, OutreachStatus[]> = {
  drafted: ["sent", "no_response"],
  sent: ["replied", "meeting_booked", "no_response"],
  replied: [],
  meeting_booked: [],
  no_response: [],
};

export const STATUS_LABELS: Record<OutreachStatus, string> = {
  drafted: "Drafted",
  sent: "Sent",
  replied: "Replied",
  meeting_booked: "Meeting Booked",
  no_response: "No Response",
};

export const STATUS_COLORS: Record<OutreachStatus, string> = {
  drafted: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  replied: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  meeting_booked: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  no_response: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

// Enriched type returned by the global /api/outreach-emails list
export interface OutreachEmailWithContact extends OutreachEmail {
  contacts: {
    full_name: string;
    company_name: string | null;
  } | null;
}
