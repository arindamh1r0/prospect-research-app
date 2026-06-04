import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
}

export async function Header({ title }: HeaderProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="h-14 border-b flex items-center justify-between px-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
    </header>
  );
}
