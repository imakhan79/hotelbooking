"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth.service";
import {
  addPropertyMedia,
  addRoomMedia,
  archiveProperty,
  createProperty,
  createRoomType,
  deletePropertyMedia,
  deleteRoomMedia,
  deleteRoomType,
  setPropertyAmenities,
  setRoomAmenities,
  submitPropertyForReview,
  updateProperty,
} from "@/lib/services/property.service";
import { propertyDetailsSchema, roomTypeSchema } from "@/lib/validation/property";

export type ActionState = { error?: string; success?: string };

function parseForm<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } } }, formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (raw[key] !== undefined) {
      raw[key] = Array.isArray(raw[key]) ? [...(raw[key] as unknown[]), value] : [raw[key], value];
    } else {
      raw[key] = value;
    }
  }
  return schema.safeParse(raw);
}

export async function createPropertyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const parsed = parseForm(propertyDetailsSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error!.issues[0]?.message ?? "Invalid input" };
  }

  let propertyId: string;
  try {
    propertyId = await createProperty(user.id, parsed.data!);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create property" };
  }

  redirect(`/host/properties/${propertyId}`);
}

export async function updatePropertyAction(
  propertyId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(propertyDetailsSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error!.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await updateProperty(propertyId, parsed.data!);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update property" };
  }

  revalidatePath(`/host/properties/${propertyId}`);
  return { success: "Saved." };
}

export async function updatePropertyAmenitiesAction(propertyId: string, formData: FormData) {
  const amenityIds = formData.getAll("amenityIds").map(String);
  await setPropertyAmenities(propertyId, amenityIds);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function submitForReviewAction(propertyId: string) {
  await submitPropertyForReview(propertyId);
  revalidatePath(`/host/properties/${propertyId}`);
  revalidatePath("/host/properties");
}

export async function archivePropertyAction(propertyId: string) {
  await archiveProperty(propertyId);
  revalidatePath(`/host/properties/${propertyId}`);
  revalidatePath("/host/properties");
}

export async function createRoomTypeAction(
  propertyId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseForm(roomTypeSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error!.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await createRoomType(propertyId, parsed.data!);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to add room" };
  }

  revalidatePath(`/host/properties/${propertyId}`);
  return { success: "Room added." };
}

export async function deleteRoomTypeAction(propertyId: string, roomTypeId: string) {
  await deleteRoomType(roomTypeId);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function updateRoomAmenitiesAction(
  propertyId: string,
  roomTypeId: string,
  formData: FormData,
) {
  const amenityIds = formData.getAll("amenityIds").map(String);
  await setRoomAmenities(roomTypeId, amenityIds);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function recordPropertyPhotoAction(propertyId: string, storagePath: string) {
  await addPropertyMedia(propertyId, storagePath);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function deletePropertyPhotoAction(propertyId: string, mediaId: string) {
  await deletePropertyMedia(mediaId);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function recordRoomPhotoAction(
  propertyId: string,
  roomTypeId: string,
  storagePath: string,
) {
  await addRoomMedia(roomTypeId, storagePath);
  revalidatePath(`/host/properties/${propertyId}`);
}

export async function deleteRoomPhotoAction(
  propertyId: string,
  mediaId: string,
) {
  await deleteRoomMedia(mediaId);
  revalidatePath(`/host/properties/${propertyId}`);
}
