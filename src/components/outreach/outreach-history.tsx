"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { OutreachEmailRow } from "@/lib/types/database.types";
import type { Contact } from "@/lib/types/database.types";
import type { OutreachStatus } from "@/types/outreach";
import { StatusBadge } from "@/components/outreach/status-badge";
import { StatusUpdatePanel } from "@/components/outreach/status-update-panel";
import { EmailDraftModal } from "@/components/contacts/email-draft-modal";
import { Button } from "@/components/ui/button";
import { Mail, Pencil, Trash2, RefreshCw } from "lucide-react";

interface OutreachHistoryProps {
  contact: Contact;
}

export function OutreachHistory({ contact }: OutreachHistoryProps) {
  const [emails, setEmails] = useState<OutreachEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftOpen, setDraftOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null); // view body
  const [updatingId, setUpdatingId] = useState<string | null>(null); // status panel
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/contacts/${contact.id}/emails`);
    const json = await res.json();
    setEmails(json.data ?? []);
    setLoading(false);
  }, [contact.id]);

  useEffect(() => { const t = setTimeout(fetch_, 0); return () => clearTimeout(t); }, [fetch_]);

  function handleUpdated(updated: OutreachEmailRow) {
    setEmails((prev) => prev.map((e) => e.id === updated.id ? updated : e));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/outreach-emails/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEmails((prev) => prev.filter((e) => e.id !== id));
      toast.success("Draft deleted");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Failed to delete");
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Outreach History</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetch_} title="Refresh">
            <RefreshCw className="size-3.5" />
          </Button>
          <Button size="sm" onClick={() => setDraftOpen(true)}>
            <Mail className="size-3.5 mr-1.5" />
            Draft New Email
          </Button>
        </div>
      </div>

      {loading && <p className="text-xs text-muted-foreground py-4 text-center">Loading…</p>}

      {!loading && emails.length === 0 && (
        <div className="rounded-xl border border-dashed py-8 text-center text-muted-foreground">
          <p className="text-sm">No outreach emails yet.</p>
          <p className="text-xs mt-1">Click &ldquo;Draft New Email&rdquo; to get started.</p>
        </div>
      )}

      {!loading && emails.length > 0 && (
        <div className="rounded-xl border divide-y overflow-hidden">
          {emails.map((email) => (
            <div key={email.id} className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={email.status as OutreachStatus} />
                    {email.tone && (
                      <span className="text-xs text-muted-foreground capitalize">{email.tone}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(email.updated_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{email.subject}</p>
                  {email.outcome_notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{email.outcome_notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                    title="View / Edit"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUpdatingId(updatingId === email.id ? null : email.id)}
                    title="Update Status"
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                  {email.status === "drafted" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(email.id)}
                      disabled={deletingId === email.id}
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline email body view */}
              {expandedId === email.id && (
                <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1.5">
                  <p className="font-medium">Subject: {email.subject}</p>
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">{email.body}</pre>
                </div>
              )}

              {/* Inline status update panel */}
              {updatingId === email.id && (
                <StatusUpdatePanel
                  email={email}
                  onUpdated={(updated) => { handleUpdated(updated); setUpdatingId(null); }}
                  onClose={() => setUpdatingId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <EmailDraftModal
        contact={contact}
        open={draftOpen}
        onOpenChange={setDraftOpen}
        onSaved={(saved) => setEmails((prev) => [saved as OutreachEmailRow, ...prev])}
      />
    </div>
  );
}
