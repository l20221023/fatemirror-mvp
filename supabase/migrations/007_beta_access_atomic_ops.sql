create or replace function public.redeem_beta_invite(
  p_code_hash text,
  p_now timestamptz default now()
)
returns setof public.beta_invites
language sql
security definer
set search_path = public
as $$
  update public.beta_invites
  set used_count = used_count + 1
  where code_hash = p_code_hash
    and status = 'active'
    and disabled_at is null
    and (expires_at is null or expires_at >= p_now)
    and used_count < max_uses
  returning *;
$$;

create or replace function public.increment_beta_session_usage(
  p_session_id uuid,
  p_kind text,
  p_increment_ai_today boolean default true,
  p_requested_at timestamptz default now()
)
returns setof public.beta_sessions
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('local', 'ai') then
    raise exception 'unsupported beta session usage kind: %', p_kind;
  end if;

  return query
    update public.beta_sessions
    set
      local_usage_total = local_usage_total + case when p_kind = 'local' then 1 else 0 end,
      local_usage_today = local_usage_today + case when p_kind = 'local' then 1 else 0 end,
      ai_usage_total = ai_usage_total + case when p_kind = 'ai' then 1 else 0 end,
      ai_usage_today = ai_usage_today + case when p_kind = 'ai' and p_increment_ai_today then 1 else 0 end,
      last_ai_request_at = case when p_kind = 'ai' then p_requested_at else last_ai_request_at end
    where id = p_session_id
      and status = 'active'
      and revoked_at is null
      and expires_at > p_requested_at
    returning *;
end;
$$;
