import { createClient } from "@/lib/supabase/server";
import type { Contact, ContactInsert, ContactUpdate } from "@/lib/types/database.types";

export async function listContacts(
  userId: string,
  search?: string,
  tag?: string
): Promise<Contact[]> {
  const supabase = await createClient();
  let query = supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getContact(id: string, userId: string): Promise<Contact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function createContact(
  payload: Omit<ContactInsert, "user_id">,
  userId: string
): Promise<Contact> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateContact(
  id: string,
  payload: ContactUpdate,
  userId: string
): Promise<Contact> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteContact(id: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
