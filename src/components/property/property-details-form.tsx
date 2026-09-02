"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/host/properties/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PropertyType = { id: string; name: string };

type DefaultValues = {
  name?: string;
  propertyTypeId?: string;
  description?: string;
  country?: string;
  city?: string;
  region?: string;
  addressLine?: string;
  postalCode?: string;
  starRating?: number | null;
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string;
  smokingAllowed?: boolean;
  petFriendly?: boolean;
};

const initialState: ActionState = {};

export function PropertyDetailsForm({
  action,
  propertyTypes,
  defaultValues,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  propertyTypes: PropertyType[];
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="name">Property name</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="propertyTypeId">Property type</Label>
          <Select name="propertyTypeId" defaultValue={defaultValues?.propertyTypeId} required>
            <SelectTrigger id="propertyTypeId">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="starRating">Star rating (optional)</Label>
          <Input
            id="starRating"
            name="starRating"
            type="number"
            min={1}
            max={5}
            defaultValue={defaultValues?.starRating ?? undefined}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={defaultValues?.description} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" required defaultValue={defaultValues?.country} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required defaultValue={defaultValues?.city} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="region">Region / state</Label>
          <Input id="region" name="region" defaultValue={defaultValues?.region} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input id="postalCode" name="postalCode" defaultValue={defaultValues?.postalCode} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="addressLine">Address</Label>
          <Input id="addressLine" name="addressLine" defaultValue={defaultValues?.addressLine} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="checkInTime">Check-in time</Label>
          <Input
            id="checkInTime"
            name="checkInTime"
            type="time"
            defaultValue={defaultValues?.checkInTime ?? "15:00"}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="checkOutTime">Check-out time</Label>
          <Input
            id="checkOutTime"
            name="checkOutTime"
            type="time"
            defaultValue={defaultValues?.checkOutTime ?? "11:00"}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="houseRules">House rules</Label>
          <Textarea id="houseRules" name="houseRules" rows={3} defaultValue={defaultValues?.houseRules} />
        </div>

        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox name="smokingAllowed" value="true" defaultChecked={defaultValues?.smokingAllowed} />
          Smoking allowed
        </Label>
        <Label className="flex items-center gap-2 text-sm font-normal">
          <Checkbox name="petFriendly" value="true" defaultChecked={defaultValues?.petFriendly} />
          Pet friendly
        </Label>
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-muted-foreground">{state.success}</p>}

      <Button type="submit" className="w-fit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
