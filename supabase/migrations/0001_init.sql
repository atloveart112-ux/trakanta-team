-- ============================================================
-- ตระการตา Content Ops — initial schema
-- Run this in Supabase SQL Editor (paste the whole file, Run)
-- ============================================================

-- 1. profiles (extends auth.users with display info + crew membership)
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text not null,
  crew_key    text check (crew_key in ('art','pop','tai','jack')),
  role        text not null default 'crew' check (role in ('owner','crew','poster')),
  created_at  timestamptz not null default now()
);

-- 2. custom_tasks (ad-hoc tasks per specific date)
create table public.custom_tasks (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text not null,
  title       text not null,
  platforms   text not null default '',
  crew_type   text not null check (crew_type in ('photo','video')),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index custom_tasks_date_idx on public.custom_tasks(date);

-- 3. task_progress (who marked which crew-slot as done)
create table public.task_progress (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  slot_key    text not null,
  crew_key    text not null check (crew_key in ('art','pop','tai','jack')),
  done_by     uuid references public.profiles(id) on delete set null,
  done_at     timestamptz not null default now(),
  unique (date, slot_key, crew_key)
);
create index task_progress_date_idx on public.task_progress(date);

-- 4. captions (text notes per crew-slot)
create table public.captions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  slot_key    text not null,
  crew_key    text not null check (crew_key in ('art','pop','tai','jack')),
  content     text not null default '',
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now(),
  unique (date, slot_key, crew_key)
);
create index captions_date_idx on public.captions(date);

-- 5. images (file metadata; binary stored in Supabase Storage bucket)
create table public.images (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  slot_key      text not null,
  crew_key      text not null check (crew_key in ('art','pop','tai','jack')),
  storage_path  text not null,
  file_name     text not null,
  file_size     int,
  mime_type     text,
  uploaded_by   uuid references public.profiles(id) on delete set null,
  uploaded_at   timestamptz not null default now(),
  unique (date, slot_key, crew_key)
);
create index images_date_idx on public.images(date);

-- 6. important_flags
create table public.important_flags (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  slot_key    text not null,
  crew_key    text not null check (crew_key in ('art','pop','tai','jack')),
  flagged_by  uuid references public.profiles(id) on delete set null,
  flagged_at  timestamptz not null default now(),
  unique (date, slot_key, crew_key)
);
create index important_flags_date_idx on public.important_flags(date);

-- 7. activity_log (audit trail)
create table public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  date        date,
  slot_key    text,
  crew_key    text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index activity_log_created_at_idx on public.activity_log(created_at desc);
create index activity_log_date_idx on public.activity_log(date);

-- 8. Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9. Row Level Security — team-wide read/write for authenticated users
alter table public.profiles         enable row level security;
alter table public.custom_tasks     enable row level security;
alter table public.task_progress    enable row level security;
alter table public.captions         enable row level security;
alter table public.images           enable row level security;
alter table public.important_flags  enable row level security;
alter table public.activity_log     enable row level security;

-- Read: every authenticated user can read everything (team app)
create policy "auth_read"   on public.profiles        for select to authenticated using (true);
create policy "auth_read"   on public.custom_tasks    for select to authenticated using (true);
create policy "auth_read"   on public.task_progress   for select to authenticated using (true);
create policy "auth_read"   on public.captions        for select to authenticated using (true);
create policy "auth_read"   on public.images          for select to authenticated using (true);
create policy "auth_read"   on public.important_flags for select to authenticated using (true);
create policy "auth_read"   on public.activity_log    for select to authenticated using (true);

-- profiles: user can only update own profile
create policy "auth_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

-- Write: every authenticated user can insert/update/delete on collaborative tables
create policy "auth_insert" on public.custom_tasks    for insert to authenticated with check (true);
create policy "auth_update" on public.custom_tasks    for update to authenticated using (true);
create policy "auth_delete" on public.custom_tasks    for delete to authenticated using (true);

create policy "auth_insert" on public.task_progress   for insert to authenticated with check (true);
create policy "auth_update" on public.task_progress   for update to authenticated using (true);
create policy "auth_delete" on public.task_progress   for delete to authenticated using (true);

create policy "auth_insert" on public.captions        for insert to authenticated with check (true);
create policy "auth_update" on public.captions        for update to authenticated using (true);
create policy "auth_delete" on public.captions        for delete to authenticated using (true);

create policy "auth_insert" on public.images          for insert to authenticated with check (true);
create policy "auth_update" on public.images          for update to authenticated using (true);
create policy "auth_delete" on public.images          for delete to authenticated using (true);

create policy "auth_insert" on public.important_flags for insert to authenticated with check (true);
create policy "auth_delete" on public.important_flags for delete to authenticated using (true);

-- activity_log: insert only (append-only audit trail)
create policy "auth_insert" on public.activity_log    for insert to authenticated with check (true);

-- 10. Enable Realtime on collaborative tables
alter publication supabase_realtime add table public.custom_tasks;
alter publication supabase_realtime add table public.task_progress;
alter publication supabase_realtime add table public.captions;
alter publication supabase_realtime add table public.images;
alter publication supabase_realtime add table public.important_flags;
alter publication supabase_realtime add table public.activity_log;
