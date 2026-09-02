import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, getCurrentUserRoles } from "@/lib/services/auth.service";
import { listHostProperties } from "@/lib/services/property.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Host dashboard" };

const KPIS = [
  "Revenue",
  "Bookings",
  "Occupancy",
  "ADR",
  "RevPAR",
  "Rating",
  "Reviews",
  "Conversion",
];

export default async function HostPage() {
  const user = await getCurrentUser();
  const roles = await getCurrentUserRoles();
  const isHost = roles.includes("host");

  if (!isHost) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Become a host</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            List your first property to become a host — you&apos;ll set up rooms,
            amenities, and photos next, then submit it for review.
          </p>
          <Button render={<Link href="/host/properties/new">List Your Property</Link>} className="w-fit" />
        </CardContent>
      </Card>
    );
  }

  const properties = await listHostProperties(user!.id);
  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const approvedCount = properties.filter((p) => p.status === "approved").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Host dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {properties.length} {properties.length === 1 ? "property" : "properties"} ·{" "}
            {approvedCount} live · {pendingCount} pending review
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/host/properties">Manage properties</Link>} />
          <Button render={<Link href="/host/properties/new">New property</Link>} />
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Upcoming arrivals &amp; departures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No reservations yet — bookings appear here once the booking engine (Phase 4)
            is live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
