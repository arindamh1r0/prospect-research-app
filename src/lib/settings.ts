import { createClient } from "@/lib/supabase/server";
import type { UserSettings } from "@/lib/types/database.types";
import { DEFAULT_EMAIL_MODEL, DEFAULT_RESEARCH_MODEL } from "@/types/settings";

const DEFAULTS: Omit<UserSettings, "user_id" | "created_at" | "updated_at"> = {
  email_draft_model: DEFAULT_EMAIL_MODEL,
  research_model: DEFAULT_RESEARCH_MODEL,
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) {
    // Return defaults without persisting — row is created on first save
    return {
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...DEFAULTS,
    };
  }
  return data;
}

export async function upsertUserSettings(
  userId: string,
  patch: { email_draft_model?: string; research_model?: string }
): Promise<UserSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...DEFAULTS, ...patch }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
