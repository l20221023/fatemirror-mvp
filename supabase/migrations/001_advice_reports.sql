create extension if not exists pgcrypto;

create table if not exists public.advice_reports (
  id uuid primary key default gen_random_uuid(),
  access_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  deleted_at timestamptz null,
  locale text not null,
  relationship_stage text not null,
  primary_concern text not null,
  generation_mode text not null,
  safety_level text not null,
  provider text null,
  model text null,
  prompt_version text not null,
  advice_version text not null,
  report_payload jsonb not null,
  estimated_input_tokens integer null,
  estimated_output_tokens integer null,
  estimated_cost_usd numeric(12,4) null,
  entitlement_type text not null default 'beta',
  duration_ms integer null,
  fallback_reason_code text null,
  validation_failure_codes jsonb null
);

create index if not exists advice_reports_expires_at_idx on public.advice_reports (expires_at);
create index if not exists advice_reports_deleted_at_idx on public.advice_reports (deleted_at);
create index if not exists advice_reports_generation_mode_idx on public.advice_reports (generation_mode);
create index if not exists advice_reports_entitlement_type_idx on public.advice_reports (entitlement_type);
create index if not exists advice_reports_created_at_idx on public.advice_reports (created_at desc);

alter table public.advice_reports enable row level security;
