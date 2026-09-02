import type { Metadata } from "next";
import { getCurrentUserRoles } from "@/lib/services/auth.service";
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
            Host registration and property onboarding (property type, location, rooms,
            amenities, pricing, availability) land in Phase 2. There&apos;s nothing to
            wire up here yet.
          </p>
          <Button disabled>List Your Property (coming soon)</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Host dashboard</h1>
        <p className="text-sm text-muted-foreground">
          No properties yet — the property system arrives in Phase 2.
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
