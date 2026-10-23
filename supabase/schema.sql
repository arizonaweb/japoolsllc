-- Run in the Supabase SQL editor. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the site build environment.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  service_type text not null,
  notes text,
  sms_consent boolean not null default false,
  photo_paths text[] not null default '{}'
);

alter table public.service_requests enable row level security;
create policy "anon can submit requests" on public.service_requests
  for insert to anon with check (true);

insert into storage.buckets (id, name, public)
values ('service-request-photos', 'service-request-photos', false)
on conflict (id) do nothing;

create policy "anon can upload request photos" on storage.objects
  for insert to anon with check (bucket_id = 'service-request-photos');
create policy "anon can replace request photos" on storage.objects
  for update to anon using (bucket_id = 'service-request-photos') with check (bucket_id = 'service-request-photos');
-- Staff review rows and photos through the Supabase dashboard (service role); anon has no read access.
