import { z } from "zod";

export const SORT_OPTIONS = ["recommended", "newest", "rating"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const searchParamsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  types: z.array(z.string().uuid()).optional(),
  amenities: z.array(z.string().uuid()).optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  smoking: z.enum(["true", "false"]).optional(),
  petFriendly: z.enum(["true", "false"]).optional(),
  sort: z.enum(SORT_OPTIONS).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchFilters = z.infer<typeof searchParamsSchema>;

export const PAGE_SIZE = 12;
