import { z } from "zod";

// Constants for image validation
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const MAX_FILE_SIZE = 5_000_000; // 5MB

// Base schema for shared fields
const baseBioSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  designations: z
    .array(z.string().min(1, "Designation cannot be empty"))
    .min(1, "At least one designation is required"),
  desc: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  metadataJson: z.string().optional().or(z.literal("")),
});

// Create schema (profile image required)
export const bioCreateSchema = baseBioSchema.extend({
  profileImage: z
    .any()
    .refine((files) => files?.length >= 1, "Profile image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    ),
});

// Update schema (profile image optional)
export const bioUpdateSchema = baseBioSchema.extend({
  profileImage: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    ),
});

// Union schema for form validation (handles both create and update)
export const bioSchema = bioCreateSchema.or(bioUpdateSchema);

export type BioFormData = z.infer<typeof bioSchema>;
export type BioUpdateFormData = z.infer<typeof bioUpdateSchema>;

// Helper types for mode validation
export type BioCreateFormData = z.infer<typeof bioCreateSchema>;

// Server response type
export type Bio = {
  id: string;
  name: string;
  designations: string[];
  desc: string;
  profileImage: string; // This will be the URL after upload
  resumeUrl: string | null;
  userId: string;
  metadata?: Record<string, unknown>;
};
