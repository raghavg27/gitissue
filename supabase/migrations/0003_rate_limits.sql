-- Rate-limit counters. The key is an HMAC of the action, the kind (user, device, network) and the
-- subject, made on the server, so no raw IP address, device ID or user ID is stored.
-- RLS is on with no policies: only the service role can use the table.
create table public.rate_limits (
  key text primary key,
  count int not null,
  reset_at timestamptz not null
);
alter table public.rate_limits enable row level security;
create index rate_limits_reset_at on public.rate_limits (reset_at);

-- Counts one hit and says if it is inside the limit. Expired rows are deleted on the way, so a hash
-- lives no longer than its window plus one day.
create function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns table (allowed boolean, remaining int, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  hit public.rate_limits;
begin
  delete from public.rate_limits r where r.reset_at < now() - interval '1 day';

  insert into public.rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case when r.reset_at <= now() then 1 else r.count + 1 end,
    reset_at = case when r.reset_at <= now() then now() + make_interval(secs => p_window_seconds) else r.reset_at end
  returning * into hit;

  return query select hit.count <= p_limit, greatest(p_limit - hit.count, 0), hit.reset_at;
end;
$$;

revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;
