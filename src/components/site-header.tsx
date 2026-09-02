import Link from "next/link";
import { getCurrentUser, getCurrentUserRoles } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/actions";

const NAV_LINKS = [
  { href: "/", label: "Stays" },
  { href: "/destinations", label: "Destinations" },
  { href: "/deals", label: "Deals" },
  { href: "/help", label: "Help" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const roles = user ? await getCurrentUserRoles() : [];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Stayverse
        </Link>

        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Language / currency selectors are non-functional placeholders in Phase 1 */}
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" disabled>
            EN
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" disabled>
            USD
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/host">List Your Property</Link>}
          />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                Account
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem render={<Link href="/account">Dashboard</Link>} />
                {roles.includes("host") && (
                  <DropdownMenuItem render={<Link href="/host">Host dashboard</Link>} />
                )}
                {roles.includes("admin") && (
                  <DropdownMenuItem render={<Link href="/admin">Admin</Link>} />
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <form action={logout} className="w-full">
                      <button type="submit" className="w-full text-left">
                        Log out
                      </button>
                    </form>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login">Login</Link>} />
              <Button size="sm" render={<Link href="/signup">Sign Up</Link>} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
