import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContact, updateContact, deleteContact } from "@/lib/contacts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const data = await getContact(id, user.id);
  if (!data) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  return NextResponse.json({ data, error: null });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ data: null, error: "Invalid email format" }, { status: 400 });
  }

  if (body.full_name !== undefined && !body.full_name?.trim()) {
    return NextResponse.json({ data: null, error: "full_name cannot be empty" }, { status: 400 });
  }

  // Whitelist updatable fields
  const { full_name, email, phone, company_name, job_title, linkedin_url, website, location, context_notes, tags, source } = body;
  const payload = Object.fromEntries(
    Object.entries({ full_name, email, phone, company_name, job_title, linkedin_url, website, location, context_notes, tags, source })
      .filter(([, v]) => v !== undefined)
  );

  try {
    const data = await updateContact(id, payload, user.id);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

// Hard delete — contacts are user-owned personal data; hard delete is straightforward and avoids stale data.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  try {
    await deleteContact(id, user.id);
    return NextResponse.json({ data: { id }, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
