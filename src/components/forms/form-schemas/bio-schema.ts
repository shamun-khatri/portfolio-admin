import { z } from "zod";

export const bioSchema = z.object({
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
  profileImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type BioFormData = z.infer<typeof bioSchema>;

export type Bio = {
  id: string;
  name: string;
  designations: string[];
  desc: string;
  profileImage: string;
  resumeUrl: string | null;
  userId: string;
};
