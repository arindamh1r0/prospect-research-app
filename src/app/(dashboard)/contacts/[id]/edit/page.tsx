import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContact } from "@/lib/contacts";
import { Header } from "@/components/layout/header";
import { ContactForm } from "@/components/contacts/contact-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditContactPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const contact = await getContact(id, user.id);
  if (!contact) notFound();

  return (
    <>
      <Header title={`Edit — ${contact.full_name}`} />
      <main className="flex-1 p-6">
        <ContactForm initial={contact} />
      </main>
    </>
  );
}
