import { z } from "zod";

// Constants
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
] as const;

export const MAX_FILE_SIZE = 5_000_000; // 5MB

// Base schema for shared fields
const baseProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  date: z
    .string()
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  github: z
    .string()
    .url("Please enter a valid GitHub URL")
    .optional()
    .or(z.literal("")),
  projectUrl: z
    .string()
    .url("Please enter a valid project URL")
    .optional()
    .or(z.literal("")),
  metadataJson: z.string().optional().or(z.literal("")),
});

// Create schema (image required)
export const projectCreateSchema = baseProjectSchema.extend({
  image: z
    .any()
    .refine((files) => files?.length >= 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    ),
});

// Update schema (image optional)
export const projectUpdateSchema = baseProjectSchema.extend({
  image: z
    .any()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    )
    .optional(),
});

// Combined schema that can handle both create and update
export const projectSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    ...projectCreateSchema.shape,
  }),
  z.object({
    mode: z.literal("edit"),
    ...projectUpdateSchema.shape,
  }),
]);

// Type exports
export type ProjectFormValues = z.infer<typeof baseProjectSchema> & {
  image?: FileList;
};

export type ProjectCreateValues = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateValues = z.infer<typeof projectUpdateSchema>;

// Export schemas
export { baseProjectSchema };
export default projectSchema;
