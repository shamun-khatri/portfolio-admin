import { z } from "zod";

// Constants for icon validation (similar to image handling)
export const ACCEPTED_ICON_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_ICON_SIZE = 2_000_000; // 2MB (smaller than regular images)

// Base schema for shared fields
const baseSkillSchema = z.object({
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(50, "Skill name must be less than 50 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(30, "Category must be less than 30 characters"),
  metadataJson: z.string().optional().or(z.literal("")),
});

// Create schema (icon required)
export const skillCreateSchema = baseSkillSchema.extend({
  icon: z
    .any()
    .refine((files) => files?.length >= 1, "Skill icon is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_ICON_SIZE,
      "Max file size is 2MB"
    )
    .refine(
      (files) => ACCEPTED_ICON_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp, and .svg formats are supported"
    ),
});

// Update schema (icon optional)
export const skillUpdateSchema = baseSkillSchema.extend({
  icon: z
    .any()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_ICON_SIZE,
      "Max file size is 2MB"
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_ICON_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp, and .svg formats are supported"
    ),
});

// Union schema for form validation
export const skillSchema = skillCreateSchema.or(skillUpdateSchema);

export type SkillFormData = z.infer<typeof skillCreateSchema>;

// Helper types for mode validation
export type SkillCreateFormData = z.infer<typeof skillCreateSchema>;
export type SkillUpdateFormData = z.infer<typeof skillUpdateSchema>;

// Server response type
export type Skill = {
  id: string;
  name: string;
  icon: string; // This will be the URL after upload
  category: string;
  userId: string;
  metadata?: Record<string, unknown>;
};

// Grouped skills type for listing page
export type GroupedSkills = {
  [category: string]: Skill[];
};

// Utility function to convert form data to FormData for API
export const toFormData = (data: SkillFormData): FormData => {
  const formData = new FormData();
  
  formData.append("name", data.name);
  formData.append("category", data.category);
  
  // Handle icon file
  if (data.icon && data.icon.length > 0) {
    const file = data.icon[0];
    if (file instanceof File) {
      formData.append("icon", file);
    }
  }
  
  return formData;
};
