-- ============================================================
-- (1) Title overrides per (date, slot_key)
-- (2) Free-form crew picker for custom tasks
-- ============================================================

-- 1. title_overrides — lets users rename a slot for a specific date
create table public.title_overrides (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  slot_key      text not null,
  custom_title  text not null,
  updated_by    uuid references public.profiles(id) on delete set null,
  updated_at    timestamptz not null default now(),
  unique (date, slot_key)
);
create index title_overrides_date_idx on public.title_overrides(date);

alter table public.title_overrides enable row level security;

create policy "auth_read"   on public.title_overrides for select to authenticated using (true);
create policy "auth_insert" on public.title_overrides for insert to authenticated with check (true);
create policy "auth_update" on public.title_overrides for update to authenticated using (true);
create policy "auth_delete" on public.title_overrides for delete to authenticated using (true);

alter publication supabase_realtime add table public.title_overrides;

-- 2. custom_tasks gains an optional array of crew members
-- (when null/empty → fall back to crew_type for backward compat)
alter table public.custom_tasks
  add column custom_crew text[];

-- Allow crew_type to be null going forward (existing rows still have it)
alter table public.custom_tasks
  alter column crew_type drop not null;
