import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroSearch } from "@/components/hero-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TRUST_POINTS = [
  { title: "Verified properties", description: "Every listing is reviewed before it goes live." },
  { title: "Secure payments", description: "Payments are processed and never touch our servers unencrypted." },
  { title: "Best price", description: "Transparent pricing with no hidden fees at checkout." },
  { title: "Customer support", description: "Real support before, during, and after your stay." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: propertyTypes } = await supabase
    .from("property_types")
    .select("slug, name")
    .order("sort_order");

  return (
    <>
      <section className="flex flex-col items-center gap-6 bg-gradient-to-b from-muted/60 to-background px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Find your next stay, anywhere in the world
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Hotels, resorts, apartments, villas, and more — compare and book with confidence.
        </p>
        <HeroSearch />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold">Browse by property type</h2>
        {propertyTypes && propertyTypes.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {propertyTypes.map((type) => (
              <Card key={type.slug} className="text-center">
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{type.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Property types are not available right now — please check back shortly.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold">Why book with us?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <Card key={point.title}>
              <CardContent className="p-6">
                <p className="font-medium">{point.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Have a place to share?</h2>
        <p className="max-w-xl text-muted-foreground">
          List your hotel, apartment, or vacation home and reach travelers worldwide.
        </p>
        <Button size="lg" render={<Link href="/host">List Your Property</Link>} />
      </section>
    </>
  );
}
