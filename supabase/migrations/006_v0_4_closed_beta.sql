alter table public.beta_sessions
  add column if not exists token_hash text,
  add column if not exists cohort_id text not null default 'beta-default',
  add column if not exists local_usage_total integer not null default 0,
  add column if not exists local_usage_today integer not null default 0,
  add column if not exists ai_usage_total integer not null default 0,
  add column if not exists ai_usage_today integer not null default 0,
  add column if not exists last_ai_request_at timestamptz null,
  add column if not exists pricing_experiment_code text null;

update public.beta_sessions
set token_hash = coalesce(token_hash, id::text)
where token_hash is null;

alter table public.beta_sessions
  alter column token_hash set not null;

create unique index if not exists beta_sessions_token_hash_idx on public.beta_sessions (token_hash);
create index if not exists beta_sessions_cohort_id_idx on public.beta_sessions (cohort_id);
create index if not exists beta_sessions_last_ai_request_at_idx on public.beta_sessions (last_ai_request_at desc);

alter table public.advice_usage_daily
  add column if not exists ai_request_count integer not null default 0,
  add column if not exists ai_success_count integer not null default 0,
  add column if not exists ai_downgrade_count integer not null default 0,
  add column if not exists rate_limited_count integer not null default 0,
  add column if not exists invite_failure_count integer not null default 0;

alter table public.advice_reports
  add column if not exists cohort_id text null;

create index if not exists advice_reports_cohort_id_idx on public.advice_reports (cohort_id);

alter table public.advice_generation_events
  add column if not exists created_at timestamptz not null default now();

alter table public.beta_sessions enable row level security;
