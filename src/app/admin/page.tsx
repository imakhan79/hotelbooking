import type { Metadata } from "next";
import { getCurrentUserRoles } from "@/lib/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin" };

const KPIS = ["GMV", "Revenue", "Commission", "Bookings", "Customers", "Hosts", "Properties"];

export default async function AdminPage() {
  const roles = await getCurrentUserRoles();
  const isAdmin = roles.includes("admin");

  if (!isAdmin) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Access restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This area is limited to platform administrators.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide metrics populate once properties and bookings exist (Phase 2+).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi}</p>
              <p className="mt-1 text-xl font-semibold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              User list, verification, and role management arrive alongside the property
              and booking systems.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Property management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Approve, reject, and moderate listings once Phase 2 ships.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
