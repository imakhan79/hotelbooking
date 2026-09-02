"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };

export function SearchFilters({
  propertyTypes,
  amenities,
}: {
  propertyTypes: Option[];
  amenities: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(formData: FormData) {
    const params = new URLSearchParams();

    const q = formData.get("q");
    if (q) params.set("q", String(q));

    for (const type of formData.getAll("types")) params.append("types", String(type));
    for (const amenity of formData.getAll("amenities")) params.append("amenities", String(amenity));

    const minRating = formData.get("minRating");
    if (minRating && minRating !== "any") params.set("minRating", String(minRating));

    if (formData.get("smoking") === "true") params.set("smoking", "true");
    if (formData.get("petFriendly") === "true") params.set("petFriendly", "true");

    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="q">Destination</Label>
        <Input id="q" name="q" placeholder="City, country, or property" defaultValue={searchParams.get("q") ?? ""} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Property type</p>
        {propertyTypes.map((type) => (
          <Label key={type.id} className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              name="types"
              value={type.id}
              defaultChecked={searchParams.getAll("types").includes(type.id)}
            />
            {type.name}
          </Label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Amenities</p>
        {amenities.map((amenity) => (
          <Label key={amenity.id} className="flex items-center gap-2 text-sm font-normal">
            <Checkbox
              name="amenities"
              value={amenity.id}
              defaultChecked={searchParams.getAll("amenities").includes(amenity.id)}
            />
            {amenity.name}
          </Label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="minRating">Minimum star rating</Label>
        <Select name="minRating" defaultValue={searchParams.get("minRating") ?? "any"}>
          <SelectTrigger id="minRating">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}★ and up
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox name="smoking" value="true" defaultChecked={searchParams.get("smoking") === "true"} />
          Smoking allowed
        </Label>
        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox
            name="petFriendly"
            value="true"
            defaultChecked={searchParams.get("petFriendly") === "true"}
          />
          Pet friendly
        </Label>
      </div>

      <Button type="submit" size="sm">
        Apply filters
      </Button>
    </form>
  );
}
