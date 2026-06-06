"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Contact } from "@/lib/types/database.types";
import { ContactTable } from "@/components/contacts/contact-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";

const TAG_SUGGESTIONS = ["warm lead", "followed up", "Series A", "cold", "VIP", "churned"];

export function ContactsListClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags))).sort();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeTag) params.set("tag", activeTag);
    const res = await fetch(`/api/contacts?${params}`);
    const json = await res.json();
    setContacts(json.data ?? []);
    setLoading(false);
  }, [search, activeTag]);

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

      <div className="flex flex-wrap gap-1.5">
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="text-xs px-2.5 py-1 rounded-full border border-input text-muted-foreground hover:bg-accent transition-colors"
          >
            Clear filter
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

      <p className="text-xs text-muted-foreground">
        {loading ? "Loading…" : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
      </p>

      {!loading && <ContactTable contacts={contacts} onDelete={handleDelete} />}
    </div>
  );
}
