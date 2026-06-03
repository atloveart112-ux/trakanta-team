-- ============================================================
-- Storage bucket for content images
-- Run this AFTER 0001_init.sql, also in SQL Editor
-- ============================================================

-- Create private bucket (only authenticated users can access)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  false,
  26214400, -- 25 MB
  array['image/jpeg','image/png','image/gif','image/webp','image/heic']
)
on conflict (id) do nothing;

-- Storage policies: any authenticated user can read/upload/update/delete
create policy "auth_read_storage" on storage.objects for select
  to authenticated using (bucket_id = 'content-images');

create policy "auth_insert_storage" on storage.objects for insert
  to authenticated with check (bucket_id = 'content-images');

create policy "auth_update_storage" on storage.objects for update
  to authenticated using (bucket_id = 'content-images');

create policy "auth_delete_storage" on storage.objects for delete
  to authenticated using (bucket_id = 'content-images');
