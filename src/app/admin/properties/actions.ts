"use server";

import { revalidatePath } from "next/cache";
import { setPropertyModerationStatus } from "@/lib/services/property.service";

export async function approvePropertyAction(propertyId: string) {
  await setPropertyModerationStatus(propertyId, "approved");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
}

export async function rejectPropertyAction(propertyId: string, reason: string) {
  await setPropertyModerationStatus(propertyId, "rejected", reason);
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
}

export async function suspendPropertyAction(propertyId: string) {
  await setPropertyModerationStatus(propertyId, "suspended");
  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/admin/properties");
}
