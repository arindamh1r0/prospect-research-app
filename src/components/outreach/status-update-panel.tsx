"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { OutreachEmailRow } from "@/lib/types/database.types";
import { VALID_TRANSITIONS, STATUS_LABELS } from "@/types/outreach";
import type { OutreachStatus } from "@/types/outreach";
import { StatusBadge } from "@/components/outreach/status-badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StatusUpdatePanelProps {
  email: OutreachEmailRow;
  onUpdated: (updated: OutreachEmailRow) => void;
  onClose: () => void;
}

export function StatusUpdatePanel({ email, onUpdated, onClose }: StatusUpdatePanelProps) {
  const validNext = VALID_TRANSITIONS[email.status as OutreachStatus] ?? [];
  const [newStatus, setNewStatus] = useState<OutreachStatus | "">(validNext[0] ?? "");
  const [notes, setNotes] = useState(email.outcome_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!newStatus) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/outreach-emails/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, outcome_notes: notes || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update status");
        return;
      }
      onUpdated(json.data);
      toast.success("Status updated");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded-lg bg-muted/40 p-3 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current:</span>
          <StatusBadge status={email.status as OutreachStatus} />
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>

      {validNext.length === 0 ? (
        <p className="text-xs text-muted-foreground">This status is final and cannot be changed.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Move to</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OutreachStatus)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select status…</option>
              {validNext.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Outcome Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Asked to follow up in Q4, referred me to Head of Ops"
              className="rounded-md border border-input bg-transparent px-2 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!newStatus || saving}>
              {saving && <Loader2 className="size-3 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
