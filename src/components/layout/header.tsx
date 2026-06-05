import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title: string;
}

export async function Header({ title }: HeaderProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";
  const email = user?.email ?? "";

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {email}
          </span>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
