import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getHostProfile, getPropertyDetail, listAmenities } from "@/lib/services/property.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookRoomButton } from "@/components/property/book-room-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyDetail(id).catch(() => null);
  return { title: property?.name ?? "Property" };
}

function unwrapOne<T>(rel: T | T[] | null): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyDetail(id).catch(() => null);
  if (!property) notFound();

  const [amenities, host] = await Promise.all([
    listAmenities(),
    getHostProfile(property.host_id),
  ]);
  const amenityName = (amenityId: string) => amenities.find((a) => a.id === amenityId)?.name ?? amenityId;

  const propertyPhotoBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-photos/`;
  const roomPhotoBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/room-photos/`;
  const propertyType = unwrapOne(property.property_types);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{property.name}</h1>
            {property.star_rating && <Badge variant="outline">{property.star_rating}★</Badge>}
          </div>
          <p className="mt-1 text-muted-foreground">
            {propertyType?.name ? `${propertyType.name} · ` : ""}
            {property.city}, {property.country}
          </p>
        </div>

        {property.property_media.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {property.property_media.map((media) => (
              <div key={media.id} className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={`${propertyPhotoBase}${media.storage_path}`}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
            No photos yet
          </div>
        )}

        {property.description && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">About this property</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{property.description}</p>
          </section>
        )}

        {property.property_amenities.length > 0 && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.property_amenities.map((a) => (
                <Badge key={a.amenity_id} variant="secondary">
                  {amenityName(a.amenity_id)}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold">Rooms</h2>
          {property.room_types.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms listed yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {property.room_types.map((room) => (
                <Card key={room.id}>
                  <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                    <div className="relative aspect-square overflow-hidden rounded-l-md bg-muted sm:aspect-auto">
                      {room.room_media[0] ? (
                        <Image
                          src={`${roomPhotoBase}${room.room_media[0].storage_path}`}
                          alt={room.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No photo yet
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Sleeps {room.max_guests}
                        {room.bed_config ? ` · ${room.bed_config}` : ""}
                        {room.size_sqm ? ` · ${room.size_sqm} m²` : ""}
                        {room.view ? ` · ${room.view} view` : ""}
                      </p>
                      {room.description && <p className="text-sm">{room.description}</p>}
                      {room.room_amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {room.room_amenities.map((a) => (
                            <Badge key={a.amenity_id} variant="secondary" className="text-xs">
                              {amenityName(a.amenity_id)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <BookRoomButton />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Policies</h2>
          <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Check-in: {property.check_in_time}</p>
            <p>Check-out: {property.check_out_time}</p>
            <p>Smoking: {property.smoking_allowed ? "Allowed" : "Not allowed"}</p>
            <p>Pets: {property.pet_friendly ? "Allowed" : "Not allowed"}</p>
          </div>
          {property.house_rules && (
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {property.house_rules}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Location</h2>
          <p className="text-sm text-muted-foreground">
            {[property.address_line, property.city, property.region, property.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Reviews</h2>
          <p className="text-sm text-muted-foreground">
            No reviews yet — reviews open up once a stay is completed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Hosted by</h2>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={host?.avatar_url ?? undefined} />
              <AvatarFallback>{(host?.full_name ?? "H").charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm">{host?.full_name ?? "Host"}</p>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Ready to book?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Availability, pricing, and checkout are coming with the booking engine
              (Phase 4). Pick a room above to see what that&apos;ll look like.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
