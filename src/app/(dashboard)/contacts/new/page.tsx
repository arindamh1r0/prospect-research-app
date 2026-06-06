import { Header } from "@/components/layout/header";
import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  return (
    <>
      <Header title="Add Contact" />
      <main className="flex-1 p-6">
        <ContactForm />
      </main>
    </>
  );
}
