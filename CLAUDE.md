# ProspectAI — Claude Code Guide

## Project Overview
A multi-user sales research web app. Sales reps submit a company name (+ optional division/region), an n8n agent workflow researches the prospect from web/LinkedIn/news sources, and the results are displayed in a structured dashboard.

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + shadcn/ui + Tailwind CSS
- **Database + Auth**: Supabase (PostgreSQL + Row Level Security + Supabase Auth)
- **Agent Workflow**: n8n (self-hosted via Docker locally, VPS in production)
- **Hosting**: Vercel (frontend), VPS (n8n)
- **Source Control**: Git + GitHub

## Architecture
```
Browser (Next.js/Vercel)
  ├── /login, /signup          — Supabase Auth
  ├── /dashboard               — summary stats
  ├── /prospects               — list all prospects (User Story 1.2)
  ├── /prospects/new           — submit new prospect (User Story 1.1)
  └── /prospects/[id]          — detail + research summary
        ↕ real-time (Supabase Realtime)
Supabase DB
  ├── prospects table
  └── research_results table
        ↕ webhook (POST)
n8n Workflow
  ├── Webhook trigger
  ├── Web search node
  ├── LinkedIn/news nodes
  ├── LLM summarize node
  └── Write back to Supabase
```

## Folder Structure
```
src/
├── app/
│   ├── (auth)/login/          — login page
│   ├── (auth)/signup/         — signup page
│   ├── (dashboard)/
│   │   ├── layout.tsx         — sidebar + shell
│   │   ├── dashboard/         — stats overview
│   │   └── prospects/
│   │       ├── page.tsx       — table of prospects
│   │       ├── new/page.tsx   — new prospect form
│   │       └── [id]/page.tsx  — detail + research summary
│   ├── api/
│   │   ├── auth/callback/     — Supabase OAuth callback
│   │   └── research/trigger/  — calls n8n webhook, creates DB record
│   ├── layout.tsx
│   └── page.tsx               — redirects to /dashboard or /login
├── components/
│   ├── ui/                    — shadcn components (do not edit manually)
│   ├── auth/                  — login-form, signup-form
│   ├── prospects/             — prospect-form, prospect-table, research-summary
│   └── layout/                — sidebar, header
└── lib/
    ├── supabase/
    │   ├── client.ts          — browser Supabase client
    │   ├── server.ts          — server component client
    │   └── middleware.ts      — session refresh in Next.js middleware
    └── types/
        └── database.types.ts  — typed DB schema (prospects, research_results)
```

## Environment Variables
Copy `.env.local.example` → `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `N8N_WEBHOOK_URL` — webhook trigger URL from your n8n workflow

## Database Schema (Supabase SQL)
Run this in the Supabase SQL editor to create tables:

```sql
-- Prospects table
create table prospects (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  division text,
  region text,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research results table
create table research_results (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade not null,
  source text not null,
  raw_data jsonb default '{}',
  summary text,
  status text check (status in ('pending','processing','completed','failed')) default 'pending',
  refreshed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Row Level Security
alter table prospects enable row level security;
alter table research_results enable row level security;

create policy "Users see own prospects" on prospects
  for all using (auth.uid() = created_by);

create policy "Users see own research results" on research_results
  for all using (
    prospect_id in (select id from prospects where created_by = auth.uid())
  );
```

## Development Commands
```bash
npm run dev        # start local dev server at localhost:3000
npm run build      # production build
npm run lint       # ESLint check
```

## n8n Local Setup
```bash
docker run -it --rm -p 5678:5678 n8nio/n8n
# UI available at http://localhost:5678
```
Set `N8N_WEBHOOK_URL=http://localhost:5678/webhook/prospect-research` in `.env.local`.

## Key Conventions
- **Supabase client**: always use `createClient()` from `@/lib/supabase/server` in Server Components and API routes; use `@/lib/supabase/client` only in Client Components (`"use client"`).
- **Auth**: middleware in `src/middleware.ts` protects all `/dashboard` and `/prospects` routes automatically.
- **n8n integration**: the API route `/api/research/trigger` creates the DB record first, then fires the webhook non-blocking. n8n writes results back directly to Supabase.
- **Real-time**: `research-summary.tsx` subscribes to Supabase Realtime when status is `pending`/`processing` and updates the UI automatically when n8n finishes.
- **shadcn components**: never edit files in `src/components/ui/` manually — use `npx shadcn@latest add <component>` to add new ones.

## EPICs & User Stories Status
| Story | Title | Status |
|---|---|---|
| 1.1 | Automated Prospect Data Collection | Scaffolded — logic pending (n8n workflow) |
| 1.2 | Prospect Summary View | Scaffolded — needs sample data seeded |
