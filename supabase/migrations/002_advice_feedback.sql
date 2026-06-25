create table if not exists public.advice_feedback (
  report_id uuid primary key references public.advice_reports(id) on delete cascade,
  helpfulness text not null,
  reasons jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists advice_feedback_created_at_idx on public.advice_feedback (created_at desc);

alter table public.advice_feedback enable row level security;
