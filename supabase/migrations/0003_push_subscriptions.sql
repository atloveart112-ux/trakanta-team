-- ============================================================
-- Web Push subscriptions per user/device
-- Run in Supabase SQL Editor after 0001 + 0002
-- ============================================================

create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null,
  p256dh_key  text not null,
  auth_key    text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  unique (user_id, endpoint)
);
create index push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- Users can only read/write their OWN subscriptions
create policy "auth_read_own"
  on public.push_subscriptions for select
  to authenticated using (auth.uid() = user_id);

create policy "auth_insert_own"
  on public.push_subscriptions for insert
  to authenticated with check (auth.uid() = user_id);

create policy "auth_update_own"
  on public.push_subscriptions for update
  to authenticated using (auth.uid() = user_id);

create policy "auth_delete_own"
  on public.push_subscriptions for delete
  to authenticated using (auth.uid() = user_id);
