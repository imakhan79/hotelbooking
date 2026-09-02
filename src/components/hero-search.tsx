"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSearch() {
  const router = useRouter();

  function handleSearch(formData: FormData) {
    const destination = String(formData.get("destination") ?? "").trim();
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="p-4">
        <form action={handleSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div className="flex flex-col gap-2 lg:col-span-2">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" name="destination" placeholder="Where are you going?" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-in">Check-in</Label>
            <Input id="check-in" name="checkIn" type="date" disabled title="Available once booking launches" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-out">Check-out</Label>
            <Input id="check-out" name="checkOut" type="date" disabled title="Available once booking launches" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="guests">Guests</Label>
            <Input id="guests" name="guests" type="number" min={1} disabled title="Available once booking launches" />
          </div>
          <Button type="submit" className="lg:col-span-5">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
