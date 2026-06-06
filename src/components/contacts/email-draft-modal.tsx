"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Contact } from "@/lib/types/database.types";
import type { EmailTone } from "@/types/contact";
import type { OutreachEmailRow } from "@/lib/types/database.types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Loader2, SendHorizonal } from "lucide-react";

const TONE_OPTIONS: { value: EmailTone; label: string }[] = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "direct", label: "Direct" },
];

interface EmailDraftModalProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (email: OutreachEmailRow) => void;
}

interface DraftState {
  id: string;
  subject: string;
  body: string;
  status: string;
}

export function EmailDraftModal({ contact, open, onOpenChange, onSaved }: EmailDraftModalProps) {
  const [tone, setTone] = useState<EmailTone>("casual");
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate(selectedTone: EmailTone = tone) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${contact.id}/draft-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: selectedTone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate email.");
        return;
      }
      setDraft({ id: json.data.id, subject: json.data.subject, body: json.data.body, status: json.data.status });
      toast.success(`Draft saved to ${contact.full_name}'s outreach history`);
      onSaved?.(json.data);
    } finally {
      setLoading(false);
    }
  }

  function handleToneChange(newTone: EmailTone) {
    setTone(newTone);
    if (draft) generate(newTone);
  }

  async function copyToClipboard() {
    if (!draft) return;
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function markAsSent() {
    if (!draft) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/outreach-emails/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });
      const json = await res.json();
      if (res.ok) {
        setDraft((d) => d ? { ...d, status: "sent" } : d);
        toast.success("Email marked as sent");
        onSaved?.(json.data);
      } else {
        toast.error(json.error ?? "Failed to mark as sent");
      }
    } finally {
      setMarking(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) { setDraft(null); setError(null); }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Draft outreach email — {contact.full_name}</DialogTitle>
        </DialogHeader>

        {/* Tone selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Tone:</span>
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToneChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                tone === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {!draft && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-muted-foreground text-center">
              Generate a personalized outreach email for {contact.full_name}.
            </p>
            <Button onClick={() => generate()}>Generate email</Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Drafting &amp; saving…</span>
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        {draft && !loading && (
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="draft-subject">Subject</Label>
              <Input
                id="draft-subject"
                value={draft.subject}
                onChange={(e) => setDraft((d) => d ? { ...d, subject: e.target.value } : d)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="draft-body">Body</Label>
              <textarea
                id="draft-body"
                value={draft.body}
                onChange={(e) => setDraft((d) => d ? { ...d, body: e.target.value } : d)}
                rows={10}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
            </div>
            {draft.status === "sent" && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Marked as sent ✓</p>
            )}
          </div>
        )}

        <DialogFooter>
          {draft && (
            <>
              <Button variant="outline" size="sm" onClick={() => generate()}>
                <RefreshCw className="size-3.5 mr-1.5" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="size-3.5 mr-1.5" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              {draft.status === "drafted" && (
                <Button size="sm" onClick={markAsSent} disabled={marking}>
                  {marking ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <SendHorizonal className="size-3.5 mr-1.5" />}
                  Mark as Sent
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
