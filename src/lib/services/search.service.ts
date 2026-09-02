import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, type SearchFilters } from "@/lib/validation/search";

export type SearchResultItem = {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number | null;
  property_type_name: string | null;
  cover_photo: string | null;
  amenity_ids: string[];
};

export async function searchProperties(filters: SearchFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(
      `id, name, city, country, star_rating, created_at,
       property_types (name),
       property_media (storage_path, is_cover, sort_order),
       property_amenities (amenity_id)`,
    )
    .eq("status", "approved");

  if (filters.q) {
    const term = filters.q.replace(/[%,]/g, " ").trim();
    if (term) {
      query = query.or(`name.ilike.%${term}%,city.ilike.%${term}%,country.ilike.%${term}%`);
    }
  }
  if (filters.types && filters.types.length > 0) {
    query = query.in("property_type_id", filters.types);
  }
  if (filters.minRating) {
    query = query.gte("star_rating", filters.minRating);
  }
  if (filters.smoking) {
    query = query.eq("smoking_allowed", filters.smoking === "true");
  }
  if (filters.petFriendly) {
    query = query.eq("pet_friendly", filters.petFriendly === "true");
  }

  const { data, error } = await query.limit(200);
  if (error) throw error;

  type Row = {
    id: string;
    name: string;
    city: string;
    country: string;
    star_rating: number | null;
    created_at: string;
    property_types: { name: string } | { name: string }[] | null;
    property_media: { storage_path: string; is_cover: boolean; sort_order: number }[];
    property_amenities: { amenity_id: string }[];
  };

  let results: (SearchResultItem & { created_at: string })[] = (data as Row[]).map((row) => {
    const typeRel = Array.isArray(row.property_types) ? row.property_types[0] : row.property_types;
    const cover =
      [...row.property_media].sort((a, b) =>
        a.is_cover === b.is_cover ? a.sort_order - b.sort_order : a.is_cover ? -1 : 1,
      )[0] ?? null;

    return {
      id: row.id,
      name: row.name,
      city: row.city,
      country: row.country,
      star_rating: row.star_rating,
      created_at: row.created_at,
      property_type_name: typeRel?.name ?? null,
      cover_photo: cover?.storage_path ?? null,
      amenity_ids: row.property_amenities.map((a) => a.amenity_id),
    };
  });

  if (filters.amenities && filters.amenities.length > 0) {
    const required = filters.amenities;
    results = results.filter((r) => required.every((a) => r.amenity_ids.includes(a)));
  }

  switch (filters.sort) {
    case "newest":
      results.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    case "rating":
      results.sort((a, b) => (b.star_rating ?? 0) - (a.star_rating ?? 0));
      break;
    default:
      results.sort((a, b) => {
        const ratingDiff = (b.star_rating ?? 0) - (a.star_rating ?? 0);
        return ratingDiff !== 0 ? ratingDiff : b.created_at.localeCompare(a.created_at);
      });
  }

  const total = results.length;
  const safePage = Math.max(1, filters.page);
  const start = (safePage - 1) * PAGE_SIZE;
  const page = results.slice(start, start + PAGE_SIZE).map(({ created_at: _created_at, ...rest }) => rest);

  return { results: page, total, pageSize: PAGE_SIZE };
}
