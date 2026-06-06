import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/settings";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const settings = await getUserSettings(user.id);
  const initials = user.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <>
      <Header title="Settings" />
      <main className="flex-1 p-6">
        <SettingsForm
          initial={settings}
          userEmail={user.email ?? ""}
          userInitials={initials}
        />
      </main>
    </>
  );
}
