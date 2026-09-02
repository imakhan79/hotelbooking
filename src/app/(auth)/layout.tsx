import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Stayverse
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
