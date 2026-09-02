"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type MediaItem = { id: string; storage_path: string };

export function PhotoUploader({
  bucket,
  ownerId,
  media,
  onUploaded,
  onDelete,
}: {
  bucket: "property-photos" | "room-photos";
  ownerId: string;
  media: MediaItem[];
  onUploaded: (storagePath: string) => Promise<void>;
  onDelete: (mediaId: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const publicBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }
      await onUploaded(path);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {media.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md border">
            <Image
              src={`${publicBase}${item.storage_path}`}
              alt=""
              fill
              className="object-cover"
              sizes="150px"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => onDelete(item.id))}
              className="absolute top-1 right-1 rounded-full bg-background/90 px-1.5 py-0.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div>
        <input
          id={`upload-${ownerId}`}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById(`upload-${ownerId}`)?.click()}
        >
          {uploading ? "Uploading..." : "Upload photos"}
        </Button>
      </div>
    </div>
  );
}
