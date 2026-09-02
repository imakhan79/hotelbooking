"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function AmenityChecklist({
  amenities,
  selectedIds,
  action,
}: {
  amenities: { id: string; name: string }[];
  selectedIds: string[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await action(formData);
          toast.success("Amenities saved.");
        })
      }
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {amenities.map((amenity) => (
          <Label key={amenity.id} className="flex items-center gap-2 text-sm font-normal">
            <Checkbox name="amenityIds" value={amenity.id} defaultChecked={selectedIds.includes(amenity.id)} />
            {amenity.name}
          </Label>
        ))}
      </div>
      <Button type="submit" size="sm" className="w-fit" disabled={isPending}>
        {isPending ? "Saving..." : "Save amenities"}
      </Button>
    </form>
  );
}
