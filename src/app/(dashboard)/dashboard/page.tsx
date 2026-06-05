import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  FileText,
  Mail,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: prospectCount },
    { count: completedCount },
    { count: pendingCount },
    { count: failedCount },
  ] = await Promise.all([
    supabase.from("prospects").select("*", { count: "exact", head: true }),
    supabase
      .from("research_results")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    supabase
      .from("research_results")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "processing"]),
    supabase
      .from("research_results")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  const totalResearch = (completedCount ?? 0) + (failedCount ?? 0);
  const successRate =
    totalResearch > 0
      ? `${Math.round(((completedCount ?? 0) / totalResearch) * 100)}%`
      : "—";

  const stats = [
    {
      label: "Prospects Researched",
      value: prospectCount ?? 0,
      icon: Building2,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "Research Completed",
      value: completedCount ?? 0,
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "In Queue",
      value: pendingCount ?? 0,
      icon: Clock,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
    },
    {
      label: "Success Rate",
      value: successRate,
      icon: TrendingUp,
      iconClass: "text-violet-500",
      bgClass: "bg-violet-500/10",
    },
  ];

  const comingSoonFeatures = [
    {
      icon: Mail,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
      title: "Email Outreach",
      description:
        "Generate personalized outreach emails based on your prospect's research profile.",
    },
    {
      icon: BarChart3,
      iconClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
      title: "Competitor Analysis",
      description:
        "Compare prospects against key competitors and surface differentiation opportunities.",
    },
    {
      icon: RefreshCw,
      iconClass: "text-rose-500",
      bgClass: "bg-rose-500/10",
      title: "CRM Integration",
      description:
        "Automatically sync researched prospects and insights to your CRM system.",
    },
    {
      icon: TrendingUp,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      title: "Reports & Analytics",
      description:
        "Generate sales intelligence reports and track your research team's performance.",
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-8 w-full">
        {/* Stats overview */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Overview
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardHeader className="pb-0">
                  <div
                    className={`inline-flex items-center justify-center rounded-lg size-9 ${stat.bgClass}`}
                  >
                    <stat.icon className={`size-4 ${stat.iconClass}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Active: Prospect Research */}
            <Card className="transition-all hover:ring-2 hover:ring-ring/40">
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center justify-center rounded-lg size-10 bg-blue-500/10">
                    <Search className="size-5 text-blue-500" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-medium">
                    Active
                  </Badge>
                </div>
                <CardTitle>Prospect Research</CardTitle>
                <CardDescription>
                  Submit a company name and let AI research it from web,
                  LinkedIn, and news sources automatically.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" render={<Link href="/prospects/new" />}>
                  Start Research
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>

            {/* Active: Research Summaries */}
            <Card className="transition-all hover:ring-2 hover:ring-ring/40">
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center justify-center rounded-lg size-10 bg-violet-500/10">
                    <FileText className="size-5 text-violet-500" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 font-medium">
                    Active
                  </Badge>
                </div>
                <CardTitle>Research Summaries</CardTitle>
                <CardDescription>
                  View AI-generated summaries and key insights for all your
                  researched prospects in one place.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href="/prospects" />}
                >
                  Browse Summaries
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>

            {/* Coming soon feature cards */}
            {comingSoonFeatures.map((feature) => (
              <Card key={feature.title} className="opacity-60">
                <CardHeader className="gap-2">
                  <div className="flex items-start justify-between">
                    <div
                      className={`inline-flex items-center justify-center rounded-lg size-10 ${feature.bgClass}`}
                    >
                      <feature.icon className={`size-5 ${feature.iconClass}`} />
                    </div>
                    <Badge variant="outline" className="font-medium">
                      Coming Soon
                    </Badge>
                  </div>
                  <CardTitle className="text-muted-foreground">
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="flex gap-3 flex-wrap">
          <Button render={<Link href="/prospects/new" />}>
            <Zap className="size-4" />
            New Research
          </Button>
          <Button variant="outline" render={<Link href="/prospects" />}>
            View All Prospects
          </Button>
        </section>
      </main>
    </>
  );
}
