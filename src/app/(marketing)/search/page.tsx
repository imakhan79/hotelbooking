import type { Metadata } from "next";
import Link from "next/link";
import { searchProperties } from "@/lib/services/search.service";
import { listAmenities, listPropertyTypes } from "@/lib/services/property.service";
import { searchParamsSchema } from "@/lib/validation/search";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchSort } from "@/components/search/search-sort";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Search stays" };

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const toArray = (v: string | string[] | undefined) => (v ? (Array.isArray(v) ? v : [v]) : undefined);

  const parsed = searchParamsSchema.safeParse({
    q: raw.q,
    types: toArray(raw.types),
    amenities: toArray(raw.amenities),
    minRating: raw.minRating,
    smoking: raw.smoking,
    petFriendly: raw.petFriendly,
    sort: raw.sort,
    page: raw.page,
  });
  const filters = parsed.success ? parsed.data : searchParamsSchema.parse({});

  const [propertyTypes, amenities, { results, total, pageSize }] = await Promise.all([
    listPropertyTypes(),
    listAmenities(),
    searchProperties(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    for (const t of filters.types ?? []) params.append("types", t);
    for (const a of filters.amenities ?? []) params.append("amenities", a);
    if (filters.minRating) params.set("minRating", String(filters.minRating));
    if (filters.smoking) params.set("smoking", filters.smoking);
    if (filters.petFriendly) params.set("petFriendly", filters.petFriendly);
    params.set("sort", filters.sort);
    params.set("page", String(page));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SearchFilters propertyTypes={propertyTypes} amenities={amenities} />
        </aside>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "property" : "properties"} found
            </p>
            <SearchSort />
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No properties match your filters yet. Try broadening your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                render={<Link href={buildPageHref(filters.page - 1)}>Previous</Link>}
              />
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                render={<Link href={buildPageHref(filters.page + 1)}>Next</Link>}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
