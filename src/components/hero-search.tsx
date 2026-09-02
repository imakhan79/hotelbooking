"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSearch() {
  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" name="destination" placeholder="Where are you going?" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="check-in">Check-in</Label>
          <Input id="check-in" name="checkIn" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="check-out">Check-out</Label>
          <Input id="check-out" name="checkOut" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="guests">Guests</Label>
          <Input id="guests" name="guests" type="number" min={1} defaultValue={2} />
        </div>
        <Button
          className="lg:col-span-5"
          onClick={() =>
            toast("Search launches in Phase 3 (property search & availability).")
          }
        >
          Search
        </Button>
      </CardContent>
    </Card>
  );
}
