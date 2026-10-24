-- Run in the Supabase SQL editor. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the site build environment.
-- Never put the service-role key in frontend code or build env; the browser only uses the anon key.

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

-- Photo upload status and SMS status are tracked separately.
-- sms_status 'composer_opened' only means the customer's Messages app was opened; the browser cannot
-- know whether Send was tapped. Staff set 'received' once the text actually arrives.
alter table public.service_requests
  add column if not exists photo_status text not null default 'pending',
  add column if not exists photos_verified_at timestamptz,
  add column if not exists sms_status text not null default 'not_opened',
  add column if not exists sms_composer_opened_at timestamptz;
alter table public.service_requests drop constraint if exists service_requests_photo_status_check;
alter table public.service_requests add constraint service_requests_photo_status_check
  check (photo_status in ('pending', 'uploaded'));
alter table public.service_requests drop constraint if exists service_requests_sms_status_check;
alter table public.service_requests add constraint service_requests_sms_status_check
  check (sms_status in ('not_opened', 'composer_opened', 'received'));

-- One row per photo slot, all tied to the same request_id.
create table if not exists public.service_request_photos (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.service_requests (request_id) on delete cascade,
  slot text not null check (slot in ('equipment', 'pool', 'otherSide', 'spa')),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  unique (request_id, slot)
);

-- Office staff are identified by the email on their Supabase Auth login.
create table if not exists public.staff_members (email text primary key);
alter table public.staff_members enable row level security; -- no policies: only is_staff() reads it

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff_members where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

alter table public.service_requests enable row level security;
alter table public.service_request_photos enable row level security;

-- The public site cannot read or write these tables directly; it only calls the functions below.
drop policy if exists "anon can submit requests" on public.service_requests;
drop policy if exists "staff read requests" on public.service_requests;
drop policy if exists "staff update requests" on public.service_requests;
drop policy if exists "staff read request photos" on public.service_request_photos;
create policy "staff read requests" on public.service_requests for select to authenticated using (public.is_staff());
create policy "staff update requests" on public.service_requests for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "staff read request photos" on public.service_request_photos for select to authenticated using (public.is_staff());

create or replace function public.create_service_request(
  p_request_id text, p_name text, p_email text, p_phone text, p_address text,
  p_service_type text, p_notes text, p_sms_consent boolean
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_request_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'invalid request id';
  end if;
  -- Idempotent so a retry never duplicates the request.
  insert into public.service_requests (request_id, name, email, phone, address, service_type, notes, sms_consent)
  values (p_request_id, left(p_name, 200), left(p_email, 200), left(p_phone, 50), left(p_address, 300),
          left(p_service_type, 200), left(p_notes, 1000), coalesce(p_sms_consent, false))
  on conflict (request_id) do nothing;
end $$;

-- Records a photo only if the file really exists in the private bucket under this request's folder.
create or replace function public.register_request_photo(p_request_id text, p_slot text, p_path text)
returns void language plpgsql security definer set search_path = public, storage as $$
declare photo_count int;
begin
  if p_slot not in ('equipment', 'pool', 'otherSide', 'spa') then raise exception 'invalid slot'; end if;
  if left(p_path, length(p_request_id) + 1) <> p_request_id || '/' then raise exception 'path does not match request'; end if;
  if not exists (select 1 from public.service_requests where request_id = p_request_id) then raise exception 'unknown request'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'service-request-photos' and name = p_path) then
    raise exception 'file not found in storage';
  end if;
  insert into public.service_request_photos (request_id, slot, storage_path) values (p_request_id, p_slot, p_path)
  on conflict (request_id, slot) do update set storage_path = excluded.storage_path, created_at = now();
  update public.service_requests set photo_paths = coalesce((
    select array_agg(storage_path order by slot) from public.service_request_photos where request_id = p_request_id
  ), '{}') where request_id = p_request_id;
  select count(*) into photo_count from public.service_request_photos where request_id = p_request_id;
  if photo_count = 3 then
    update public.service_requests set photo_status = 'uploaded', photos_verified_at = now() where request_id = p_request_id;
  else
    update public.service_requests set photo_status = 'pending', photos_verified_at = null where request_id = p_request_id;
  end if;
end $$;

-- Slots that are saved for the request AND present in storage.
create or replace function public.verify_request_photos(p_request_id text) returns text[]
language sql stable security definer set search_path = public, storage as $$
  select coalesce(array_agg(p.slot order by p.slot), '{}')
  from public.service_request_photos p
  join storage.objects o on o.bucket_id = 'service-request-photos' and o.name = p.storage_path
  where p.request_id = p_request_id;
$$;

create or replace function public.mark_sms_composer_opened(p_request_id text) returns void
language sql security definer set search_path = public as $$
  update public.service_requests
  set sms_status = 'composer_opened', sms_composer_opened_at = now()
  where request_id = p_request_id and photo_status = 'uploaded' and sms_status = 'not_opened';
$$;

revoke all on function public.create_service_request(text, text, text, text, text, text, text, boolean) from public;
revoke all on function public.register_request_photo(text, text, text) from public;
revoke all on function public.verify_request_photos(text) from public;
revoke all on function public.mark_sms_composer_opened(text) from public;
grant execute on function public.create_service_request(text, text, text, text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.register_request_photo(text, text, text) to anon, authenticated;
grant execute on function public.verify_request_photos(text) to anon, authenticated;
grant execute on function public.mark_sms_composer_opened(text) to anon, authenticated;

-- PRIVATE bucket: JPEG only, 10 MB max per file.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-request-photos', 'service-request-photos', false, 10485760, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg'];

drop policy if exists "anon can upload request photos" on storage.objects;
drop policy if exists "anon can replace request photos" on storage.objects;
drop policy if exists "staff read request photos" on storage.objects;
-- Anonymous visitors may only create new files named <request-uuid>/<slot>-<uuid>.jpg. No read, update or delete.
create policy "anon can upload request photos" on storage.objects for insert to anon
  with check (
    bucket_id = 'service-request-photos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(equipment|pool|otherSide|spa)-[0-9a-f-]{36}\.jpg$'
  );
create policy "staff read request photos" on storage.objects for select to authenticated
  using (bucket_id = 'service-request-photos' and public.is_staff());

-- Add office staff (their Supabase Auth user must exist with the same email):
--   insert into public.staff_members (email) values ('office@example.com');
