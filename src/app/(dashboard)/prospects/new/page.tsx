import { Header } from "@/components/layout/header";
import { ProspectForm } from "@/components/prospects/prospect-form";

export default function NewProspectPage() {
  return (
    <>
      <Header title="New Prospect" />
      <main className="flex-1 p-6 flex justify-center">
        <ProspectForm />
      </main>
    </>
  );
}
