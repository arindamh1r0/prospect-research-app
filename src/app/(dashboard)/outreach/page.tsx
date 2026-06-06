import { Header } from "@/components/layout/header";
import { OutreachPageClient } from "@/components/outreach/outreach-page-client";

export default function OutreachPage() {
  return (
    <>
      <Header title="Outreach" />
      <main className="flex-1 p-6">
        <OutreachPageClient />
      </main>
    </>
  );
}
