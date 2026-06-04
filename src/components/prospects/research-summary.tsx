"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ResearchResult } from "@/lib/types/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ResearchSummaryProps {
  prospectId: string;
  initialResult: ResearchResult | null;
}

export function ResearchSummary({ prospectId, initialResult }: ResearchSummaryProps) {
  const [result, setResult] = useState<ResearchResult | null>(initialResult);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (result?.status === "pending" || result?.status === "processing") {
      const supabase = createClient();
      const channel = supabase
        .channel(`research_results:${prospectId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "research_results",
            filter: `prospect_id=eq.${prospectId}`,
          },
          (payload) => setResult(payload.new as ResearchResult)
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [prospectId, result?.status]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetch("/api/research/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prospect_id: prospectId, refresh: true }),
    });
    setRefreshing(false);
  }

  const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Research Summary</CardTitle>
        <div className="flex items-center gap-3">
          {result && (
            <Badge variant={statusColor[result.status] ?? "outline"}>
              {result.status}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh data"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!result && (
          <p className="text-sm text-muted-foreground">No research data yet. Click Refresh to start.</p>
        )}
        {result?.status === "pending" || result?.status === "processing" ? (
          <p className="text-sm text-muted-foreground animate-pulse">
            Research in progress — this page will update automatically...
          </p>
        ) : null}
        {result?.status === "completed" && result.summary && (
          <div className="prose prose-sm max-w-none text-foreground">
            <pre className="whitespace-pre-wrap text-sm font-sans">{result.summary}</pre>
          </div>
        )}
        {result?.status === "failed" && (
          <p className="text-sm text-destructive">Research failed. Try refreshing.</p>
        )}
      </CardContent>
    </Card>
  );
}
