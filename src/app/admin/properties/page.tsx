import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserRoles } from "@/lib/services/auth.service";
import { listPropertiesForAdmin } from "@/lib/services/property.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Properties" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "destructive",
  archived: "outline",
};

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="p-6 text-sm text-muted-foreground">
          This area is limited to platform administrators.
        </CardContent>
      </Card>
    );
  }

  const { status } = await searchParams;
  const properties = await listPropertiesForAdmin(status);

  const filters = ["pending", "approved", "rejected", "suspended", "draft", "archived"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="text-sm text-muted-foreground">Review and moderate listings.</p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/properties"
          className={!status ? "font-medium underline" : "text-muted-foreground hover:underline"}
        >
          All
        </Link>
        {filters.map((f) => (
          <Link
            key={f}
            href={`/admin/properties?status=${f}`}
            className={status === f ? "font-medium underline" : "text-muted-foreground hover:underline"}
          >
            {f}
          </Link>
        ))}
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No properties found.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/admin/properties/${property.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.city}, {property.country}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[property.status] ?? "outline"}>
                    {property.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
