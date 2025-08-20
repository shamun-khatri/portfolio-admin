import { z } from "zod";

// Image constraints reused from create schema; for update the image is optional.
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5000000; // 5MB

const experienceUpdateSchema = z.object({
  desc: z.string().min(1, "Description is required"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  date: z.string().min(1, "Date is required"),
  img: z
    .any()
    .optional()
    .refine(
      (files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) =>
        !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

export type ExperienceUpdateFormValues = z.infer<typeof experienceUpdateSchema>;

export default experienceUpdateSchema;
