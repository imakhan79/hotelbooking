import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResultItem } from "@/lib/services/search.service";

export function PropertyCard({ property }: { property: SearchResultItem }) {
  const photoUrl = property.cover_photo
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-photos/${property.cover_photo}`
    : null;

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          {photoUrl ? (
            <Image src={photoUrl} alt={property.name} fill className="object-cover" sizes="300px" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No photo yet
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{property.name}</p>
            {property.star_rating && (
              <Badge variant="outline" className="shrink-0">
                {property.star_rating}★
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {property.city}, {property.country}
          </p>
          {property.property_type_name && (
            <p className="text-xs text-muted-foreground">{property.property_type_name}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
