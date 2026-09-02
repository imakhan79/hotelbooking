import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "host" | "admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserRoles(): Promise<AppRole[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id);

  if (error || !data) return [];

  return data
    .map((row) => (row.roles as unknown as { name: AppRole } | null)?.name)
    .filter((name): name is AppRole => Boolean(name));
}

export async function requireRole(role: AppRole) {
  const roles = await getCurrentUserRoles();
  return roles.includes(role);
}
