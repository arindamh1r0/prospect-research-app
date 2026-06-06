"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Users, PlusCircle, LogOut, Zap, BookUser, Settings, SendHorizonal } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Research", icon: Users },
  { href: "/prospects/new", label: "New Research", icon: PlusCircle },
  { href: "/contacts", label: "Contacts", icon: BookUser },
  { href: "/outreach", label: "Outreach", icon: SendHorizonal },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-screen flex flex-col border-r bg-muted/40 p-4 shrink-0">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-lg size-8 bg-primary text-primary-foreground">
          <Zap className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight leading-none">ProspectAI</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Sales Research</p>
        </div>
      </div>
      <Separator className="mb-4" />
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator className="my-4" />
      <div className="flex flex-col gap-0.5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          <Settings className="size-4 shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground text-left"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
