-- Phase 1: Foundation schema — RBAC, profiles, audit log, static reference tables.
-- Property/room/rate/booking tables are out of scope for this migration (Phase 2+).

create extension if not exists "pgcrypto";

-- updated_at trigger helper, reused by every table below and by future phases.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- roles / user_roles (RBAC)
-- ---------------------------------------------------------------------------

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('customer', 'host', 'admin')),
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create index user_roles_user_id_idx on public.user_roles(user_id);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper used throughout RLS policies (this phase and future phases) to check role
-- without recursive RLS evaluation on user_roles itself.
create or replace function public.has_role(_user_id uuid, _role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = _user_id and r.name = _role_name
  );
$$;

-- New auth.users row -> profile + default 'customer' role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_role_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  select id into customer_role_id from public.roles where name = 'customer';

  insert into public.user_roles (user_id, role_id)
  values (new.id, customer_role_id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs(entity, entity_id);
create index audit_logs_actor_idx on public.audit_logs(actor_id);

-- ---------------------------------------------------------------------------
-- property_types (lookup)
-- ---------------------------------------------------------------------------

create table public.property_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- amenities (lookup)
-- ---------------------------------------------------------------------------

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.property_types enable row level security;
alter table public.amenities enable row level security;

-- roles: readable by any authenticated user (needed to resolve role names), admin-only writes.
create policy "roles_select_authenticated" on public.roles
  for select to authenticated using (true);
create policy "roles_write_admin" on public.roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- user_roles: user can see own roles; admin can see/manage all.
create policy "user_roles_select_own_or_admin" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "user_roles_write_admin" on public.user_roles
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
create policy "user_roles_update_admin" on public.user_roles
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "user_roles_delete_admin" on public.user_roles
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- profiles: user can select/update own row; admin can select all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- audit_logs: admin-only select; inserts happen via security-definer service functions only
-- (no direct insert policy for regular authenticated users).
create policy "audit_logs_select_admin" on public.audit_logs
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- property_types / amenities: public read, admin write.
create policy "property_types_select_public" on public.property_types
  for select to anon, authenticated using (true);
create policy "property_types_write_admin" on public.property_types
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "amenities_select_public" on public.amenities
  for select to anon, authenticated using (true);
create policy "amenities_write_admin" on public.amenities
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Seed: roles + reference data (idempotent)
-- ---------------------------------------------------------------------------

insert into public.roles (name) values ('customer'), ('host'), ('admin')
  on conflict (name) do nothing;

insert into public.property_types (slug, name, sort_order) values
  ('hotel', 'Hotel', 1),
  ('resort', 'Resort', 2),
  ('apartment', 'Apartment', 3),
  ('villa', 'Villa', 4),
  ('guest_house', 'Guest House', 5),
  ('hostel', 'Hostel', 6),
  ('serviced_apartment', 'Serviced Apartment', 7),
  ('vacation_home', 'Vacation Home', 8),
  ('cabin', 'Cabin', 9),
  ('cottage', 'Cottage', 10),
  ('homestay', 'Homestay', 11),
  ('boutique_hotel', 'Boutique Hotel', 12),
  ('motel', 'Motel', 13),
  ('lodge', 'Lodge', 14)
  on conflict (slug) do nothing;

insert into public.amenities (slug, name, category, sort_order) values
  ('wifi', 'Wi-Fi', 'general', 1),
  ('pool', 'Pool', 'general', 2),
  ('gym', 'Gym', 'general', 3),
  ('parking', 'Parking', 'general', 4),
  ('spa', 'Spa', 'general', 5),
  ('restaurant', 'Restaurant', 'general', 6),
  ('kitchen', 'Kitchen', 'general', 7),
  ('ac', 'Air Conditioning', 'general', 8),
  ('workspace', 'Workspace', 'general', 9),
  ('pet_friendly', 'Pet Friendly', 'general', 10),
  ('airport_shuttle', 'Airport Shuttle', 'general', 11)
  on conflict (slug) do nothing;
