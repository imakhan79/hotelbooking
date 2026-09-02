import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/help", label: "Help" },
  { href: "/host", label: "List Your Property" },
  { href: "/deals", label: "Deals" },
  { href: "/destinations", label: "Destinations" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} Stayverse. All rights reserved.</p>
        <nav className="flex flex-wrap gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
