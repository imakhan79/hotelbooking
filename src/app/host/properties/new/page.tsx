import type { Metadata } from "next";
import { listPropertyTypes } from "@/lib/services/property.service";
import { PropertyDetailsForm } from "@/components/property/property-details-form";
import { createPropertyAction } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "List a new property" };

export default async function NewPropertyPage() {
  const propertyTypes = await listPropertyTypes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">List a new property</h1>
        <p className="text-sm text-muted-foreground">
          Start with the basics — you&apos;ll add rooms, amenities, and photos next.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property details</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyDetailsForm
            action={createPropertyAction}
            propertyTypes={propertyTypes}
            submitLabel="Create property"
          />
        </CardContent>
      </Card>
    </div>
  );
}
