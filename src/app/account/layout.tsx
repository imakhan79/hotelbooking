import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth.service";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/account");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
