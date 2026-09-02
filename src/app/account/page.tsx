import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user!.id)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">{user!.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming trips yet — booking launches in Phase 4.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Past trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No past trips yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Save properties you love once search is live (Phase 3).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You can review a stay after it&apos;s completed.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name: </span>
              {profile?.full_name || "Not set"}
            </p>
            <p>
              <span className="text-muted-foreground">Phone: </span>
              {profile?.phone || "Not set"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
