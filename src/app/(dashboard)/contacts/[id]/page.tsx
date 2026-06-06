import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getContact } from "@/lib/contacts";
import { Header } from "@/components/layout/header";
import { DraftEmailButton } from "@/components/contacts/draft-email-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowLeft, Globe, Link2, Phone, MapPin, Building2, Briefcase, Mail } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function ContactProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const contact = await getContact(id, user.id);
  if (!contact) notFound();

  return (
    <>
      <Header title={contact.full_name} />
      <main className="flex-1 p-6 space-y-6 max-w-3xl">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" render={<Link href="/contacts" />}>
            <ArrowLeft className="size-3.5 mr-1.5" />
            All Contacts
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link href={`/contacts/${contact.id}/edit`} />}>
              <Pencil className="size-3.5 mr-1.5" />
              Edit
            </Button>
            <DraftEmailButton contact={contact} />
          </div>
        </div>

        {/* Core info */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">{contact.full_name}</h2>
            {(contact.job_title || contact.company_name) && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {[contact.job_title, contact.company_name].filter(Boolean).join(" at ")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow icon={Mail} label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
            <InfoRow icon={Phone} label="Phone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : undefined} />
            <InfoRow icon={Building2} label="Company" value={contact.company_name} />
            <InfoRow icon={Briefcase} label="Title" value={contact.job_title} />
            <InfoRow icon={MapPin} label="Location" value={contact.location} />
            <InfoRow icon={Globe} label="Source" value={contact.source} />
            {contact.linkedin_url && (
              <InfoRow icon={Link2} label="LinkedIn" value="View profile" href={contact.linkedin_url} external />
            )}
            {contact.website && (
              <InfoRow icon={Globe} label="Website" value={contact.website} href={contact.website} external />
            )}
          </div>

          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {contact.tags.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Context notes */}
        {contact.context_notes && (
          <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-4 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Context / Intel
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{contact.context_notes}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Added {new Date(contact.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
          {contact.updated_at !== contact.created_at && (
            <> · Updated {new Date(contact.updated_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</>
          )}
        </p>
      </main>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  href?: string;
  external?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}
