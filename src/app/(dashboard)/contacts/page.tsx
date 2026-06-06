import { Header } from "@/components/layout/header";
import { ContactsListClient } from "@/components/contacts/contacts-list-client";

export default function ContactsPage() {
  return (
    <>
      <Header title="Contacts" />
      <main className="flex-1 p-6">
        <ContactsListClient />
      </main>
    </>
  );
}
