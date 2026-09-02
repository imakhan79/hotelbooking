"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmenityChecklist } from "@/components/property/amenity-checklist";
import { PhotoUploader } from "@/components/property/photo-uploader";

type Room = {
  id: string;
  name: string;
  description: string | null;
  max_guests: number;
  bed_config: string | null;
  size_sqm: number | null;
  view: string | null;
  room_amenities: { amenity_id: string }[];
  room_media: { id: string; storage_path: string }[];
};

export function RoomCard({
  room,
  amenities,
  onDelete,
  onSaveAmenities,
  onUploadPhoto,
  onDeletePhoto,
}: {
  room: Room;
  amenities: { id: string; name: string }[];
  onDelete: () => Promise<void>;
  onSaveAmenities: (formData: FormData) => Promise<void>;
  onUploadPhoto: (storagePath: string) => Promise<void>;
  onDeletePhoto: (mediaId: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{room.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Sleeps {room.max_guests} · {room.bed_config || "Bed configuration not set"}
            {room.size_sqm ? ` · ${room.size_sqm} m²` : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await onDelete();
              toast.success("Room removed.");
            })
          }
        >
          Remove
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {room.description && <p className="text-sm">{room.description}</p>}

        <div>
          <p className="mb-2 text-sm font-medium">Amenities</p>
          <AmenityChecklist
            amenities={amenities}
            selectedIds={room.room_amenities.map((a) => a.amenity_id)}
            action={onSaveAmenities}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Photos</p>
          <PhotoUploader
            bucket="room-photos"
            ownerId={room.id}
            media={room.room_media}
            onUploaded={onUploadPhoto}
            onDelete={onDeletePhoto}
          />
        </div>
      </CardContent>
    </Card>
  );
}
