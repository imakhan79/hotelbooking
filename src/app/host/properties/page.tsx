import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/services/auth.service";
import { listHostProperties } from "@/lib/services/property.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Your properties" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "destructive",
  archived: "outline",
};

export default async function HostPropertiesPage() {
  const user = await getCurrentUser();
  const properties = await listHostProperties(user!.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage listings, rooms, photos, and submissions for review.
          </p>
        </div>
        <Button render={<Link href="/host/properties/new">New property</Link>} />
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            You haven&apos;t listed a property yet.{" "}
            <Link href="/host/properties/new" className="underline underline-offset-4">
              Create your first listing
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/host/properties/${property.id}`}>
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
