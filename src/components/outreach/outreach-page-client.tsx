"use client";

import { useEffect, useState, useCallback } from "react";
import React from "react";
import Link from "next/link";
import type { OutreachEmailWithContact, OutreachStatus, OutreachSummary } from "@/types/outreach";
import { STATUS_LABELS, STATUS_COLORS, VALID_TRANSITIONS } from "@/types/outreach";
import { StatusBadge } from "@/components/outreach/status-badge";
import { StatusUpdatePanel } from "@/components/outreach/status-update-panel";
import { GmailBanner } from "@/components/outreach/gmail-banner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, RefreshCw, Eye, EyeOff, Pencil, ChevronDown } from "lucide-react";
import type { OutreachEmailRow } from "@/lib/types/database.types";
import { toast } from "sonner";

const ALL_STATUSES: OutreachStatus[] = ["drafted", "sent", "replied", "meeting_booked", "no_response"];

const EMPTY_SUMMARY: OutreachSummary = {
  drafted: 0, sent: 0, replied: 0, meeting_booked: 0, no_response: 0, reply_rate: 0,
};

type PanelType = "view" | "edit" | "status";
interface ActivePanel { emailId: string; panel: PanelType }

export function OutreachPageClient() {
  const [emails, setEmails] = useState<OutreachEmailWithContact[]>([]);
  const [summary, setSummary] = useState<OutreachSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OutreachStatus[]>([]);

  // Single active panel — only one expand open at a time across view / edit / status
  const [active, setActive] = useState<ActivePanel | null>(null);

  // Edit form state
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    statusFilter.forEach((s) => params.append("status", s));

    const [emailsRes, summaryRes] = await Promise.all([
      fetch(`/api/outreach-emails?${params}`),
      fetch("/api/outreach-emails?summary=true"),
    ]);
    const [emailsJson, summaryJson] = await Promise.all([emailsRes.json(), summaryRes.json()]);
    setEmails(emailsJson.data ?? []);
    setSummary(summaryJson.data ?? EMPTY_SUMMARY);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  function toggleStatus(s: OutreachStatus) {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function togglePanel(emailId: string, panel: PanelType, email?: OutreachEmailWithContact) {
    // Close if already open
    if (active?.emailId === emailId && active.panel === panel) {
      setActive(null);
      return;
    }
    // Populate edit state before opening edit panel
    if (panel === "edit" && email) {
      setEditSubject(email.subject);
      setEditBody((email as OutreachEmailRow).body ?? "");
    }
    setActive({ emailId, panel });
  }

  function handleUpdated(updated: OutreachEmailRow) {
    setEmails((prev) =>
      prev.map((e) => e.id === updated.id ? { ...e, ...updated } : e)
    );
    setActive(null);
    fetchData();
  }

  async function handleSaveEdit(emailId: string) {
    setSaving(true);
    const res = await fetch(`/api/outreach-emails/${emailId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: editSubject, body: editBody }),
    });
    const json = await res.json();
    if (res.ok) {
      setEmails((prev) => prev.map((e) => e.id === emailId ? { ...e, ...json.data } : e));
      setActive(null);
      toast.success("Email saved");
    } else {
      toast.error(json.error ?? "Failed to save");
    }
    setSaving(false);
  }

  const statCards = [
    { label: "Drafted", value: summary.drafted, color: "text-gray-600" },
    { label: "Sent", value: summary.sent, color: "text-blue-600" },
    { label: "Replied", value: summary.replied, color: "text-green-600" },
    { label: "Meeting Booked", value: summary.meeting_booked, color: "text-purple-600" },
    { label: "No Response", value: summary.no_response, color: "text-amber-600" },
    { label: "Reply Rate", value: `${summary.reply_rate}%`, color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <GmailBanner />

      {/* Stats row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search prospect name, company, subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <Badge
              key={s}
              variant={statusFilter.includes(s) ? "default" : "secondary"}
              className={`cursor-pointer ${!statusFilter.includes(s) ? STATUS_COLORS[s] : ""}`}
              onClick={() => toggleStatus(s)}
            >
              {STATUS_LABELS[s]}
            </Badge>
          ))}
          {statusFilter.length > 0 && (
            <button
              onClick={() => setStatusFilter([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Pipeline table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
      ) : emails.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
          <p className="text-sm">No outreach emails found.</p>
          <p className="text-xs mt-1">Draft emails from a contact profile to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Tone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => {
                const isView   = active?.emailId === email.id && active.panel === "view";
                const isEdit   = active?.emailId === email.id && active.panel === "edit";
                const isStatus = active?.emailId === email.id && active.panel === "status";
                const hasTransitions = (VALID_TRANSITIONS[email.status as OutreachStatus]?.length ?? 0) > 0;

                return (
                  <React.Fragment key={email.id}>
                    {/* Main row */}
                    <TableRow className={isEdit || isView || isStatus ? "bg-muted/10" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            <Link href={`/contacts/${email.contact_id}`} className="hover:underline">
                              {email.contacts?.full_name ?? "—"}
                            </Link>
                          </p>
                          <p className="text-xs text-muted-foreground">{email.contacts?.company_name ?? ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{email.subject}</p>
                      </TableCell>
                      <TableCell>
                        {email.tone && <span className="text-xs capitalize text-muted-foreground">{email.tone}</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={email.status as OutreachStatus} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(email.updated_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <p className="text-xs text-muted-foreground truncate">{email.outcome_notes ?? "—"}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            variant={isView ? "secondary" : "ghost"}
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={() => togglePanel(email.id, "view")}
                          >
                            {isView ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            <span className="hidden sm:inline">{isView ? "Hide" : "View"}</span>
                          </Button>

                          {/* Edit — drafted only */}
                          {email.status === "drafted" && (
                            <Button
                              variant={isEdit ? "secondary" : "ghost"}
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => togglePanel(email.id, "edit", email)}
                            >
                              <Pencil className="size-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          )}

                          {/* Change status */}
                          {hasTransitions && (
                            <Button
                              variant={isStatus ? "secondary" : "outline"}
                              size="sm"
                              className="gap-1 text-xs"
                              onClick={() => togglePanel(email.id, "status")}
                            >
                              <ChevronDown className="size-3.5" />
                              <span>Status</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* View panel */}
                    {isView && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30 p-5">
                          <div className="max-w-2xl space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                              Subject
                            </p>
                            <p className="text-sm font-medium">{email.subject}</p>
                            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase pt-2">
                              Body
                            </p>
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                              {(email as OutreachEmailRow).body}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Edit panel — drafted emails only */}
                    {isEdit && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20 p-5">
                          <div className="max-w-2xl space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                              Edit Draft
                            </p>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">Subject</label>
                              <Input
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                placeholder="Subject"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">Body</label>
                              <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                placeholder="Email body…"
                                rows={12}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm font-sans leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" onClick={() => handleSaveEdit(email.id)} disabled={saving}>
                                {saving ? "Saving…" : "Save Changes"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setActive(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Status update panel */}
                    {isStatus && (
                      <TableRow>
                        <TableCell colSpan={7} className="p-4 bg-muted/10">
                          <div className="max-w-md">
                            <StatusUpdatePanel
                              email={email as unknown as OutreachEmailRow}
                              onUpdated={handleUpdated}
                              onClose={() => setActive(null)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
