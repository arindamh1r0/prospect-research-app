import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <>
      <Header title="Integrations" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <p className="text-sm text-muted-foreground">
          Connect external tools to automate outreach tracking and sync data.
        </p>

        <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
          <div className="flex items-center justify-center rounded-lg size-10 bg-red-500/10 shrink-0">
            <Mail className="size-5 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Gmail</h3>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-sync sent emails and track replies without manual status updates.
              When connected, ProspectAI will monitor your Gmail threads and update
              outreach statuses automatically.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
