"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/lib/types/database.types";
import type { ContactFormValues } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  initial?: Contact;
}

const SOURCE_OPTIONS = ["Manual", "LinkedIn", "Apollo", "Referral", "Event", "Other"];

export function ContactForm({ initial }: ContactFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<ContactFormValues>({
    full_name: initial?.full_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    company_name: initial?.company_name ?? "",
    job_title: initial?.job_title ?? "",
    linkedin_url: initial?.linkedin_url ?? "",
    website: initial?.website ?? "",
    location: initial?.location ?? "",
    context_notes: initial?.context_notes ?? "",
    tags: initial?.tags?.join(", ") ?? "",
    source: initial?.source ?? "",
  });

  function set(key: keyof ContactFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    const tags = values.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      full_name: values.full_name.trim(),
      email: values.email.trim() || null,
      phone: values.phone.trim() || null,
      company_name: values.company_name.trim() || null,
      job_title: values.job_title.trim() || null,
      linkedin_url: values.linkedin_url.trim() || null,
      website: values.website.trim() || null,
      location: values.location.trim() || null,
      context_notes: values.context_notes.trim() || null,
      tags,
      source: values.source.trim() || null,
    };

    setLoading(true);
    try {
      const url = initial ? `/api/contacts/${initial.id}` : "/api/contacts";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        return;
      }
      router.push(`/contacts/${json.data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" id="full_name">
          <Input id="full_name" value={values.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Smith" required />
        </Field>
        <Field label="Email" id="email">
          <Input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme.com" />
        </Field>
        <Field label="Phone" id="phone">
          <Input id="phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 1234" />
        </Field>
        <Field label="Company" id="company_name">
          <Input id="company_name" value={values.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Acme Corp" />
        </Field>
        <Field label="Job Title" id="job_title">
          <Input id="job_title" value={values.job_title} onChange={(e) => set("job_title", e.target.value)} placeholder="VP of Engineering" />
        </Field>
        <Field label="Location" id="location">
          <Input id="location" value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="San Francisco, CA" />
        </Field>
        <Field label="LinkedIn URL" id="linkedin_url">
          <Input id="linkedin_url" value={values.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
        </Field>
        <Field label="Website" id="website">
          <Input id="website" value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://acme.com" />
        </Field>
        <Field label="Source" id="source">
          <select
            id="source"
            value={values.source}
            onChange={(e) => set("source", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select source…</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Tags" id="tags">
          <Input id="tags" value={values.tags} onChange={(e) => set("tags", e.target.value)} placeholder="warm lead, Series A, followed up" />
          <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
        </Field>
      </div>

      <Field label="Context Notes" id="context_notes">
        <textarea
          id="context_notes"
          value={values.context_notes}
          onChange={(e) => set("context_notes", e.target.value)}
          rows={5}
          placeholder="e.g. Met at SaaStr, interested in automation, budget confirmed Q3. Mutual connection: Alex from Sequoia."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : initial ? "Save Changes" : "Add Contact"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
