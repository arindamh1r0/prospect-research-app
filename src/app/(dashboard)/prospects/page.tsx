import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { ProspectTable } from "@/components/prospects/prospect-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProspectsPage() {
  const supabase = await createClient();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header title="Prospects" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {prospects?.length ?? 0} prospect{prospects?.length !== 1 ? "s" : ""}
          </p>
          <Button size="sm" render={<Link href="/prospects/new" />}>
            New Prospect
          </Button>
        </div>
        <ProspectTable prospects={prospects ?? []} />
      </main>
    </>
  );
}
