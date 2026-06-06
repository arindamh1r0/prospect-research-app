"use client";

import Link from "next/link";
import { useState } from "react";
import type { Contact } from "@/lib/types/database.types";
import type { OutreachStatus } from "@/types/outreach";
import { StatusBadge } from "@/components/outreach/status-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmailDraftModal } from "@/components/contacts/email-draft-modal";
import { Pencil, Trash2, Mail, Eye } from "lucide-react";

export interface ContactWithOutreach extends Contact {
  last_outreach?: {
    contact_id: string;
    status: string;
    subject: string;
    updated_at: string;
  } | null;
}

interface ContactTableProps {
  contacts: ContactWithOutreach[];
  onDelete?: (id: string) => void;
}

export function ContactTable({ contacts, onDelete }: ContactTableProps) {
  const [draftContact, setDraftContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) onDelete?.(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No contacts yet.</p>
        <Button className="mt-4" variant="outline" size="sm" render={<Link href="/contacts/new" />}>
          Add your first contact
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Outreach</TableHead>
            <TableHead>Added</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.full_name}</TableCell>
              <TableCell>{c.company_name ?? <span className="text-muted-foreground text-xs">—</span>}</TableCell>
              <TableCell>{c.job_title ?? <span className="text-muted-foreground text-xs">—</span>}</TableCell>
              <TableCell className="text-xs">{c.email ?? <span className="text-muted-foreground">—</span>}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                  {c.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{c.tags.length - 3}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {c.last_outreach ? (
                  <div className="space-y-0.5">
                    <StatusBadge status={c.last_outreach.status as OutreachStatus} />
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.last_outreach.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(c.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" render={<Link href={`/contacts/${c.id}`} />}>
                    <Eye className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" render={<Link href={`/contacts/${c.id}/edit`} />}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDraftContact(c)}>
                    <Mail className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {draftContact && (
        <EmailDraftModal
          contact={draftContact}
          open={true}
          onOpenChange={(open) => { if (!open) setDraftContact(null); }}
        />
      )}
    </>
  );
}
