import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth.service";
import { getPropertyDetail, listAmenities, listPropertyTypes } from "@/lib/services/property.service";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyDetailsForm } from "@/components/property/property-details-form";
import { AmenityChecklist } from "@/components/property/amenity-checklist";
import { PhotoUploader } from "@/components/property/photo-uploader";
import { RoomCard } from "@/components/property/room-card";
import { RoomTypeForm } from "@/components/property/room-type-form";
import { PropertyLifecycleActions } from "@/components/property/property-lifecycle-actions";
import {
  createRoomTypeAction,
  deletePropertyPhotoAction,
  deleteRoomPhotoAction,
  deleteRoomTypeAction,
  recordPropertyPhotoAction,
  recordRoomPhotoAction,
  updatePropertyAction,
  updatePropertyAmenitiesAction,
  updateRoomAmenitiesAction,
} from "../actions";

export const metadata: Metadata = { title: "Manage property" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  suspended: "destructive",
  archived: "outline",
};

export default async function ManagePropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const property = await getPropertyDetail(id).catch(() => null);

  if (!property || property.host_id !== user!.id) {
    notFound();
  }

  const [propertyTypes, amenities] = await Promise.all([listPropertyTypes(), listAmenities()]);

  const boundUpdateProperty = updatePropertyAction.bind(null, id);
  const boundUpdateAmenities = updatePropertyAmenitiesAction.bind(null, id);
  const boundCreateRoom = createRoomTypeAction.bind(null, id);
  const boundRecordPropertyPhoto = recordPropertyPhotoAction.bind(null, id);
  const boundDeletePropertyPhoto = deletePropertyPhotoAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{property.name}</h1>
            <Badge variant={STATUS_VARIANT[property.status] ?? "outline"}>{property.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {property.city}, {property.country}
          </p>
        </div>
        <PropertyLifecycleActions propertyId={id} status={property.status} />
      </div>

      {property.status === "rejected" && property.rejection_reason && (
        <Alert variant="destructive">
          <AlertTitle>Listing rejected</AlertTitle>
          <AlertDescription>{property.rejection_reason}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="rooms">Rooms ({property.room_types.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Property details</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyDetailsForm
                action={boundUpdateProperty}
                propertyTypes={propertyTypes}
                submitLabel="Save changes"
                defaultValues={{
                  name: property.name,
                  propertyTypeId: property.property_type_id,
                  description: property.description ?? undefined,
                  country: property.country,
                  city: property.city,
                  region: property.region ?? undefined,
                  addressLine: property.address_line ?? undefined,
                  postalCode: property.postal_code ?? undefined,
                  starRating: property.star_rating,
                  checkInTime: property.check_in_time,
                  checkOutTime: property.check_out_time,
                  houseRules: property.house_rules ?? undefined,
                  smokingAllowed: property.smoking_allowed,
                  petFriendly: property.pet_friendly,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Property amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <AmenityChecklist
                amenities={amenities}
                selectedIds={property.property_amenities.map((a) => a.amenity_id)}
                action={boundUpdateAmenities}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="flex flex-col gap-4 pt-4">
          {property.room_types.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              amenities={amenities}
              onDelete={deleteRoomTypeAction.bind(null, id, room.id)}
              onSaveAmenities={updateRoomAmenitiesAction.bind(null, id, room.id)}
              onUploadPhoto={recordRoomPhotoAction.bind(null, id, room.id)}
              onDeletePhoto={deleteRoomPhotoAction.bind(null, id)}
            />
          ))}
          <RoomTypeForm action={boundCreateRoom} />
        </TabsContent>

        <TabsContent value="photos" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Property photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                bucket="property-photos"
                ownerId={id}
                media={property.property_media}
                onUploaded={boundRecordPropertyPhoto}
                onDelete={boundDeletePropertyPhoto}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
