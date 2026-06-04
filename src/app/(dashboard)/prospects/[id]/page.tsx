import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { ResearchSummary } from "@/components/prospects/research-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Prospect, ResearchResult } from "@/lib/types/database.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProspectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return notFound();

  const prospect = data as Prospect;

  const { data: researchData } = await supabase
    .from("research_results")
    .select("*")
    .eq("prospect_id", id)
    .order("refreshed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestResearch = researchData as ResearchResult | null;

  return (
    <>
      <Header title={prospect.company_name} />
      <main className="flex-1 p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prospect Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Company</p>
              <p className="font-medium">{prospect.company_name}</p>
            </div>
            {prospect.division && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Division</p>
                <Badge variant="secondary">{prospect.division}</Badge>
              </div>
            )}
            {prospect.region && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Region</p>
                <p>{prospect.region}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs mb-1">Added</p>
              <p>{new Date(prospect.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <ResearchSummary
          prospectId={prospect.id}
          initialResult={latestResearch}
        />
      </main>
    </>
  );
}
