import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth.service";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
