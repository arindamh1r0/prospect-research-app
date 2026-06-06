-- One row per user; stores AI model preferences.
create table user_settings (
  user_id            uuid        primary key references auth.users(id) on delete cascade,
  email_draft_model  text        not null default 'anthropic/claude-3.5-haiku',
  research_model     text        not null default 'anthropic/claude-3.5-sonnet',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger user_settings_updated_at
  before update on user_settings
  for each row execute procedure handle_updated_at();

alter table user_settings enable row level security;

create policy "Users manage own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
