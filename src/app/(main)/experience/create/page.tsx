"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import experienceSchema from "@/components/forms/form-schemas/experience-schema";
import ExperienceForm from "@/components/forms/experience-form";
import { useRouter } from "next/navigation";

type FormValues = z.infer<typeof experienceSchema>;

export default function Page() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      desc: "",
      company: "",
      role: "",
      date: "",
      img: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      // Here you would typically send the data to your API
      console.log("Form values:", values);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("desc", values.desc);
      formData.append("company", values.company);
      formData.append("role", values.role);
      formData.append("date", values.date);
      if (values.img?.[0]) {
        formData.append("img", values.img[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/experience`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      console.log("Response:", response);

      alert("Experience created successfully!");

      // Reset form after successful submission
      form.reset();
      router.push("/experience");
    } catch (error) {
      console.error("Error creating experience:", error);
      alert("Error creating experience. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Experience</CardTitle>
        <CardDescription>
          Add a new experience entry to your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ExperienceForm form={form} handleSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}
