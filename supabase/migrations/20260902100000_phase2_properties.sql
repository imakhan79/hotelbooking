-- Phase 2: Property System — properties, rooms, amenities join tables, media, storage.
-- Pricing/availability/booking (Phase 4), payouts (Phase 5), and public search (Phase 3)
-- are intentionally out of scope here.

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  property_type_id uuid not null references public.property_types(id),
  name text not null check (char_length(name) between 2 and 200),
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected', 'suspended', 'archived')),
  rejection_reason text,
  country text not null,
  city text not null,
  region text,
  address_line text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  star_rating smallint check (star_rating between 1 and 5),
  check_in_time time not null default '15:00',
  check_out_time time not null default '11:00',
  house_rules text,
  smoking_allowed boolean not null default false,
  pet_friendly boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_host_id_idx on public.properties(host_id);
create index properties_status_idx on public.properties(status);
create index properties_city_idx on public.properties(city);

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- Host self-service status changes only (draft/pending/archived); admin-only for
-- approved/rejected/suspended; ownership (host_id) cannot be reassigned by the host.
create or replace function public.enforce_property_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.host_id is distinct from old.host_id and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can reassign property ownership';
  end if;

  if new.status is distinct from old.status
     and new.status in ('approved', 'rejected', 'suspended')
     and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can set property status to %', new.status;
  end if;

  return new;
end;
$$;

create trigger properties_enforce_status_transition
  before update on public.properties
  for each row execute function public.enforce_property_status_transition();

-- First property a user creates grants them the 'host' role automatically.
create or replace function public.grant_host_role_on_property_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  host_role_id uuid;
begin
  select id into host_role_id from public.roles where name = 'host';

  insert into public.user_roles (user_id, role_id)
  values (new.host_id, host_role_id)
  on conflict do nothing;

  return new;
end;
$$;

create trigger properties_grant_host_role
  after insert on public.properties
  for each row execute function public.grant_host_role_on_property_insert();

-- ---------------------------------------------------------------------------
-- property_amenities (join)
-- ---------------------------------------------------------------------------

create table public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

-- ---------------------------------------------------------------------------
-- property_media
-- ---------------------------------------------------------------------------

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index property_media_property_id_idx on public.property_media(property_id);

-- ---------------------------------------------------------------------------
-- room_types
-- ---------------------------------------------------------------------------

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 150),
  description text,
  max_guests smallint not null default 2 check (max_guests > 0),
  bed_config text,
  size_sqm numeric(6, 2) check (size_sqm > 0),
  view text,
  smoking_allowed boolean not null default false,
  accessible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index room_types_property_id_idx on public.room_types(property_id);

create trigger room_types_set_updated_at
  before update on public.room_types
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- room_amenities (join)
-- ---------------------------------------------------------------------------

create table public.room_amenities (
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (room_type_id, amenity_id)
);

-- ---------------------------------------------------------------------------
-- room_media
-- ---------------------------------------------------------------------------

create table public.room_media (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index room_media_room_type_id_idx on public.room_media(room_type_id);

-- ---------------------------------------------------------------------------
-- Ownership helpers (security definer, mirrors public.has_role from Phase 1)
-- ---------------------------------------------------------------------------

create or replace function public.is_property_owner(_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties
    where id = _property_id and host_id = auth.uid()
  );
$$;

create or replace function public.is_room_type_owner(_room_type_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_types rt
    join public.properties p on p.id = rt.property_id
    where rt.id = _room_type_id and p.host_id = auth.uid()
  );
$$;

create or replace function public.is_property_visible(_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties
    where id = _property_id
      and (status = 'approved' or host_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.properties enable row level security;
alter table public.property_amenities enable row level security;
alter table public.property_media enable row level security;
alter table public.room_types enable row level security;
alter table public.room_amenities enable row level security;
alter table public.room_media enable row level security;

-- properties
create policy "properties_select" on public.properties
  for select to anon, authenticated
  using (status = 'approved' or host_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "properties_insert_own" on public.properties
  for insert to authenticated
  with check (host_id = auth.uid());

create policy "properties_update_own_or_admin" on public.properties
  for update to authenticated
  using (host_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  with check (host_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "properties_delete_own_draft_or_admin" on public.properties
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin') or (host_id = auth.uid() and status = 'draft'));

-- property_amenities
create policy "property_amenities_select" on public.property_amenities
  for select to anon, authenticated
  using (public.is_property_visible(property_id));

create policy "property_amenities_write_owner_or_admin" on public.property_amenities
  for all to authenticated
  using (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'));

-- property_media
create policy "property_media_select" on public.property_media
  for select to anon, authenticated
  using (public.is_property_visible(property_id));

create policy "property_media_write_owner_or_admin" on public.property_media
  for all to authenticated
  using (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'));

-- room_types
create policy "room_types_select" on public.room_types
  for select to anon, authenticated
  using (public.is_property_visible(property_id));

create policy "room_types_write_owner_or_admin" on public.room_types
  for all to authenticated
  using (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_property_owner(property_id) or public.has_role(auth.uid(), 'admin'));

-- room_amenities
create policy "room_amenities_select" on public.room_amenities
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and public.is_property_visible(rt.property_id)
    )
  );

create policy "room_amenities_write_owner_or_admin" on public.room_amenities
  for all to authenticated
  using (public.is_room_type_owner(room_type_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_room_type_owner(room_type_id) or public.has_role(auth.uid(), 'admin'));

-- room_media
create policy "room_media_select" on public.room_media
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.room_types rt
      where rt.id = room_type_id and public.is_property_visible(rt.property_id)
    )
  );

create policy "room_media_write_owner_or_admin" on public.room_media
  for all to authenticated
  using (public.is_room_type_owner(room_type_id) or public.has_role(auth.uid(), 'admin'))
  with check (public.is_room_type_owner(room_type_id) or public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Storage buckets + policies for property/room photos
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('room-photos', 'room-photos', true)
on conflict (id) do nothing;

-- Object paths are "{property_id}/{filename}" and "{room_type_id}/{filename}".
create policy "property_photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-photos');

create policy "property_photos_owner_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-photos'
    and public.is_property_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "property_photos_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'property-photos'
    and public.is_property_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "property_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'property-photos'
    and (
      public.is_property_owner(((storage.foldername(name))[1])::uuid)
      or public.has_role(auth.uid(), 'admin')
    )
  );

create policy "room_photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'room-photos');

create policy "room_photos_owner_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'room-photos'
    and public.is_room_type_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "room_photos_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'room-photos'
    and public.is_room_type_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "room_photos_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'room-photos'
    and (
      public.is_room_type_owner(((storage.foldername(name))[1])::uuid)
      or public.has_role(auth.uid(), 'admin')
    )
  );
