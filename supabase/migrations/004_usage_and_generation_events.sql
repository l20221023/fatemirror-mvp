create table if not exists public.advice_usage_daily (
  date date primary key,
  submitted_count integer not null default 0,
  local_only_count integer not null default 0,
  ai_enhanced_count integer not null default 0,
  ai_fallback_count integer not null default 0,
  high_risk_count integer not null default 0,
  total_generation_ms bigint not null default 0,
  total_input_tokens bigint not null default 0,
  total_output_tokens bigint not null default 0,
  total_cost_usd numeric(12,4) not null default 0
);

create table if not exists public.advice_generation_events (
  request_id uuid primary key,
  report_id uuid null references public.advice_reports(id) on delete set null,
  generation_mode text not null,
  provider text null,
  model text null,
  prompt_version text not null,
  advice_version text not null,
  duration_ms integer null,
  estimated_input_tokens integer null,
  estimated_output_tokens integer null,
  estimated_cost_usd numeric(12,4) null,
  fallback_reason_code text null,
  validation_failure_codes jsonb null,
  safety_level text not null,
  created_at timestamptz not null default now()
);

create index if not exists advice_generation_events_report_id_idx on public.advice_generation_events (report_id);
create index if not exists advice_generation_events_created_at_idx on public.advice_generation_events (created_at desc);
create index if not exists advice_generation_events_generation_mode_idx on public.advice_generation_events (generation_mode);

alter table public.advice_usage_daily enable row level security;
alter table public.advice_generation_events enable row level security;
