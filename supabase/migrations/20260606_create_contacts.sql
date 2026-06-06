-- Contacts table: stores individual person profiles for outreach
-- Separate from the `prospects` table which handles company-level research.
create table contacts (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  full_name     text        not null,
  email         text,
  phone         text,
  company_name  text,
  job_title     text,
  linkedin_url  text,
  website       text,
  location      text,
  context_notes text,
  tags          text[]      not null default '{}',
  source        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on contacts
  for each row execute procedure handle_updated_at();

-- Row Level Security
alter table contacts enable row level security;

create policy "Users manage own contacts"
  on contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
