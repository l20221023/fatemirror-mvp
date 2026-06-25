create table if not exists public.commercial_products (
  code text primary key,
  name text not null,
  description text not null,
  price_cents integer not null,
  currency text not null default 'USD',
  active boolean not null default true,
  entitlement_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_orders (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  subject_hash text not null,
  product_code text not null references public.commercial_products(code),
  status text not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  provider text not null,
  checkout_url text not null,
  provider_session_id text null,
  provider_payment_intent_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz null,
  fulfilled_at timestamptz null,
  cancelled_at timestamptz null,
  refunded_at timestamptz null
);

create index if not exists commercial_orders_subject_hash_idx on public.commercial_orders (subject_hash);
create index if not exists commercial_orders_status_idx on public.commercial_orders (status);
create index if not exists commercial_orders_product_code_idx on public.commercial_orders (product_code);
create index if not exists commercial_orders_created_at_idx on public.commercial_orders (created_at desc);

create table if not exists public.commercial_entitlements (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null,
  entitlement_type text not null,
  product_code text not null references public.commercial_products(code),
  status text not null,
  order_id uuid null unique references public.commercial_orders(id) on delete set null,
  expires_at timestamptz null,
  consumed_at timestamptz null,
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_entitlements_subject_hash_idx on public.commercial_entitlements (subject_hash);
create index if not exists commercial_entitlements_status_idx on public.commercial_entitlements (status);
create index if not exists commercial_entitlements_product_code_idx on public.commercial_entitlements (product_code);
create index if not exists commercial_entitlements_expires_at_idx on public.commercial_entitlements (expires_at);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid null references public.commercial_orders(id) on delete set null,
  event_type text not null,
  provider text not null,
  signature_valid boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_order_id_idx on public.payment_events (order_id);
create index if not exists payment_events_event_type_idx on public.payment_events (event_type);
create index if not exists payment_events_created_at_idx on public.payment_events (created_at desc);

alter table public.commercial_products enable row level security;
alter table public.commercial_orders enable row level security;
alter table public.commercial_entitlements enable row level security;
alter table public.payment_events enable row level security;
