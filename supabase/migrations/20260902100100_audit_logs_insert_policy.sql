-- Phase 1 only granted admins SELECT on audit_logs. Admin actions (e.g. property
-- moderation in Phase 2) need to be able to log themselves via the RLS-scoped client.
create policy "audit_logs_insert_admin" on public.audit_logs
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
