-- Phase 3: property detail pages show "Hosted by {name}". Phase 1's profiles RLS only
-- allowed a user to read their own row (or admin). Extend it: anyone can read a host's
-- profile if that host has at least one approved (publicly visible) property — not a
-- blanket public-profiles policy.
create policy "profiles_select_public_host" on public.profiles
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.host_id = profiles.id and p.status = 'approved'
    )
  );
