-- Add platforms override (alongside existing title override).
-- One row per (date, slot_key) can hold either or both overrides.

alter table public.title_overrides
  add column if not exists custom_platforms text;

-- title was NOT NULL; now either field is optional (we delete the row when both are cleared)
alter table public.title_overrides
  alter column custom_title drop not null;
