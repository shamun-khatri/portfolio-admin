import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5000000;

const experienceSchema = z.object({
  desc: z.string().min(1, "Description is required"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  date: z.string().min(1, "Date is required"),
  img: z
    .any()
    .refine((files) => files?.length >= 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default experienceSchema;
