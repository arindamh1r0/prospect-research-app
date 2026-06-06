"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ContactTable, type ContactWithOutreach } from "@/components/contacts/contact-table";
import type { OutreachStatus } from "@/types/outreach";
import { STATUS_LABELS } from "@/types/outreach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";

const TAG_SUGGESTIONS = ["warm lead", "followed up", "Series A", "cold", "VIP", "churned"];

const OUTREACH_STATUSES: OutreachStatus[] = ["drafted", "sent", "replied", "meeting_booked", "no_response"];

export function ContactsListClient() {
  const [contacts, setContacts] = useState<ContactWithOutreach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [outreachStatus, setOutreachStatus] = useState<OutreachStatus | null>(null);

  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags))).sort();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeTag) params.set("tag", activeTag);
    const res = await fetch(`/api/contacts?${params}`);
    const json = await res.json();
    let data: ContactWithOutreach[] = json.data ?? [];
    if (outreachStatus) {
      data = data.filter((c) => c.last_outreach?.status === outreachStatus);
    }
    setContacts(data);
    setLoading(false);
  }, [search, activeTag, outreachStatus]);

  useEffect(() => {
    const t = setTimeout(fetchContacts, 300);
    return () => clearTimeout(t);
  }, [fetchContacts]);

  function handleDelete(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  const displayTags = allTags.length > 0 ? allTags : TAG_SUGGESTIONS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name, company, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" render={<Link href="/contacts/new" />}>
          <UserPlus className="size-3.5 mr-1.5" />
          Add Contact
        </Button>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        {(activeTag || outreachStatus) && (
          <button
            onClick={() => { setActiveTag(null); setOutreachStatus(null); }}
            className="text-xs px-2.5 py-1 rounded-full border border-input text-muted-foreground hover:bg-accent transition-colors"
          >
            Clear filters
          </button>
        )}
        {displayTags.map((tag) => (
          <Badge
            key={tag}
            variant={activeTag === tag ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Outreach status filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Last outreach:</span>
        {OUTREACH_STATUSES.map((s) => (
          <Badge
            key={s}
            variant={outreachStatus === s ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setOutreachStatus(outreachStatus === s ? null : s)}
          >
            {STATUS_LABELS[s]}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {loading ? "Loading…" : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
      </p>

      {!loading && <ContactTable contacts={contacts} onDelete={handleDelete} />}
    </div>
  );
}
