-- Outreach emails: tracks generated + sent emails per contact.
-- Uses contact_id (FK → contacts) not prospect_id, because in this app
-- individual people live in the contacts table.
-- gmail_message_id and gmail_thread_id are reserved for future Gmail integration.
create table outreach_emails (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  contact_id       uuid        not null references contacts(id) on delete cascade,
  subject          text        not null,
  body             text        not null,
  tone             text,
  status           text        not null default 'drafted',
  sent_at          timestamptz,
  replied_at       timestamptz,
  outcome_notes    text,
  gmail_message_id text,
  gmail_thread_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint outreach_emails_status_check
    check (status in ('drafted','sent','replied','meeting_booked','no_response')),
  constraint outreach_emails_tone_check
    check (tone in ('formal','casual','direct') or tone is null)
);

create trigger outreach_emails_updated_at
  before update on outreach_emails
  for each row execute procedure handle_updated_at();

create index outreach_emails_contact_status_idx
  on outreach_emails (contact_id, status);

create index outreach_emails_user_updated_idx
  on outreach_emails (user_id, updated_at desc);

alter table outreach_emails enable row level security;

create policy "Users manage own outreach emails"
  on outreach_emails for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
