create table if not exists public.beta_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  status text not null default 'active',
  max_uses integer not null default 1,
  used_count integer not null default 0,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  disabled_at timestamptz null
);

create index if not exists beta_invites_status_idx on public.beta_invites (status);
create index if not exists beta_invites_expires_at_idx on public.beta_invites (expires_at);
create index if not exists beta_invites_disabled_at_idx on public.beta_invites (disabled_at);

create table if not exists public.beta_sessions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.beta_invites(id) on delete cascade,
  subject_hash text not null,
  status text not null default 'active',
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists beta_sessions_subject_hash_idx on public.beta_sessions (subject_hash);
create index if not exists beta_sessions_expires_at_idx on public.beta_sessions (expires_at);
create index if not exists beta_sessions_status_idx on public.beta_sessions (status);

alter table public.beta_invites enable row level security;
alter table public.beta_sessions enable row level security;
