import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PropertyDetailsInput, RoomTypeInput } from "@/lib/validation/property";

export async function listPropertyTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_types")
    .select("id, slug, name")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function listAmenities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("amenities")
    .select("id, slug, name, category")
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function listHostProperties(hostId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, status, city, country, created_at")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPropertyDetail(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      `id, host_id, name, description, status, rejection_reason, property_type_id,
       country, city, region, address_line, postal_code, star_rating,
       check_in_time, check_out_time, house_rules, smoking_allowed, pet_friendly,
       property_types (id, name),
       property_amenities (amenity_id),
       property_media (id, storage_path, alt_text, sort_order, is_cover),
       room_types (
         id, name, description, max_guests, bed_config, size_sqm, view,
         smoking_allowed, accessible, sort_order,
         room_amenities (amenity_id),
         room_media (id, storage_path, alt_text, sort_order, is_cover)
       )`,
    )
    .eq("id", propertyId)
    .single();
  if (error) throw error;
  return data;
}

export async function createProperty(hostId: string, input: PropertyDetailsInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({
      host_id: hostId,
      name: input.name,
      property_type_id: input.propertyTypeId,
      description: input.description || null,
      country: input.country,
      city: input.city,
      region: input.region || null,
      address_line: input.addressLine || null,
      postal_code: input.postalCode || null,
      star_rating: input.starRating ?? null,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
      house_rules: input.houseRules || null,
      smoking_allowed: input.smokingAllowed,
      pet_friendly: input.petFriendly,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateProperty(propertyId: string, input: PropertyDetailsInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      name: input.name,
      property_type_id: input.propertyTypeId,
      description: input.description || null,
      country: input.country,
      city: input.city,
      region: input.region || null,
      address_line: input.addressLine || null,
      postal_code: input.postalCode || null,
      star_rating: input.starRating ?? null,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
      house_rules: input.houseRules || null,
      smoking_allowed: input.smokingAllowed,
      pet_friendly: input.petFriendly,
    })
    .eq("id", propertyId);
  if (error) throw error;
}

export async function setPropertyAmenities(propertyId: string, amenityIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("property_amenities")
    .delete()
    .eq("property_id", propertyId);
  if (deleteError) throw deleteError;

  if (amenityIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("property_amenities")
    .insert(amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id })));
  if (insertError) throw insertError;
}

export async function submitPropertyForReview(propertyId: string) {
  const supabase = await createClient();

  const { count, error: roomError } = await supabase
    .from("room_types")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  if (roomError) throw roomError;
  if (!count) {
    throw new Error("Add at least one room type before submitting for review.");
  }

  const { error } = await supabase
    .from("properties")
    .update({ status: "pending" })
    .eq("id", propertyId);
  if (error) throw error;
}

export async function archiveProperty(propertyId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({ status: "archived" })
    .eq("id", propertyId);
  if (error) throw error;
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", propertyId);
  if (error) throw error;
}

export async function createRoomType(propertyId: string, input: RoomTypeInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .insert({
      property_id: propertyId,
      name: input.name,
      description: input.description || null,
      max_guests: input.maxGuests,
      bed_config: input.bedConfig || null,
      size_sqm: input.sizeSqm ?? null,
      view: input.view || null,
      smoking_allowed: input.smokingAllowed,
      accessible: input.accessible,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteRoomType(roomTypeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("room_types").delete().eq("id", roomTypeId);
  if (error) throw error;
}

export async function setRoomAmenities(roomTypeId: string, amenityIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("room_amenities")
    .delete()
    .eq("room_type_id", roomTypeId);
  if (deleteError) throw deleteError;

  if (amenityIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("room_amenities")
    .insert(amenityIds.map((amenity_id) => ({ room_type_id: roomTypeId, amenity_id })));
  if (insertError) throw insertError;
}

export async function addPropertyMedia(propertyId: string, storagePath: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_media")
    .insert({ property_id: propertyId, storage_path: storagePath });
  if (error) throw error;
}

export async function deletePropertyMedia(mediaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_media")
    .select("storage_path")
    .eq("id", mediaId)
    .single();
  if (error) throw error;

  const { error: deleteRowError } = await supabase
    .from("property_media")
    .delete()
    .eq("id", mediaId);
  if (deleteRowError) throw deleteRowError;

  await supabase.storage.from("property-photos").remove([data.storage_path]);
}

export async function addRoomMedia(roomTypeId: string, storagePath: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("room_media")
    .insert({ room_type_id: roomTypeId, storage_path: storagePath });
  if (error) throw error;
}

export async function deleteRoomMedia(mediaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_media")
    .select("storage_path")
    .eq("id", mediaId)
    .single();
  if (error) throw error;

  const { error: deleteRowError } = await supabase
    .from("room_media")
    .delete()
    .eq("id", mediaId);
  if (deleteRowError) throw deleteRowError;

  await supabase.storage.from("room-photos").remove([data.storage_path]);
}

// --- Admin ---

export async function listPropertiesForAdmin(status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("id, name, status, city, country, host_id, created_at")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function setPropertyModerationStatus(
  propertyId: string,
  status: "approved" | "rejected" | "suspended",
  rejectionReason?: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason ?? null : null,
    })
    .eq("id", propertyId);
  if (error) throw error;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("audit_logs").insert({
    actor_id: user?.id,
    action: `property.${status}`,
    entity: "property",
    entity_id: propertyId,
    metadata: rejectionReason ? { rejection_reason: rejectionReason } : {},
  });
}
