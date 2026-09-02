import { z } from "zod";

export const propertyDetailsSchema = z.object({
  name: z.string().trim().min(2).max(200),
  propertyTypeId: z.string().uuid("Select a property type"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  country: z.string().trim().min(2, "Country is required"),
  city: z.string().trim().min(2, "City is required"),
  region: z.string().trim().optional().or(z.literal("")),
  addressLine: z.string().trim().optional().or(z.literal("")),
  postalCode: z.string().trim().optional().or(z.literal("")),
  starRating: z.coerce.number().int().min(1).max(5).optional(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/).default("15:00"),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).default("11:00"),
  houseRules: z.string().trim().max(4000).optional().or(z.literal("")),
  smokingAllowed: z.coerce.boolean().default(false),
  petFriendly: z.coerce.boolean().default(false),
});

export type PropertyDetailsInput = z.infer<typeof propertyDetailsSchema>;

export const roomTypeSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  maxGuests: z.coerce.number().int().min(1).max(30),
  bedConfig: z.string().trim().max(200).optional().or(z.literal("")),
  sizeSqm: z.coerce.number().positive().optional(),
  view: z.string().trim().max(200).optional().or(z.literal("")),
  smokingAllowed: z.coerce.boolean().default(false),
  accessible: z.coerce.boolean().default(false),
});

export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
