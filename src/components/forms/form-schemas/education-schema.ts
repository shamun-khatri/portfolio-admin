import { z } from "zod";

export const educationSchema = z.object({
  img: z
    .string()
    .url("Please enter a valid image URL")
    .optional()
    .or(z.literal("")),
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
