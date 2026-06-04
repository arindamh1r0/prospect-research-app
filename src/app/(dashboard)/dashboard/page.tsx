import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: prospectCount } = await supabase
    .from("prospects")
    .select("*", { count: "exact", head: true });

  const { count: researchCount } = await supabase
    .from("research_results")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{prospectCount ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Research Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{researchCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Quick actions</h3>
        </div>
        <div className="flex gap-3">
          <Button render={<Link href="/prospects/new" />}>
            Research a new prospect
          </Button>
          <Button variant="outline" render={<Link href="/prospects" />}>
            View all prospects
          </Button>
        </div>
      </main>
    </>
  );
}
