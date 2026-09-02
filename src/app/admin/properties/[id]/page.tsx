import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUserRoles } from "@/lib/services/auth.service";
import { getPropertyDetail } from "@/lib/services/property.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModerationActions } from "@/components/property/moderation-actions";

export const metadata: Metadata = { title: "Review property" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "destructive",
  archived: "outline",
};

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const property = await getPropertyDetail(id).catch(() => null);
  if (!property) notFound();

  const photoBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-photos/`;
  const propertyTypeName = Array.isArray(property.property_types)
    ? property.property_types[0]?.name
    : (property.property_types as { name?: string } | null)?.name;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{property.name}</h1>
            <Badge variant={STATUS_VARIANT[property.status] ?? "outline"}>{property.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {property.city}, {property.country} · {propertyTypeName}
          </p>
        </div>
        <ModerationActions propertyId={id} status={property.status} />
      </div>

      {property.property_media.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {property.property_media.map((media) => (
            <div key={media.id} className="relative aspect-square overflow-hidden rounded-md border">
              <Image
                src={`${photoBase}${media.storage_path}`}
                alt=""
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          ))}
        </div>
      )}

      {property.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{property.description}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Rooms ({property.room_types.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {property.room_types.length === 0 && (
            <p className="text-sm text-muted-foreground">No rooms added yet.</p>
          )}
          {property.room_types.map((room) => (
            <div key={room.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{room.name}</p>
              <p className="text-muted-foreground">
                Sleeps {room.max_guests} · {room.bed_config || "No bed configuration"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
