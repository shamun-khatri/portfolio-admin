import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5000000; // 5MB

export const educationSchema = z.object({
  img: z
    .any()
    .refine((files) => files?.length >= 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    )
    .optional(), // Make it optional if the image is not mandatory
  school: z
    .string()
    .min(1, "School name is required")
    .max(100, "School name must be less than 100 characters"),
  date: z.string().min(1, "Date is required"),
  grade: z
    .string()
    .min(1, "Grade is required")
    .max(10, "Grade must be less than 10 characters"),
  desc: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  degree: z
    .string()
    .min(1, "Degree is required")
    .max(100, "Degree must be less than 100 characters"),
});

export type EducationFormValues = z.infer<typeof educationSchema>;
