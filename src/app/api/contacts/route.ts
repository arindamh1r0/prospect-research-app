import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listContacts, createContact } from "@/lib/contacts";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  try {
    const data = await listContacts(user.id, search, tag);
    return NextResponse.json({ data, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { full_name, email, phone, company_name, job_title, linkedin_url, website, location, context_notes, tags, source } = body;

  if (!full_name?.trim()) {
    return NextResponse.json({ data: null, error: "full_name is required" }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ data: null, error: "Invalid email format" }, { status: 400 });
  }

  try {
    const data = await createContact(
      {
        full_name: full_name.trim(),
        email: email || null,
        phone: phone || null,
        company_name: company_name || null,
        job_title: job_title || null,
        linkedin_url: linkedin_url || null,
        website: website || null,
        location: location || null,
        context_notes: context_notes || null,
        tags: Array.isArray(tags) ? tags : [],
        source: source || null,
      },
      user.id
    );
    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ data: null, error: (err as Error).message }, { status: 500 });
  }
}
